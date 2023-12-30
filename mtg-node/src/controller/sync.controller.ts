import { Request, Response } from "express";
import { MTGCard } from "../entity/MTGCard.entity.ts";
import got from "got";
import { DB } from "../datasource.ts";
import { logger } from "../index.ts";
import { MTGSet } from "../entity/MTGSet.entity.ts";
import { scryfallPublicApiUrl } from "../constants.ts";
import { DownloadCardImages, scryfallPublicApi } from "../clients/scryfall.ts";
import { MTGCardRepository } from "../repository/MTGCard.repository.ts";
import { MTGSetRepository } from "../repository/MTGSet.repository.ts";
import {
  fetchCardsFromScryfallBatch,
  CardState,
  ParseResult,
} from "../parsing/scryfallCardParsing.ts";

const getSetsUrl = `${scryfallPublicApiUrl}/sets`;
export const Sync = async (req: Request, res: Response) => {
  const start = new Date().getTime();
  SyncCardsBatch().then((result) => {
    let elapsed = new Date().getTime() - start;
    logger.info(`Synchronization completed in ${elapsed} seconds!`);
    res.send({
      status: "success!",
      runtime: elapsed,
      details: result,
    });
  });
};

export const SyncSets = async (): Promise<MTGSet[]> => {
  logger.info("Syncing sets");
  return await getAndSaveSets().then(async (sets: MTGSet[]) => {
    const setsFromDb: MTGSet[] = await MTGSetRepository.find();
    const setsinDbSet = new Set(setsFromDb.map((set) => set.shortName));
    const newSetsSet = new Set(sets.map((set) => set.shortName));
    let _difference = setsinDbSet;
    for (let elem of newSetsSet) {
      _difference.delete(elem);
    }
    if (_difference.size == 0) {
      return setsFromDb;
    } else {
      throw Error(`Couldnt find all sets. Missing ${_difference.size} sets.`);
    }
  });
};

const getAndSaveSets = async (): Promise<MTGSet[]> => {
  return got
    .get(getSetsUrl)
    .json()
    .then((response) => {
      const setPromiseArray: Promise<MTGSet>[] = [];
      response["data"].forEach((rawSet) => {
        const set = new MTGSet(
          rawSet["code"],
          rawSet["name"],
          rawSet["id"],
          rawSet["set_type"],
          rawSet["icon_svg_uri"],
          new Date(rawSet["released_at"]),
        );
        const promise: Promise<MTGSet> = MTGSetRepository.saveOne(set);
        setPromiseArray.push(promise);
      });
      return Promise.all(setPromiseArray).then((sets) => {
        logger.info(`Downloaded and saved ${sets.length} sets`);
        return sets;
      });
    });
};

const SyncCardsBatch = async (): Promise<ParseResult> => {
  const sets: MTGSet[] = await SyncSets();
  const [allCards, totalCardsFromDB]: [MTGCard[], number] =
    await MTGCardRepository.findAll();

  const cardsMap: Map<string, [MTGCard, CardState]> = new Map(
    allCards.map((card: MTGCard) => [card.name, [card, CardState.Unchanged]]),
  );

  await fetchCardsFromScryfallBatch(sets, cardsMap);

  const newCards: MTGCard[] = Array.from(cardsMap.values())
    .filter((entry: [MTGCard, CardState]) => entry[1] === CardState.New)
    .map((entry: [MTGCard, CardState]) => entry[0]);

  await MTGCardRepository.insert(newCards);

  const updatedCards: MTGCard[] = Array.from(cardsMap.values())
    .filter((entry: [MTGCard, CardState]) => entry[1] === CardState.Updated)
    .map((entry: [MTGCard, CardState]) => entry[0]);

  updatedCards.forEach((card: MTGCard) => MTGCardRepository.saveCard(card));

  return {
    totalCardsInDB: cardsMap.size,
    updatedCards: Array.from(cardsMap.values()).filter(
      (entry: [MTGCard, CardState]) => entry[1] === CardState.Updated,
    ).length,
    newCardsInserted: Array.from(cardsMap.values()).filter(
      (entry: [MTGCard, CardState]) => entry[1] === CardState.New,
    ).length,
    unchangedCards: Array.from(cardsMap.values()).filter(
      (entry: [MTGCard, CardState]) => entry[1] === CardState.Unchanged,
    ).length,
  };
};

export async function ClearCards(req: Request, res: Response) {
  logger.info("Clearing cards!");
  await DB.manager
    .query("DELETE FROM mtg_card_tags_mtg_card_tag WHERE 1")
    .then(async () => {
      logger.info("Cleared extra categories");
      await DB.manager.query("DELETE FROM card WHERE 1");
    })
    .then(() => logger.info("Cleared all cards!"));
  res.sendStatus(200);
}

export const GetScryfallInfoForCard = async (req: Request, res: Response) => {
  await scryfallPublicApi
    .get(`/cards/search?q=${req.query.name}&unique=prints}`)
    .then((response) => res.send(response));
};

export const SyncImages = async (req: Request, res: Response) => {
  const [allCards, _] = await MTGCardRepository.findAndCount();
  allCards.forEach((card) => DownloadCardImages(card));
  res.sendStatus(200);
};
