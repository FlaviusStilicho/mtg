import { logger } from "../index.js";
import { DeckCardEntry } from "../entity/Deck.entity.js";
import { DB } from "../datasource.js";

export const DeckCardEntryRepository = DB.getRepository(DeckCardEntry);
