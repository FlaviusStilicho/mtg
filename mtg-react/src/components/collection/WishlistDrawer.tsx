import { Component } from "react";
import { WishlistEntryDTO } from "../../../../mtg-common/src/DTO";
import { Box, Divider, Drawer, List, ListItem } from "@mui/material";
import { drawerWidth, navBarHeight } from "../../constants";
import { deckEntryTextBoxStyle, listItemStyle } from "../../style/styles";
import { WishlistEntry } from "./WishlistEntry";

export interface WishlistProps {
    wishlistOpened: boolean
    wishlistEntries: WishlistEntryDTO[]
    updateCardCopiesInWishlist: (id: number, add: boolean) => void
  }

export class WishlistDrawer extends Component<WishlistProps> {
    shouldComponentUpdate(nextProps: WishlistProps) {
      // return this.props.wishlistOpened !== nextProps.wishlistOpened ||
      // this.props.wishlistedCards.length !== nextProps.wishlistedCards.length;
      return true
    }
  
    render() {
        // console.log("Rendering wishlist")
        // console.log(`current number of entries: ${this.props.wishlistEntries ? this.props.wishlistEntries.length : 0}`)
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
                <Box
                  style={{ textAlign: "left", width: "100%" }}
                  sx={deckEntryTextBoxStyle}
                >
                      {this.props.wishlistEntries && this.props.wishlistEntries.length > 0 ?

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
                </Box>
              <Divider/>
            </List>
          </Drawer>
        </Box>)
    }
}