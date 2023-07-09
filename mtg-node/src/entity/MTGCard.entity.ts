import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToMany, JoinTable, Repository, ManyToOne, OneToMany, FindOptionsUtils } from "typeorm";
import { DB } from "../datasource.ts";
import { MTGCardTag } from './MTGCardTag.entity.ts';
import { logger } from "../index.ts"
import { MTGSet } from './MTGSet.entity.ts';
import { MTGCardDTO, MTGCardVersionDTO } from "mtg-common";
import { CardQueryParameters } from 'mtg-common';
import { colors as allColors } from "../controller/color.controller.ts";
import assert from "node:assert";

@Entity()
export class MTGCard {

    static repo: Repository<MTGCard> = DB.manager.getRepository(MTGCard)

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Index({ fulltext: true })
    name: string
    @Column()
    @Index({ fulltext: true })
    colorIdentity: string
    @Column()
    @Index()
    type: string
    @Column({
        default: null,
        nullable: true
    })
    @Index()
    backSideType: string
    @Column()
    @Index()
    rarity: string
    @Column()
    @Index({ fulltext: true })
    manaCost: string
    @Column()
    @Index()
    convertedManaCost: number
    @Column({
        default: null,
        nullable: true
    })
    @Index({ fulltext: true })
    backSideName: string
    @Index({ fulltext: true })
    @Column({
        length: 2000,
        default: null,
        nullable: true
    })
    text: string
    @Index({ fulltext: true })
    @Column({
        length: 2000,
        default: null,
        nullable: true
    })
    backSideText: string
    @Index()
    @ManyToOne(() => MTGSet, (set) => set.cards, {
        cascade: true
    })
    @JoinTable()
    set: MTGSet
    @Column({
        default: null,
        nullable: true
    })
    power: string
    @Column({
        default: null,
        nullable: true
    })
    toughness: string
    @Column({
        default: null,
        nullable: true
    })
    @Index()
    standardLegal: boolean
    @Column({
        default: null,
        nullable: true
    })
    @Index()
    commanderLegal: boolean
    @Column({ default: 0 })
    @Index()
    ownedCopies: number
    @Column({
        default: null,
        nullable: true
    })
    @Index()
    constructedRating: number
    @Column({
        default: null,
        nullable: true
    })
    @Index()
    limitedRating: number
    @ManyToMany(() => MTGCardTag, (tag) => tag.cards, {
        cascade: true,
        eager: true,
    })
    @JoinTable()
    tags: MTGCardTag[]
    @OneToMany(() => MTGCardVersion, (version) => version.card, {
        eager: true,
        cascade: true,
    })
    versions: MTGCardVersion[]

    constructor(
        name: string,
        color: string,
        type: string,
        rarity: string,
        manaCost: string,
        convertedManaCost: number,
        text: string,
        power: string,
        toughness: string,
        standardLegal: boolean,
        commanderLegal: boolean,
        versions: MTGCardVersion[],
        backSideName: string = null,
        backSideType: string = null,
        backSideText: string = null,
        ownedCopies: number = 0,
        constructedRating: number = -1,
        limitedRating: number = -1,
    ) {
        this.name = name
        this.colorIdentity = color
        this.type = type
        this.rarity = rarity
        this.manaCost = manaCost
        this.convertedManaCost = convertedManaCost
        this.text = text
        this.power = power ? power : null
        this.toughness = toughness ? toughness : null
        this.standardLegal = standardLegal
        this.commanderLegal = commanderLegal
        this.versions = versions
        this.backSideName = backSideName
        this.backSideType = backSideType
        this.backSideText = backSideText
        this.ownedCopies = ownedCopies
        this.constructedRating = constructedRating
        this.limitedRating = limitedRating

    }

    isValid() {
        return this.name &&
            this.colorIdentity &&
            this.type &&
            this.rarity &&
            (this.manaCost || this.manaCost == '') &&
            (this.convertedManaCost || this.convertedManaCost === 0)
    }

    equals(anotherCard: MTGCard) {
        return this.name === anotherCard.name &&
            this.colorIdentity === anotherCard.colorIdentity &&
            this.type === anotherCard.type &&
            this.rarity === anotherCard.rarity &&
            this.manaCost === anotherCard.manaCost &&
            this.convertedManaCost === anotherCard.convertedManaCost &&
            this.text === anotherCard.text &&
            this.power === anotherCard.power &&
            this.toughness === anotherCard.toughness &&
            this.set === anotherCard.set &&
            this.backSideName === anotherCard.backSideName &&
            this.backSideType === anotherCard.backSideType &&
            this.backSideText === anotherCard.backSideText
    }

    update(newVersion: MTGCard) {
        if(this.name != newVersion.name){
            logger.debug("updating name")
            this.name = newVersion.name
        }
        if(this.colorIdentity != newVersion.colorIdentity){
            logger.debug("updating colorIdentity")
            this.colorIdentity = newVersion.colorIdentity
        }
        if(this.type != newVersion.type){
            logger.debug("updating type")
            this.type = newVersion.type
        }
        if(this.rarity != newVersion.rarity){
            logger.debug("updating rarity")
            this.rarity = newVersion.rarity
        }
        if(this.manaCost != newVersion.manaCost){
            logger.debug("updating manaCost")
            this.manaCost = newVersion.manaCost
        }
        if(this.convertedManaCost != newVersion.convertedManaCost){
            logger.debug("updating convertedManaCost")
            this.convertedManaCost = newVersion.convertedManaCost
        }
        if(this.text != newVersion.text){
            logger.debug("updating text")
            this.text = newVersion.text
        }
        if(this.power != newVersion.power){
            logger.debug("updating power")
            this.power = newVersion.power
        }
        if(this.toughness != newVersion.toughness){
            logger.debug("updating toughness")
            this.toughness = newVersion.toughness
        }
        if(this.set != newVersion.set){
            logger.debug("updating set")
            this.set = newVersion.set
        }
        if(this.backSideName != newVersion.backSideName){
            logger.debug("updating backSideName")
            this.backSideName = newVersion.backSideName
        }
        if(this.backSideType != newVersion.backSideType){
            logger.debug("updating backSideType")
            this.backSideType = newVersion.backSideType
        }
        if(this.backSideText != newVersion.backSideText){
            logger.debug("updating backSideText")
            this.backSideText = newVersion.backSideText
        }
    }

    isStandardLegal(): boolean {
        return this.versions.filter(version => version.isStandardLegal).length > 0
    }

    isCommanderLegal(): boolean {
        return this.versions.filter(version => version.isCommanderLegal).length > 0
    }

    toDTO() {
        const result = <MTGCardDTO>{
            id: this.id,
            name: this.name,
            type: this.type,
            manaCost: this.manaCost,
            convertedManaCost: this.convertedManaCost,
            ownedCopies: this.ownedCopies,
            versions: this.versions.map(version => version.toDTO()),
        }
        if (result.versions.filter(version => version.isPrimaryVersion).length == 0) {
            result.versions[0].isPrimaryVersion = true
        }
        return result
    }

    getPrimaryVersion(): MTGCardVersion {
        const primaryVersions: MTGCardVersion[] = this.versions.filter(version => version.isPrimaryVersion)
        assert.equal(primaryVersions.length, 1)
        return primaryVersions[0]
    }

    getVersion(scryfallId: string): MTGCardVersion {
        const primaryVersions: MTGCardVersion[] = this.versions.filter(version => version.scryfallId == scryfallId)
        if (primaryVersions.length === 0) {
            return null
        } else if (primaryVersions.length === 1) {
            return primaryVersions[0]
        } else {
            throw Error("multiple duplicate versions found")
        }
    }

    static async Query(take: number, page: number, params: CardQueryParameters): Promise<[MTGCard[], number]> {
        var qb = this.repo.createQueryBuilder("card")
            .leftJoinAndSelect("card.versions", "version")
            .leftJoinAndSelect("version.set", "set")
            .orderBy('card.convertedManaCost', 'ASC')
        FindOptionsUtils.joinEagerRelations(qb, qb.alias, DB.getMetadata(MTGCard));

        if (params.cardName) {
            qb.andWhere(`(card.name like "%${params.cardName}%" or card.backSideName like "%${params.cardName}%")`)
        }
        if (params.cardText) {
            const words: string[] = params.cardText.split(" ")

            if (words.length === 1) {
                if (words[0].startsWith("!")) {
                    qb.andWhere(`(card.text not like "%${words[0].substring(1)}%" and card.backSideText not like "%${words[0].substring(1)}%")`)
                } else {
                    qb.andWhere(`(card.text like "%${words[0]}%" or card.backSideText like "%${words[0]}%")`)
                }
            } else {
                words.filter(word => !word.startsWith("!")).map(word => qb.andWhere(`(card.text like "%${word}%" or card.backSideText like "%${word}%")`))
                words.filter(word => word.startsWith("!")).map(word => qb.andWhere(`(card.text not like "%${word.substring(1)}%" and card.backSideText not like "%${word.substring(1)}%")`))
            }
        }
        if (params.sets) {
            var setsArray;
            if (params.sets instanceof Object) {
                setsArray = Object.values(params.sets)
            } else {
                setsArray = params.sets
            }
            qb.andWhere("set.id IN(:...sets)", { sets: setsArray })
        }
        if (params.rarities && params.rarities.length < 4) {
            qb.andWhere("card.rarity IN(:...rarities)", { rarities: params.rarities })
        }

        if (params.subType || params.types) {
            var words: string[] = []
            if (params.types) {
                words = words.concat(params.types)
            }
            if (params.subType) {
                words = words.concat(params.subType.split(" "))
            }
            if (words.length === 1) {
                if (words[0].startsWith("!")) {
                    qb.andWhere(`(card.type not like "%${words[0].substring(1)}%" and card.backSideType not like "%${words[0].substring(1)}%")`)
                } else {
                    qb.andWhere(`(card.type like "%${words[0]}%" or card.backSideType like "%${words[0]}%")`)
                }
            } else {
                // fix OR queries by splitting into two qb.andWhere's
                words.filter(word => !word.startsWith("!")).map(word => qb.andWhere(`(card.type like "%${word}%" or card.backSideType like "%${word}%")`))
                words.filter(word => word.startsWith("!")).map(word => qb.andWhere(`(card.type not like "%${word.substring(1)}%" and card.backSideType not like "%${word.substring(1)}%")`))
            }
        }
        if (params.colors) {
            if (params.colorSearchSetting == "Exact match") {
                params.colors.map(color => qb.andWhere(`card.colorIdentity like "%${color}%"`))
                allColors.filter(color => params.colors.indexOf(color.name) === -1).map(color => qb.andWhere(`card.colorIdentity not like "%${color.name}%"`))
            } else if (params.colorSearchSetting == "Includes at least") {
                if (params.colors.length === 1) {
                    qb.andWhere("card.colorIdentity like :color", { type: `%${params.colors}%` })
                } else {
                    params.colors.map(color => qb.andWhere(`card.colorIdentity like "%${color}%"`))
                }
            } else if (params.colorSearchSetting == "Includes at most") {
                allColors.filter(color => params.colors.indexOf(color.name) === -1).map(color => {
                    logger.info(color.name)
                    qb.andWhere(`card.colorIdentity not like "%${color.name}%"`)
                })
            } else {
                throw new Error("Illegal search setting")
            }
        }

        if (params.manaCost) {
            var manaCostQuery = params.manaCost
            if (manaCostQuery.startsWith(">=")) {
                manaCostQuery = manaCostQuery.substring(2)
                var manaCost = Number(manaCostQuery)
                qb.andWhere("card.convertedManaCost >= :manaCost", { manaCost })
            } else if (manaCostQuery.startsWith("<=")) {
                manaCostQuery = manaCostQuery.substring(2)
                var manaCost = Number(manaCostQuery)
                qb.andWhere("card.convertedManaCost <= :manaCost", { manaCost })
            } else if (manaCostQuery.startsWith(">")) {
                manaCostQuery = manaCostQuery.substring(1)
                const manaCost = Number(manaCostQuery)
                qb.andWhere("card.convertedManaCost > :manaCost", { manaCost })
            } else if (manaCostQuery.startsWith("<")) {
                manaCostQuery = manaCostQuery.substring(1)
                const manaCost = Number(manaCostQuery)
                qb.andWhere("card.convertedManaCost < :manaCost", { manaCost })
            } else {
                const manaCost = Number(manaCostQuery)
                qb.andWhere("card.convertedManaCost = :manaCost", { manaCost })
            }
        }

        const skip = (page - 1) * take
        const [data, total] = await qb.take(take)
            .skip(skip)
            .getManyAndCount();
        logger.info(`Found ${total} cards.`)
        logger.debug(`Query: 
        name=${params.cardName};
        text=${params.cardText};
        set=IN(${params.sets});
        rarity=IN(${params.rarities});
        colorSearchSetting=${params.colorSearchSetting}
        color=${params.colors}`)
        return [data, total]
    }
}

export async function Update(id: number, partialCard) {
    const card = await DB.manager.findOne(MTGCard, {
        relations: {
            tags: true,
        },
        where: {
            id
        }
    })

    if (!card) {
        throw new Error('Card Not Found!')
    }

    const result = await DB.manager.update(MTGCard, {
        id: id
    }, {
        ...partialCard
    })
}

export async function AddCategory(cardId: number, category: string) {
    const card = await DB.manager.findOne(MTGCard, {
        relations: {
            tags: true,
        },
        where: {
            id: cardId
        }
    })

    if (!card) {
        throw new Error('Card Not Found!')
    }

    const categoryInstance = await DB.manager.findOne(MTGCardTag, {
        where: {
            name: category
        }
    })
    if (categoryInstance) {
        var categoryExistsOnCard = false
        card.tags.forEach(category => {
            if (category.id === categoryInstance.id) {
                categoryExistsOnCard = true
            }
        })

        if (!categoryExistsOnCard) {
            card.tags.push(categoryInstance)
            await DB.manager.save(
                card
            )
            logger.debug(`Added category ${category} to card ${card.name}.`)
        } else {
            logger.debug(`Category ${category} already exists on card ${card.name}.`)
        }
    } else {
        const categoryInstance = new MTGCardTag()
        categoryInstance.name = category

        logger.debug(categoryInstance.name)
        await DB.manager.save(MTGCardTag, categoryInstance)
        logger.debug(`Added category ${category} to card ${card.name}. Created category ${category}.`)
    }
}

export async function RemoveCategory(cardId: number, categoryName: string) {
    const card = await DB.manager.findOne(MTGCard, {
        relations: {
            tags: true,
        },
        where: {
            id: cardId
        }
    })

    if (!card) {
        throw new Error('Card Not Found!')
    }

    const extraCategories = card.tags.filter(category => { return category.name !== categoryName });

    if (extraCategories.length === card.tags.length) {
        logger.debug(`Category ${categoryName} did not exist on card ${card.name}.`)
    } else {
        card.tags = extraCategories
        await DB.manager.save(MTGCard,
            card
        )
        logger.debug(`Removed category ${categoryName} from card ${card.name}.`)
    }

}

@Entity()
export class MTGCardVersion {

    static repo: Repository<MTGCardVersion> = DB.manager.getRepository(MTGCardVersion)

    @PrimaryGeneratedColumn()
    id: number

    @Index()
    @Column()
    scryfallId: string
    @Column({
        default: null,
        nullable: true
    })
    frontIllustrationId: string
    @Column({
        default: null,
        nullable: true
    })
    backIllustrationId: string
    @Column()
    rulingsUri: string
    @Column()
    scryfallUri: string
    @Column()
    frontImageUri: string
    @Column({
        default: null,
        nullable: true
    })
    backImageUri: string
    @Index()
    @ManyToOne(() => MTGSet, (set) => set.cards, {
        cascade: true
    })
    @JoinTable()
    set: MTGSet
    @Column()
    @Index()
    isPrimaryVersion: boolean
    @Column()
    @Index()
    isStandardLegal: boolean
    @Column()
    @Index()
    isCommanderLegal: boolean
    @Index()
    @ManyToOne(() => MTGCard, (card) => card.versions)
    card: MTGCard

    constructor(
        scryfallId: string,
        frontIllustrationId: string,
        rulingsUri: string,
        scryfallUri: string,
        frontImageUri: string,
        set: MTGSet,
        isPrimaryVersion: boolean,
        standardLegal: boolean,
        commanderLegal: boolean,
        backIllustrationId: string = null,
        backImageUri: string = null,
    ) {
        this.scryfallId = scryfallId
        this.frontIllustrationId = frontIllustrationId
        this.rulingsUri = rulingsUri
        this.scryfallUri = scryfallUri
        this.frontImageUri = frontImageUri
        this.set = set,
            this.isPrimaryVersion = isPrimaryVersion
        this.isStandardLegal = standardLegal
        this.isCommanderLegal = commanderLegal
        this.backIllustrationId = backIllustrationId
        this.backImageUri = backImageUri
    }

    equals(anotherVersion: MTGCardVersion): boolean {
        return this.scryfallId == anotherVersion.scryfallId &&
            this.frontIllustrationId == anotherVersion.frontIllustrationId &&
            this.rulingsUri == anotherVersion.rulingsUri &&
            this.scryfallUri == anotherVersion.scryfallUri &&
            this.frontImageUri == anotherVersion.frontImageUri &&
            this.set.equals(anotherVersion.set) &&
            this.isStandardLegal == anotherVersion.isStandardLegal &&
            this.isCommanderLegal == anotherVersion.isCommanderLegal &&
            this.backIllustrationId == anotherVersion.backIllustrationId &&
            this.backImageUri == anotherVersion.backImageUri
    }

    update(newVersion: MTGCardVersion) {
        if(this.scryfallId != newVersion.scryfallId){
            logger.debug("updating scryfallId")
            this.scryfallId = newVersion.scryfallId
        }
        if(this.frontIllustrationId != newVersion.frontIllustrationId){
            logger.debug("updating frontIllustrationId")
            this.frontIllustrationId = newVersion.frontIllustrationId
        }
        if(this.rulingsUri != newVersion.rulingsUri){
            logger.debug("updating rulingsUri")
            this.rulingsUri = newVersion.rulingsUri
        }
        if(this.frontImageUri != newVersion.frontImageUri){
            logger.debug("updating frontImageUri")
            this.frontImageUri = newVersion.frontImageUri
        }
        if(this.set != newVersion.set){
            logger.debug("updating set")
            this.set = newVersion.set
        }
        if(this.isStandardLegal != newVersion.isStandardLegal){
            logger.debug("updating isStandardLegal")
            this.isStandardLegal = newVersion.isStandardLegal
        }
        if(this.isCommanderLegal != newVersion.isCommanderLegal){
            logger.debug("updating isCommanderLegal")
            this.isCommanderLegal = newVersion.isCommanderLegal
        }
        if(this.backIllustrationId != newVersion.backIllustrationId){
            logger.debug("updating backIllustrationId")
            this.backIllustrationId = newVersion.backIllustrationId
        }
        if(this.backImageUri != newVersion.backImageUri){
            logger.debug("updating backImageUri")
            this.backImageUri = newVersion.backImageUri
        }
    }

    toDTO() {
        return <MTGCardVersionDTO>{
            isPrimaryVersion: this.isPrimaryVersion,
            scryfallId: this.scryfallId,
            frontImageUri: `http://localhost:8000/cards/${this.frontIllustrationId}.jpg`,
            backImageUri: this.backIllustrationId ? `http://localhost:8000/cards/${this.backIllustrationId}.jpg` : null
        }
    }
}