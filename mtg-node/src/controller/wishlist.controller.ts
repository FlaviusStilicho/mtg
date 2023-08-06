import { WishlistEntryDTO } from '../../../mtg-common/src/DTO';
import { WishlistEntryRepository } from '../repository/WishlistEntry.repository';
import { Request, Response } from "express";
import { logger } from "./../index.ts"
import { WishlistEntry } from '../entity/WishlistEntry.entity';

export const GetWishlistEntries = async (req: Request, res: Response<WishlistEntryDTO[]>) => {
    WishlistEntryRepository.find().then(entries => res.send(entries.map(entry => entry.toDTO())))
}

export const AddWishlistEntry = async (req: Request<{}, {}, WishlistEntryDTO, {}>, res: Response) => {
    const cardName = req.body.card.name
    await WishlistEntryRepository
        .createQueryBuilder("wishlistEntry")
        .innerJoinAndSelect("wishlistEntry.card", "card")
        .where("card.name = :name", { name: cardName })
        .getMany().then(async entries => {
            if(entries.length === 0){
                WishlistEntryRepository.save(await WishlistEntry.fromDTO(req.body))
                logger.info(`New wishlist entry added for card ${cardName}`)
                res.send(200)
            } else {
                logger.info(`A wishlist entry already exists for card ${cardName}`)
                res.sendStatus(409)
            }
        })
}

export const RemoveWishlistEntry = async (req: Request<{}, {}, WishlistEntryDTO, {}>, res: Response) => {
    const cardName = req.body.card.name
    await WishlistEntryRepository
        .createQueryBuilder("wishlistEntry")
        .innerJoinAndSelect("wishlistEntry.card", "card")
        .where("card.name = :name", { name: cardName })
        .getMany().then(async entries => {
            if(entries.length === 1){
                WishlistEntryRepository.delete({ id: entries[0].id })
                logger.info(`Wishlist entry deleted for card ${cardName}`)
                res.send(200)
            } else if (entries.length === 0) {
                res.sendStatus(404)
            } else {
                res.sendStatus(400)
            }
        })
}