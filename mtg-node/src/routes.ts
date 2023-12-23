import express, { Router } from "express";
import {
  ClearCards,
  GetScryfallInfoForCard,
  Sync,
  SyncImages,
} from "./controller/sync.controller.ts";
import {
  GetCards,
  UpdateCard,
  AddCardCategory,
  RemoveCardCategory,
  UpdateCardOwnedCopies,
  GetCardPrice,
} from "./controller/card.controller.ts";
import {
  UploadDelverFile,
  UploadDelverFileAdditive,
} from "./controller/fileUpload.controller.ts";
import { GetSets } from "./controller/set.controller.ts";
import { GetTypes } from "./controller/type.controller.ts";
import { GetColors } from "./controller/color.controller.ts";
import {
  CreateDeck,
  GetDeck,
  ListDecks,
  CheckDeck,
  ClearDecks,
  ListDeckNames,
  CopyDeck,
  UploadDeck,
} from "./controller/deck.controller.ts";
import { DeleteDeck, UpdateDeck } from "./controller/deck.controller.ts";
import {
  ClearCollection,
  CreateBuylistMultipleDecks,
  ExportCollection,
  GetCollection,
} from "./controller/collection.controller.ts";
import {
  GetWishlistEntries,
  SaveWishlist,
} from "./controller/wishlist.controller.ts";

export const routes = (router: Router) => {
  router.get("/types", GetTypes);

  router.get("/cards", GetCards);
  router.post("/cards", UpdateCard);
  router.post("/cards/ownedCopies", UpdateCardOwnedCopies);
  router.post("/cardCategories", AddCardCategory);
  router.delete("/cardCategories", RemoveCardCategory);

  router.get("/colors", GetColors);

  router.get("/decks", ListDecks);
  router.get("/decks/short", ListDeckNames);
  router.get("/deck", GetDeck);
  router.get("/deck/check", CheckDeck);
  router.post("/deck", CreateDeck);
  router.post("/deck/upload", UploadDeck);
  router.post("/deck/copy", CopyDeck);
  router.put("/deck", UpdateDeck);
  router.delete("/deck", DeleteDeck);
  router.delete("/decks/clear", ClearDecks);

  router.get("/price/:cardName", GetCardPrice);

  router.get("/wishlist", GetWishlistEntries);
  // router.post("/wishlist", AddWishlistEntry)
  router.post("/wishlist", SaveWishlist);
  // router.delete("/wishlist", RemoveWishlistEntry)

  router.post("/sync", Sync);
  router.post("/syncImages", SyncImages);
  router.delete("/sync", ClearCards);
  router.get("/sync", GetScryfallInfoForCard);
  router.get("/sets", GetSets);

  router.post("/uploads/delver/", UploadDelverFile);
  router.use("/uploads/delver/", express.static("./uploads/delver"));
  router.post("/uploads/delver/additive", UploadDelverFileAdditive);
  router.use("/uploads/delver/additive", express.static("./uploads/delver"));

  router.get("/collection/", GetCollection);
  router.get("/collection/export", ExportCollection);
  router.post("/collection/buyList", CreateBuylistMultipleDecks);
  router.delete("/collection/clear", ClearCollection);
};
