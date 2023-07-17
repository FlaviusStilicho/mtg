import { Request, Response } from "express";
import multer from "multer";
import { extname } from "path";
import { parse } from 'csv-parse';
import { createReadStream } from "fs";
import { MTGCard } from "../entity/MTGCard.entity.ts";
import { logger } from "../index.ts"
import { MTGCardRepository } from "../repository/MTGCard.repository.ts";


export const UploadDelverFile = async (req: Request, res: Response) => {
    await ProcessdDelverFile(req, res, false)
}

export const UploadDelverFileAdditive = async (req: Request, res: Response) => {
    await ProcessdDelverFile(req, res, true)
}

export const ProcessdDelverFile = async (req: Request, res: Response, additive: boolean) => {
    logger.info(`Processing uploaded Delver file! additive=${additive}`)

    const storage = multer.diskStorage({
        destination: './uploads/delver/',
        filename(_, file, callback) {
            const randomName = Math.random().toString(20).substr(2, 12);
            return callback(null, `${randomName}${extname(file.originalname)}`)
        }
    });
    const upload = multer({ storage }).single('csv');

    upload(req, res, (err) => {
        if (!err) {
            const cards: MTGCard[] = [];
            var cardNameRow: number = null
            // var scryfallIdRow: number = null
            var quantityRow: number = null

            const failedCards: string[] = [];

            createReadStream(`./uploads/delver/${req.file.filename}`)
                .pipe(parse({ delimiter: ',' }))
                .on('data', async function (row: string[]) {
                    // if (!scryfallIdRow && !quantityRow) {
                    if (!quantityRow) {
                        for (let i = 0; i < row.length; i++) {
                            if (row[i] == "Name") { cardNameRow = i }
                            // if (row[i] == "Scryfall ID") { scryfallIdRow = i }
                            if (row[i] == "Quantity") { quantityRow = i }
                        }
                    } else {
                        const cardCopies = parseInt(row[quantityRow]);
                        // const scryfallId = row[scryfallIdRow]
                        var cardName = row[cardNameRow]
                        if (cardName.includes(" //")){
                            cardName = cardName.substring(cardName.indexOf(" //") - 1);
                        }
                        try {
                            // await MTGCard.findOneByScryfallIdAndName(scryfallId, cardName).then(
                            await MTGCardRepository.findOneByName(cardName).then(
                                async (card) => {
                                    card.ownedCopies = additive ? card.ownedCopies + cardCopies : cardCopies
                                    await MTGCardRepository.saveCard(card)
                                    cards.push(card);
                                    if (additive) {
                                        logger.info(`Increased number of owned copies for card '${cardName}' by ${cardCopies} to ${card.ownedCopies}`)
                                    } else {
                                        logger.info(`Set number of owned copies for card '${cardName}' to ${card.ownedCopies}`)
                                    }
                                }
                            ).catch(err => {
                                logger.warn(`Error updating quantity for card '${cardName}': ${err}`)
                                // failedCards.push([cardName, scryfallId])
                                failedCards.push(cardName)
                            });
                        } catch (err) {
                            logger.warn(`Error updating quantity for card '${cardName}': ${err}`)
                        }
                    }
                })
                .on('error', function (err) {
                    logger.error(err.message);
                })
                .on('end', function () {
                    res.sendStatus(200);
                });
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            logger.error("Uploaded file has unexpected key")
            return res.sendStatus(400)
        } else {
            logger.error(err)
            return res.sendStatus(400)
        }
    });
}