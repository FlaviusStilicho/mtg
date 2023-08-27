import { Component } from "react";
import { WishlistEntryDTO } from "../../../../mtg-common/src/DTO";
import { Box, Divider, Drawer, List, ListItem } from "@mui/material";
import { drawerWidth, navBarHeight } from "../../constants";
import { deckEntryTextBoxStyle, listItemStyle } from "../../style/styles";
import { WishlistEntry } from "./WishlistEntry";

export interface WishlistProps {
    wishlistOpened: boolean
    wishlistedCards: WishlistEntryDTO[]
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
              <ListItem style={{ paddingLeft: 0, paddingRight: 0, width: "100%" }}>
                <Box
                  style={{ textAlign: "left", width: "100%" }}
                  sx={deckEntryTextBoxStyle}
                >
                      {this.props.wishlistedCards.map((entry) => {
                        return (
                          <WishlistEntry
                            key={entry.card.id}
                            entry={entry}
                          />
                        );
                      })}
                </Box>
              </ListItem>
              <Divider/>
            </List>
          </Drawer>
        </Box>)
    }
}