import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MTGCard } from './MTGCard.entity.ts';
import { Deck } from './Deck.entity.ts';
import { WishlistEntryDTO } from 'mtg-common';
import { MTGCardRepository } from '../repository/MTGCard.repository.ts';
import { DeckRepository } from '../repository/Deck.repository.ts';

@Entity()
export class WishlistEntry {

    @PrimaryGeneratedColumn()
    id: number
    @OneToOne(() => MTGCard, {
        eager: true
    })
    @JoinColumn()
    card: MTGCard
    @Column()
    desiredEntries: number

    constructor(
        card: MTGCard,
        desiredEntries: number
    ) {
        this.card = card
        this.desiredEntries = desiredEntries
    }

    toDTO(){
        return <WishlistEntryDTO>{
            card: this.card.toDTO(),
            desiredCopies: this.desiredEntries,
            isInShoppingCart: false
        } 
    }

    static async fromDTO(entry: WishlistEntryDTO): Promise<WishlistEntry> {
        return new WishlistEntry(
            await MTGCardRepository.findOneBy({id: entry.card.id}),
            entry.desiredCopies
        )
    }
}