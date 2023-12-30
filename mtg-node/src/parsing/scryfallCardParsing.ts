import {
  scryfallPublicApi,
  getBatchCardsFromScryfall,
} from "../clients/scryfall.ts";
import { logger } from "../index.ts";
import { MTGCard, MTGCardVersion } from "../entity/MTGCard.entity.ts";
import { MTGSet } from "../entity/MTGSet.entity.ts";
import assert from "node:assert";

export enum CardState {
  New,
  Updated,
  Unchanged,
}

export interface ParseResult {
  totalCardsInDB: number;
  updatedCards: number;
  newCardsInserted: number;
  unchangedCards: number;
}

export async function fetchCardsFromScryfallBatch(
  sets: MTGSet[],
  cardsMap: Map<string, [MTGCard, CardState]>,
): Promise<void> {
  await scryfallPublicApi.get(`bulk-data`).then(async (response) => {
    const filesMetadata = response.data.data;
    const allCardsFileMetadata = filesMetadata.find(
      (obj) => obj.type === "default_cards",
    );

    if (!allCardsFileMetadata) {
      throw Error("All cards bulk data file not found");
    }

    const raw_cards = await getBatchCardsFromScryfall(
      allCardsFileMetadata.download_uri,
    );

    logger.info("Sorting cards");
    raw_cards.sort((a, b) => {
      const dateA = new Date(a.released_at);
      const dateB = new Date(b.released_at);
      return dateA.getTime() - dateB.getTime();
    });

    const excluded_set_types = new Set([
      "token",
      "funny",
      "minigame",
      "alchemy",
      "memorabilia",
    ]);
    logger.info(`Parsing card data...`);
    for (const card of raw_cards) {
      if (card.type_line && card.type_line.includes("Token")) {
        logger.debug(`Skipping token card "${card.name}"`);
        continue;
      } else if (excluded_set_types.has(card.set_type)) {
        logger.debug(`Skipping card in excluded set type "${card.set_type}"`);
        continue;
      } else if (
        card.legalities.commander != "legal" &&
        card.legalities.legacy != "legal"
      ) {
        logger.debug(
          `Skipping card "${card.name}" because it is not legal in commander or legacy`,
        );
        continue;
      }
      const currentCardRecord = cardsMap.get(card.name);

      // TODO improvement: do something wth related cards (combo pieces)
      if (currentCardRecord) {
        logger.debug(`Card "${card.name}" already exists in DB`);
        ParseAndAttachCardVersion(card, sets, cardsMap);
      } else {
        ParseCard(card, sets, cardsMap);
        logger.info(`Card "${card.name}" does not exist in DB`);
      }
    }
    return;
  });
}
export function ParseCard(
  rawCard: object,
  sets: MTGSet[],
  cardsMap: Map<string, [MTGCard, CardState]>,
): void {
  var card: MTGCard;

  if (rawCard["card_faces"]) {
    const front = rawCard["card_faces"][0];
    const back = rawCard["card_faces"][1];

    card = new MTGCard(
      front["name"],
      parseColorIdentity(rawCard),
      front["type_line"],
      rawCard["rarity"],
      front["mana_cost"] ? front["mana_cost"] : "N/A",
      ParseDoubleSidedCardCMC(rawCard),
      front["oracle_text"],
      front["power"],
      front["toughness"],
      true, //todo alex fix this
      true, //todo alex fix this
      [ParseCardVersion(rawCard, sets, true)],
      back["name"],
      back["type_line"],
      back["oracle_text"],
    );
  } else {
    card = new MTGCard(
      rawCard["name"],
      parseColorIdentity(rawCard),
      rawCard["type_line"],
      rawCard["rarity"],
      rawCard["mana_cost"],
      rawCard["cmc"] ? parseInt(rawCard["cmc"]) : 0,
      rawCard["oracle_text"],
      rawCard["power"],
      rawCard["toughness"],
      true, //todo alex fix this
      true, //todo alex fix this
      [ParseCardVersion(rawCard, sets, true)],
    );
  }

  if (card.isValid()) {
    const existingCard = cardsMap.get(card.name);
    if (!existingCard) {
      cardsMap.set(card.name, [card, CardState.New]);
      logger.debug(`inserting card ${card.name}`);
    } else if (!existingCard[0].equals(card)) {
      existingCard[0].update(card);
      cardsMap.set(card.name, [existingCard[0], CardState.Updated]);
      logger.info(`updating card ${card.name}`);
    } else {
      logger.debug(`no changes to card ${card.name}`);
    }
  } else {
    throw Error(`Error parsing card ${rawCard}`);
  }
}

export function ParseAndAttachCardVersion(
  rawCard: object,
  sets: MTGSet[],
  cardsMap: Map<string, [MTGCard, CardState]>,
) {
  try {
    const cardName: string = rawCard["card_faces"]
      ? rawCard["card_faces"][0]["name"]
      : rawCard["name"];
    const cardEntry: [MTGCard, CardState] = cardsMap.get(cardName);
    const card: MTGCard = cardEntry[0];
    const cardVersion: MTGCardVersion = ParseCardVersion(rawCard, sets, false);
    const existingVersion: MTGCardVersion = card.getVersion(
      cardVersion.scryfallId,
    );
    if (!existingVersion) {
      card.versions.push(cardVersion);
      if (cardEntry[1] !== CardState.New) {
        cardEntry[1] = CardState.Updated;
      }
      logger.debug(
        `Adding version to card ${card.name} with id ${cardVersion.scryfallId}`,
      );
    } else if (!existingVersion.equals(cardVersion)) {
      existingVersion.update(cardVersion);
      if (cardEntry[1] !== CardState.New) {
        cardEntry[1] = CardState.Updated;
      }
      logger.debug(
        `Updating version of card ${card.name} with id ${cardVersion.scryfallId}`,
      );
    } else {
      logger.debug(
        `Skipping version on card ${card.name} with id ${cardVersion.scryfallId}`,
      );
    }
  } catch (err) {
    logger.error(`Cannot find card ${rawCard["name"]}.Skipping. Err: ${err}`);
  }
}

function ParseCardVersion(
  rawCard: object,
  sets: MTGSet[],
  isPrimaryVersion: boolean,
): MTGCardVersion {
  const matchedSets = sets.filter((set) => set.shortName === rawCard["set"]);
  assert.equal(matchedSets.length, 1);

  if (rawCard["card_faces"]) {
    const front = rawCard["card_faces"][0];
    const back = rawCard["card_faces"][1];

    return new MTGCardVersion(
      rawCard["id"],
      front["illustration_id"],
      rawCard["rulings_uri"],
      rawCard["scryfall_uri"],
      parseImageUri(rawCard, front),
      matchedSets[0],
      isPrimaryVersion, //todo currently the first fetched version is the primary one, instead the most recent version should be
      rawCard["legalities"]["standard"] === "legal" ? true : false,
      rawCard["legalities"]["commander"] === "legal" ? true : false,
      back["illustration_id"],
      parseImageUri(rawCard, back),
    );
  } else {
    return new MTGCardVersion(
      rawCard["id"],
      rawCard["illustration_id"],
      rawCard["rulings_uri"],
      rawCard["scryfall_uri"],
      rawCard["image_uris"]["normal"],
      matchedSets[0],
      isPrimaryVersion,
      rawCard["legalities"]["standard"] === "legal" ? true : false,
      rawCard["legalities"]["commander"] === "legal" ? true : false,
    );
  }
}

function ParseDoubleSidedCardCMC(rawCard: object): number {
  if (rawCard["cmc"]) {
    return rawCard["cmc"];
  } else if (rawCard["card_faces"][0]["cmc"]) {
    return rawCard["card_faces"][0]["cmc"];
  } else {
    return 0;
  }
}

function parseImageUri(rawCard: object, face: object): string {
  try {
    return face["image_uris"]["normal"];
  } catch (err) {
    return rawCard["image_uris"]["normal"];
  }
}

function parseColorIdentity(rawCard: object): string {
  var colorIdentity = rawCard["color_identity"].join("");
  if (colorIdentity === "") {
    colorIdentity = "C";
  }
  return colorIdentity;
}
