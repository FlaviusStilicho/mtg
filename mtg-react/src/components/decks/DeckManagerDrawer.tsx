import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import { navBarHeight, deckManagerDrawerWidth, manaCurveChartOptions, imageHeight, imageWidth } from '../../constants';
import { buttonBackgroundStyle, deckEntryTextBoxStyle, listItemStyle, searchTextFieldStyle } from '../../style/styles';
import { Button, CardMedia, IconButton, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import { useEffect, useState } from 'react';
import { CreateDeckWindow, CreateDeckWindowProps } from './CreateDeckWindow';
import { DeckCardEntryDTO } from '../../../../mtg-common/src/DTO';
import { filterCreatures, filterInstants, filterLands, filterNoncreatureArtifacts, filterSorceries, getNumberOfCreatures, getNumberOfInstants, getNumberOfLands, getNumberOfNoncreatureArtifacts, getNumberOfPlaneswalkers, getNumberOfSorceries, filterPlaneswalkers, getNumberOfBattles, filterBattles, getNumberOfNoncreatureEnchantment, filterNoncreatureEnchantments, numberOfCardsAvailable, costToFinishDeck, filterSideboard, getNumberOfSideboardCards, getCommander } from '../../functions/util';
import { exportToCsv } from '../../functions/exportToCsv';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { DeckCardTypeCounter } from './DeckCardTypeCounter';
import { CopyDeckWindow, CopyDeckWindowProps } from './CopyDeckWindow';
import { DeleteDeckWindow, DeleteDeckWindowProps } from './DeleteDeckWindow';
import { EditDeckWindow, EditDeckWindowProps } from './EditDeckWindow';
import { DeckState } from '../hooks/DeckState';
import { CompareDeckWindow, CompareDeckWindowProps } from './CompareDeckWindow';

const colorIconSize = 15
const deckNameFontSize = 10

export interface DeckManagerProps extends MuiAppBarProps {
  deckManagerOpened?: boolean;
  handleDeckManagerOpenClose: Function
  deckState: DeckState
  selectedDeckEntries: DeckCardEntryDTO[]
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue(value => value + 1);
}

export default function DeckManagerDrawer(props: DeckManagerProps) {
  const deckState = props.deckState
  const [createDeckWindowOpened, setCreateDeckWindowOpened] = useState<boolean>(false);
  const [editDeckWindowOpened, setEditDeckWindowOpened] = useState<boolean>(false);
  const [copyDeckWindowOpened, setCopyDeckWindowOpened] = useState<boolean>(false);
  const [deleteDeckWindowOpened, setDeleteDeckWindowOpened] = useState<boolean>(false);
  const [compareDeckWindowOpened, setCompareDeckWindowOpened] = useState<boolean>(false);

  const closeCreateDeckWindow = () => {
    setCreateDeckWindowOpened(false);
  };

  const createDeckWindowProps: CreateDeckWindowProps = {
    opened: createDeckWindowOpened,
    onClose: closeCreateDeckWindow,
    fetchDecks: deckState.fetchDecks
  }

  const windows = []
  windows.push(<CreateDeckWindow {...createDeckWindowProps} />)

  if (deckState.selectedDeck != null) {
    const closeEditDeckWindow = () => {
      setEditDeckWindowOpened(false);
    };

    const closeCopyDeckWindow = () => {
      setCopyDeckWindowOpened(false);
    };

    const closeDeleteDeckWindow = () => {
      setDeleteDeckWindowOpened(false);
    };

    const closeCompareDeckWindow = () => {
      setCompareDeckWindowOpened(false);
    };

    const editDeckWindowProps: EditDeckWindowProps = {
      opened: editDeckWindowOpened,
      onClose: closeEditDeckWindow,
      deck: deckState.selectedDeck,
      fetchDecks: deckState.fetchDecks
    }

    const copyDeckWindowProps: CopyDeckWindowProps = {
      opened: copyDeckWindowOpened,
      onClose: closeCopyDeckWindow,
      deck: deckState.selectedDeck,
      fetchDecks: deckState.fetchDecks
    }

    const deleteDeckWindowProps: DeleteDeckWindowProps = {
      opened: deleteDeckWindowOpened,
      onClose: closeDeleteDeckWindow,
      deck: deckState.selectedDeck,
      fetchDecks: deckState.fetchDecks
    }

    const compareDeckWindowProps: CompareDeckWindowProps = {
      opened: compareDeckWindowOpened,
      onClose: closeCompareDeckWindow,
      deck: deckState.selectedDeck,
      decks: deckState.decks
    }

    if (deckState.selectedDeck != null) {
      windows.push(<EditDeckWindow {...editDeckWindowProps} />)
      windows.push(<CopyDeckWindow {...copyDeckWindowProps} />)
      windows.push(<DeleteDeckWindow {...deleteDeckWindowProps} />)
      windows.push(<CompareDeckWindow {...compareDeckWindowProps} />)
    }

  }

  useEffect(() => {
    console.log("rerendering deck manager")
  }, [deckState.decks])


  const calculateMissingCopies = (entry: DeckCardEntryDTO): number => {
    const missingCopies = entry.copies - entry.card.ownedCopies
    return missingCopies > 0 ? missingCopies : 0
  }

  const exportDeckToCsv = () => {
    if (deckState.selectedDeckId !== 0) {
      const deckName = deckState.decks.filter(deck => deck.id === deckState.selectedDeckId)[0].name
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
    if (deckState.selectedDeck === null) {
      return
    }
    const currentCommanderEntries: DeckCardEntryDTO[] = deckState.selectedDeck.cardEntries.filter(entry => entry.isCommander)
    if (currentCommanderEntries.length > 1) {
      console.error(`Deck ${deckState.selectedDeck.name} has multiple commanders!`)
      return
    } else if (currentCommanderEntries.length === 0) {
      // console.log(`Deck ${props.selectedDeck.name} has no commander yet.`)
    }
    else if (currentCommanderEntries[0] === entry) {
      console.log(`${entry.card.name} is already commander of deck ${deckState.selectedDeck.name}!`)
      return
    } else if (currentCommanderEntries[0] !== entry) {
      console.log(`${currentCommanderEntries[0].card.name} is already commander of deck ${deckState.selectedDeck.name}! Unassigning!`)
      currentCommanderEntries[0].isCommander = false
    }
    console.log(`Assigning ${entry.card.name} as new commander of deck ${deckState.selectedDeck.name}!`)
    entry.isCommander = true
    forceUpdate();
  }

  const currentCommander = getCommander(deckState.selectedDeck)
  const [availableMissingCards, unavailableMissingCards] = numberOfCardsAvailable(props.selectedDeckEntries)

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
          },
        }}
        PaperProps={{
          sx: {
            height: `calc(100% - ${navBarHeight}px)`,
            top: navBarHeight,
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
            >
              <AddIcon />
            </IconButton>
          </ListItem>
          <ListItem sx={{ ...listItemStyle }}>
            <Select
              id="select-deck"
              style={searchTextFieldStyle}
              sx={{ ...buttonBackgroundStyle }}
              value={deckState.selectedDeckId ? deckState.selectedDeckId : undefined}
              // renderValue={selectedDeckId => deckState.selectedDeck !== null ? deckState.selectedDeck.name : "Select a deck"}
              onChange={deckState.handleChangeSelectedDeck}
            >
              <MenuItem value={99999}>
                <Box sx={{ fontSize: deckNameFontSize }}>
                  Select a deck
                </Box>
              </MenuItem>
              {
                deckState.decks.map((deck) => {
                  const commander = getCommander(deck)
                  var deckColorIdentity: Set<string>
                  if (commander) {
                    deckColorIdentity = new Set(commander.colorIdentity)
                  } else {
                    deckColorIdentity = new Set()
                    deck.cardEntries.forEach(entry => entry.card.colorIdentity.forEach(color => deckColorIdentity.add(color)))
                  }
                  return (
                    <MenuItem key={`${deck.id}-${Date.now()}`} value={deck.id} >
                      <Box sx={{ fontSize: deckNameFontSize, display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {commander ? `${deck.name} [${commander.name}]` : deck.name}
                        <Box>
                          {Array.from(deckColorIdentity).map((color) => (
                            <Box
                              component="img"
                              key={color}
                              sx={{
                                height: colorIconSize,
                                width: colorIconSize,
                                maxHeight: colorIconSize,
                                maxWidth: colorIconSize,
                              }}
                              src={`http://localhost:3000/mana/${color}.png`}
                            />))}
                        </Box>
                      </Box>
                    </MenuItem>
                  )
                })}
            </Select>
            <IconButton
              color="inherit"
              aria-label="edit-deck-metadata"
              edge="end"
              disabled={deckState.selectedDeckId === 0}
              onClick={() => setEditDeckWindowOpened(true)}
              sx={{
                marginLeft: '5px'
              }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="copy-deck-metadata"
              edge="end"
              disabled={deckState.selectedDeckId === 0}
              onClick={() => setCopyDeckWindowOpened(true)}
              sx={{
                marginLeft: '5px'
              }}
            >
              <ContentCopyIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="delete-deck"
              edge="end"
              disabled={deckState.selectedDeckId === 0}
              onClick={() => setDeleteDeckWindowOpened(true)}
              sx={{
                marginLeft: '5px'
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
          <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
            Total: {props.selectedDeckEntries.length > 0 ? props.selectedDeckEntries.map(entry => entry.copies).reduce((a, b) => a + b) : 0} cards
          </Box>
          <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
            {availableMissingCards > 0 || unavailableMissingCards > 0 ? `Missing cards: ${availableMissingCards} available, ${unavailableMissingCards} unavailable` : ``}
          </Box>
          <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
            {availableMissingCards > 0 || unavailableMissingCards > 0 ? `Cost to complete: € ${costToFinishDeck(props.selectedDeckEntries)}` : ``}
          </Box>
          <Divider />

          <DeckCardTypeCounter
            label="Lands"
            deckState={deckState}
            countFn={getNumberOfLands}
            filterFn={filterLands}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
          />

          <DeckCardTypeCounter
            label="Creatures"
            deckState={deckState}
            countFn={getNumberOfCreatures}
            filterFn={filterCreatures}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
          />

          <DeckCardTypeCounter
            label="Planeswalkers"
            deckState={deckState}
            countFn={getNumberOfPlaneswalkers}
            filterFn={filterPlaneswalkers}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
          />

          <DeckCardTypeCounter
            label="Noncreature artifacts"
            deckState={deckState}
            countFn={getNumberOfNoncreatureArtifacts}
            filterFn={filterNoncreatureArtifacts}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
          />

          <DeckCardTypeCounter
            label="Sorceries"
            deckState={deckState}
            countFn={getNumberOfSorceries}
            filterFn={filterSorceries}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
          />

          <DeckCardTypeCounter
            label="Instants"
            deckState={deckState}
            countFn={getNumberOfInstants}
            filterFn={filterInstants}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
          />

          <DeckCardTypeCounter
            label="Enchantments"
            deckState={deckState}
            countFn={getNumberOfNoncreatureEnchantment}
            filterFn={filterNoncreatureEnchantments}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
          />

          <DeckCardTypeCounter
            label="Battles"
            deckState={deckState}
            countFn={getNumberOfBattles}
            filterFn={filterBattles}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
          />

          <Bar style={{
            paddingLeft: 30,
            paddingRight: 30,
            color: "black"
          }}
            options={manaCurveChartOptions}
            data={manaCurveChartData} />
          <Divider />
          <DeckCardTypeCounter
            label="Sideboard"
            deckState={deckState}
            countFn={getNumberOfSideboardCards}
            filterFn={filterSideboard}
            setNewCommander={setNewCommander}
            isSideboardEntry={true}
          />
          <Divider />
          {deckState.selectedDeck ?
            (<div>
              <ListItem>
                <Button
                  color="inherit"
                  aria-label="save deck"
                  variant="contained"
                  onClick={deckState.saveDeck}
                  sx={{
                    ...buttonBackgroundStyle, ...listItemStyle
                  }}
                >
                  <SaveIcon /> Save Changes
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  color="inherit"
                  aria-label="compare deck"
                  variant="contained"
                  onClick={() => setCompareDeckWindowOpened(true)}
                  sx={{
                    ...buttonBackgroundStyle, ...listItemStyle
                  }}
                >
                  <SaveIcon /> Compare decks
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
            </div>
            ) : (<></>)
          }
        </List>
        {windows}
      </Drawer>
    </Box>
  );
}