import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import { imageHeight, imageWidth } from "../../constants";
import { deckEntryTextBoxStyle } from "../../style/styles";
import {
  Button,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  DeckCardEntryDTO,
  DeckDTO,
  MTGCardDTO,
  WishlistEntryDTO,
} from "mtg-common";
import { v4 as uuidv4 } from "uuid";
import {
  isBasicLand,
  isCommanderEligible,
  numberOfMissingCards,
} from "../../functions/util";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import { Component } from "react";
import StarIcon from "@mui/icons-material/Star";
import { getLowestCardPriceStr, sortPriceInfo } from "../../functions/fetchCardPrice";

export interface DeckEntryComponentProps {
  entry: DeckCardEntryDTO;
  selectedDeck: DeckDTO | null;
  updateDeckEntries: (entry: DeckCardEntryDTO) => void;
  updateCardCopiesInDeck: (
    card: MTGCardDTO,
    increment: number,
    isSideboard: boolean,
  ) => void;
  isSideboardEntry: boolean;
  setNewCommander: (entry: DeckCardEntryDTO) => void;
  isCardInWishlist: (card: MTGCardDTO) => boolean;
  updateCardCopiesInWishlist: (card: MTGCardDTO, add: boolean) => void;
  wishlistEntries: WishlistEntryDTO[];
}

const iconWidth = 16;
const iconHeight = 16;

export class DeckEntryComponentWithTooltip extends Component<DeckEntryComponentProps> {
  swapSideboardCopies = () => {
    const entry = this.props.entry;
    console.log(entry.card.name);
    if (this.props.isSideboardEntry) {
      entry.copies = entry.sideboardCopies;
      entry.sideboardCopies = 0;
    } else {
      entry.sideboardCopies = entry.copies;
      entry.copies = 0;
    }
    this.props.updateDeckEntries(entry);
  };

  shouldComponentUpdate(nextProps: DeckEntryComponentProps) {
    // TODO if this causes performance issues, try to fix it. The update on buyprice doesnt trigger an update!
    // return this.props.entry !== nextProps.entry ||
    // this.props.entry.buyPrice !== nextProps.entry.buyPrice
    return true;
  }

  render() {
    // console.log(`rendering entry ${this.props.entry.card.name}`)
    const entry = this.props.entry;
    const isSideboardEntry = this.props.isSideboardEntry;

    const copies = isSideboardEntry ? entry.sideboardCopies : entry.copies;
    const manaCostArray = entry.card.manaCost
      .split("}")
      .map((mc) => mc.substring(1))
      .filter((mc) => mc !== "");
    const maxCardCopies =
      this.props.selectedDeck?.format === "Standard" ? 4 : 1;
    const missingCards = numberOfMissingCards(entry, isSideboardEntry) > 0;
    const onWishlist = missingCards
      ? this.props.isCardInWishlist(entry.card)
      : false;
    var bgcolor: string;
    if (missingCards && onWishlist) {
      bgcolor = "#e8e66b";
    } else if (missingCards) {
      bgcolor = "#e3c2c2";
    } else {
      bgcolor = "White";
    }

    const addButtonDisabled = isSideboardEntry
      ? entry.sideboardCopies >= maxCardCopies && !isBasicLand(entry.card)
      : entry.copies >= maxCardCopies && !isBasicLand(entry.card);
    const subtractButtonDisabled = isSideboardEntry
      ? entry.sideboardCopies < 1
      : entry.copies < 1;

    return (
      <ListItem key={`entry-listitem-${entry.card.name}`} sx={{ py: 0.2 }}>
        <Tooltip
          arrow
          placement="left"
          sx={{
            backgroundColor: "transparent", // Set background color to transparent
            p: 0, // Remove padding
          }}
          title={
            <Box>
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
              {this.props.entry.card.priceInfo &&
                this.props.entry.card.priceInfo.length > 0 && (
                  <TableContainer
                    sx={{
                      backgroundColor: "white",
                      borderRadius: "10px",
                      marginTop: "10px",
                      border: "3px solid black", // Add black border
                    }}
                  >
                    <Table
                      sx={{
                        "& th": {
                          padding: "6px",
                        },
                        "& td": {
                          padding: "6px",
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>In Stock</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Store</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.props.entry.card.priceInfo
                        .sort(sortPriceInfo)
                        .map((priceInfo) => (
                          <TableRow key={priceInfo.store}>
                            <TableCell>
                              {priceInfo.inStock ? "Yes" : "No"}
                            </TableCell>
                            <TableCell>{priceInfo.buyPrice}</TableCell>
                            <TableCell>{priceInfo.store}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
            </Box>
          }
        >
          <Box
            bgcolor={bgcolor}
            sx={{
              width: "100%",
              border: "1px solid",
              borderRadius: "7px",
              flexDirection: "row",
              display: "flex",
            }}
          >
            <Box style={{ width: "42%" }} sx={deckEntryTextBoxStyle}>
              {entry.card.name}
            </Box>
            <Box
              style={{ textAlign: "right", marginRight: 4, width: "14%" }}
              sx={deckEntryTextBoxStyle}
            >
              {getLowestCardPriceStr(entry.card.priceInfo)}
            </Box>
            <Box
              style={{ textAlign: "right", marginRight: 4, width: "25%" }}
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
              style={{ textAlign: "right", marginRight: 2, width: "47%" }}
              sx={deckEntryTextBoxStyle}
            >
              <Button
                variant="contained"
                sx={{
                  borderRadius: "30%",
                  height: iconHeight,
                  width: iconWidth,
                  minWidth: { xs: iconWidth, md: iconWidth },
                }}
                disabled={onWishlist}
                onClick={() =>
                  this.props.updateCardCopiesInWishlist(entry.card, true)
                } //TODO update the function or use another
              >
                <StarIcon fontSize="small" />
              </Button>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "30%",
                  height: iconHeight,
                  width: iconWidth,
                  minWidth: { xs: iconWidth, md: iconWidth },
                }}
                disabled={!isCommanderEligible(entry)}
                onClick={() => this.props.setNewCommander(entry)}
              >
                <Box
                  component="img"
                  sx={{
                    borderRadius: "30%",
                    height: iconHeight,
                    width: iconWidth,
                    minWidth: iconWidth,
                  }}
                  src={`http://localhost:3000/commander.png`}
                />
              </Button>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "30%",
                  height: iconHeight,
                  width: iconWidth,
                  minWidth: iconWidth,
                }}
                disabled={subtractButtonDisabled}
                onClick={() =>
                  this.props.updateCardCopiesInDeck(
                    entry.card,
                    -1,
                    this.props.isSideboardEntry,
                  )
                }
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
                disabled={addButtonDisabled}
                onClick={() =>
                  this.props.updateCardCopiesInDeck(
                    entry.card,
                    1,
                    this.props.isSideboardEntry,
                  )
                }
              >
                <AddIcon fontSize="small" />
              </Button>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "30%",
                  height: iconHeight,
                  width: iconWidth,
                  minWidth: iconWidth,
                }}
                style={{ backgroundColor: "#6497b1" }}
                onClick={this.swapSideboardCopies}
              >
                {this.props.isSideboardEntry ? (
                  <UnarchiveIcon fontSize="small" />
                ) : (
                  <ArchiveIcon fontSize="small" />
                )}
              </Button>
            </Box>
            <Box
              style={{ textAlign: "right", width: "6%" }}
              sx={deckEntryTextBoxStyle}
            >
              {Math.min(copies, entry.card.ownedCopies)}/{copies}
            </Box>
          </Box>
        </Tooltip>
      </ListItem>
    );
  }
}
