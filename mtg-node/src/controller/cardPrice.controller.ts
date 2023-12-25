import { Request, Response } from "express";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { logger } from "../index.ts";
import { fetchCardBuyPriceFromMagicers } from "../clients/magicers.ts";
import { fetchCardBuyPriceFromMagickast } from "../clients/magickast.ts";
import { fetchCardBuyPriceFromScryfall } from "../clients/scryfall.ts";

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

const CARD_PRICE_CACHE_FILE_PATH = `./cache/cardPrices/${getTodayDate()}.json`;
var CARD_PRICE_CACHE = {};

if (existsSync(CARD_PRICE_CACHE_FILE_PATH)) {
  const cacheData = readFileSync(CARD_PRICE_CACHE_FILE_PATH, 'utf-8');
  CARD_PRICE_CACHE = JSON.parse(cacheData);
  console.log(`Loaded ${Object.keys(CARD_PRICE_CACHE).length} card prices into cache`);
}

process.on('SIGINT', () => {
    logger.info(`Writing ${Object.keys(CARD_PRICE_CACHE).length} card prices to disk`);
    writeFileSync(CARD_PRICE_CACHE_FILE_PATH, JSON.stringify(CARD_PRICE_CACHE), 'utf-8');
  });

export const GetCardPrice = async (req: Request, res: Response) => {
  const cardName: string = req.params.cardName.replace("--", "//");

  if (CARD_PRICE_CACHE.hasOwnProperty(cardName)) {
    logger.info(`Retrieving buy price for ${cardName} from cache`);
    res.send(CARD_PRICE_CACHE[cardName]);
    return; // Exit early since the response has been sent
  } else {

    logger.info(`Fetching buy price for ${cardName}`);

    if (["Island", "Swamp", "Forest", "Plains", "Mountain"].includes(cardName)) {
      res.send([
        {
          inStock: false,
          store: "Magicers",
          buyPrice: 0,
        },
      ]);
    } else {
      const magicersPrice = await fetchCardBuyPriceFromMagicers(cardName);
      const magickastPrice = await fetchCardBuyPriceFromMagickast(cardName);
      const scryfallPrice = await fetchCardBuyPriceFromScryfall(cardName);

      const priceInfo = [magicersPrice, magickastPrice, scryfallPrice];
      CARD_PRICE_CACHE[cardName] = priceInfo;

      res.send(priceInfo);
    }
  }
};
