import { DB } from "../datasource.ts";
import { WishlistEntry } from "../entity/WishlistEntry.entity.ts";

export const WishlistEntryRepository = DB.getRepository(WishlistEntry);
