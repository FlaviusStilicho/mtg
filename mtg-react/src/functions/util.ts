import { MTGCardDTO, DeckCardEntryDTO, DeckDTO } from '../../../mtg-common/src/DTO';

export const isBasicLand = (card: MTGCardDTO): boolean => {
    return card.type.startsWith('Basic Land')
}

export const isLand = (entry: DeckCardEntryDTO): boolean => {
    return entry.card.type.includes('Land')
}

export const isCreature = (entry: DeckCardEntryDTO): boolean => {
    return entry.card.type.includes('Creature')
}

export const isPlaneswalker = (entry: DeckCardEntryDTO): boolean => {
    return entry.card.type.includes('Planeswalker')
}

export const isArtifact = (entry: DeckCardEntryDTO): boolean => {
    return entry.card.type.includes('Artifact')
}

export const isEnchantment = (entry: DeckCardEntryDTO): boolean => {
    return entry.card.type.includes('Enchantment')
}

export const isSorcery = (entry: DeckCardEntryDTO): boolean => {
    return entry.card.type.includes('Sorcery')
}

export const isInstant = (entry: DeckCardEntryDTO): boolean => {
    return entry.card.type.includes('Instant')
}

export const isBattle = (entry: DeckCardEntryDTO): boolean => {
    return entry.card.type.includes('Battle')
}

export const filterLands = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.copies > 0)
        .filter(entry => isLand(entry) && !isCreature(entry))
}

export const filterCreatures = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.copies > 0)
        .filter(entry => isCreature(entry))
        .sort(sortDeckEntriesFn)
}

export const filterPlaneswalkers = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.copies > 0)
        .filter(entry => isPlaneswalker(entry))
        .sort(sortDeckEntriesFn)
}

export const filterNoncreatureArtifacts = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.copies > 0)
        .filter(entry => isArtifact(entry) && !isCreature(entry) && !isLand(entry))
        .sort(sortDeckEntriesFn)
}

export const filterNoncreatureEnchantments = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.copies > 0)
        .filter(entry => isEnchantment(entry) && !isCreature(entry) && !isLand(entry))
        .sort(sortDeckEntriesFn)
}

export const filterSorceries = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries
        .filter(entry => entry.copies > 0)
        .filter(entry => isSorcery(entry))
        .sort(sortDeckEntriesFn)
}

export const filterInstants = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.copies > 0)
        .filter(entry => isInstant(entry))
        .sort(sortDeckEntriesFn)
}

export const filterBattles = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.copies > 0)
        .filter(entry => isBattle(entry))
        .sort(sortDeckEntriesFn)
}

export const filterSideboard = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.sideboardCopies > 0)
        .sort(sortDeckEntriesFn)
}

const sortDeckEntriesFn = (entry1: DeckCardEntryDTO, entry2: DeckCardEntryDTO) => {
    const result = entry1.card.convertedManaCost - entry2.card.convertedManaCost
    if (result !== 0) {
        return result
    } else {
        return entry1.card.name.localeCompare(entry2.card.name)
    }
}

export const getTotalCardCopies = (entries: DeckCardEntryDTO[]): number => {
    return entries.length > 0 ? entries
        .filter(entry => entry.copies > 0)
        .map(entry => entry.copies)
        .reduce((a, b) => a + b) : 0
}
export const getNumberOfLands = (entries: DeckCardEntryDTO[]): number => {
    return getTotalCardCopies(filterLands(entries))
}

export const getNumberOfCreatures = (entries: DeckCardEntryDTO[]): number => {
    return getTotalCardCopies(filterCreatures(entries))
}

export const getNumberOfPlaneswalkers = (entries: DeckCardEntryDTO[]): number => {
    return getTotalCardCopies(filterPlaneswalkers(entries))
}

export const getNumberOfNoncreatureArtifacts = (entries: DeckCardEntryDTO[]): number => {
    return getTotalCardCopies(filterNoncreatureArtifacts(entries))
}

export const getNumberOfNoncreatureEnchantment = (entries: DeckCardEntryDTO[]): number => {
    return getTotalCardCopies(filterNoncreatureEnchantments(entries))
}

export const getNumberOfSorceries = (entries: DeckCardEntryDTO[]): number => {
    return getTotalCardCopies(filterSorceries(entries))
}

export const getNumberOfInstants = (entries: DeckCardEntryDTO[]): number => {
    return getTotalCardCopies(filterInstants(entries))
}

export const getNumberOfBattles = (entries: DeckCardEntryDTO[]): number => {
    return getTotalCardCopies(filterBattles(entries))
}

export const getNumberOfSideboardCards = (entries: DeckCardEntryDTO[]): number => {
    return entries.length > 0 ? entries
        .filter(entry => entry.sideboardCopies > 0)
        .map(entry => entry.sideboardCopies)
        .reduce((a, b) => a + b, 0) : 0
}

export const isCommanderEligible = (entry: DeckCardEntryDTO): boolean => {
    if (entry.isCommander === true || entry.copies === 0) {
        return false
    } else if (entry.card.type.includes("Legendary") && entry.card.type.includes("Creature")) {
        return true
    } else if (entry.card.type.includes("Planeswalker")) {
        return true
    } else {
        return false
    }
}

export const firstCharUpper = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const numberOfMissingCards = (entry: DeckCardEntryDTO, isSideboardEntry: boolean = false): number => {
    if (!isSideboardEntry) {
        const missingCards = entry.copies - entry.card.ownedCopies
        return missingCards > 0 ? missingCards : 0
    } else { 
        const missingCards = entry.sideboardCopies - entry.card.ownedCopies
        return missingCards > 0 ? missingCards : 0
    }
}

export const numberOfCardsAvailable = (entries: DeckCardEntryDTO[]): [number, number] => {
    if (entries.length === 0) {
        return [0, 0]
    }
    const available = entries
        .filter(entry => entry.copies > 0)
        .filter(entry => numberOfMissingCards(entry) > 0 && entry.buyPrice !== undefined)
        .map(entry => numberOfMissingCards(entry))
        .reduce((a, b) => a + b, 0)
    const unavailable = entries
        .filter(entry => entry.copies > 0)
        .filter(entry => numberOfMissingCards(entry) > 0 && entry.buyPrice === undefined)
        .map(entry => numberOfMissingCards(entry))
        .reduce((a, b) => a + b, 0)
    return [available, unavailable]
}

export const costToFinishDeck = (entries: DeckCardEntryDTO[]): number => {
    if (entries.length === 0) {
        return 0
    }
    const result = entries
        .filter(entry => entry.copies > 0)
        .filter(entry => numberOfMissingCards(entry) > 0 && entry.buyPrice !== undefined)
        .map(entry => {
            return entry.buyPrice === undefined ? 0 :
                numberOfMissingCards(entry) * entry.buyPrice
        })
        .reduce((a, b) => a + b, 0)
    return result
}

export function getCommander(deck: DeckDTO | null) {
    if (deck === null) {
      return null
    }
    const currentCommanderEntries: DeckCardEntryDTO[] = deck.cardEntries.filter(entry => entry.isCommander)
    if (currentCommanderEntries.length !== 1) {
      return null
    } else {
      return currentCommanderEntries[0].card
    }
  }