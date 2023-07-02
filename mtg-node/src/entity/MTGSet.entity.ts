import { Entity, PrimaryGeneratedColumn, Column, JoinTable, OneToMany } from 'typeorm';
import { MTGCard } from './MTGCard.entity.js';
import { MTGSetDTO } from 'mtg-common';
@Entity()
export class MTGSet {

    @PrimaryGeneratedColumn()
    id: number
    @Column()
    shortName: string
    @Column()
    fullName: string
    @Column()
    scryfallId: string
    @Column()
    setType: string
    @Column()
    iconUrl: string
    @Column({
       nullable: true,
    })
    releaseDate: Date
    @OneToMany((type) => MTGCard, (card) => card.set)
    @JoinTable()
    cards: MTGCard[]

    constructor(
        shortName: string,
        fullName: string,
        scryfallId: string,
        setType: string,
        iconUrl: string,
        releaseDate: Date
    ) {
        this.shortName = shortName
        this.fullName = fullName
        this.scryfallId = scryfallId
        this.setType = setType
        this.iconUrl = iconUrl
        this.releaseDate = releaseDate
    }

    equals(anotherSet: MTGSet) {
        return this.shortName === anotherSet.shortName &&
            this.fullName === anotherSet.fullName &&
            this.scryfallId === anotherSet.scryfallId &&
            this.setType === anotherSet.setType &&
            this.iconUrl === anotherSet.iconUrl &&
            this.releaseDate.toISOString() === anotherSet.releaseDate.toISOString()
    }

    toDTO(){
        return <MTGSetDTO>{
            id: this.id,
            shortName: this.shortName,
            fullName: this.fullName,
            setType: this.setType,
            iconUrl: this.iconUrl,
            releaseDate: this.releaseDate.toString()
        }
    }
    
}
