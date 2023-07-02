import { Request, Response } from "express";
import { MTGCard } from "../entity/MTGCard.entity.ts"
import { writeFileSync } from "fs";
import { export_dir } from "../constants.ts";
import { MTGCardRepository } from "../repository/MTGCard.repository.ts";

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
    exportToCsv(`export-${Date.now()}`, ownedCards)
    res.send(ownedCards)
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
