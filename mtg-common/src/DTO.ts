export interface PriceInformation {
    buyPrice: number
    store : Store
}

export enum Store {
    MAGICERS = "magicers",
    MAGICKAST = "magickast",
    SCRYFALL = "scryfall"
}

export interface MTGCardDTO {
    id: number
    name: string
    type: string
    rarity: string
    manaCost: string
    colorIdentity: string[]
    convertedManaCost: number
    ownedCopies: number
    versions: MTGCardVersionDTO[]
    otherSide?: MTGCardDTO
    priceInfo: PriceInformation[]
}

export interface MTGCardVersionDTO {
    isPrimaryVersion: boolean
    scryfallId: string
    frontImageUri: string
    backImageUri: string | undefined
}

export interface MTGSetDTO {
    id: number
    shortName: string
    fullName: string
    setType: string
    iconUrl: string
    releaseDate: string
}

export interface DeckDTO {
    id: number | undefined
    name: string
    format: string
    cardEntries: DeckCardEntryDTO[]
}

export interface DeckCardEntryDTO {
    id: number | undefined
    card: MTGCardDTO 
    copies: number
    sideboardCopies: number
    isCommander: boolean
}

export interface Color {
    name: string
    displayName: string
    iconUrl: string
}

export interface UploadDeckDTO {
    name: string
    format: string
    entries: NewDeckEntryDTO[]
}

export interface NewDeckEntryDTO {
    quantity: number,
    cardName: string
  }

export interface WishlistEntryDTO {
    card: MTGCardDTO
    desiredCopies: number
    isInShoppingCart: boolean
    inDecks: string[]
}