import { logger } from "../index.js";
import { DB } from "../datasource.js";
import { MTGCard } from "../entity/MTGCard.entity.js";
import { UpdateResult } from "typeorm";


export const MTGCardRepository = DB.getRepository(MTGCard).extend({
    async findAll(): Promise<[MTGCard[], number]> {
        return await this.createQueryBuilder("card")
            .leftJoinAndSelect('card.versions', 'versions')
            .leftJoinAndSelect('versions.set', 'set')
            .getManyAndCount()
    },
    async findAllOwned(): Promise<[MTGCard[], number]> {
        return await this.createQueryBuilder("card")
            .where("card.ownedCopies > 0")
            .getManyAndCount()
    },
    async findOneById(id: number): Promise<MTGCard> {
        return await this.createQueryBuilder("card")
            .where("card.id = :id", { id })
            .getOneOrFail()
    },
    async findOneByName(name: string): Promise<MTGCard> {
        return await this.createQueryBuilder("card")
            .where("card.name = :name", { name })
            .getOneOrFail()
    },
    async insert(cards: MTGCard[]): Promise<MTGCard[]> {
        logger.debug(`Inserted '${cards.length} cards'`)
        return this.save(cards);
    },
    async saveCard(card: MTGCard): Promise<MTGCard> {
        logger.debug(`Saved card '${card.name}'`)
        return this.save(card)
    },
    async clear(): Promise<UpdateResult> {
        return await this.createQueryBuilder("card")
            .update()
            .set({ ownedCopies: 0})
            .where("1")
            .execute()
    }
})