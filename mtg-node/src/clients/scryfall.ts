import axios from "axios";
import { ConcurrencyManager } from "axios-concurrency";
import { MTGCard } from "../entity/MTGCard.entity.ts";
import { logger } from "../index.ts";
import { createWriteStream, existsSync } from "fs";
import {
  max_concurrent_requests,
  scryfallCardsUrl,
  scryfallPublicApiUrl,
} from "../constants.ts";
import fs from "fs";
import path from "path";
import { PriceInformation } from "mtg-common";

let scryfallCardsApi = axios.create({
  baseURL: scryfallCardsUrl,
  responseType: "stream",
});
const manager2 = ConcurrencyManager(scryfallCardsApi, max_concurrent_requests);

export async function DownloadCardImages(card: MTGCard) {
  card.versions.forEach(async (version) => {
    if (!version.frontImageUri) {
      logger.debug(`No image found for card '${card.name}'!`);
      return;
    }
    const frontImageFilePath = `./static/cards/${version.frontIllustrationId}.jpg`;
    if (!existsSync(frontImageFilePath)) {
      const url = version.frontImageUri.replace(
        "https://cards.scryfall.io",
        "",
      );
      await scryfallCardsApi
        .get(url)
        .then((response) => {
          const writer = createWriteStream(frontImageFilePath);
          response.data.pipe(writer);
          logger.debug(`Downloaded front image for ${card.name}`);
        })
        .catch((err) =>
          logger.error(
            `Error occurred while downloading image for card ${card.name}: ${err}`,
          ),
        );
    } else {
      logger.debug(`Front image for card '${card.name}' already exists!`);
    }
    const backImageFilePath = `./static/cards/${version.backIllustrationId}.jpg`;
    if (!existsSync(backImageFilePath)) {
      const url = version.backImageUri.replace("https://cards.scryfall.io", "");
      await scryfallCardsApi
        .get(url)
        .then((response) => {
          const writer = createWriteStream(backImageFilePath);
          response.data.pipe(writer);
          logger.debug(`Downloaded back image for ${card.name}`);
        })
        .catch((err) =>
          logger.error(
            `Error occurred while downloading image for card ${card.name}: ${err}`,
          ),
        );
    } else {
      logger.debug(`Back image for card '${card.name}' already exists!`);
    }
  });
}

export async function getBatchCardsFromScryfall(fileUri: string) {
  logger.info("Retrieving bulk data info");
  const filepath = `./cache/cardData/${path.basename(fileUri)}`;

  if (fs.existsSync(filepath)) {
    logger.info("Retrieved bulk data info from disk");
  } else {
    logger.info(`Downloading file from ${fileUri}`);
    const response = await axios.get(fileUri, { responseType: "stream" });

    const fileStream = fs.createWriteStream(filepath);
    response.data.pipe(fileStream);
    await new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });

    logger.info(`File downloaded and saved as ${filepath}`);
  }
  const fileContents = fs.readFileSync(filepath, "utf8");
  return JSON.parse(fileContents);
}
export const fetchCardBuyPriceFromScryfall = async (
  cardName: string,
): Promise<PriceInformation> => {
  const response = await axios.get(
    `https://api.scryfall.com/cards/named?exact=${cardName}`,
  );
  const data = response.data;
  if (data && data.prices && data.prices["eur"]) {
    return {
      inStock: true,
      store: "Cardmarket",
      buyPrice: data.prices["eur"],
    };
  } else {
    return {
      inStock: false,
      store: "Cardmarket",
      buyPrice: null,
    };
  }
};
export let scryfallPublicApi = axios.create({
  baseURL: scryfallPublicApiUrl,
  responseType: "json",
});
const manager = ConcurrencyManager(scryfallPublicApi, max_concurrent_requests);
