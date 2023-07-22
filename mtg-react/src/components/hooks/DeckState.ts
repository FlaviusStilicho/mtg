import { DeckDTO, MTGCardDTO, DeckCardEntryDTO } from '../../../../mtg-common/src/DTO';
import { SelectChangeEvent } from "@mui/material";

export interface DeckState {
    decks: DeckDTO[]
    saveDeck: any
    deleteDeck: () => void
    fetchDecks: () => void
    selectedDeck: DeckDTO | null
    selectedDeckId: number | null
    selectedDeckEntries: DeckCardEntryDTO[]
    handleChangeSelectedDeck: (event: SelectChangeEvent<number>) => void;
    deckChanged: boolean
    setDeckChanged: Function
    updateCardCopiesInDeck: (card: MTGCardDTO, increment: number, isSideboard: boolean) => void
    updateDeckEntries: (entry: DeckCardEntryDTO) => void
    getCurrentNumberOfCopiesForCard: (card: MTGCardDTO) => number
}