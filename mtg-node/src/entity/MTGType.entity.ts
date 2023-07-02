import { Column, Entity, PrimaryGeneratedColumn, Repository } from "typeorm"
import { DB } from "../datasource.ts"

@Entity()
export class MTGType {

    static repo: Repository<MTGType> = DB.manager.getRepository(MTGType)

    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
}