import { Request, Response } from "express";
import { MTGCard } from "../entity/MTGCard.entity.ts"
import { writeFileSync } from "fs";
import { export_dir } from "../constants.ts";
import { MTGCardRepository } from "../repository/MTGCard.repository.ts";
import { DeckRepository } from '../repository/Deck.repository.ts';
import { In } from "typeorm";
import { logger } from "../index.ts";
import { DeckCardEntry } from "../entity/Deck.entity.ts";

export const GetCollection = async (req: Request, res: Response) => {
    const [ownedCards, total] = await MTGCardRepository.findAllOwned()
    res.send(ownedCards)
}
export const ClearCollection = async (req: Request, res: Response) => {
    await MTGCardRepository.clear()
    res.send(200)
}

export const ExportCollection = async (req: Request, res: Response) => {
    const [ownedCards, total] = await MTGCardRepository.findAllOwned()
    const fileName = `export-${Date.now()}`
    exportToCsv(fileName, ownedCards)
    logger.info
    res.send({
        result: "success",
        fileName: fileName,
        totalCards: ownedCards.map(cards => cards.ownedCopies).reduce((a,b) => a + b)
    })
}

export interface ExportDecksParams{
    decks: number[]
}

export const CreateBuylistMultipleDecks = async (req: Request<{}, {}, ExportDecksParams, {}>, res: Response) => {
    if ( req.body.decks.length <= 1 ){
        res.send([])
    }
    let decks = await DeckRepository.findBy({
        id: In(req.body.decks)
    })
    const deckNames: string[] = decks.map(deck => deck.name)
    logger.debug(`Creating buylist for decks ${deckNames}`)
    const cardEntriesLists: DeckCardEntry[] = decks.map(deck => deck.cardEntries).flat()
    const cardIds = new Set(cardEntriesLists.map(entry => entry.card.id))
    const cardEntriesMap = new Map<number, object>()

    MTGCardRepository.findBy({ id: In(Array.from(cardIds)) }).then((cards: MTGCard[]) => {
        const cardMap: { [key: number]: MTGCard } = cards.reduce((map, card) => {
            map[card.id] = card;
            return map;
          }, {});

        logger.debug(cardMap)   
        cardEntriesLists.forEach(entry => {
            if (!cardEntriesMap.has(entry.card.id)){
                const card = cardMap[entry.card.id]
                logger.debug(card)
                cardEntriesMap.set(card.id, {
                    name: card.name,
                    required: entry.copies,
                    owned: card.ownedCopies
                })
                logger.debug(cardEntriesMap)
            } else {
                const cardEntry = cardEntriesMap.get(entry.card.id)
                if (entry.copies > cardEntry['required']) {
                    cardEntry['required'] = entry.copies
                    cardEntriesMap.set(entry.card.id, cardEntry)
                }
            }
        })

        const exportEntries: ExportedCardEntry[] = []
        cardEntriesMap.forEach((entry: object, id: number) => {
            if (entry['required'] > entry['owned']){
                exportEntries.push({
                    name: entry['name'],
                    copies: entry['required'] - entry['owned']
                })
            }
        });

        const fileName = `buylist-${Date.now()}.csv`
        exportCsv(fileName, exportEntries)
        res.send(fileName)
    })
}

export const exportToCsv = (filename: string, cards: MTGCard[]): void => {
    if (!cards || !cards.length) {
        return;
    }

    const separator: string = ",";
    const hearders = ["Name", "Quantity"];
    const csvContent =
        hearders.join(separator) + '\n' +   
        cards.map(card => {
            var cardName = card.name
            if (cardName.search(/("|,|\n)/g) >= 0) {
                cardName = `"${cardName}"`;
            }
            return [cardName, card.ownedCopies].join(separator)
        }).join("\n")

    writeFileSync(`${export_dir}/${filename}`, csvContent);
};

export interface ExportedCardEntry {
    name: string,
    copies: number
}

export const exportCsv = (filename: string, cards: ExportedCardEntry[]): void => {
    if (!cards || !cards.length) {
        return;
    }

    const separator: string = ",";
    const hearders = ["Name", "Quantity"];
    const csvContent =
        hearders.join(separator) + '\n' +   
        cards.map(card => {
            var cardName = `"${card.name}"`;
            return [cardName, card.copies].join(separator)
        }).join("\n")

    writeFileSync(`${export_dir}/${filename}`, csvContent);
};
