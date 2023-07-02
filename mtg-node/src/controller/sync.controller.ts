import { Request, Response } from "express";
import { MTGCard, MTGCardVersion } from "../entity/MTGCard.entity.ts";
import got from "got";
import { ConcurrencyManager } from "axios-concurrency";
import axios from "axios";
import { DB } from "../datasource.ts";
import { logger } from "../index.ts"
import { MTGSet } from "../entity/MTGSet.entity.ts";
import assert from "node:assert";
import { Sleep } from "../util.ts";
import { scryfallPublicApiUrl, max_concurrent_requests } from '../constants.ts';
import { DownloadCardImages } from "../clients/scryfallCardsApi.client.ts";
import { MTGSetRepository } from "../repository/MTGSet.repository.ts";
import { MTGCardRepository } from "../repository/MTGCard.repository.ts";

let scryfallPublicApi = axios.create({
    baseURL: scryfallPublicApiUrl,
    responseType: 'json'
});
const manager = ConcurrencyManager(scryfallPublicApi, max_concurrent_requests);

const getSetsUrl = `${scryfallPublicApiUrl}/sets`
const getCardsUrl = `${scryfallPublicApiUrl}/cards/search?q=(f:pioneer or f:standard or f:commander)`
const getCardsReprintsUrl = `${scryfallPublicApiUrl}/cards/search?q=(f:pioneer or f:standard or f:commander )&unique=prints`

export const Sync = async (req: Request, res: Response) => {
    const start = new Date().getTime();
    await SyncSets().then((sets: MTGSet[]) => {
        SyncCards(sets).then(result => {
            let elapsed = new Date().getTime() - start;
            res.send({
                "status": "success!",
                "runtime": elapsed,
                details: result
            });
        })
    })
}

export const SyncSets = async (): Promise<MTGSet[]> => {
    return await got.get(getSetsUrl).json().then(response => {
        const setPromiseArray = []
        response['data'].forEach(rawSet => {
            const set = new MTGSet(
                rawSet['code'],
                rawSet['name'],
                rawSet['id'],
                rawSet['set_type'],
                rawSet['icon_svg_uri'],
                new Date(rawSet['released_at'])
            )
            setPromiseArray.push(MTGSetRepository.save(set))
        })
        return setPromiseArray
    }).then(async (sets: MTGSet[]) => {
        while (true) {
            const setsFromDb: MTGSet[] = await MTGSetRepository.find()
            if (setsFromDb.length === sets.length) {
                return setsFromDb
            }
            Sleep(100)
        }
    })
}

interface ParseResult {
    totalCardsInDB: number
    updatedCards: number
    newCardsInserted: number
    unchangedCards: number
}

enum CardState {
    New,
    Updated,
    Unchanged,
}

const SyncCards = async (sets: MTGSet[]): Promise<ParseResult> => {
    const [allCards, totalCardsFromDB] = await MTGCardRepository.findAll()
    logger.info(`${totalCardsFromDB} cards fetched from DB`)

    const cardsMap: Map<string, [MTGCard, CardState]> = new Map(allCards.map(card => [card.name, [card, CardState.Unchanged]]))
    logger.info(`Mapped cards to hashmap`)

    await fetchCardsFromScryfall(sets, cardsMap, getCardsUrl, ParseCard);
    await fetchCardsFromScryfall(sets, cardsMap, getCardsReprintsUrl, ParseAndAttachCardVersion)

    const newCards: MTGCard[] = Array.from(cardsMap.values()).filter(entry => entry[1] === CardState.New).map(entry => entry[0])
    return await MTGCardRepository.insert(newCards).then(async () => {
        const updatedCards: MTGCard[] = Array.from(cardsMap.values()).filter(entry => entry[1] === CardState.Updated).map(entry => entry[0])
        updatedCards.forEach(card => MTGCardRepository.save(card))
        return {
            totalCardsInDB: cardsMap.keys.length,
            updatedCards: Array.from(cardsMap.values()).filter(entry => entry[1] === CardState.Updated).length,
            newCardsInserted: Array.from(cardsMap.values()).filter(entry => entry[1] === CardState.New).length,
            unchangedCards: Array.from(cardsMap.values()).filter(entry => entry[1] === CardState.Unchanged).length
        }
    })
}

async function fetchCardsFromScryfall(sets: MTGSet[], cardsMap: Map<string, [MTGCard, CardState]>, url: string, parseFunction: Function): Promise<void> {
    var page_num = 1;
    var done: boolean = false;

    while (!done) {
        logger.info(`fetching page ${page_num}`)
        await scryfallPublicApi.get(`${url}&page=${page_num}`).then(response => {
            page_num++;
            done = !response.data['has_more'];
            logger.debug(`Fetched total of ${response.data['data'].length} cards`);
            response.data['data'].forEach(async (card) => {
                parseFunction(card, sets, cardsMap);
            });
        })
        Sleep(100);
        // if (page_num == 20){
        //     done=true
        // }
    }
    return
}

function ParseCard(rawCard: object, sets: MTGSet[], cardsMap: Map<string, [MTGCard, CardState]>): void {
    var card: MTGCard;

    if (rawCard['card_faces']) {
        const front = rawCard['card_faces'][0]
        const back = rawCard['card_faces'][1]

        card = new MTGCard(
            front['name'],
            parseColorIdentity(rawCard),
            front['type_line'],
            rawCard['rarity'],
            front['mana_cost'] ? front['mana_cost'] : "N/A",
            ParseDoubleSidedCardCMC(rawCard),
            front['oracle_text'],
            front['power'],
            front['toughness'],
            [ParseCardVersion(rawCard, sets, true)],
            back['name'],
            back['type_line'],
            back['oracle_text'],
        )
    } else {
        card = new MTGCard(
            rawCard['name'],
            parseColorIdentity(rawCard),
            rawCard['type_line'],
            rawCard['rarity'],
            rawCard['mana_cost'],
            rawCard['cmc'] ? parseInt(rawCard['cmc']) : 0,
            rawCard['oracle_text'],
            rawCard['power'],
            rawCard['toughness'],
            [ParseCardVersion(rawCard, sets, true)]
        )
    }

    if (card.isValid()) {
        const existingCard = cardsMap.get(card.name)
        if (!existingCard) {
            cardsMap.set(card.name, [card, CardState.New])
            logger.debug(`inserting card ${card.name}`)
        } else if (!existingCard[0].equals(card)) {
            card.id = existingCard[0].id
            cardsMap.set(card.name, [card, CardState.Updated])
            logger.info(`updating card ${card.name}`)
        } else {
            logger.debug(`no changes to card ${card.name}`)
        }
    } else {
        throw Error(`Error parsing card ${rawCard}`)
    }
}

function ParseAndAttachCardVersion(rawCard: object, sets: MTGSet[], cardsMap: Map<string, [MTGCard, CardState]>) {
    try {
        const cardName: string = rawCard['card_faces'] ? rawCard['card_faces'][0]['name'] : rawCard['name']
        const cardEntry: [MTGCard, CardState] = cardsMap.get(cardName)
        const card: MTGCard = cardEntry[0]
        const cardVersion: MTGCardVersion = ParseCardVersion(rawCard, sets, false);
        const existingVersion: MTGCardVersion = card.getVersion(cardVersion.scryfallId)
        if (!existingVersion) {
            card.versions.push(cardVersion)
            if (cardEntry[1] !== CardState.New) {
                cardEntry[1] = CardState.Updated
            }
            logger.debug(`Adding version to card ${card.name} with id ${cardVersion.scryfallId}`)
        } else if (!existingVersion.equals(cardVersion)) {
            existingVersion.update(cardVersion)
            if (cardEntry[1] !== CardState.New) {
                cardEntry[1] = CardState.Updated
            }
            logger.debug(`Updating version of card ${card.name} with id ${cardVersion.scryfallId}`)
        } else {
            logger.debug(`Skipping version on card ${card.name} with id ${cardVersion.scryfallId}`)
        }
    } catch (err) {
        logger.error(`Cannot find card ${rawCard['name']}.Skipping. Err: ${err}`)
    }
}

function ParseCardVersion(rawCard: object, sets: MTGSet[], isPrimaryVersion: boolean): MTGCardVersion {
    const matchedSets = sets.filter(set => set.shortName === rawCard['set'])
    assert.equal(matchedSets.length, 1)

    if (rawCard['card_faces']) {
        const front = rawCard['card_faces'][0]
        const back = rawCard['card_faces'][1]

        return new MTGCardVersion(
            rawCard['id'],
            front['illustration_id'],
            rawCard['rulings_uri'],
            rawCard['scryfall_uri'],
            parseImageUri(rawCard, front),
            matchedSets[0],
            isPrimaryVersion,
            rawCard['legalities']['standard'] === "legal" ? true : false,
            rawCard['legalities']['commander'] === "legal" ? true : false,
            back['illustration_id'],
            parseImageUri(rawCard, back)
        )
    } else {
        return new MTGCardVersion(
            rawCard['id'],
            rawCard['illustration_id'],
            rawCard['rulings_uri'],
            rawCard['scryfall_uri'],
            rawCard['image_uris']['normal'],
            matchedSets[0],
            isPrimaryVersion,
            rawCard['legalities']['standard'] === "legal" ? true : false,
            rawCard['legalities']['commander'] === "legal" ? true : false,
        )
    }
}

function ParseDoubleSidedCardCMC(rawCard: object): number {
    if (rawCard['cmc']){
        return rawCard['cmc']
    } else if (rawCard['card_faces'][0]['cmc']){
        return rawCard['card_faces'][0]['cmc']
    } else {
        return 0
    }
}

function parseImageUri(rawCard: object, face: object): string {
    try {
        return face['image_uris']['normal']
    } catch (err) {
        return rawCard['image_uris']['normal']
    }
}

function parseColorIdentity(rawCard: object): string {
    var colorIdentity = rawCard['color_identity'].join("");
    if (colorIdentity === "") {
        colorIdentity = "C";
    }
    return colorIdentity;
}

export async function ClearCards(req: Request, res: Response) {
    logger.info("Clearing cards!")
    await DB.manager.query("DELETE FROM mtg_card_tags_mtg_card_tag WHERE 1").then(
        async () => {
            logger.info("Cleared extra categories")
            await DB.manager.query("DELETE FROM card WHERE 1")
        }).then(
            () => logger.info("Cleared all cards!")
        )
    res.sendStatus(200)
}

export const GetScryfallInfoForCard = async (req: Request, res: Response) => {
    await scryfallPublicApi.get(`/cards/search?q=${req.query.name}&unique=prints}`).then(response => res.send(response))
}

export const SyncImages = async (req: Request, res: Response) => {
    const [allCards, _] = await MTGCardRepository.findAndCount()
    allCards.forEach(card => DownloadCardImages(card))
    res.sendStatus(200)

}
