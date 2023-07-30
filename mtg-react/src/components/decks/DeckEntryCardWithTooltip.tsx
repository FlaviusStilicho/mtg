import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { imageHeight, imageWidth } from '../../constants';
import { deckEntryTextBoxStyle } from '../../style/styles';
import { Button, CardMedia, Tooltip } from '@mui/material';
import { DeckCardEntryDTO } from '../../../../mtg-common/src/DTO';
import { v4 as uuidv4 } from 'uuid';
import { isBasicLand, isCommanderEligible, numberOfMissingCards } from '../../functions/util';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { memo } from 'react';
import { DeckState } from '../hooks/DeckState';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

export interface DeckEntryComponentProps {
  entry: DeckCardEntryDTO
  deckState: DeckState
  isSideboardEntry: boolean
  setNewCommander: (entry: DeckCardEntryDTO) => void
}

const iconWidth = 16
const iconHeight = 16

export const DeckEntryComponentWithTooltip = memo((props: DeckEntryComponentProps) => {
  const entry: DeckCardEntryDTO = props.entry
  const copies = props.isSideboardEntry ? entry.sideboardCopies : entry.copies
  const deckState = props.deckState
  var manaCostArray = entry.card.manaCost.split("}").map(mc => mc.substring(1)).filter(mc => mc !== '');

  const maxCardCopies = props.deckState.selectedDeck?.format === "Standard" ? 4 : 1
  const missingCards = numberOfMissingCards(entry, props.isSideboardEntry) > 0
  const addButtonDisabled = props.isSideboardEntry ?
    entry.sideboardCopies >= maxCardCopies && !isBasicLand(entry.card) :
    entry.copies >= maxCardCopies && !isBasicLand(entry.card)
  const subtractButtonDisabled = props.isSideboardEntry ? entry.sideboardCopies < 1 : entry.copies < 1

  function swapSideboardCopies() {
    console.log(entry.card.name)
    if (props.isSideboardEntry) {
      entry.copies = entry.sideboardCopies
      entry.sideboardCopies = 0
    } else {
      entry.sideboardCopies = entry.copies
      entry.copies = 0
    }
    // checkEntryIllegal(existingCardEntry, selectedDeck)
    deckState.updateDeckEntries(entry)
  }

  return (
    <ListItem key={`entry-listitem-${entry.card.name}-${Date.now()}`} sx={{ py: 0.2 }}>
      <Tooltip
        arrow
        placement='left'
        title={<CardMedia
          key={`tooltip-${entry.card.name}-${Date.now()}`}
          sx={{
            height: imageHeight * 0.5,
            width: imageWidth * 0.5
          }}
          style={{
            backgroundColor: "White"
          }}
          image={entry.card.versions[0].frontImageUri}
          />
          }
        >
        <Box bgcolor={missingCards ? "#e3c2c2" : "White"} sx={{
          width: "100%",
          border: '1px solid',
          borderRadius: "7px",
          flexDirection: 'row',
          display: "flex"
        }}>
          <Box style={{ width: "42%" }} sx={deckEntryTextBoxStyle}>
            {entry.card.name}
          </Box>
          <Box style={{ textAlign: "right", marginRight: 4, width: "14%" }} sx={deckEntryTextBoxStyle}>
            {entry.buyPrice !== undefined ? `€ ${entry.buyPrice}` : 'N/A'}
          </Box>
          <Box style={{ textAlign: "right", marginRight: 4, width: "25%" }} sx={deckEntryTextBoxStyle}>
            {manaCostArray.map(manaCost => {
              var fileName = manaCost
              if (fileName.includes('/')) {
                fileName = fileName.replace('/', '');
              }
              return (
                <Box
                  component="img"
                  key={`deck-entry-${manaCost}-${uuidv4()}`}
                  sx={{
                    height: iconHeight,
                    width: iconWidth,
                    maxHeight: iconHeight,
                    maxWidth: iconWidth,
                    paddingLeft: 0,
                    paddingRight: 0
                  }}
                  src={`http://localhost:3000/mana/${fileName}.png`} />)
            })}
          </Box>
          <Box style={{ textAlign: "right", marginRight: 2, width: "47%" }} sx={deckEntryTextBoxStyle}>
            <Button
              variant="contained"
              sx={{
                borderRadius: '30%',
                height: iconHeight,
                width: iconWidth,
                minWidth: { xs: iconWidth, md: iconWidth },
              }}
              disabled={!isCommanderEligible(entry)}
              onClick={() => props.setNewCommander(entry)}
            >
              <Box
                component="img"
                sx={{
                  borderRadius: '30%',
                  height: iconHeight,
                  width: iconWidth,
                  minWidth: iconWidth,
                }}
                src={`http://localhost:3000/commander.png`}
              />
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: '30%',
                height: iconHeight,
                width: iconWidth,
                minWidth: iconWidth,
              }}
              disabled={subtractButtonDisabled}
              onClick={() => deckState.updateCardCopiesInDeck(entry.card, -1, props.isSideboardEntry)}
            >
              <RemoveIcon fontSize="small" />
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: '30%',
                height: iconHeight,
                width: iconWidth,
                minWidth: iconWidth,
              }}
              disabled={addButtonDisabled}
              onClick={() => deckState.updateCardCopiesInDeck(entry.card, 1, props.isSideboardEntry)}
            >
              <AddIcon fontSize="small" />
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: '30%',
                height: iconHeight,
                width: iconWidth,
                minWidth: iconWidth,
              }}
              style={{ backgroundColor: "#6497b1" }}
              onClick={swapSideboardCopies}
            >
              {props.isSideboardEntry ? (<UnarchiveIcon fontSize="small" />) : (<ArchiveIcon fontSize="small" />)}
            </Button>
          </Box>
          <Box style={{ textAlign: "right", width: "6%" }} sx={deckEntryTextBoxStyle}>
            {Math.min(copies, entry.card.ownedCopies)}/{copies}
          </Box>
        </Box>
      </Tooltip>
    </ListItem >
  );
})