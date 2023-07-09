import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import SearchBar, { SearchWindowProps } from './collection/SearchBar';
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
import useConstant from 'use-constant';
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

  // search state
  const [cardNameQuery, setCardNameQuery] = React.useState<string>("");
  const [cardTextQuery, setCardTextQuery] = React.useState<string>("");

  const [sets, setSets] = React.useState<MTGSetDTO[]>([]);
  const [selectedSets, setSelectedSets] = React.useState<number[]>([]);

  const rarities = React.useState<string[]>(raritiesList)[0];
  const [selectedRarities, setSelectedRarities] = React.useState<string[]>(raritiesList);

  const [types, setTypes] = React.useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedSubType, setSelectedSubType] = React.useState<string>("");

  const [colors, setColors] = React.useState<Color[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);

  const [colorSearchSettings, setColorSearchSettings] = React.useState<string[]>(colorSearchOptions);
  const [selectedColorSearchSetting, setSelectedColorSearchSetting] = React.useState<string>("Exact match");

  const [selectedManaCost, setSelectedManaCost] = React.useState<string>("");
  const [selectedDeckFormat, setSelectedDeckFormat] = React.useState<string>(DeckFormat.STANDARD.toString());

  // card state
  const pageSize = 60;
  const [page, setPage] = useState(1);
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
    fetchDecks()
    updateCards()
  }, []);

  const fetchData = () => {
    axios.get(`http://localhost:8000/sets`).then(response => {
      const setsFromApi: MTGSetDTO[] = response.data.data
      setSets(setsFromApi)
      setSelectedSets(currentStandardSets)
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

  const fetchCards = (incrementPage: boolean) => {
    var currentPage = page
    if (incrementPage) {
      currentPage += 1
      setPage(currentPage)
    } else {
      currentPage = 1
      setPage(currentPage)
    }

    const queryParameters: CardQueryParameters = {
      cardName: cardNameQuery,
      cardText: cardTextQuery,
      sets: selectedSets.length != 0 ? selectedSets : currentStandardSets,
      rarities: selectedRarities,
      types: selectedTypes,
      subType: selectedSubType,
      colors: selectedColors,
      colorSearchSetting: selectedColorSearchSetting,
      manaCost: selectedManaCost,
      format: selectedDeckFormat
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
  }

  
  const updateCards = React.useCallback(debounce((incrementPage: boolean = false) => {
    fetchCards(incrementPage);
  }, 1500), [
    page, 
    cards,
    cardNameQuery,
    cardTextQuery,
    selectedSets,
    selectedRarities,
    selectedTypes,
    selectedSubType,
    selectedColors,
    selectedColorSearchSetting,
    selectedManaCost,
    selectedDeckFormat
  ]);

  const handleChangeCardNameQuery = (event: SelectChangeEvent<typeof cardNameQuery>) => {
    setCardNameQuery(event.target.value);
    updateCards();
  };

  const handleChangeCardTextQuery = (event: SelectChangeEvent<typeof cardTextQuery>) => {
    setCardTextQuery(event.target.value);
    updateCards();
  };

  const handleChangeSelectedSets = (event: SelectChangeEvent<typeof selectedSets>) => {
    const newValue = event.target.value
    if (typeof newValue === 'string') {
      console.error("help!")
    } else if (newValue[newValue.length - 1] === 99999) {
      setSelectedSets(selectedSets.length > 0 ? [] : sets.map(set => set.id));
      updateCards();
    } else {
      setSelectedSets(newValue);
      updateCards();
    }
  };

  const handleChangeSelectedRarities = (event: SelectChangeEvent<typeof selectedRarities>) => {
    const newValue = event.target.value
    if (typeof newValue === 'string') {
      console.error("help!")
    } else {
      setSelectedRarities(newValue);
      updateCards();
    }
  };

  const handleChangeSelectedTypes = (event: SelectChangeEvent<typeof selectedTypes>) => {
    const newValue = event.target.value
    if (typeof newValue === 'string') {
      console.error("help!")
    } else {
      setSelectedTypes(newValue);
      updateCards();
    }
  };

  const handleChangeSelectedSubType = (event: SelectChangeEvent<typeof selectedSubType>) => {
    setSelectedSubType(event.target.value);
    updateCards();
  };

  const handleChangeSelectedColors = (event: SelectChangeEvent<typeof selectedColors>) => {
    const newValue = event.target.value
    if (typeof newValue === 'string') {
      console.error("help!")
    } else {
      setSelectedColors(newValue);
      updateCards();
    }
  };

  const handleChangeSelectedColorSearchSetting = (event: SelectChangeEvent<typeof selectedColorSearchSetting>) => {
    setSelectedColorSearchSetting(event.target.value);
    updateCards();
  };

  const handleChangeSelectedManaCost = (event: SelectChangeEvent<typeof selectedManaCost>) => {
    setSelectedManaCost(event.target.value);
    updateCards();
  };

  const handleChangeSelectedDeckFormat = (event: SelectChangeEvent<typeof selectedDeckFormat>) => {
    const newValue = event.target.value
    setSelectedDeckFormat(newValue);
    if (newValue == DeckFormat.STANDARD.toString()) {
      setSelectedSets(currentStandardSets)
    } else if (newValue == DeckFormat.COMMANDER.toString()) {
      setSelectedSets(sets.map(set => set.id))
    }
    updateCards();
  };

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
    updateCards(true)
  }

  const searchWindowProps: SearchWindowProps = {
    cardNameQuery,
    handleChangeCardNameQuery,
    cardTextQuery,
    handleChangeCardTextQuery,
    sets,
    selectedSets,
    setSelectedSets,
    handleChangeSelectedSets,
    rarities,
    selectedRarities,
    setSelectedRarities,
    handleChangeSelectedRarities,
    types,
    selectedTypes,
    setSelectedTypes,
    handleChangeSelectedTypes,
    selectedSubType,
    setSelectedSubType,
    handleChangeSelectedSubType,
    colors,
    selectedColors,
    setSelectedColors,
    handleChangeSelectedColors,
    colorSearchSettings,
    setColorSearchSetting: setColorSearchSettings,
    selectedColorSearchSetting,
    setSelectedColorSearchSetting,
    handleChangeSelectedColorSearchSetting,
    selectedManaCost,
    setSelectedManaCost,
    handleChangeSelectedManaCost,
    selectedDeckFormat,
    setSelectedDeckFormat,
    handleChangeSelectedDeckFormat
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