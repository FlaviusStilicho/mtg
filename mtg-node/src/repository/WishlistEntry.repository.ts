import { DB } from "../datasource";
import { WishlistEntry } from "../entity/WishlistEntry.entity";

export const WishlistEntryRepository = DB.getRepository(WishlistEntry)