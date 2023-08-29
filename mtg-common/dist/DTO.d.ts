export interface MTGCardDTO {
    id: number;
    name: string;
    type: string;
    manaCost: string;
    convertedManaCost: number;
    ownedCopies: number;
    versions: MTGCardVersionDTO[];
    otherSide?: MTGCardDTO;
}
export interface MTGCardVersionDTO {
    isPrimaryVersion: boolean;
    scryfallId: string;
    frontImageUri: string;
    backImageUri: string | undefined;
}
export interface MTGSetDTO {
    id: number;
    shortName: string;
    fullName: string;
    setType: string;
    iconUrl: string;
    releaseDate: string;
}
export interface DeckDTO {
    id: number | undefined;
    name: string;
    format: string;
    cardEntries: DeckCardEntryDTO[];
}
export interface DeckCardEntryDTO {
    id: number | undefined;
    card: MTGCardDTO;
    copies: number;
}
export interface Color {
    name: string;
    displayName: string;
    iconUrl: string;
}
