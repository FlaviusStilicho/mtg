import express, {Router} from 'express'
import { ClearCards, GetScryfallInfoForCard, Sync, SyncImages } from './controller/sync.controller.ts'
import { GetCards, UpdateCard, AddCardCategory, RemoveCardCategory, UpdateCardOwnedCopies } from './controller/card.controller.ts';
import { UploadDelverFile, UploadDelverFileAdditive } from './controller/fileUpload.controller.ts';
import { GetSets } from './controller/set.controller.ts';
import { GetTypes } from './controller/type.controller.ts';
import { GetColors } from './controller/color.controller.ts';
import { CreateDeck, GetDeck, ListDecks, CheckDeck, ClearDecks, ListDeckNames, CopyDeck, UploadDeck } from './controller/deck.controller.ts';
import { DeleteDeck, UpdateDeck } from './controller/deck.controller.ts';
import { ClearCollection, CreateBuylistMultipleDecks, ExportCollection, GetCollection } from './controller/collection.controller.ts';

export const routes = (router: Router) => {


    router.get("/types", GetTypes)   

    router.get("/cards", GetCards)
    router.post("/cards", UpdateCard)
    router.post("/cards/ownedCopies", UpdateCardOwnedCopies)
    router.post("/cardCategories", AddCardCategory)
    router.delete("/cardCategories", RemoveCardCategory)

    router.get("/colors", GetColors)

    router.get("/decks/list", ListDecks)
    router.get("/decks/list/short", ListDeckNames)
    router.get("/decks", GetDeck)
    router.get("/decks/check", CheckDeck)
    router.post("/decks", CreateDeck)
    router.post("/decks/upload", UploadDeck)
    router.post("/decks/copy", CopyDeck)
    router.put("/decks", UpdateDeck)
    router.delete("/decks", DeleteDeck)
    router.delete("/decks/clear", ClearDecks)
    
    router.post("/sync", Sync)
    router.post("/syncImages", SyncImages)
    router.delete("/sync", ClearCards)
    router.get("/sync", GetScryfallInfoForCard)
    router.get("/sets", GetSets) 

    router.post("/uploads/delver/", UploadDelverFile)
    router.use("/uploads/delver/", express.static('./uploads/delver'));
    router.post("/uploads/delver/additive", UploadDelverFileAdditive)
    router.use("/uploads/delver/additive", express.static('./uploads/delver'));
    
    router.get("/collection/", GetCollection)
    router.get("/collection/export", ExportCollection)
    router.post("/collection/buyList", CreateBuylistMultipleDecks)
    router.delete("/collection/clear", ClearCollection)
}