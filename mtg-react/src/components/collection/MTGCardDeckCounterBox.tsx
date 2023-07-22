import { Box, Button, IconButton, TextField } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { cardTextFieldStyle, flipButtonStyle, staticButtonStyle } from '../../style/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { CardState } from '../hooks/CardState';
import { DeckState } from '../hooks/DeckState';
import { useState, memo } from 'react';
import { isBasicLand } from '../../functions/util';
import { DeckFormat } from '../../enum';
import ArchiveIcon from '@mui/icons-material/Archive';

export interface MTGCardDeckCounterBoxProps {
    cardState: CardState
    deckState: DeckState
}

export const MTGCardDeckCounterBox = memo((props: MTGCardDeckCounterBoxProps) => {
    const cardState = props.cardState
    const deckState = props.deckState

    const [copiesInDeck, setCopiesInDeck] = useState<number>(
        deckState.getCurrentNumberOfCopiesForCard(cardState.card))

    const checkCanAddCopy = () => {
        if (deckState.selectedDeck === null) {
            return false
        } else if (deckState.selectedDeck.format === DeckFormat.STANDARD) {
            if (isBasicLand(cardState.card)) {
                return true
            } else {
                return copiesInDeck >= 4 ? true : false
            }
        } else if (deckState.selectedDeck.format === DeckFormat.COMMANDER) {
            if (isBasicLand(cardState.card)) {
                return true
            } else {
                return copiesInDeck === 0 ? true : false
            }
        } else {
            return false
        }
    }

    const canAddCopy: boolean = checkCanAddCopy()

    return (
        <Box style={{ alignItems: "center" }}>
            <Button
                aria-label="reduce"
                name="subtract-button"
                variant="contained"
                style={staticButtonStyle}
                sx={{ borderRadius: '20%' }}
                disabled={deckState.selectedDeckId === 0 || copiesInDeck <= 0}
                onClick={() => deckState.updateCardCopiesInDeck(cardState.card, -1, false)}
            >
                <RemoveIcon fontSize="small" />
            </Button>
            <TextField
                name="current-copies-counter"
                value={copiesInDeck}
                variant="standard"
                style={cardTextFieldStyle}

                sx={{ borderRadius: '20%' }}
                InputProps={{
                    readOnly: true,
                    disabled: true,
                    inputProps: {
                        style: { textAlign: "center" },
                    }
                }}></TextField>
            <Button
                aria-label="increase"
                name="add-button"
                variant="contained"
                style={staticButtonStyle}
                disabled={!canAddCopy}
                onClick={() => deckState.updateCardCopiesInDeck(cardState.card, 1, false)}
            >
                <AddIcon fontSize="small" />
            </Button>
            <Button
                aria-label="sideboard"
                name="sideboard-button"
                variant="contained"
                style={{...staticButtonStyle, backgroundColor: "#6497b1"}}
                disabled={!canAddCopy}
                onClick={() => deckState.updateCardCopiesInDeck(cardState.card, 1, true)}
            >
                <ArchiveIcon fontSize="small" />
            </Button>

            {cardState.primaryVersion.backImageUri !== null &&
                <IconButton
                    name="flip-button"
                    style={flipButtonStyle}
                    onClick={cardState.flipCard}>
                    <AutorenewIcon />
                </IconButton>
            }
        </Box>
    )
});