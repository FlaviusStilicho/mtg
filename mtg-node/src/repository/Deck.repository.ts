import { logger } from "../index.ts";
import { Deck } from "../entity/Deck.entity.ts";
import { DB } from "../datasource.ts";


export const DeckRepository = DB.getRepository(Deck).extend({
    async saveOne(deck: Deck): Promise<Deck> {
        logger.debug(`Saved deck '${deck.name}'`)
        return await this.save(deck);
    },
    async findById(id: number) {
        return await this.findOneByOrFail({ id })
    },
    async deleteOne(deck: Deck) {
        logger.debug(`Deleting deck '${deck.name}'`)
        return await this.delete({ id: deck.id })
    }, 
    async clear() {
        logger.debug(`Clearing all decks`)
        return this.createQueryBuilder("deck")
            .delete()
            .where("1")
            .execute()
    }
})
