import * as React from 'react';
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
import { FC, useEffect, useState } from 'react';
import { CardQueryParameters, ListDecksResponse } from '../../../mtg-common/src/requests';
import { debounce } from "lodash";
import DeckManagerDrawer, { DeckManagerProps } from './decks/DeckManagerDrawer';
import { maximumCardCopiesStandard, searchBarDrawerWidth } from '../constants';
import { DeckState } from './hooks/DeckState';
import { isBasicLand } from '../functions/util';
import { fetchCardBuyPriceFromMagicersAsString } from '../functions/magicers';
import { DeckFormat } from '../enum';
import TabPanel from './TabPanel';

const currentStandardSets = [19, 21, 46, 62, 87, 108, 120, 133]
const raritiesList = ["Common", "Uncommon", "Rare", "Mythic"]
const colorSearchOptions = ["Exact match", "Includes at least", "Includes at most"]

export enum EnabledTab {
  COLLECTION,
  DECK
}

const MagicCollectionManager: FC = (props) => {
  // tab state
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleChangeSelectedTab = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // search options
  const [sets, setSets] = React.useState<MTGSetDTO[]>([]);
  const rarities = React.useState<string[]>(raritiesList)[0];
  const [types, setTypes] = React.useState<string[]>([]);
  const [colors, setColors] = React.useState<Color[]>([]);
  const colorSearchSettings = React.useState<string[]>(colorSearchOptions)[0];

  // search state
  const [selectedQueryParameters, setSelectedQueryParameters] = React.useState<CardQueryParameters>({
    cardName: "",
    cardText: "",
    sets: currentStandardSets,
    rarities: raritiesList,
    types: [],
    subType: "",
    colors: [],
    colorSearchSetting: "Exact match",
    manaCost: "",
    format: DeckFormat.STANDARD.toString()
  })

  // card state
  const pageSize = 60;
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1)
  const [cards, setCards] = React.useState<MTGCardDTO[]>([]);

  // deck state
  const [deckManagerOpened, setDeckManagerOpened] = React.useState(true);
  const [decks, setDecks] = useState<DeckDTO[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number>(0);
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
    fetchCards({
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

  const fetchCards = React.useCallback(debounce((queryParameters: CardQueryParameters, incrementPage: boolean = false, delay: number = 0) => {
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
    })
  }, 1500), [
    page,
    cards,
    selectedQueryParameters
  ]);

  const handleChangeSelectedQueryParameters = (event: SelectChangeEvent<typeof selectedQueryParameters>) => {
    const propName = event.target.name;
    const newValue = event.target.value;
    var queryParameters = selectedQueryParameters
    if (propName == "cardName" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, cardName: newValue }
    } else if (propName == "cardText" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, cardText: newValue }
    } else if (propName == "sets" && Array.isArray(newValue) && newValue.every(item => typeof item === 'number')) {
      var newSets: number[] = []
      if (newValue[newValue.length - 1] === 99999) {
        newSets = queryParameters.sets.length > 0 ? [] : sets.map(set => set.id);
      } else {
        newSets = newValue;
      }
      queryParameters = { ...selectedQueryParameters, sets: newSets }
    } else if (propName == "rarities" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
      queryParameters = { ...selectedQueryParameters, rarities: newValue }
    } else if (propName == "types" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
      queryParameters = { ...selectedQueryParameters, types: newValue }
    } else if (propName == "subType" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, subType: newValue }
    } else if (propName == "colors" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
      queryParameters = { ...selectedQueryParameters, colors: newValue }
    } else if (propName == "colorSearchSetting" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, colorSearchSetting: newValue }
    } else if (propName == "manaCost" && typeof newValue === 'string') {
      queryParameters = { ...selectedQueryParameters, manaCost: newValue }
    } else if (propName == "format" && typeof newValue === 'string') {
      var newSets: number[] = []
      if (newValue == DeckFormat.STANDARD.toString()) {
        newSets = currentStandardSets
      } else if (newValue == DeckFormat.COMMANDER.toString()) {
        newSets = sets.map(set => set.id)
      } else {
        console.error("Unknown format!")
      }
      queryParameters = { ...selectedQueryParameters, format: newValue, sets: newSets }
    }
    else {
      console.error(`Type error while updating query parameters: field=${propName}, type=${typeof newValue}, value=${newValue}`)
    }
    setSelectedQueryParameters(queryParameters)
    fetchCards(queryParameters, false, 0)
  }

  const handleChangeSelectedDeck = (event: SelectChangeEvent<typeof selectedDeckId>) => {
    const newValue = event.target.value
    if (typeof newValue === 'string') {
      console.error("help!")
    } else {
      setSelectedDeckId(newValue);

      Promise.all(getDeck(newValue).cardEntries.map(entry => {
        return fetchCardBuyPriceFromMagicersAsString(entry.card).then(price => {
          entry.buyPrice = price
          return entry
        })
      })).then(entries => setSelectedDeckEntries(entries))

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

  const saveDeck = (test: any) => {
    console.log('save')
    const deck = getDeck(selectedDeckId)
    deck.cardEntries = selectedDeckEntries

    // make a clone, submit it without version data
    const deckClone = JSON.parse(JSON.stringify(deck));
    for (let i = 0; i < deck.cardEntries.length; i++) {
      deckClone.cardEntries[i].card.versions = []
    }

    axios.put(`http://localhost:8000/decks/`, deckClone).then(response => {
      console.log("updated deck!")
    })
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

  const addCardCopyToDeck = (newCard: MTGCardDTO, setCopiesInDeck?: Function) => {
    var cardEntry: DeckCardEntryDTO | null = getExistingEntry(newCard)
    fetchCardBuyPriceFromMagicersAsString(newCard).then(buyPrice => {
      if (!cardEntry) {
        cardEntry = {
          id: undefined,
          card: newCard,
          copies: 1,
          buyPrice
        }
      } else {
        if (cardEntry.copies >= maximumCardCopiesStandard && !isBasicLand(cardEntry.card)) {
          console.error("Cannot increase copies beyond 4!")
        } else {
          cardEntry.copies += 1
        }
      }
      updateDeckEntries(cardEntry)
      if (setCopiesInDeck) {
        setCopiesInDeck(cardEntry.copies)
      }
    })

  }

  const subtractCardCopyFromDeck = (newCard: MTGCardDTO, setCopiesInDeck?: Function) => {
    const existingCardEntry: DeckCardEntryDTO | null = getExistingEntry(newCard)
    if (!existingCardEntry) {
      return
    } else {
      if (existingCardEntry.copies <= 1) {
        setSelectedDeckEntries(selectedDeckEntries.filter(entry => entry.card.id !== existingCardEntry.card.id))
        if (setCopiesInDeck) {
          setCopiesInDeck(0)
        }
      } else {
        existingCardEntry.copies -= 1
        updateDeckEntries(existingCardEntry)
        if (setCopiesInDeck) {
          setCopiesInDeck(existingCardEntry.copies)
        }
      }
    }
  }
  const handleLoadMore = async () => {
    fetchCards(selectedQueryParameters, true, 0)
  }


  const searchWindowProps: SearchWindowProps = {
    selectedQueryParameters,
    handleChangeSelectedQueryParameters,
    sets,
    rarities,
    types,
    colors,
    colorSearchSettings,
  }

  const deckState: DeckState = {
    decks,
    fetchDecks,
    selectedDeckId,
    handleChangeSelectedDeck,
    deckChanged,
    setDeckChanged,
    addCardCopyToDeck,
    subtractCardCopyFromDeck,
    getCurrentNumberOfCopiesForCard,
    // getCurrentDeckEntries
  }

  const deckManagerProps: DeckManagerProps = {
    deckManagerOpened: deckManagerOpened,
    handleDeckManagerOpenClose,
    decks,
    selectedDeckId,
    selectedDeckEntries,
    fetchDecks,
    saveDeck,
    // getCurrentDeckEntries,
    handleChangeSelectedDeck,
    addCardCopyToDeck,
    subtractCardCopyFromDeck
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