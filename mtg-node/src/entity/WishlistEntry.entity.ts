import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MTGCard } from './MTGCard.entity.ts';
import { Deck } from './Deck.entity.ts';
import { WishlistEntryDTO } from '../../../mtg-common/src/DTO';
import { MTGCardRepository } from '../repository/MTGCard.repository.ts';
import { DeckRepository } from '../repository/Deck.repository.ts';

@Entity()
export class WishlistEntry {

    @PrimaryGeneratedColumn()
    id: number
    @OneToOne(() => MTGCard)
    @JoinColumn()
    card: MTGCard
    @OneToOne(() => Deck)
    @JoinColumn()
    deck: Deck
    @Column()
    shop: string

    constructor(
        card: MTGCard,
        deck: Deck,
        shop: string
    ) {
        this.card = card
        this.deck = deck
        this.shop = shop
    }

    toDTO(){
        return <WishlistEntryDTO>{
            card: this.card.toDTO(),
            deck: this.deck.toDTO(),
            shop: this.shop,
            isInShoppingCart: false
        } 
    }

    static async fromDTO(entry: WishlistEntryDTO): Promise<WishlistEntry> {
        return new WishlistEntry(
            await MTGCardRepository.findOneBy({id: entry.card.id}),
            await DeckRepository.findOneBy({id: entry.deck.id}),
            entry.shop
        )
    }

    

}