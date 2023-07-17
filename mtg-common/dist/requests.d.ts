import { DeckDTO } from "./DTO";
export interface CardQueryParameters {
    cardName: string;
    cardText: string;
    sets: number[];
    rarities: string[];
    types: string[];
    typeSearchSetting: string
    subType: string;
    colors: string[];
    colorSearchSetting: string;
    manaCost: string;
    format: String;
}
export interface UpdateCardOwnedCopiesQueryParams {
    cardId: number;
    ownedCopies: number;
}
export interface ListDecksResponse {
    decks: DeckDTO[];
    total: number;
}
export interface CopyDeckRequest {
    deckId: number;
    name: string;
}

export interface CreateDeckResponse {
    id: number;
}
export interface GetDeckRequest {
    id: number;
}
export interface CheckDeckRequest {
    id: number;
}
export interface DeleteDeckRequest {
    id: number;
}
