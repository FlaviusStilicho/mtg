import { Entity, Column, PrimaryGeneratedColumn, Index, JoinTable, Repository, ManyToOne } from "typeorm";
import { DB } from "../datasource.ts";
import { MTGSet } from './MTGSet.entity.ts';
import { MTGCard } from "./MTGCard.entity.ts";
import { MTGCardVersionDTO } from 'mtg-common';

// @Entity()
// export class MTGCardVersion {

//     static repo: Repository<MTGCardVersion> = DB.manager.getRepository(MTGCardVersion)

//     @PrimaryGeneratedColumn()
//     id: number

//     @Index()
//     @Column()
//     scryfallId: string
//     @Column({ default: null })
//     frontIllustrationId: string
//     @Column({ default: null })
//     backIllustrationId: string
//     @Column()
//     rulingsUri: string
//     @Column()
//     scryfallUri: string
//     @Column()
//     frontImageUri: string
//     @Column()
//     backImageUri: string
//     @Index()
//     @ManyToOne((type) => MTGSet, (set) => set.cards, {
//         cascade: true
//     })
//     @JoinTable()
//     set: MTGSet
//     @Column()
//     @Index()
//     isPrimaryVersion: boolean    
//     @Column()
//     @Index()
//     isStandardLegal: boolean
//     @Column()
//     @Index()
//     isCommanderLegal: boolean
//     @Index()
//     @ManyToOne((type) => MTGCard, (card) => card.versions)
//     card: MTGCard

//     constructor(
//         card: MTGCard,
//         scryfallId: string,
//         frontIllustrationId: string,
//         rulingsUri: string,
//         scryfallUri: string,
//         frontImageUri: string,
//         set: MTGSet,
//         isPrimaryVersion: boolean,
//         standardLegal: boolean,
//         commanderLegal: boolean,
//         backIllustrationId: string = null,       
//         backImageUri: string = null,
//     ) {
//         this.card = card
//         this.scryfallId = scryfallId
//         this.frontIllustrationId = frontIllustrationId
//         this.rulingsUri = rulingsUri
//         this.scryfallUri = scryfallUri
//         this.frontImageUri = frontImageUri
//         this.set = set,
//         this.isPrimaryVersion = isPrimaryVersion
//         this.isStandardLegal = standardLegal
//         this.isCommanderLegal = commanderLegal
//         this.backIllustrationId = backIllustrationId
//         this.backImageUri = backImageUri
//     }

//     equals(anotherVersion: MTGCardVersion): boolean {
//         return this.card == anotherVersion.card &&
//         this.scryfallId == anotherVersion.scryfallId &&
//         this.frontIllustrationId == anotherVersion.frontIllustrationId &&
//         this.rulingsUri == anotherVersion.rulingsUri &&
//         this.scryfallUri == anotherVersion.scryfallUri &&
//         this.frontImageUri == anotherVersion.frontImageUri &&
//         this.set == anotherVersion.set &&
//         this.isStandardLegal == anotherVersion.isStandardLegal &&
//         this.isCommanderLegal == anotherVersion.isCommanderLegal &&
//         this.backIllustrationId == anotherVersion.backIllustrationId &&
//         this.backImageUri == anotherVersion.backImageUri
//     }

//     toDTO() {
//         return <MTGCardVersionDTO>{
//             isPrimaryVersion: this.isPrimaryVersion,
//             scryfallId: this.scryfallId,
//             frontImageUri: this.frontImageUri,
//             backImageUri: this.backImageUri
//         }
//     }
// }