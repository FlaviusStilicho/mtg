import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn, Repository } from "typeorm"
import { DB } from "../datasource.ts"
import { logger } from "../index.ts"
import { MTGCard } from "./MTGCard.entity.ts"
import { DeckDTO, DeckCardEntryDTO } from "mtg-common"
import { MTGCardRepository } from '../repository/MTGCard.repository.ts';
import { DeckFormat } from "../enum.ts"


interface DeckRules {
    formatName: string,
    cardMinimum: number
    cardMaximum: number
    maximumCardCopies: number
}



@Entity()
export class Deck {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string
    @Column({
        type: 'enum',
        enum: DeckFormat,
        default: DeckFormat.STANDARD
    })
    format: DeckFormat
    // @Column()
    @OneToMany(() => DeckCardEntry, entry => entry.deck, {
        eager: true,
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinTable()
    cardEntries: DeckCardEntry[]

    isValid(): [boolean, string] {
        try {
            if (this.format === 'standard') {
                this.verifyDeckLegal({
                    formatName: 'Standard',
                    cardMinimum: 60,
                    cardMaximum: 100,
                    maximumCardCopies: 4
                })
            } else if (this.format === 'commander') {
                this.verifyDeckLegal({
                    formatName: 'commander',
                    cardMinimum: 100,
                    cardMaximum: 100,
                    maximumCardCopies: 1
                })
            } else {
                throw Error('Format not supported!')
            }
            return [true, ""]
        } catch (err) {
            return [false, err]
        }
    }

    totalCards(): number {
        if (this.cardEntries.length === 0) {
            return 0
        } else {
            return this.cardEntries.map(entry => entry.copies).reduce((a, b) => a + b)
        }
    }

    constructor(
        id: number,
        name: string,
        format: string,
        cardEntries: DeckCardEntry[]
    ) {
        this.id = id
        this.name = name
        this.format = format as DeckFormat
        this.cardEntries = cardEntries
    }

    toDTO(): DeckDTO {
        const dto: DeckDTO = {
            id: this.id,
            name: this.name,
            format: this.format.toString(),
            cardEntries: this.cardEntries ? this.cardEntries.map(entry => entry.toDTO()) : []
        }
        return dto
    }

    static async fromDTO(dto: DeckDTO): Promise<Deck> {
        if (!dto.cardEntries) dto.cardEntries = []
        if (!dto.name || dto.name === "") {
            throw Error("Invalid name!")
        }
        if (!dto.format || dto.format === "") {
            throw Error("Invalid format!")
        }
        const entries = await dto.cardEntries.map(
            entry => DeckCardEntry.fromDTO(entry))

        return Promise.all(entries).then(entries => {
            return new Deck(
                dto.id ? dto.id : undefined,
                dto.name,
                dto.format,
                entries)
        })
    }

    verifyDeckLegal(rules: DeckRules): [boolean, string] {
        try {
            const numberOfCards = this.cardEntries.map(entry => entry.copies).reduce((a, b) => a + b)
            if (numberOfCards > rules.cardMaximum) throw new Error(`Deck contains too many cards. Maximum allowed in format ${rules.formatName}: ${rules.cardMaximum}. Currently contains: ${numberOfCards}`)
            if (numberOfCards < rules.cardMinimum) throw new Error(`Deck contains too few cards. Minimum allowed in format ${rules.formatName}: ${rules.cardMinimum}. Currently contains: ${numberOfCards}`)
            this.cardEntries.forEach(entry => {
                if (entry.card.type !== 'Basic Land' && entry.copies < rules.maximumCardCopies) {
                    throw new Error(`Deck contains too many copies of card ${entry.card.name}. Maximum allowed in format ${rules.formatName}: ${rules.maximumCardCopies}. Currently contains: ${entry.copies}`)
                }
            })
            return [true, null]
        } catch (err) {
            return [false, err]
        }
    }
}

@Entity()
export class DeckCardEntry {

    static repo: Repository<DeckCardEntry> = DB.manager.getRepository(DeckCardEntry)

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => MTGCard, {
        eager: true
    })
    card: MTGCard
    @Column()
    copies: number
    @ManyToOne(() => Deck, deck => deck.cardEntries)
    deck: Deck

    constructor(
        id: number,
        card: MTGCard,
        copies: number) {
        this.id = id
        this.card = card
        this.copies = copies
    }
    toDTO(): DeckCardEntryDTO {
        const dto: DeckCardEntryDTO = {
            id: this.id,
            card: this.card.toDTO(),
            copies: this.copies
        }
        return dto
    }

    static async fromDTO(entry: DeckCardEntryDTO): Promise<DeckCardEntry> {
        return new DeckCardEntry(
            entry.id,
            await MTGCardRepository.findOneById(entry.card.id),
            entry.copies,
        )
    }
}