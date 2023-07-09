import { Request, Response } from "express";
import { Deck, DeckCardEntry } from '../entity/Deck.entity.ts';
import { CheckDeckRequest, CreateDeckResponse, DeleteDeckRequest, GetDeckRequest, DeckMetadata, ListDecksResponse, ListDeckNamesResponse, DeckDTO } from 'mtg-common';
import { DeckRepository } from '../repository/Deck.repository.ts';
import { logger } from "../index.ts";
import { DeckCardEntryRepository } from "../repository/DeckCardEntry.repository.ts";


export const ListDecks = async (req: Request, res: Response<ListDecksResponse>) => {
    await DeckRepository.findAndCount().then(result => {
        const decks = result[0].map(deck => deck.toDTO())
        const total = result[1]
        res.send({
            decks,
            total
        })
    })
}

export const ListDeckNames = async (req: Request, res: Response<ListDeckNamesResponse>) => {
    await DeckRepository.findAndCount().then(result => {
        const decks: DeckMetadata[] = result[0].map(deck => {
            const metaData: DeckMetadata = {
                id: deck.id,
                name: deck.name,
                totalCards: deck.totalCards()
            }
            return metaData
        })
        const total = result[1]
        res.send({
            decks,
            total
        })
    })
}

export const CreateDeck = async (req: Request<{}, {}, DeckDTO, {}>, res: Response<CreateDeckResponse>) => {
    Deck.fromDTO(req.body).then(
        deck => DeckRepository.saveOne(deck).then(
            deck => res.send({ id: deck.id })))
        .catch(err => res.status(400).send(err.toString()))
}

export const DeleteDeck = async (req: Request<{}, {}, {}, DeleteDeckRequest>, res: Response) => {
    const deckId= req.query.id
    await DeckCardEntryRepository
    .createQueryBuilder()
    .delete()
    .from(DeckCardEntry)
    .where('deckId = :deckId', { deckId })
    .execute();

    DeckRepository.delete(deckId).then(
        _ => res.sendStatus(200)).catch(
            err => {
                logger.error(err);
                res.sendStatus(404)
            })

    // find the deck
    // DeckRepository.findById(req.query.id).then(
    //     // find all entries
    //     deck => DeckCardEntryRepository.findBy({ deck: deck }).then(
    //         // delete all entries
    //         entries => DeckCardEntryRepository.remove(entries).then(
    //             // find the deck again
    //             _ => DeckRepository.findById(req.query.id).then(
    //                 // remove the deck
    //                 deck => DeckRepository.remove(deck)).then(
    //                     _ => res.sendStatus(200)).catch(
    //                         err => {
    //                             logger.error(err);
    //                             res.sendStatus(404)
    //                         }))))
}

export const ClearDecks = async (req: Request<{}, {}, {}, {}>, res: Response) => {
    DeckRepository.clear().then(() => res.sendStatus(200))
}

export const GetDeck = async (req: Request<{}, {}, {}, GetDeckRequest>, res: Response<DeckDTO>) => {
    DeckRepository.findById(req.query.id).then(
        deck => res.send(deck.toDTO())).catch(
            () => res.sendStatus(404))
}

export const UpdateDeck = async (req: Request<{}, {}, DeckDTO, {}>, res: Response) => {
    Deck.fromDTO(req.body).then(
        deck => DeckRepository.saveOne(deck).then(
            () => res.sendStatus(200)
        ))
}

export const CheckDeck = async (req: Request<{}, {}, {}, CheckDeckRequest>, res: Response) => {
    const [valid, message] = await DeckRepository.findById(req.query.id).then(deck => deck.isValid())
    const responseBody = {
        valid: valid,
    }
    if (message) responseBody['message'] = message
    res.send(responseBody)
}

// export const ExportDeck = async (req: Request<{}, {}, {}, GetCardsQueryParams>, res: Response) => {

// }

// export const ExportDeckBuyList = async (req: Request<{}, {}, {}, GetCardsQueryParams>, res: Response) => {

// }