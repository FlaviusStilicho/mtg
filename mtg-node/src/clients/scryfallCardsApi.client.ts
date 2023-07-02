import axios from "axios";
import { ConcurrencyManager } from 'axios-concurrency';
import { MTGCard } from "../entity/MTGCard.entity.ts";
import { logger } from "../index.ts";
import { createWriteStream, existsSync } from "fs";
import { max_concurrent_requests, scryfallCardsUrl } from "../constants.ts";

let scryfallCardsApi = axios.create({
    baseURL: scryfallCardsUrl,
    responseType: 'stream'
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
            const url = version.frontImageUri.replace("https://cards.scryfall.io", "");
            await scryfallCardsApi.get(url).then(response => {
                const writer = createWriteStream(frontImageFilePath);
                response.data.pipe(writer);
                logger.debug(`Downloaded front image for ${card.name}`);
            }).catch(err => logger.error(`Error occurred while downloading image for card ${card.name}: ${err}`));
        } else {
            logger.debug(`Front image for card '${card.name}' already exists!`);
        }
        const backImageFilePath = `./static/cards/${version.backIllustrationId}.jpg`;
        if (!existsSync(backImageFilePath)) {
            const url = version.backImageUri.replace("https://cards.scryfall.io", "");
            await scryfallCardsApi.get(url).then(response => {
                const writer = createWriteStream(backImageFilePath);
                response.data.pipe(writer);
                logger.debug(`Downloaded back image for ${card.name}`);
            }).catch(err => logger.error(`Error occurred while downloading image for card ${card.name}: ${err}`));
        } else {
            logger.debug(`Back image for card '${card.name}' already exists!`);
        }
    })
}