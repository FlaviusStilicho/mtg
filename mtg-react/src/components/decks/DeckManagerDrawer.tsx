import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { navBarHeight, deckManagerDrawerWidth, manaCurveChartOptions } from '../../constants';
import { buttonBackgroundStyle, deckEntryTextBoxStyle, listItemStyle, searchTextFieldStyle } from '../../style/styles';
import { Button, IconButton, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import { CreateDeckWindow, CreateDeckWindowProps } from './CreateDeckWindow';
import { DeckCardEntryDTO, DeckDTO } from '../../../../mtg-common/src/DTO';
import { filterCreatures, filterLands, filterNoncreatureSpells, getNumberOfCreatures, getNumberOfLands, getNumberOfNoncreatureSpells } from '../../functions/util';
import { exportToCsv } from '../../functions/exportToCsv';
import { Bar } from 'react-chartjs-2';
import { DeckEntryComponentWithTooltip } from './DeckEntryCardWithTooltip';
import 'chart.js/auto';

export interface DeckManagerProps extends MuiAppBarProps {
  deckManagerOpened?: boolean;
  handleDeckManagerOpenClose: any
  decks: DeckDTO[]
  selectedDeckId: number
  selectedDeckEntries: DeckCardEntryDTO[]
  fetchDecks: () => void
  saveDeck: any
  deleteDeck: any
  handleChangeSelectedDeck: any,
  addCardCopyToDeck: Function,
  subtractCardCopyFromDeck: Function
}

export default function DeckManagerDrawer(props: DeckManagerProps) {
  const [createDeckWindowOpened, setCreateDeckWindowOpened] = useState<boolean>(false);
  const [editDeckWindowOpened, setEditDeckWindowOpened] = useState<boolean>(false);

  const closeCreateDeckWindow = () => {
    setCreateDeckWindowOpened(false);
  };

  const closeEditDeckWindow = () => {
    setEditDeckWindowOpened(false);
  };

  useEffect(() => {
    console.log("rerendering deck manager")
  }, [props.decks])


  const createDeckWindowProps: CreateDeckWindowProps = {
    createDeckWindowOpened,
    closeCreateDeckWindow: closeCreateDeckWindow,
    fetchDecks: props.fetchDecks
  }

  const calculateMissingCopies = (entry: DeckCardEntryDTO): number => {
    const missingCopies = entry.copies - entry.card.ownedCopies
    return missingCopies > 0 ? missingCopies : 0
  }

  const exportDeckToCsv = () => {
    if (props.selectedDeckId !== 0) {
      const deckName = props.decks.filter(deck => deck.id === props.selectedDeckId)[0].name
      const cardsMap: string[][] = props.selectedDeckEntries.map(entry => [entry.card.name, entry.copies.toString(), calculateMissingCopies(entry).toString()])
      exportToCsv(deckName, cardsMap, ["Card name", "copies", "missing copies"])
    } else {
      console.error("No deck selected")
    }
  }

  const getNumberOfCardsAtManaPrice = (price: string): number => {
    var total = 0
    if (price === '7+') {
      props.selectedDeckEntries.forEach((entry) => {
        if (entry.card.convertedManaCost >= 7) {
          total += entry.copies
        }
      })
    } else {
      props.selectedDeckEntries.forEach((entry) => {
        if (entry.card.convertedManaCost === Number(price)) {
          total += entry.copies
        }
      })
    }
    return total
  }

  const manaCurveChartLabels = ['1', '2', '3', '4', '5', '6', '7+']
  const manaCurveChartData = {
    labels: manaCurveChartLabels,
    datasets: [
      {
        label: 'Mana Curve',
        data: manaCurveChartLabels.map(price => getNumberOfCardsAtManaPrice(price)),
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
      }
    ],
  };


  return (
    <Box sx={{
      display: 'flex',
    }}>
      <Drawer
        sx={{
          width: deckManagerDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: deckManagerDrawerWidth,
          }
        }}
        PaperProps={{
          sx: {
            height: `calc(100% - ${navBarHeight}px)`,
            top: navBarHeight,
            // backgroundColor: '#7adeff'
            // bgcolor: "#cc4839"
            bgcolor: "#4bb5f2",
            overflowX: "hidden"
          },
        }}
        variant="persistent"
        anchor="right"
        open={props.deckManagerOpened}
      >
        <List>
          <ListItem sx={{ ...listItemStyle, fontSize: 18 }}>
            Deck
            <IconButton
              color="inherit"
              aria-label="create-deck"
              edge="end"
              onClick={() => setCreateDeckWindowOpened(true)}
              sx={{
                marginLeft: 'auto',
                // ...(props.open && { display: 'none' }) 
              }}
            >
              <AddIcon />
            </IconButton>
          </ListItem>
          <ListItem sx={{ ...listItemStyle }}>
            <Select
              id="select-deck"
              style={searchTextFieldStyle}
              sx={{ ...buttonBackgroundStyle }}
              value={props.selectedDeckId}
              displayEmpty={true}
              renderValue={selectedDeckId => {
                if (selectedDeckId !== 0) {
                  return props.decks.filter(deck => deck.id === selectedDeckId)[0].name
                } else {
                  return "Select a deck"
                }
              }}
              onChange={props.handleChangeSelectedDeck}
            >
              {
                props.decks.map((deck) => (
                  <MenuItem key={`${deck.id}-${Date.now()}`} value={deck.id}>
                    <ListItemText primary={deck.name} />
                  </MenuItem>
                ))}
            </Select>
            <IconButton
              color="inherit"
              aria-label="edit-deck-metadata"
              edge="end"
              disabled={props.selectedDeckId === 0}
              onClick={() => setEditDeckWindowOpened(true)}
              sx={{
                marginLeft: 'auto',
                // ...(props.open && { display: 'none' }) 
              }}
            >
              <SettingsIcon />
            </IconButton>
          </ListItem>
          <Divider />

          <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
            Lands ({getNumberOfLands(props.selectedDeckEntries)})
          </Box>
          {filterLands(props.selectedDeckEntries).map(entry => {
            const deckEntryProps = {
              entry,
              addCardCopyToDeck: props.addCardCopyToDeck,
              subtractCardCopyFromDeck: props.subtractCardCopyFromDeck
            }
            return (
              < DeckEntryComponentWithTooltip
                {...deckEntryProps} />
            )
          })
          }

          <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
            Creatures ({getNumberOfCreatures(props.selectedDeckEntries)})
          </Box>
          {filterCreatures(props.selectedDeckEntries).map(entry => {
            const deckEntryProps = {
              entry,
              addCardCopyToDeck: props.addCardCopyToDeck,
              subtractCardCopyFromDeck: props.subtractCardCopyFromDeck
            }
            return (
              <DeckEntryComponentWithTooltip {...deckEntryProps} />
            )
          })}

          <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
            Noncreature spells ({getNumberOfNoncreatureSpells(props.selectedDeckEntries)})
          </Box>
          {filterNoncreatureSpells(props.selectedDeckEntries).map(entry => {
            const deckEntryProps = {
              entry,
              addCardCopyToDeck: props.addCardCopyToDeck,
              subtractCardCopyFromDeck: props.subtractCardCopyFromDeck
            }
            return (
              <DeckEntryComponentWithTooltip {...deckEntryProps} />
            )
          })}

          <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
            Total: {props.selectedDeckEntries.length > 0 ? props.selectedDeckEntries.map(entry => entry.copies).reduce((a, b) => a + b) : 0} cards
          </Box>
          <Divider />

          <Bar style={{
            paddingLeft: 30,
            paddingRight: 30,
            color: "black"
          }}
            options={manaCurveChartOptions}
            data={manaCurveChartData} />
          <Divider />
          <ListItem>
            <Button
              color="inherit"
              aria-label="save deck"
              // edge="end"
              variant="contained"
              onClick={props.saveDeck}
              sx={{
                ...buttonBackgroundStyle, ...listItemStyle
              }}
            >
              <SaveAltIcon /> Save Changes
            </Button>
          </ListItem>
          <ListItem>
            <Button
              color="inherit"
              aria-label="download-deck"
              variant="contained"
              onClick={exportDeckToCsv}
              sx={{
                ...buttonBackgroundStyle, ...listItemStyle
              }}
            >
              <SaveAltIcon /> Download card list
            </Button>
          </ListItem>
          <ListItem>
            <Button
              color="inherit"
              aria-label="delete-deck"
              variant="contained"
              onClick={props.deleteDeck}
              sx={{
                ...buttonBackgroundStyle, ...listItemStyle
              }}
            >
              <DeleteIcon /> Delete deck
            </Button>
          </ListItem>
        </List>
        <CreateDeckWindow {...createDeckWindowProps}
        />
      </Drawer>
    </Box>
  );
}


