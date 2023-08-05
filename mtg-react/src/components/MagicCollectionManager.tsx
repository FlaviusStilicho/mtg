import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import SearchBar, { SearchWindowProps } from './SearchBar';
import NavBar, { NavBarProps } from './NavBar';
import CardGrid from './collection/CardGrid';
import { theme } from '../style/theme';
import { SelectChangeEvent } from '@mui/material/Select';
import { Color, DeckCardEntryDTO, DeckDTO, MTGCardDTO, MTGSetDTO } from '../../../mtg-common/src/DTO';
import axios from 'axios';
import { CardGridProps } from './collection/CardGrid';
import { FC, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { CardQueryParameters, ListDecksResponse } from '../../../mtg-common/src/requests';
import { debounce } from "lodash";
import DeckManagerDrawer, { DeckManagerProps } from './decks/DeckManagerDrawer';
import { searchBarDrawerWidth } from '../constants';
import { DeckState } from './hooks/DeckState';
import { isBasicLand, numberOfMissingCards } from '../functions/util';
import { fetchCardBuyPriceFromMagicersSingle } from '../functions/magicers';
import { DeckFormat } from '../enum';
import TabPanel from './TabPanel';

const currentStandardSets = [19, 21, 46, 62, 87, 108, 120, 133]
const raritiesList = ["Common", "Uncommon", "Rare", "Mythic"]
const colorSearchOptions = ["Exact match", "Includes at least", "Includes at most"]
const typeSearchOptions = ["Includes at least", "Includes any of"]

export enum EnabledTab {
  COLLECTION,
  DECK
}

const MagicCollectionManager: FC = (props) => {
  // tab state
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChangeSelectedTab = (event: SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // search options
  const [sets, setSets] = useState<MTGSetDTO[]>([]);
  const rarities = useState<string[]>(raritiesList)[0];
  const [types, setTypes] = useState<string[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const typeSearchSettings = useState<string[]>(typeSearchOptions)[0];
  const colorSearchSettings = useState<string[]>(colorSearchOptions)[0];

  // search state
  const [selectedQueryParameters, setSelectedQueryParameters] = useState<CardQueryParameters>({
    cardName: "",
    cardText: "",
    sets: currentStandardSets,
    rarities: raritiesList,
    types: [],
    typeSearchSetting: "Includes any of",
    subType: "",
    colors: [],
    colorSearchSetting: "Exact match",
    manaCost: "",
    format: DeckFormat.STANDARD.toString(),
    minOwnedCopies: 0
  })

  // card state
  const pageSize = 60;
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1)
  const [cards, setCards] = useState<MTGCardDTO[]>([]);

  // deck state
  const [deckManagerOpened, setDeckManagerOpened] = useState(true);
  const [decks, setDecks] = useState<DeckDTO[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number>(99999);
  const [selectedDeck, setSelectedDeck] = useState<DeckDTO | null>(null);
  const [selectedDeckEntries, setSelectedDeckEntries] = useState<DeckCardEntryDTO[]>([])
  const [deckChanged, setDeckChanged] = useState<boolean>(false);

  const handleDeckManagerOpenClose = () => {
    if (deckManagerOpened) {
      setDeckManagerOpened(false)
    } else {
      setDeckManagerOpened(true);
    }
  };

  useEffect(() => {
    fetchData()
    fetchCardsDebounced({
      ...selectedQueryParameters,
      sets: currentStandardSets
    }, false)
    fetchDecks()
  }, []);

  const fetchData = () => {
    axios.get(`http://localhost:8000/sets`).then(response => {
      const setsFromApi: MTGSetDTO[] = response.data.data
      setSets(setsFromApi)
      setSelectedQueryParameters({
        ...selectedQueryParameters,
        sets: currentStandardSets
      })
    })
    axios.get('http://localhost:8000/types').then(response => {
      const types: string[] = response.data.data
      setTypes(types)
    })
    axios.get(`http://localhost:8000/colors`).then(response => {
      const colors: Color[] = response.data.data
      setColors(colors)
    })

  }

  const fetchCards = (queryParameters: CardQueryParameters, incrementPage: boolean = false) => {
    var currentPage = page
    if (incrementPage) {
      currentPage += 1
      setPage(currentPage)
    } else {
      currentPage = 1
      setPage(currentPage)
    }

    console.log(`fetchcards: currentPage: ${currentPage}`)
    axios.get(`cards/`, {
      params: {
        take: pageSize,
        page: currentPage,
        query: queryParameters
      }
    }).then(response => {
      const newCards: MTGCardDTO[] = response.data.cards
      if (currentPage === 1) {
        setCards(newCards)
      } else {
        const newCardsList = cards.concat(newCards)
        setCards(newCardsList)
        // todo alex do something with total pages
      }
    }).catch(error => {
      console.error(error)
      setCards([])
    })
  }

  const fetchCardsDebounced = useCallback(debounce(fetchCards, 1500), [
    page,
    cards,
    selectedQueryParameters
  ]);

  const getDefaultSetsForFormat = (format: string) => {
    if (format === DeckFormat.STANDARD.toString()) {
      return currentStandardSets
    } else if (format === DeckFormat.COMMANDER.toString()) {
      return sets.map(set => set.id)
    } else {
      throw Error("Unknown format!")
    }
  }

  const handleChangeSelectedQueryParameters = (event: SelectChangeEvent<typeof selectedQueryParameters>) => {
    const propName = event.target.name;
    const newValue = event.target.value;
    var queryParameters = selectedQueryParameters

    if (propName === "cardName" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, cardName: newValue }
    } else if (propName === "cardText" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, cardText: newValue }
    } else if (propName === "sets" && Array.isArray(newValue) && newValue.every(item => typeof item === 'number')) {
      var newSets: number[] = []
      if (newValue[newValue.length - 1] === 99999) {
        newSets = queryParameters.sets.length > 0 ? [] : sets.map(set => set.id);
      } else {
        newSets = newValue;
      }
      queryParameters = { ...selectedQueryParameters, sets: newSets }
    } else if (propName === "rarities" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
      queryParameters = { ...selectedQueryParameters, rarities: newValue }
    } else if (propName === "types" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
      queryParameters = { ...selectedQueryParameters, types: newValue }
    } else if (propName === "typeSearchSetting" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, typeSearchSetting: newValue }
    } else if (propName === "subType" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, subType: newValue }
    } else if (propName === "colors" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
      queryParameters = { ...selectedQueryParameters, colors: newValue }
    } else if (propName === "colorSearchSetting" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, colorSearchSetting: newValue }
    } else if (propName === "manaCost" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, manaCost: newValue }
    } else if (propName === "format" && typeof newValue === 'string') {
      const newSets: number[] = getDefaultSetsForFormat(newValue)
      queryParameters = { ...selectedQueryParameters, format: newValue, sets: newSets }
    } else if (propName === "minOwnedCopies" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, minOwnedCopies: parseInt(newValue) }
    } else {
      console.error(`Type error while updating query parameters: field=${propName}, type=${typeof newValue}, value=${newValue}`)
    }
    setSelectedQueryParameters(queryParameters)
    fetchCardsDebounced(queryParameters, false)
  }

  const handleChangeSelectedDeck = (event: SelectChangeEvent<typeof selectedDeckId>) => {
    const newDeckId = event.target.value
    if (typeof newDeckId === 'string') {
      console.error("help!")
    } else {
      if (newDeckId === 99999) {
        setSelectedDeckId(99999);
        setSelectedDeck(null)
        setSelectedDeckEntries([])
      } else {
        setSelectedDeckId(newDeckId);
        const newDeck = decks.filter(deck => deck.id === newDeckId)[0]
        setSelectedDeck(newDeck)
        setSelectedQueryParameters({ ...selectedQueryParameters, format: newDeck.format, sets: getDefaultSetsForFormat(newDeck.format) })

        Promise.all(getDeck(newDeckId).cardEntries.map(entry => {
          if (numberOfMissingCards(entry, true) > 0 || numberOfMissingCards(entry, false) > 0) {
            return fetchCardBuyPriceFromMagicersSingle(entry.card).then(price => {
              entry.buyPrice = price
              return entry
            })
          } else {
            entry.buyPrice = undefined
            return entry
          }
        })).then(entries => setSelectedDeckEntries(entries))
        // todo
        // setSelectedDeckEntries(getDeck(newDeckId).cardEntries)
      }
    }
  }

  const fetchDecks = () => {
    axios.get(`http://localhost:8000/decks/list`).then(response => {
      const data: ListDecksResponse = response.data
      const decks = data.decks
      decks.forEach(deck => { if (deck['cardEntries'] === undefined) deck['cardEntries'] = [] })
      setDecks(decks)
    })
  }

  const saveDeck = () => {
    console.log('Saving deck')
    const deck = getDeck(selectedDeckId)
    deck.cardEntries = selectedDeckEntries

    // make a clone, submit it without version data
    const deckClone = JSON.parse(JSON.stringify(deck));
    for (let i = 0; i < deck.cardEntries.length; i++) {
      deckClone.cardEntries[i].card.versions = []
    }

    axios.put(`http://localhost:8000/decks/`, deckClone).then(response => {
      console.log(`updated deck ${deckClone.name}!`)
    })
  }

  const deleteDeck = () => {
    axios.delete(`http://localhost:8000/decks/?id=${selectedDeckId}`).then(response => {
      console.log("Deleted deck!")
    })
    setSelectedDeckId(0)
  }

  const getDeck = (id: number): DeckDTO => {
    return decks.filter(deck => deck.id === id)[0]
  }

  const getExistingEntry = (newCard: MTGCardDTO) => {
    const existingCardEntry: DeckCardEntryDTO[] = selectedDeckEntries.filter(entry => entry.card.id === newCard.id)
    if (existingCardEntry.length !== 0) {
      return existingCardEntry[0]
    } else {
      return null
    }
  }

  const getCurrentNumberOfCopiesForCard = (card: MTGCardDTO): number => {
    const entry = getExistingEntry(card)
    if (!entry) {
      return 0
    } else {
      return entry.copies
    }
  }

  const updateDeckEntries = (entry: DeckCardEntryDTO) => {
    const currentEntriesList = selectedDeckEntries
    const newEntriesList = currentEntriesList.filter(currentEntry => currentEntry.card.name !== entry.card.name)
    newEntriesList.push(entry)
    setSelectedDeckEntries(newEntriesList)
  }

  const updateCardCopiesInDeck = (card: MTGCardDTO, increment: number, isSideboard: boolean) => {
    if (increment !== -1 && increment !== 1) {
      throw Error("Unexpected increment")
    }
    if (selectedDeck === null) {
      throw Error("No deck selected!")
    }
    const existingCardEntry: DeckCardEntryDTO | null = getExistingEntry(card)

    if (!existingCardEntry) {
      if (increment === -1) {
        throw Error("Cannot remove cards from nonexistant entry")
      }
      const newEntry = {
        id: undefined,
        card: card,
        copies: isSideboard ? 0 : 1,
        sideboardCopies: isSideboard ? 1 : 0,
        isCommander: false
      }
      updateDeckEntries(newEntry)
    } else {
      if (isSideboard) {
        existingCardEntry.sideboardCopies += increment
      } else {
        existingCardEntry.copies += increment
      }
      checkEntryIllegal(existingCardEntry, selectedDeck)
      updateDeckEntries(existingCardEntry)
    }
  }

  function checkEntryIllegal(entry: DeckCardEntryDTO, deck: DeckDTO) {
    const format = deck.format
    var maxCardCopies
    if (format === "standard") {
      maxCardCopies = 4
    } else if (format === "commander") {
      maxCardCopies = 1
    } else {
      console.log(format)
      throw Error("Unsupported format")
    }
    if (entry.copies < 0 || entry.sideboardCopies < 0) {
      throw Error("Cannot have less than 0 copies")
    }
    if (isBasicLand(entry.card)) {
      return
    } else if (entry.copies > maxCardCopies || entry.sideboardCopies > maxCardCopies) {
      throw Error("Cannot exceed max card copies")
    }
    return
  }

  const handleLoadMore = async () => {
    fetchCardsDebounced(selectedQueryParameters, true)
  }

  const searchWindowProps: SearchWindowProps = {
    selectedQueryParameters,
    handleChangeSelectedQueryParameters,
    sets,
    rarities,
    types,
    typeSearchSettings,
    colors,
    colorSearchSettings,
  }

  const deckState: DeckState = {
    decks,
    saveDeck,
    deleteDeck,
    fetchDecks,
    selectedDeck,
    selectedDeckId,
    selectedDeckEntries,
    handleChangeSelectedDeck,
    deckChanged,
    setDeckChanged,
    updateCardCopiesInDeck,
    updateDeckEntries,
    getCurrentNumberOfCopiesForCard
  }

  const deckManagerProps: DeckManagerProps = {
    deckManagerOpened: deckManagerOpened,
    handleDeckManagerOpenClose,
    deckState,
    selectedDeckEntries
  }

  const searchGridProps: CardGridProps = {
    cards,
    enabledTab: EnabledTab.COLLECTION,
    deckState,
    handleLoadMore
  }

  const deckGridProps: CardGridProps = {
    cards,
    enabledTab: EnabledTab.DECK,
    deckState,
    deckManagerOpened,
    handleLoadMore
  }

  const navBarProps: NavBarProps = {
    selectedTab,
    handleChangeSelectedTab,
    open: deckManagerOpened,
    handleDeckManagerOpenClose
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', minWidth: "100%" }}>
        <CssBaseline />
        <Box
          component="nav"
          sx={{ width: { sm: searchBarDrawerWidth }, flexShrink: { sm: 0 } }}>
          <SearchBar {...searchWindowProps} />
        </Box>
        <Box width="100%">
          <NavBar {...navBarProps} />
          <TabPanel value={selectedTab} index={0}>
            <Box width="100%">
              <CardGrid {...searchGridProps} />
            </Box>
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <Box width="100%">
              <CardGrid {...deckGridProps} />
            </Box>
            <DeckManagerDrawer {...deckManagerProps} />
          </TabPanel>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default MagicCollectionManager