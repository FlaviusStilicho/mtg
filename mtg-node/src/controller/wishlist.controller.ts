import { WishlistEntryDTO } from 'mtg-common';
import { WishlistEntryRepository } from '../repository/WishlistEntry.repository.ts';
import { Request, Response } from "express";
import { logger } from "./../index.ts"
import { WishlistEntry } from '../entity/WishlistEntry.entity.ts';

export const GetWishlistEntries = async (req: Request, res: Response<WishlistEntryDTO[]>) => {
    WishlistEntryRepository.find().then(entries => {
        logger.info(`found ${entries.length} wishlist entries!`)
        res.send(entries.map(entry => entry.toDTO()))})
}

export const SaveWishlist = async (req: Request<{}, {}, WishlistEntryDTO[], {}>, res: Response) => {
    const dtos: WishlistEntryDTO[] = Object.values(req.body)
    Promise.all(dtos.map(entry => WishlistEntry.fromDTO(entry))).then(
        async (newWishlistEntries: WishlistEntry[]) => {
            await WishlistEntryRepository.find().then(currentWishlistEntries => {
                if(newWishlistEntries.length > 0){
                    newWishlistEntries.forEach(newEntry => {
                        currentWishlistEntries.forEach(currentEntry => {
                            if(newEntry.card.id === currentEntry.card.id){
                                newEntry.id = currentEntry.id
                            }
                        })
                    })
                    logger.info(`saving ${newWishlistEntries.length} wishlist entries`)
                    WishlistEntryRepository.save(newWishlistEntries)
                }

                const newWishlistEntryCardIds: Set<number> = new Set(newWishlistEntries.map(entry => entry.card.id))
                const wishlistEntriesToDelete: WishlistEntry[] = currentWishlistEntries.filter(entry =>
                    !newWishlistEntryCardIds.has(entry.card.id)
                )
                
                logger.info(`deleting ${wishlistEntriesToDelete.length} wishlist entries`)
                wishlistEntriesToDelete.forEach(entry => WishlistEntryRepository.delete(entry.id))
            })
        }
    )

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