import { Column, Entity, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { DB } from '../datasource';

// @Entity()
// export class MTGCardTypes {

//     static repo: Repository<MTGCardTypes> = DB.manager.getRepository(MTGCardTypes)
//     static superTypes: string[] = [
//         // "Basic",
//         "Legendary",
//         // "Ongoing",
//         // "Snow",
//         // "World",
//         // "Elite",
//         // "Host",
//     ]

//     static types: string[] = [
//         "Legendary",
//         "Land", 
//         "Creature", 
//         "Artifact", 
//         "Enchantment", 
//         "Planeswalker", 
//         "Instant", 
//         "Sorcery"
//     ]

//     @PrimaryGeneratedColumn()
//     id: number
//     @Column()
//     name: string


