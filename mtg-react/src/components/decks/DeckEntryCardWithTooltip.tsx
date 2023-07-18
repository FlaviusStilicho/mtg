import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { imageHeight, imageWidth, maximumCardCopiesStandard } from '../../constants';
import { deckEntryTextBoxStyle } from '../../style/styles';
import { Button, CardMedia, Tooltip } from '@mui/material';
import { DeckCardEntryDTO } from '../../../../mtg-common/src/DTO';
import { v4 as uuidv4 } from 'uuid';
import { isBasicLand, isCommanderEligible } from '../../functions/util';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

export interface DeckEntryComponent {
  entry: DeckCardEntryDTO
  addCardCopyToDeck: Function
  subtractCardCopyFromDeck: Function
  setNewCommander: (entry: DeckCardEntryDTO) => void
}

const iconWidth = 12
const iconHeight = 15

export function DeckEntryComponentWithTooltip(props: DeckEntryComponent) {
  const entry: DeckCardEntryDTO = props.entry
  var manaCostArray = entry.card.manaCost.split("}").map(mc => mc.substring(1)).filter(mc => mc !== '');

  const addCopy = () => {
    props.addCardCopyToDeck(entry.card)
  }

  const removeCopy = () => {
    props.subtractCardCopyFromDeck(entry.card)
  }

  const missingCards = entry.card.ownedCopies - entry.copies < 0
  return (
    <ListItem key={`entry-listitem-${entry.card.name}-${Date.now()}`} sx={{ py: 0.2 }}>
      <Tooltip
        arrow
        placement='left'
        title={<> <CardMedia
          key={`tooltip-${entry.card.name}-${Date.now()}`}
          sx={{
            height: imageHeight * 0.5,
            width: imageWidth * 0.5
          }}
          style={{
            backgroundColor: "White"
          }}
          image={entry.card.versions[0].frontImageUri}
        >
        </CardMedia></>}>
        <Box bgcolor={missingCards ? "#e3c2c2" : "White"} sx={{
          width: "100%",
          border: '1px solid',
          borderRadius: "7px",
          flexDirection: 'row',
          display: "flex"
        }}>
          <Box style={{ width: "44%" }} sx={deckEntryTextBoxStyle}>
            {entry.card.name}
          </Box>
          <Box style={{ textAlign: "right", marginRight: 4, width: "25%" }} sx={deckEntryTextBoxStyle}>
            {entry.buyPrice}
          </Box>
          <Box style={{ textAlign: "right", marginRight: 4, width: "25%" }} sx={deckEntryTextBoxStyle}>
            {manaCostArray.map(manaCost => (
              <Box
                component="img"
                key={`deck-entry-${manaCost}-${uuidv4()}`}
                sx={{
                  height: 15,
                  width: 15,
                  maxHeight: { xs: 15, md: 15 },
                  maxWidth: { xs: 15, md: 15 },
                }}
                src={`http://localhost:3000/mana/${manaCost}.png`} />))}
          </Box>
          { isCommanderEligible(entry) ? 
          (<Box style={{ textAlign: "right", marginRight: 0, width: "5%" }} sx={deckEntryTextBoxStyle}>
            <Button
              variant="contained"
              // style={staticButtonStyle}
              sx={{
                borderRadius: '30%',
                marginTop: "5px",

                minWidth: { xs: iconWidth * 1.5, md: iconWidth * 1.5 },
                maxHeight: { xs: iconHeight * 1.5, md: iconHeight * 1.5 },
                maxWidth: { xs: iconWidth * 1.5, md: iconWidth * 1.5 },
              }}
            onClick={() => props.setNewCommander(entry)}
            >
              <Box
                component="img"
                sx={{
                  borderRadius: '30%',
                  maxWidth: { xs: iconWidth * 1.5, md: iconWidth * 1.5 },
                }}
                src={`http://localhost:3000/commander.png`}
              />
            </Button>
          </Box>) : (<></>)
         }
          <Box style={{ textAlign: "right", marginRight: 4, width: "20%" }} sx={deckEntryTextBoxStyle}>
            <Button
              variant="contained"
              // style={staticButtonStyle}
              sx={{
                borderRadius: '30%',
                height: iconHeight,
                width: iconWidth,
                // minHeight: { xs: iconHeight, md: iconHeight },
                minWidth: { xs: iconWidth, md: iconWidth },
                // maxHeight: { xs: iconHeight, md: iconHeight },
                // maxWidth: { xs: iconWidth, md: iconWidth },
              }}
              onClick={removeCopy}
            >
              <RemoveIcon fontSize="small" />
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: '30%',
                height: iconHeight,
                width: iconWidth,
                // minHeight: { xs: iconHeight, md: iconHeight },
                minWidth: { xs: iconWidth, md: iconWidth },
                // maxHeight: { xs: iconHeight, md: iconHeight },
                // maxWidth: { xs: iconWidth, md: iconWidth },
              }}
              disabled={entry.copies >= maximumCardCopiesStandard && !isBasicLand(entry.card)}
              onClick={addCopy}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Box>
          <Box style={{ textAlign: "right", marginRight: 4, width: "6%" }} sx={deckEntryTextBoxStyle}>
            {Math.min(entry.copies, entry.card.ownedCopies)}/{entry.copies}
          </Box>
        </Box>
      </Tooltip>
    </ListItem>
  );
}
