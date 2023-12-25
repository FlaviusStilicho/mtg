import { WishlistEntryRepository } from "../repository/WishlistEntry.repository.ts";
import { Request, Response } from "express";
import { logger } from "../index.ts";
import { DeckRepository } from "../repository/Deck.repository.ts";
import { MTGCardRepository } from "../repository/MTGCard.repository.ts";
import { writeFileSync } from "fs";
import { getTodayDate } from "../util.ts";

const BACKUP_FILE_PATH = `./backup/${getTodayDate()}.json`;

interface ExportedCard {
  name: string;
  copies: number;
}

interface ExportedDeck {
  name: string;
  cards: ExportedCard[];
}

interface Backup {
  cards: ExportedCard[];
  decks: ExportedDeck[];
  wishlist: ExportedCard[];
}

export const CreateBackup = async (
  req: Request,
  res: Response,
) => {
  const cardsInCollection = await MTGCardRepository.findOwnedCards();
  const decks = await DeckRepository.find();
  const wishlistEntries = await WishlistEntryRepository.find();

  const backup: Backup = {
    cards: cardsInCollection.map((card) => ({
      name: card.name,
      copies: card.ownedCopies,
    })),
    decks: decks.map((deck) => ({
      name: deck.name,
      cards: deck.cardEntries.map((entry) => ({
        name: entry.card.name,
        copies: entry.copies,
      })),
    })),
    wishlist: wishlistEntries.map((entry) => ({
      name: entry.card.name,
      copies: entry.desiredEntries,
    })),
  };

  writeFileSync(BACKUP_FILE_PATH, JSON.stringify(backup), "utf-8");
  const message = `Created backup at ${BACKUP_FILE_PATH}. Exported ${backup.decks.length} decks, ${backup.cards.length} cards, and ${backup.wishlist.length} wishlist entries`
  logger.info(message);
  res.send({result: message});
};


