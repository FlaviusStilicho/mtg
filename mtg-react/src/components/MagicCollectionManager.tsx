import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import SearchBar, { SearchWindowProps } from './SearchBar';
import NavBar, { NavBarProps } from './NavBar';
import { CardGrid } from './collection/CardGrid';
import { theme } from '../style/theme';
import { SelectChangeEvent } from '@mui/material/Select';
import { Color, DeckCardEntryDTO, DeckDTO, MTGCardDTO, MTGSetDTO, WishlistEntryDTO } from '../../../mtg-common/src/DTO';
import axios from 'axios';
import { CardGridProps } from './collection/CardGrid';
import { FC, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { CardQueryParameters, ListDecksResponse, UpdateCardOwnedCopiesQueryParams } from '../../../mtg-common/src/requests';
import { debounce } from "lodash";
import DeckManagerDrawer, { DeckManagerProps } from './decks/DeckManagerDrawer';
import { searchBarDrawerWidth } from '../constants';
import { DeckState } from './hooks/DeckState';
import { isBasicLand, numberOfMissingCards, getDeckColorIdentity } from '../functions/util';
import { fetchCardBuyPriceFromMagicersSingle } from '../functions/magicers';
import { DeckFormat } from '../enum';
import TabPanel from './TabPanel';
import { WishlistDrawer, WishlistProps } from './collection/WishlistDrawer';

const currentStandardSets = [19, 21, 46, 62, 87, 108, 120, 133]
const raritiesList = ["Common", "Uncommon", "Rare", "Mythic"]
const colorSearchOptions = ["Exact match", "Includes at least", "Includes at most"]
const typeSearchOptions = ["Includes at least", "Includes any of"]

export enum EnabledTab {
  COLLECTION,
  DECK
}

const MagicCollectionManager: FC = (props) => {
  // console.log("rendering collection manager")
  
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
    sets: [],
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
  // const [lastPage, setLastPage] = useState(1)
  const [cards, setCards] = useState<MTGCardDTO[]>([]);

  // deck state
  const [deckManagerOpened, setDeckManagerOpened] = useState(true);
  const [decks, setDecks] = useState<DeckDTO[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number>(99999);
  const [selectedDeck, setSelectedDeck] = useState<DeckDTO | null>(null);
  const [selectedDeckEntries, setSelectedDeckEntries] = useState<DeckCardEntryDTO[]>([])
  const [deckChanged, setDeckChanged] = useState<boolean>(false);

  // wishlist
  const [wishlistOpened, setWishlistOpened] = useState(true);
  const [wishlistEntries, setWishlistEntries] = useState<WishlistEntryDTO[]>([])

  const handleDeckManagerOpenClose = () => {
    if (deckManagerOpened) {
      setDeckManagerOpened(false)
    } else {
      setDeckManagerOpened(true);
    }
  };

  const handleWishlistOpenClose = () => {
    if (wishlistOpened) {
      setWishlistOpened(false)
    } else {
      setWishlistOpened(true);
    }
  };


  useEffect(() => {
    fetchData()
    fetchCardsDebounced({
      ...selectedQueryParameters,
    }, false)
    fetchDecks()
  }, []);

  const fetchData = () => {
    axios.get(`http://localhost:8000/sets`).then(response => {
      const setsFromApi: MTGSetDTO[] = response.data.data
      setSets(setsFromApi)
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
        console.log("new cards")
        setCards(newCards)
      } else {
        console.log("extra cards")
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
      return []
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
        const newDeck = decks.filter(deck => deck.id === newDeckId)[0]
        const colorIdentity: string[] = Array.from(getDeckColorIdentity(newDeck))
        setSelectedDeckId(newDeckId);
        setSelectedDeck(newDeck)
        setSelectedQueryParameters({ ...selectedQueryParameters, 
          format: newDeck.format, 
          sets: getDefaultSetsForFormat(newDeck.format),
          colors: colorIdentity,
          colorSearchSetting: colorIdentity.length > 0 ? "Includes at most" : selectedQueryParameters.colorSearchSetting
         })

        setSelectedDeckEntries(getDeck(newDeckId).cardEntries)
        console.log("Collecting card prices")
        Promise.all(getDeck(newDeckId).cardEntries.map(entry => {
          if (numberOfMissingCards(entry, true) > 0 || numberOfMissingCards(entry, false) > 0) {
            return fetchCardBuyPriceFromMagicersSingle(entry.card).then(price => {
              console.log(`Price of card ${entry.card.name} is ${price}`)
              entry.buyPrice = price
              return entry
            })
          } else {
            entry.buyPrice = undefined
            return entry
          }
        })).then(entries => {
          console.log("done collecting card prices")
          setSelectedDeckEntries(entries)})
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
    doSaveDeck(selectedDeckEntries)
  }

  const doSaveDeck = (entries: DeckCardEntryDTO[]) => {
    console.log('Saving deck')
    const deck = getDeck(selectedDeckId)
    deck.cardEntries = entries

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
    doSaveDeck(newEntriesList)
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

  const postUpdatedOwnedCopies = debounce((body: UpdateCardOwnedCopiesQueryParams) => {
    axios.post(`http://localhost:8000/cards/ownedCopies`, body)
  } , 1500)

  const updateCardCopiesInCollection = (id: number, copies: number) => {
    const updatedCards: MTGCardDTO[] = cards.map(card => {
      if (card.id === id) {
          console.log(`updating collection: ${card.name} to ${copies}`);
          const body: UpdateCardOwnedCopiesQueryParams = {
            cardId: card.id,
            ownedCopies: copies
          }
          postUpdatedOwnedCopies(body)
          return {
              ...card,          
              ownedCopies: copies 
          };
      } else {
        return card
      }
    });
    setCards(updatedCards);
  }

  const updateCardCopiesInWishlist = (id: number, add: boolean) => {
    var updatedEntries: WishlistEntryDTO[] = wishlistEntries.map(entry => entry)
    console.log(wishlistEntries)

    const matchingEntry = wishlistEntries.filter(entry => {
        if (entry.card.id === id){
          return true
        }
        return false
      })
    if (matchingEntry.length === 1){ 
      const entry = matchingEntry[0]
      console.log(`found existing wishlist entry ${entry.card.name}`)

      entry.desiredCopies = add ? entry.desiredCopies + 1 : entry.desiredCopies - 1
      if (matchingEntry[0].desiredCopies <= 0){
        console.log(`Removing entry fom wishlist: ${wishlistEntries.filter(entry => entry.card.id === id)[0].card.name}`)
        updatedEntries = wishlistEntries.filter(entry => entry.card.id !== id)
      } else {
        updatedEntries = wishlistEntries.filter(entry => entry.card.id !== id)
        updatedEntries.push(matchingEntry[0])
      }
    } else {
      if(!add) {
        throw Error("Cannot decrease number of copies on card that isnt on wishlist")
      }
      const matchingCards: MTGCardDTO[] = cards.filter(card => card.id === id)
      if(matchingCards.length > 1 || matchingCards.length === 0){
        throw Error("Couldnt match card")
      } else {
        console.log(`Adding entry to wishlist: ${matchingCards[0].name}`)

        updatedEntries.push({
          card: matchingCards[0],
          desiredCopies: 1,
          isInShoppingCart: false
        })
      }
    }
    console.log("updating wishlist")
    console.log(updatedEntries)
    setWishlistEntries(updatedEntries);
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
    deckState,
    selectedDeckEntries
  }

  const wishlistProps: WishlistProps = {
    wishlistOpened,
    wishlistedCards: wishlistEntries,
    updateCardCopiesInWishlist
  }

  const collectionGridProps: CardGridProps = {
    cards,
    enabledTab: EnabledTab.COLLECTION,
    deckState,
    wishlistOpened,
    updateCardCopiesInCollection,
    updateCardCopiesInWishlist,
    handleLoadMore
  }

  const deckGridProps: CardGridProps = {
    cards,
    enabledTab: EnabledTab.DECK,
    deckState,
    deckManagerOpened,
    updateCardCopiesInCollection,
    updateCardCopiesInWishlist,
    handleLoadMore
  }

  const navBarProps: NavBarProps = {
    selectedTab,
    handleChangeSelectedTab,
    open: deckManagerOpened,
    handleDeckManagerOpenClose,
    handleWishlistOpenClose
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
              <CardGrid {...collectionGridProps} />
            </Box>
            <WishlistDrawer {...wishlistProps}/>
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