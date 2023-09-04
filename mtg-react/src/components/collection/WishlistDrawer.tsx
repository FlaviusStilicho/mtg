import { Component } from 'react';
import { DeckDTO, WishlistEntryDTO } from "../../../../mtg-common/src/DTO";
import { Box, Divider, Drawer, List, ListItem, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { drawerWidth, navBarHeight } from "../../constants";
import { deckEntryTextBoxStyle, listItemStyle } from "../../style/styles";
import { WishlistEntry } from "./WishlistEntry";
import { findDeckByName, populateDeckWishlistEntryMap, wishlistSortFnAlphabetical, wishlistSortFnPrice } from '../../functions/util';
import { renderDeckName } from '../decks/renderDeckName';

export interface WishlistProps {
    wishlistOpened: boolean
    wishlistEntries: WishlistEntryDTO[]
    decks: DeckDTO[]
    updateCardCopiesInWishlist: (id: number, add: boolean) => void
  }

enum SortMethod {
  ALPHABETICAL = 'alphabetical',
  PRICE = 'price',
  DECK = 'deck'
}

interface WishlistState {
  sortMethod: SortMethod
  sortFn: (a: WishlistEntryDTO, b: WishlistEntryDTO) => number
}

export class WishlistDrawer extends Component<WishlistProps, WishlistState> {
    constructor(props: WishlistProps){
      super(props)

      this.state = {
        sortMethod: SortMethod.ALPHABETICAL,
        sortFn: wishlistSortFnAlphabetical
      }
    }   

    shouldComponentUpdate = (nextProps: WishlistProps, nextState: WishlistState) => {
      // return this.props.wishlistOpened !== nextProps.wishlistOpened ||
      // this.props.wishlistedCards.length !== nextProps.wishlistedCards.length;
      return true
    }
  
    handleChangeSortMethod = (event: any) => {
      console.log(event)
      const newValue = event.target.value;
      var sortFn;
      if (typeof newValue === 'string'){
        const sortMethod: SortMethod = event.target.value
        if (sortMethod === SortMethod.ALPHABETICAL){
          sortFn = wishlistSortFnAlphabetical
        } else if (sortMethod === SortMethod.PRICE){
          sortFn = wishlistSortFnPrice
        } else if (sortMethod === SortMethod.DECK){
          sortFn = wishlistSortFnPrice
        } else {
          throw Error()
        }
        console.log(this.state)
        this.setState({sortMethod, sortFn})
      }
    }

    render() {
        // console.log("Rendering wishlist")
        // console.log(`current number of entries: ${this.props.wishlistEntries ? this.props.wishlistEntries.length : 0}`)
        const entries = this.props.wishlistEntries
        entries.sort(this.state.sortFn)
        return (<Box sx={{
          display: 'flex',
        }}>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
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
            open={this.props.wishlistOpened}
          >
            <List>
              <ListItem sx={{ ...listItemStyle, fontSize: 18 }}>
                Wishlist
              </ListItem>
              <ListItem>
                <ToggleButtonGroup
                  value={this.state.sortMethod}
                  exclusive
                  onChange={this.handleChangeSortMethod}
                >
                  <ToggleButton value={SortMethod.ALPHABETICAL}>ABC</ToggleButton>
                  <ToggleButton value={SortMethod.PRICE}>Price</ToggleButton>
                  <ToggleButton value={SortMethod.DECK}>Deck</ToggleButton>
                  {/* <ToggleButton value="ios">iOS</ToggleButton> */}
                </ToggleButtonGroup>
              </ListItem>
                <Box
                  style={{ textAlign: "left", width: "100%" }}
                  sx={deckEntryTextBoxStyle}
                >
                    {
                      this.props.wishlistEntries && 
                      this.props.wishlistEntries.length > 0 &&
                      this.state.sortMethod !== SortMethod.DECK ?

                      (this.props.wishlistEntries.map((entry) => {
                        return ( 
                          <WishlistEntry
                            key={entry.card.id}
                            entry={entry}
                            updateCardCopiesInWishlist={this.props.updateCardCopiesInWishlist}
                          />
                        );
                      })) : (<></>)
                    }
                    {
                      this.props.wishlistEntries && 
                      this.props.wishlistEntries.length > 0 &&
                      this.state.sortMethod === SortMethod.DECK ?
                      this.renderWishlistEntriesByDeck() : (<></>)
                    }
                </Box>
              <Divider/>
            </List>
          </Drawer>
        </Box>)
    }

    renderWishlistEntriesByDeck = () => {
        const map = populateDeckWishlistEntryMap(this.props.wishlistEntries)

        return Array.from(map.entries()).map(([key, wishlistEntries]) => (
          <Box key={key}
            style={{backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            sx={{
              width: "100%",
              border: "1px solid",
              borderRadius: "7px",
              flexDirection: "column",
              display: "flex",
            }}
          >
            <div style={{ marginTop: '4px', marginBottom: '4px', marginLeft: '10px' }}>{ key === "unused" ? "Unused" : renderDeckName(findDeckByName(key, this.props.decks))}</div>
            {wishlistEntries.map(entry => (
              <WishlistEntry
                key={entry.card.id}
                entry={entry}
                updateCardCopiesInWishlist={this.props.updateCardCopiesInWishlist}
              />
            ))}
          </Box>
        ));
      }
}