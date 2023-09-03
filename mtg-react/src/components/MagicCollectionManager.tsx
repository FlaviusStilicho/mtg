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
import { Component, SyntheticEvent } from 'react';
import { CardQueryParameters, ListDecksResponse, UpdateCardOwnedCopiesQueryParams } from '../../../mtg-common/src/requests';
import { debounce } from "lodash";
import DeckManagerDrawer, { DeckManagerProps } from './decks/DeckManagerDrawer';
import { searchBarDrawerWidth } from '../constants';
import { isBasicLand, numberOfMissingCards, getDeckColorIdentity, findDecksContainCard } from '../functions/util';
import { fetchCardBuyPriceFromMagicersSingle } from '../functions/magicers';
import { DeckFormat } from '../enum';
import TabPanel from './TabPanel';
import { WishlistDrawer, WishlistProps } from './collection/WishlistDrawer';

const currentStandardSets = [19, 21, 46, 62, 87, 108, 120, 133]
const raritiesList = ["Common", "Uncommon", "Rare", "Mythic"]
const colorSearchOptions = ["Exact match", "Includes at least", "Includes at most"]
const typeSearchOptions = ["Includes at least", "Includes any of"]
const pageSize = 60;

export enum EnabledTab {
  COLLECTION,
  DECK
}

export interface CollectionManagerProps {

}

interface CollectionManagerState{
  selectedTab: number

  // search state
  sets: MTGSetDTO[]
  rarities: string[];
  types: string[];
  colors: Color[];
  typeSearchSettings: string[];
  colorSearchSettings: string[];
  selectedQueryParameters: CardQueryParameters

  // card state
  page: number
  // lastPage: number
  cards: MTGCardDTO[]

  // deck state
  deckManagerOpened: boolean
  decks: DeckDTO[]
  selectedDeckId: number
  selectedDeck: DeckDTO | null;
  selectedDeckEntries: DeckCardEntryDTO[]
  deckChanged: boolean;

  // wishlist
  wishlistOpened: boolean 
  wishlistEntries: WishlistEntryDTO[] 
}

export class MagicCollectionManager extends Component<CollectionManagerProps, CollectionManagerState> {
  constructor(props: CollectionManagerProps){
    super(props)

    this.state = {
      selectedTab: 0,
      sets: [],
      rarities: raritiesList,
      types: [],
      colors: [],
      typeSearchSettings: typeSearchOptions,
      colorSearchSettings: colorSearchOptions,
      selectedQueryParameters: {
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
      },
      page: 1,
      cards: [],
      deckManagerOpened: true,
      decks: [],
      selectedDeckId: 99999,
      selectedDeck: null,
      selectedDeckEntries: [],
      deckChanged: false,
      wishlistOpened: true,
      wishlistEntries: []
    }
  }

  componentDidMount(): void {
    this.fetchData()
    this.fetchCardsDebounced({
      ...this.state.selectedQueryParameters,
    }, false)
  }

  fetchData = async () => {
    axios.get(`http://localhost:8000/sets`).then(response => {
      const setsFromApi: MTGSetDTO[] = response.data.data
      this.setState({sets: setsFromApi})
    })
    axios.get('http://localhost:8000/types').then(response => {
      const types: string[] = response.data.data
      this.setState({types})
    })
    axios.get(`http://localhost:8000/colors`).then(response => {
      const colors: Color[] = response.data.data
      this.setState({colors})
    })
    const decks = await this.fetchDecks()
    axios.get(`http://localhost:8000/wishlist`).then(response => {
      const wishlistEntries: WishlistEntryDTO[] = response.data
      this.setState({wishlistEntries})

      Promise.all(wishlistEntries.map(entry => {
          return fetchCardBuyPriceFromMagicersSingle(entry.card).then(price => {
            // console.log(`Price of card ${entry.card.name} is ${price}`)
            entry.card.buyPrice = price
            return entry
          })
      })).then(wishlistEntries => {
        console.log("collected card prices for wishlist")
        Promise.all(decks).then(decks => {
          for (const wishlistEntry of wishlistEntries) {
            const inDecks: string[] = findDecksContainCard(wishlistEntry.card, decks)
            wishlistEntry.inDecks = inDecks;
          }
          console.log("mapped decks to wishlist entries")
          console.log(wishlistEntries)
          this.setState({ wishlistEntries: wishlistEntries})
        })
      })
    })
  }



  fetchDecks = async (): Promise<DeckDTO[]> => {
    return axios.get(`http://localhost:8000/decks/list`).then(response => {
      const data: ListDecksResponse = response.data
      const decks = data.decks
      decks.forEach(deck => { if (deck['cardEntries'] === undefined) deck['cardEntries'] = [] })
      this.setState({decks})
      console.log("completed fethching decks")
      return decks
    })
  }

  fetchCards(queryParameters: CardQueryParameters, incrementPage: boolean = false){
    var currentPage = this.state.page
    if (incrementPage) {
      currentPage += 1
    } else {
      currentPage = 1
    }
    this.setState({page: currentPage})

    // console.log(`fetchcards: currentPage: ${currentPage}`)
    axios.get(`cards/`, {
      params: {
        take: pageSize,
        page: currentPage,
        query: queryParameters
      }
    }).then(response => {
      const newCards: MTGCardDTO[] = response.data.cards
      if (currentPage === 1) {
        // console.log("new cards")
        this.setState({cards: newCards})
      } else {
        // console.log("extra cards")
        const newCardsList = this.state.cards.concat(newCards)
        this.setState({cards: newCardsList})
        // todo alex do something with total pages
      }
    }).catch(error => {
      console.error(error)
      this.setState({cards: []})
    })
  }

  fetchCardsDebounced = debounce(this.fetchCards, 1500);

  handleChangeSelectedTab = (event: SyntheticEvent, selectedTab: number) => {
    this.setState({selectedTab});
  };

  handleDeckManagerOpenClose(){
    this.setState({deckManagerOpened: !this.state.deckManagerOpened})
  };

  handleWishlistOpenClose(){
    this.setState({wishlistOpened: !this.state.wishlistOpened})
  };

  render(){
    // console.log("rendering collection manager")

    
    const getDefaultSetsForFormat = (format: string) => {
      if (format === DeckFormat.STANDARD.toString()) {
        return currentStandardSets
      } else if (format === DeckFormat.COMMANDER.toString()) {
        return []
      } else {
        throw Error("Unknown format!")
      }
    }

    const handleChangeSelectedQueryParameters = (event: SelectChangeEvent<CardQueryParameters>) => {
      const propName = event.target.name;
      const newValue = event.target.value;
      var queryParameters = this.state.selectedQueryParameters

      if (propName === "cardName" && typeof newValue === 'string') {
        queryParameters = { ...queryParameters, cardName: newValue.trim().toLowerCase() }
      } else if (propName === "cardText" && typeof newValue === 'string') {
        queryParameters = { ...queryParameters, cardText: newValue.trim().toLowerCase() }
      } else if (propName === "sets" && Array.isArray(newValue) && newValue.every(item => typeof item === 'number')) {
        var newSets: number[] = []
        if (newValue[newValue.length - 1] === 99999) {
          newSets = queryParameters.sets.length > 0 ? [] : this.state.sets.map(set => set.id);
        } else {
          newSets = newValue;
        }
        queryParameters = { ...queryParameters, sets: newSets }
      } else if (propName === "rarities" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
        queryParameters = { ...queryParameters, rarities: newValue }
      } else if (propName === "types" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
        queryParameters = { ...queryParameters, types: newValue }
      } else if (propName === "typeSearchSetting" && typeof newValue === 'string') {
        queryParameters = { ...queryParameters, typeSearchSetting: newValue }
      } else if (propName === "subType" && typeof newValue === 'string') {
        queryParameters = { ...queryParameters, subType: newValue.trim().toLowerCase() }
      } else if (propName === "colors" && Array.isArray(newValue) && newValue.every(item => typeof item === 'string')) {
        queryParameters = { ...queryParameters, colors: newValue }
      } else if (propName === "colorSearchSetting" && typeof newValue === 'string') {
        queryParameters = { ...queryParameters, colorSearchSetting: newValue }
      } else if (propName === "manaCost" && typeof newValue === 'string') {
        queryParameters = { ...queryParameters, manaCost: newValue.trim().toLowerCase() }
      } else if (propName === "format" && typeof newValue === 'string') {
        const newSets: number[] = getDefaultSetsForFormat(newValue)
        queryParameters = { ...queryParameters, format: newValue, sets: newSets }
      } else if (propName === "minOwnedCopies" && typeof newValue === 'string') {
        queryParameters = { ...queryParameters, minOwnedCopies: parseInt(newValue) }
      } else {
        console.error(`Type error while updating query parameters: field=${propName}, type=${typeof newValue}, value=${newValue}`)
      }
      this.setState({selectedQueryParameters: queryParameters})
      this.fetchCardsDebounced(queryParameters, false)
    }

    const handleChangeSelectedDeck = (event: SelectChangeEvent<number>) => {
      const newDeckId = event.target.value
      if (typeof newDeckId === 'string') {
        console.error("help!")
      } else {
        if (newDeckId === 99999) {
          this.setState({
            selectedDeckId: 99999,
            selectedDeck: null,
            selectedDeckEntries: []
          })
        } else {
          const newDeck = this.state.decks.filter(deck => deck.id === newDeckId)[0]
          const colorIdentity: string[] = Array.from(getDeckColorIdentity(newDeck))
          this.setState({
            selectedDeckId: newDeckId,
            selectedDeck: newDeck,
            selectedDeckEntries: getDeck(newDeckId).cardEntries,
            selectedQueryParameters: {
              ...this.state.selectedQueryParameters,
              format: newDeck.format, 
              sets: getDefaultSetsForFormat(newDeck.format),
              colors: colorIdentity,
              colorSearchSetting: colorIdentity.length > 0 ? "Includes at most" : this.state.selectedQueryParameters.colorSearchSetting 
            }
          })

          console.log("Collecting card prices")
          Promise.all(getDeck(newDeckId).cardEntries.map(entry => {
            if (numberOfMissingCards(entry, true) > 0 || numberOfMissingCards(entry, false) > 0) {
              return fetchCardBuyPriceFromMagicersSingle(entry.card).then(price => {
                // console.log(`Price of card ${entry.card.name} is ${price}`)
                entry.card.buyPrice = price
                return entry
              })
            } else {
              entry.card.buyPrice = undefined
              return entry
            }
          })).then(entries => {
            console.log(`collected prices for deck ${getDeck(newDeckId).name}`)
            this.setState({ selectedDeckEntries: entries})
          })
        }
      }
    }

    const saveDeck = () => {
      doSaveDeck(this.state.selectedDeckEntries)
    }

    const doSaveDeck = (entries: DeckCardEntryDTO[]) => {
      console.log('Saving deck')
      const deck = getDeck(this.state.selectedDeckId)
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

    const getDeck = (id: number): DeckDTO => {
      return this.state.decks.filter(deck => deck.id === id)[0]
    }

    const getExistingEntry = (newCard: MTGCardDTO) => {
      const existingCardEntry: DeckCardEntryDTO[] = this.state.selectedDeckEntries.filter(entry => entry.card.id === newCard.id)
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
      const currentEntriesList = this.state.selectedDeckEntries
      const newEntriesList = currentEntriesList.filter(currentEntry => currentEntry.card.name !== entry.card.name)
      newEntriesList.push(entry)
      this.setState({selectedDeckEntries: newEntriesList})
      doSaveDeck(newEntriesList)
    }

    const updateCardCopiesInDeck = (card: MTGCardDTO, increment: number, isSideboard: boolean) => {
      if (increment !== -1 && increment !== 1) {
        throw Error("Unexpected increment")
      }
      if (this.state.selectedDeck === null) {
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
        checkEntryIllegal(existingCardEntry, this.state.selectedDeck)
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
      const updatedCards: MTGCardDTO[] = this.state.cards.map(card => {
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
      this.setState({cards: updatedCards})
    }

    const updateCardCopiesInWishlist = async (id: number, add: boolean) => {
      var updatedEntries: WishlistEntryDTO[] = this.state.wishlistEntries && this.state.wishlistEntries.length > 0 ? 
        this.state.wishlistEntries.map(entry => entry) : []

      var matchingEntry: WishlistEntryDTO[] = []
      if(this.state.wishlistEntries && this.state.wishlistEntries.length > 0 ){
        matchingEntry = this.state.wishlistEntries.filter(entry => {
            if (entry.card.id === id){
              return true
            }
            return false
          })
      }
      if (matchingEntry.length === 1){ 
        const entry = matchingEntry[0]
        // console.log(`found existing wishlist entry ${entry.card.name}`)

        entry.desiredCopies = add ? entry.desiredCopies + 1 : entry.desiredCopies - 1
        if (entry.desiredCopies <= entry.card.ownedCopies){
          // console.log(`Removing entry fom wishlist: ${this.state.wishlistEntries.filter(entry => entry.card.id === id)[0].card.name}`)
          updatedEntries = this.state.wishlistEntries.filter(entry => entry.card.id !== id)
        } else {
          updatedEntries = this.state.wishlistEntries.filter(entry => entry.card.id !== id)
          updatedEntries.push(matchingEntry[0])
        }
      } else {
        if(!add) {
          throw Error("Cannot decrease number of copies on card that isnt on wishlist")
        }
        const matchingCards: MTGCardDTO[] = this.state.cards.filter(card => card.id === id)
        if(matchingCards.length > 1 || matchingCards.length === 0){
          throw Error("Couldnt match card")
        } else {
          // console.log(`Adding entry to wishlist: ${matchingCards[0].name}`)
          const card = matchingCards[0]
          if(!card.buyPrice){
            card.buyPrice = await fetchCardBuyPriceFromMagicersSingle(card)
          } 
          updatedEntries.push({
            card: card,
            desiredCopies: card.ownedCopies + 1,
            isInShoppingCart: false,
            inDecks: findDecksContainCard(card, this.state.decks)
         })
        }
      }
      this.setState({wishlistEntries: updatedEntries})
      axios.post(`http://localhost:8000/wishlist/`, updatedEntries).then(response => {
        console.log(`updated wishlist!`)
      })
    }

    const handleLoadMore = async () => {
      this.fetchCardsDebounced(this.state.selectedQueryParameters, true)
    }

    const searchWindowProps: SearchWindowProps = {
      selectedQueryParameters: this.state.selectedQueryParameters,
      handleChangeSelectedQueryParameters,
      sets: this.state.sets,
      rarities: this.state.rarities,
      types: this.state.types,
      typeSearchSettings: this.state.typeSearchSettings,
      colors: this.state.colors,
      colorSearchSettings: this.state.colorSearchSettings,
    }

    const deckManagerProps: DeckManagerProps = {
      deckManagerOpened: this.state.deckManagerOpened,
      fetchDecks: this.fetchDecks,
      decks: this.state.decks,
      selectedDeck: this.state.selectedDeck,
      selectedDeckId: this.state.selectedDeckId,
      selectedDeckEntries: this.state.selectedDeckEntries,
      handleChangeSelectedDeck,
      updateDeckEntries,
      updateCardCopiesInDeck,
      saveDeck
    }

    const wishlistProps: WishlistProps = {
      wishlistOpened: this.state.wishlistOpened,
      wishlistEntries: this.state.wishlistEntries,
      updateCardCopiesInWishlist
    }

    const collectionGridProps: CardGridProps = {
      cards: this.state.cards,
      enabledTab: EnabledTab.COLLECTION,
      selectedDeck: this.state.selectedDeck,
      selectedDeckId: this.state.selectedDeckId,
      selectedDeckEntries: this.state.selectedDeckEntries,
      wishlistOpened: this.state.wishlistOpened,
      updateCardCopiesInDeck,
      getCurrentNumberOfCopiesForCard,
      updateCardCopiesInCollection,
      updateCardCopiesInWishlist,
      handleLoadMore
    }

    const deckGridProps: CardGridProps = {
      cards: this.state.cards,
      enabledTab: EnabledTab.DECK,
      selectedDeck: this.state.selectedDeck,
      selectedDeckId: this.state.selectedDeckId,
      selectedDeckEntries: this.state.selectedDeckEntries,
      deckManagerOpened: this.state.deckManagerOpened,
      updateCardCopiesInDeck,
      getCurrentNumberOfCopiesForCard,
      updateCardCopiesInCollection,
      updateCardCopiesInWishlist,
      handleLoadMore
    }

    const navBarProps: NavBarProps = {
      selectedTab: this.state.selectedTab,
      handleChangeSelectedTab: this.handleChangeSelectedTab,
      open: this.state.deckManagerOpened,
      handleDeckManagerOpenClose: this.handleDeckManagerOpenClose,
      handleWishlistOpenClose: this.handleWishlistOpenClose
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
            <TabPanel value={this.state.selectedTab} index={0}>
              <Box width="100%">
                <CardGrid {...collectionGridProps} />
              </Box>
              <WishlistDrawer {...wishlistProps}/>
            </TabPanel>
            <TabPanel value={this.state.selectedTab} index={1}>
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
}

export default MagicCollectionManager