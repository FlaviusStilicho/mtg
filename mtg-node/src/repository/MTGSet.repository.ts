import { EntityNotFoundError, UpdateResult } from "typeorm"
import { logger } from "../index.ts"
import { DB } from "../datasource.ts"
import { MTGSet } from "../entity/MTGSet.entity.ts"

export const MTGSetRepository = DB.getRepository(MTGSet).extend({
    async findOneByScryfallId(scryfallId: string) {
        return await this.repo.createQueryBuilder("mtg_set")
            .where("mtg_set.scryfallId = :scryfallId", { scryfallId })
            .getOneOrFail()
    }
}).extend({
    async insert(set: MTGSet): Promise<MTGSet> {
        logger.debug(`Inserted set '${set.fullName}'`)
        return this.save(set);
    }
}).extend({
    async update(set: MTGSet): Promise<UpdateResult> {
        logger.debug(`Updated set '${set.fullName}'`)
        return this.update(set.id, set);
    }
}).extend({
    async save(set: MTGSet): Promise<MTGSet> {
        return await this.findOneByScryfallId(
            set.scryfallId,
        ).then(async existingSet => {
            if (existingSet.equals(this)) {
                logger.info(`Set ${set.fullName} already in database. Skipping.`)
            } else {
                set.id = existingSet.id;
                await this.update(set)
                return this;
            }
        }).catch(async err => {
            if (err instanceof EntityNotFoundError) {
                return await this.insert(set)
            } else {
                logger.error(`Unexpected error: ${err}`)
            }
        })

    }
})