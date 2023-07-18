import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { navBarHeight, deckManagerDrawerWidth, manaCurveChartOptions, imageHeight, imageWidth } from '../../constants';
import { buttonBackgroundStyle, deckEntryTextBoxStyle, listItemStyle, searchTextFieldStyle } from '../../style/styles';
import { Button, CardMedia, IconButton, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useEffect, useState } from 'react';
import { CreateDeckWindow, CreateDeckWindowProps } from './CreateDeckWindow';
import { DeckCardEntryDTO, DeckDTO } from '../../../../mtg-common/src/DTO';
import { filterCreatures, filterInstants, filterLands, filterNoncreatureArtifacts, filterSorceries, getNumberOfCreatures, getNumberOfInstants, getNumberOfLands, getNumberOfNoncreatureArtifacts, getNumberOfPlaneswalkers, getNumberOfSorceries, filterPlaneswalkers, getNumberOfBattles, filterBattles, getNumberOfNoncreatureEnchantment, filterNoncreatureEnchantments } from '../../functions/util';
import { exportToCsv } from '../../functions/exportToCsv';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import DeckCardTypeCounter from './DeckCardTypeCounter';
import { CopyDeckWindow, CopyDeckWindowProps } from './CopyDeckWindow';
import { DeleteDeckWindow, DeleteDeckWindowProps } from './DeleteDeckWindow';
import { EditDeckWindow, EditDeckWindowProps } from './EditDeckWindow';
// import { EditDeckWindowProps } from './EditDeckWindow';

export interface DeckManagerProps extends MuiAppBarProps {
  deckManagerOpened?: boolean;
  handleDeckManagerOpenClose: any
  decks: DeckDTO[]
  selectedDeckId: number
  selectedDeck: DeckDTO | null
  selectedDeckEntries: DeckCardEntryDTO[]
  fetchDecks: () => void
  saveDeck: any
  deleteDeck: any
  handleChangeSelectedDeck: any,
  addCardCopyToDeck: Function,
  subtractCardCopyFromDeck: Function
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue(value => value + 1);
}


export default function DeckManagerDrawer(props: DeckManagerProps) {
  const [createDeckWindowOpened, setCreateDeckWindowOpened] = useState<boolean>(false);
  const [editDeckWindowOpened, setEditDeckWindowOpened] = useState<boolean>(false);
  const [copyDeckWindowOpened, setCopyDeckWindowOpened] = useState<boolean>(false);
  const [deleteDeckWindowOpened, setDeleteDeckWindowOpened] = useState<boolean>(false);

  const closeCreateDeckWindow = () => {
    setCreateDeckWindowOpened(false);
  };

  const createDeckWindowProps: CreateDeckWindowProps = {
    opened: createDeckWindowOpened,
    onClose: closeCreateDeckWindow,
    fetchDecks: props.fetchDecks
  }


  const closeDeleteDeckWindow = () => {
    setDeleteDeckWindowOpened(false);
  };


  const windows = []
  windows.push(<CreateDeckWindow {...createDeckWindowProps} />)

  if (props.selectedDeck != null) {
    const closeEditDeckWindow = () => {
      setEditDeckWindowOpened(false);
    };

    const closeCopyDeckWindow = () => {
      setCopyDeckWindowOpened(false);
    };


    const editDeckWindowProps: EditDeckWindowProps = {
      opened: editDeckWindowOpened,
      onClose: closeEditDeckWindow,
      deck: props.selectedDeck,
      fetchDecks: props.fetchDecks
    }

    const copyDeckWindowProps: CopyDeckWindowProps = {
      opened: copyDeckWindowOpened,
      onClose: closeCopyDeckWindow,
      deck: props.selectedDeck,
      fetchDecks: props.fetchDecks
    }

    const deleteDeckWindowProps: DeleteDeckWindowProps = {
      opened: deleteDeckWindowOpened,
      onClose: closeDeleteDeckWindow,
      deck: props.selectedDeck,
      fetchDecks: props.fetchDecks
    }

    if (props.selectedDeck != null) {
      windows.push(<EditDeckWindow {...editDeckWindowProps} />)
      windows.push(<CopyDeckWindow {...copyDeckWindowProps} />)
      windows.push(<DeleteDeckWindow {...deleteDeckWindowProps} />)
    }

  }

  useEffect(() => {
    console.log("rerendering deck manager")
  }, [props.decks])


  const calculateMissingCopies = (entry: DeckCardEntryDTO): number => {
    const missingCopies = entry.copies - entry.card.ownedCopies
    return missingCopies > 0 ? missingCopies : 0
  }

  const exportDeckToCsv = () => {
    if (props.selectedDeckId !== 0) {
      const deckName = props.decks.filter(deck => deck.id === props.selectedDeckId)[0].name
      var cardsMap: string[][] = props.selectedDeckEntries.map(entry => [entry.card.name, entry.copies.toString(), calculateMissingCopies(entry).toString()])
      // filter out entries that are not missing
      cardsMap = cardsMap.filter(entry => parseInt(entry[2]) > 0)
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

  const forceUpdate = useForceUpdate();

  const setNewCommander = (entry: DeckCardEntryDTO): void => {
    if (props.selectedDeck === null) {
      return
    }
    const currentCommanderEntries: DeckCardEntryDTO[] = props.selectedDeck.cardEntries.filter(entry => entry.isCommander)
    if (currentCommanderEntries.length > 1) {
      console.error(`Deck ${props.selectedDeck.name} has multiple commanders!`)
      return
    } else if (currentCommanderEntries.length === 0) {
      // console.log(`Deck ${props.selectedDeck.name} has no commander yet.`)
    }
    else if (currentCommanderEntries[0] === entry) {
      console.log(`${entry.card.name} is already commander of deck ${props.selectedDeck.name}!`)
      return
    } else if (currentCommanderEntries[0] !== entry) {
      console.log(`${currentCommanderEntries[0].card.name} is already commander of deck ${props.selectedDeck.name}! Unassigning!`)
      currentCommanderEntries[0].isCommander = false
    }
    console.log(`Assigning ${entry.card.name} as new commander of deck ${props.selectedDeck.name}!`)
    entry.isCommander = true
    // console.log(`Current number of commanders in deck ${props.selectedDeck.name}: ${props.selectedDeck.cardEntries.filter(entry => entry.isCommander).length}`)
    forceUpdate();
  }

  const getCommander = () => {
    if (props.selectedDeck === null) {
      return null
    }
    const currentCommanderEntries: DeckCardEntryDTO[] = props.selectedDeck.cardEntries.filter(entry => entry.isCommander)
    if (currentCommanderEntries.length !== 1) {
      return null
    } else {
      return currentCommanderEntries[0].card
    }
  }

  const currentCommander = getCommander()

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
              renderValue={selectedDeckId => props.selectedDeck !== null ? props.selectedDeck.name : "Select a deck"}
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
                marginLeft: '5px',
                // ...(props.open && { display: 'none' }) 
              }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="copy-deck-metadata"
              edge="end"
              disabled={props.selectedDeckId === 0}
              onClick={() => setCopyDeckWindowOpened(true)}
              sx={{
                marginLeft: '5px',
                // ...(props.open && { display: 'none' }) 
              }}
            >
              <ContentCopyIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="delete-deck"
              edge="end"
              disabled={props.selectedDeckId === 0}
              onClick={() => setDeleteDeckWindowOpened(true)}
              sx={{
                marginLeft: '5px',
              }}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>

          {currentCommander !== null ? (
            <List>
              <ListItem sx={{ ...listItemStyle, fontSize: 18 }}>
                <Box>Commander: {currentCommander.name}</Box>
                <Divider />
              </ListItem>
              <ListItem sx={{ ...listItemStyle, fontSize: 18 }}
                style={{ display: 'flex', justifyContent: 'center' }}>
                <CardMedia
                  sx={{
                    height: imageHeight * 0.4,
                    width: imageWidth * 0.4
                  }}
                  style={{
                    padding: 5,
                    backgroundColor: "White",
                    borderRadius: '10px'
                  }}
                  image={currentCommander.versions.filter(version => version.isPrimaryVersion)[0].frontImageUri}
                />
              </ListItem>
            </List>
          ) : (<></>)
          }
          <Divider />

          <DeckCardTypeCounter
            label="Lands"
            selectedDeckEntries={props.selectedDeckEntries}
            countFn={getNumberOfLands}
            filterFn={filterLands}
            addCardCopyToDeck={props.addCardCopyToDeck}
            subtractCardCopyFromDeck={props.subtractCardCopyFromDeck}
            setNewCommander={setNewCommander}
          />

          <DeckCardTypeCounter
            label="Creatures"
            selectedDeckEntries={props.selectedDeckEntries}
            countFn={getNumberOfCreatures}
            filterFn={filterCreatures}
            addCardCopyToDeck={props.addCardCopyToDeck}
            subtractCardCopyFromDeck={props.subtractCardCopyFromDeck}
            setNewCommander={setNewCommander}
          />

          <DeckCardTypeCounter
            label="Planeswalkers"
            selectedDeckEntries={props.selectedDeckEntries}
            countFn={getNumberOfPlaneswalkers}
            filterFn={filterPlaneswalkers}
            addCardCopyToDeck={props.addCardCopyToDeck}
            subtractCardCopyFromDeck={props.subtractCardCopyFromDeck}
            setNewCommander={setNewCommander}
          />

          <DeckCardTypeCounter
            label="Noncreature artifacts"
            selectedDeckEntries={props.selectedDeckEntries}
            countFn={getNumberOfNoncreatureArtifacts}
            filterFn={filterNoncreatureArtifacts}
            addCardCopyToDeck={props.addCardCopyToDeck}
            subtractCardCopyFromDeck={props.subtractCardCopyFromDeck}
            setNewCommander={setNewCommander}
          />

          <DeckCardTypeCounter
            label="Sorceries"
            selectedDeckEntries={props.selectedDeckEntries}
            countFn={getNumberOfSorceries}
            filterFn={filterSorceries}
            addCardCopyToDeck={props.addCardCopyToDeck}
            subtractCardCopyFromDeck={props.subtractCardCopyFromDeck}
            setNewCommander={setNewCommander}
          />

          <DeckCardTypeCounter
            label="Instants"
            selectedDeckEntries={props.selectedDeckEntries}
            countFn={getNumberOfInstants}
            filterFn={filterInstants}
            addCardCopyToDeck={props.addCardCopyToDeck}
            subtractCardCopyFromDeck={props.subtractCardCopyFromDeck}
            setNewCommander={setNewCommander}
          />

          <DeckCardTypeCounter
            label="Enchantments"
            selectedDeckEntries={props.selectedDeckEntries}
            countFn={getNumberOfNoncreatureEnchantment}
            filterFn={filterNoncreatureEnchantments}
            addCardCopyToDeck={props.addCardCopyToDeck}
            subtractCardCopyFromDeck={props.subtractCardCopyFromDeck}
            setNewCommander={setNewCommander}
          />

          <DeckCardTypeCounter
            label="Battles"
            selectedDeckEntries={props.selectedDeckEntries}
            countFn={getNumberOfBattles}
            filterFn={filterBattles}
            addCardCopyToDeck={props.addCardCopyToDeck}
            subtractCardCopyFromDeck={props.subtractCardCopyFromDeck}
            setNewCommander={setNewCommander}
          />

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
        </List>
        {windows}
      </Drawer>
    </Box>
  );
}


