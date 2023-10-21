import { isEqual } from 'lodash';
import { MTGCardDTO, DeckCardEntryDTO, DeckDTO, WishlistEntryDTO, Store } from 'mtg-common';
import { CardComponentProps, CardComponentState } from '../components/collection/MTGCardComponent';

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

export const filterNonLands = (entries: DeckCardEntryDTO[]): DeckCardEntryDTO[] => {
    return entries.filter(entry => entry.copies > 0)
        .filter(entry => !isLand(entry) || ( isLand(entry) && isCreature(entry)) )
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
        .filter(entry => numberOfMissingCards(entry) > 0 && entry.card.priceInfo?.store === Store.MAGICERS)
        .map(entry => numberOfMissingCards(entry))
        .reduce((a, b) => a + b, 0)
    const unavailable = entries
        .filter(entry => entry.copies > 0)
        .filter(entry => numberOfMissingCards(entry) > 0 && entry.card.priceInfo?.store !== Store.MAGICERS)
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
        .filter(entry => numberOfMissingCards(entry) > 0 && entry.card.priceInfo != null)
        .map(entry => {
            return entry.card.priceInfo == null ? 0 :
                numberOfMissingCards(entry) * entry.card.priceInfo.buyPrice
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

export function getDeckColorIdentity(deck: DeckDTO | null): Set<string>{
    if (deck === null){
        return new Set() 
    }
    var deckColorIdentity: Set<string>
    const commander = getCommander(deck)
    if (commander) {
        deckColorIdentity = new Set(commander.colorIdentity)
        deckColorIdentity.add("C")
    } else {
        deckColorIdentity = new Set()
        deck.cardEntries.forEach(entry => entry.card.colorIdentity.forEach(color => deckColorIdentity.add(color)))
        deckColorIdentity.add("C")
    }
    return deckColorIdentity
}

export function areSetsEqual(a: Set<string>, b: Set<string>){
    return a.size === b.size && [...a].every(value => b.has(value))
}

export function wishlistSortFnAlphabetical(a: WishlistEntryDTO, b: WishlistEntryDTO): number { 
    return a.card.name.localeCompare(b.card.name)
}


export function wishlistSortFnPrice(a: WishlistEntryDTO, b: WishlistEntryDTO): number {
    const priceInfoA = a.card.priceInfo;
    const priceInfoB = b.card.priceInfo;
  
    if (priceInfoA === null && priceInfoB === null) {
      return a.card.name.localeCompare(b.card.name);
    }
    if (priceInfoA === null) {
      return 1;
    }
    if (priceInfoB === null) {
      return -1;
    }
  
    return priceInfoB.buyPrice - priceInfoA.buyPrice;
  }

export function findDecksContainCard(card: MTGCardDTO, decks: DeckDTO[]): string[] {
    const inDecks: string[] = []
    for (const deck of decks) {
      for (const cardEntry of deck.cardEntries) {
        if (card.id === cardEntry.card.id) {
          inDecks.push(deck.name);
          break;
        }
      }
    }
    return inDecks
  }

export function populateDeckWishlistEntryMap(wishlist: WishlistEntryDTO[]): Map<string, WishlistEntryDTO[]> {
    const deckWishlistEntryMap: Map<string, WishlistEntryDTO[]> = new Map();
  
    for (const entry of wishlist) {
      if (entry.inDecks.length > 0) {
        for (const deckName of entry.inDecks) {
          if (deckWishlistEntryMap.has(deckName)) {
            deckWishlistEntryMap.get(deckName)!.push(entry);
          } else {
            deckWishlistEntryMap.set(deckName, [entry]);
          }
        }
      } else {
        if (deckWishlistEntryMap.has('unused')) {
          deckWishlistEntryMap.get('unused')!.push(entry);
        } else {
          deckWishlistEntryMap.set('unused', [entry]);
        }
      }
    }
  
    return deckWishlistEntryMap;
  };
  
export function findDeckByName(name: string, decks: DeckDTO[]): DeckDTO{
    for (const deck of decks) {
        if (deck.name === name){
            return deck
        }
    }
    throw Error("Deck not found")
}

export function countCardsByRarity(entries: DeckCardEntryDTO[], rarity: string): number {
    return entries.filter(entry => entry.card.rarity === rarity).map(entry => entry.copies).reduce((a, b) => a + b, 0)
}

export function hasDeckEntryChanges(card: MTGCardDTO, prevEntries: DeckCardEntryDTO[], nextEntries: DeckCardEntryDTO[]): boolean {
    var hasChanges = false

    const matchingPreviousEntries = prevEntries.filter(entry => entry.card.id ===  card.id)
    const matchingNextEntries = nextEntries.filter(entry => entry.card.id ===  card.id)

    if (matchingPreviousEntries.length === 0 && matchingNextEntries.length === 0) {
        hasChanges = false
    } else if (matchingPreviousEntries.length === 0 && matchingNextEntries.length !== 0) {
        hasChanges = true
        // console.log(`no prev entry ${card.name}`)
    } else if (matchingNextEntries.length === 0 && matchingPreviousEntries.length !== 0) {
        hasChanges = true
        // console.log(`no next entry ${card.name}`)
    } else {
        const previousEntry = matchingPreviousEntries[0]
        const nextEntry = matchingNextEntries[0]
        hasChanges = !isEqual(previousEntry, nextEntry)
    }
    if (hasChanges){
        // console.log(`Entry for ${card.name} has changes!`)
    }
    return hasChanges
}


export function shouldCardComponentUpdate(currProps: CardComponentProps, nextProps: CardComponentProps, currState: CardComponentState, nextState: CardComponentState): boolean {
    var hasChanges: boolean = false

    if (currProps.card.ownedCopies !== nextProps.card.ownedCopies) {
        hasChanges = true
        // console.log(`Card ownership has changed!`)
    }
    if (hasDeckEntryChanges(currProps.card, currProps.selectedDeckEntries, nextProps.selectedDeckEntries)) {
        hasChanges = true
        // console.log(`Deck entry has changed!`)
    }
    if (currState.buyPrice !== nextState.buyPrice) {
        hasChanges = true
        // console.log(`Buy price has changed!`)
    }
    if (currState.sellPrice !== nextState.sellPrice) {
        hasChanges = true
        // console.log(`Sell price has changed!`)
    }
    if (currState.frontSideUp !== nextState.frontSideUp) {
        hasChanges = true
        // console.log(`Front side has changed!`)
    }
    if (currState.cardPopupOpened !== nextState.cardPopupOpened) {
        hasChanges = true
        // console.log(`Card popup has changed!`)
    }
    if(hasChanges){
        // console.log(`Card component ${currProps.card.name} has changes`)
    }
    return hasChanges
  }
