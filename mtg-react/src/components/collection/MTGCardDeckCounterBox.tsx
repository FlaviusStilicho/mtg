import { Box, Button, IconButton, TextField } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { cardTextFieldStyle, flipButtonStyle, staticButtonStyle } from '../../style/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { hasDeckEntryChanges, isBasicLand } from '../../functions/util';
import { DeckFormat } from '../../enum';
import ArchiveIcon from '@mui/icons-material/Archive';
import { Component } from 'react';
import { DeckDTO, MTGCardDTO, DeckCardEntryDTO, MTGCardVersionDTO } from '../../../../mtg-common/src/DTO';
import { isEqual } from 'lodash';

export interface MTGCardDeckCounterBoxProps {
    card: MTGCardDTO
    selectedDeckId: number | null
    selectedDeck: DeckDTO | null
    selectedDeckEntries: DeckCardEntryDTO[]
    primaryVersion: MTGCardVersionDTO
    getCurrentNumberOfCopiesForCard: Function,
    updateCardCopiesInDeck: Function
    flipCard: any
}

export class MTGCardDeckCounterBox extends Component<MTGCardDeckCounterBoxProps> {

    shouldComponentUpdate(nextProps: MTGCardDeckCounterBoxProps) {
        return hasDeckEntryChanges(this.props.card, this.props.selectedDeckEntries, nextProps.selectedDeckEntries)
    }

    checkCanAddCopy = (isSideboard: boolean = false) => {
        const copiesInDeck = this.props.getCurrentNumberOfCopiesForCard(this.props.card);
        const copiesInSideboard = this.props.getCurrentNumberOfCopiesForCard(this.props.card, true)

        if (this.props.selectedDeck === null) {
            return false;
        } else if (this.props.selectedDeck.format === DeckFormat.STANDARD) {
            if (isBasicLand(this.props.card)) {
                return true;
            } else if (isSideboard) {
                return copiesInDeck + copiesInSideboard < 4 ? true : false;
            } else {
                return copiesInDeck < 4 ? true : false;
            }
        } else if (this.props.selectedDeck.format === DeckFormat.COMMANDER) {
            if (isBasicLand(this.props.card)) {
                return true;
            } else if (isSideboard) {
                return copiesInDeck + copiesInSideboard < 1 ? true : false;                
            } else {
                return copiesInDeck < 1 ? true : false;
            }
        } else {
            return false;
        }
    }

    render() {
        const canAddCopy = this.checkCanAddCopy();
        const canAddSideboardCopy = this.checkCanAddCopy(true);
        const copiesInDeck = this.props.getCurrentNumberOfCopiesForCard(this.props.card)

        // console.log(`Rendering counter box ${this.props.card.name}`)
        return (
            <Box style={{ alignItems: "center" }}>
                <Button
                    aria-label="reduce"
                    name="subtract-button"
                    variant="contained"
                    style={staticButtonStyle}
                    sx={{ borderRadius: '20%' }}
                    disabled={this.props.selectedDeckId === 0 || copiesInDeck <= 0}
                    onClick={() => this.props.updateCardCopiesInDeck(this.props.card, -1, false)}
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
                    onClick={() => this.props.updateCardCopiesInDeck(this.props.card, 1, false)}
                >
                    <AddIcon fontSize="small" />
                </Button>
                <Button
                    aria-label="sideboard"
                    name="sideboard-button"
                    variant="contained"
                    style={{ ...staticButtonStyle, backgroundColor: "#6497b1" }}
                    disabled={!canAddSideboardCopy}
                    onClick={() => this.props.updateCardCopiesInDeck(this.props.card, 1, true)}
                >
                    <ArchiveIcon fontSize="small" />
                </Button>
                {this.props.primaryVersion.backImageUri !== null &&
                    <IconButton
                        name="flip-button"
                        style={flipButtonStyle}
                        onClick={this.props.flipCard}>
                        <AutorenewIcon />
                    </IconButton>
                }
            </Box>
        )
    }
}