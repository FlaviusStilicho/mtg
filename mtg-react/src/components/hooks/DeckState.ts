import {  DeckDTO, MTGCardDTO } from '../../../../mtg-common/src/DTO';
import { SelectChangeEvent } from "@mui/material";
import { DeckCardEntryDTO } from '../../../../mtg-common/dist/DTO';

export interface DeckState {
    decks: DeckDTO[]
    fetchDecks: Function
    selectedDeck: DeckDTO | null
    selectedDeckId: number | null
    handleChangeSelectedDeck: (event: SelectChangeEvent<number>) => void;
    deckChanged: boolean
    setDeckChanged: Function
    addCardCopyToDeck: Function
    subtractCardCopyFromDeck: Function
    getCurrentNumberOfCopiesForCard: (card: MTGCardDTO) => number
}