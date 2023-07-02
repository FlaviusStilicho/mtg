import { MTGCardDTO, DeckCardEntryDTO } from '../../../mtg-common/src/DTO';

export const isBasicLand = (card: MTGCardDTO): boolean => {
    return card.type.startsWith('Basic Land')
}

export const isLand = (card: MTGCardDTO): boolean => {
    return card.type.includes('Land') && !card.type.includes('Creature')
}

export const isCreature = (card: MTGCardDTO): boolean => {
    return card.type.includes('Creature')
}

export const filterLands = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => isLand(entry.card))
}

export const filterCreatures = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => isCreature(entry.card))
        .sort(sortDeckEntries)
}

export const filterNoncreatureSpells = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => !(entry.card.type.includes("Land") || entry.card.type.includes("Creature")))
        .sort(sortDeckEntries)
}

const sortDeckEntries = (entry1: DeckCardEntryDTO, entry2: DeckCardEntryDTO) => {
    const result = entry1.card.convertedManaCost - entry2.card.convertedManaCost
    if (result !== 0) { 
        return result 
    } else { 
        return entry1.card.name.localeCompare(entry2.card.name)
    }
}

export const getNumberOfLands = (entries: DeckCardEntryDTO[]): number => {
    const landEntries = filterLands(entries).map(entry => entry.copies)
    return landEntries.length > 0 ? landEntries.reduce((a, b) => a + b) : 0
}

export const getNumberOfCreatures = (entries: DeckCardEntryDTO[]): number => {
    const creatureEntries = filterCreatures(entries).map(entry => entry.copies)
    return creatureEntries.length > 0 ? creatureEntries.reduce((a, b) => a + b) : 0
}

export const getNumberOfNoncreatureSpells = (entries: DeckCardEntryDTO[]): number => {
    const noncreatureSpellEntries = filterNoncreatureSpells(entries).map(entry => entry.copies)
    return noncreatureSpellEntries.length > 0 ? noncreatureSpellEntries.reduce((a, b) => a + b) : 0
}

