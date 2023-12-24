import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import { imageHeight, imageWidth } from "../../constants";
import { deckEntryTextBoxStyle } from "../../style/styles";
import { Button, CardMedia, Tooltip } from "@mui/material";
import { MTGCardDTO, WishlistEntryDTO } from "mtg-common";
import { v4 as uuidv4 } from "uuid";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { Component } from "react";

export interface WishlistEntryProps {
  entry: WishlistEntryDTO;
  updateCardCopiesInWishlist: (card: MTGCardDTO, add: boolean) => void;
}

const iconWidth = 16;
const iconHeight = 16;

export class WishlistEntry extends Component<WishlistEntryProps> {
  shouldComponentUpdate(nextProps: WishlistEntryProps) {
    // if this causes performance issues, try to fix it. The update on buyprice doesnt trigger an update!
    // return this.props.entry !== nextProps.entry ||
    // this.props.entry.buyPrice !== nextProps.entry.buyPrice
    return true;
  }

  render() {
    // console.log(`rendering wishlist entry ${this.props.entry.card.name}`)
    const entry = this.props.entry;
    const manaCostArray = entry.card.manaCost
      .split("}")
      .map((mc) => mc.substring(1))
      .filter((mc) => mc !== "");

    return (
      <ListItem key={`entry-listitem-${entry.card.name}`} sx={{ py: 0.2 }}>
        <Tooltip
          arrow
          placement="left"
          title={
            <CardMedia
              key={`tooltip-${entry.card.name}`}
              sx={{
                height: imageHeight * 0.5,
                width: imageWidth * 0.5,
              }}
              style={{
                backgroundColor: "White",
              }}
              image={entry.card.versions[0].frontImageUri}
            />
          }
        >
          <Box
            bgcolor={"White"}
            sx={{
              width: "100%",
              border: "1px solid",
              borderRadius: "7px",
              flexDirection: "row",
              display: "flex",
            }}
          >
            <Box style={{ width: "45%" }} sx={deckEntryTextBoxStyle}>
              {entry.card.name}
            </Box>
            <Box
              style={{
                textAlign: "left",
                marginRight: 4,
                width: "15%",
                color:
                  // entry.card.priceInfo?.store === Store.SCRYFALL
                  // ? "red" :
                  "inherit",
              }}
              sx={deckEntryTextBoxStyle}
            >
              {
                // entry.card.priceInfo != null
                // ? `€ ${entry.card.priceInfo.buyPrice}` :
                "N/A"
              }
            </Box>
            <Box
              style={{ textAlign: "left", marginRight: 4, width: "25%" }}
              sx={deckEntryTextBoxStyle}
            >
              {manaCostArray.map((manaCost) => {
                var fileName = manaCost;
                if (fileName.includes("/")) {
                  fileName = fileName.replace("/", "");
                }
                return (
                  <Box
                    component="img"
                    key={`deck-entry-${manaCost}-${uuidv4()}`}
                    sx={{
                      height: iconHeight,
                      width: iconWidth,
                      maxHeight: iconHeight,
                      maxWidth: iconWidth,
                      paddingLeft: 0,
                      paddingRight: 0,
                    }}
                    src={`http://localhost:3000/mana/${fileName}.png`}
                  />
                );
              })}
            </Box>

            <Box
              style={{ textAlign: "right", marginRight: 2, width: "5%" }}
              sx={deckEntryTextBoxStyle}
            >
              {this.props.entry.card.ownedCopies}/
              {this.props.entry.desiredCopies}
            </Box>
            <Box
              style={{ textAlign: "right", marginRight: 2, width: "22%" }}
              sx={deckEntryTextBoxStyle}
            >
              <Button
                variant="contained"
                sx={{
                  borderRadius: "30%",
                  height: iconHeight,
                  width: iconWidth,
                  minWidth: iconWidth,
                }}
                onClick={() => {
                  this.props.updateCardCopiesInWishlist(
                    this.props.entry.card,
                    false,
                  );
                }}
              >
                <RemoveIcon fontSize="small" />
              </Button>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "30%",
                  height: iconHeight,
                  width: iconWidth,
                  minWidth: iconWidth,
                }}
                onClick={() => {
                  this.props.updateCardCopiesInWishlist(
                    this.props.entry.card,
                    true,
                  );
                }}
              >
                <AddIcon fontSize="small" />
              </Button>
            </Box>
          </Box>
        </Tooltip>
      </ListItem>
    );
  }
}
