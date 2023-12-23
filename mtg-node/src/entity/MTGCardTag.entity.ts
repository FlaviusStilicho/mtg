import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToMany,
} from "typeorm";
import { MTGCard } from "./MTGCard.entity.js";

@Entity()
export class MTGCardTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany((type) => MTGCard, (card) => card.tags)
  cards: MTGCard[];
}
