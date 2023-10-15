import {
  Box,
  Button,
  CardMedia,
  Dialog,
  List,
  ListItem,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { memo, useState } from "react";
import {
  DeckDTO,
  DeckCardEntryDTO,
  MTGCardDTO,
} from "../../../../../mtg-common/src/DTO";
import {
  buttonBackgroundStyle,
  searchTextFieldStyle,
} from "../../../style/styles";
import Divider from "@mui/material/Divider";
import { imageHeight, imageWidth } from "../../../constants";
import ColorIcon from "../../ColorIcon";

export interface CompareDeckWindowProps {
  opened: boolean;
  onClose: () => void;
  deck: DeckDTO;
  decks: DeckDTO[];
}

const deckNameFontSize = 10;

export interface CompareTableRow {
  deckName: string;
  card: MTGCardDTO;
  quantity: number;
}

export const CompareDeckWindow = memo((props: CompareDeckWindowProps) => {
  const [targetDeck, setTargetDeck] = useState<DeckDTO | null>(null);
  const [compareTableRows, setCompareTableRows] = useState<CompareTableRow[]>(
    []
  );

  function getCardEntry(deck: DeckDTO, cardName: string): DeckCardEntryDTO[] {
    return deck.cardEntries.filter((entry) => entry.card.name === cardName);
  }

  function compareDeck() {
    const deck1 = props.deck;
    const deck2 = targetDeck;
    const rows: CompareTableRow[] = [];

    if (deck2 === null) {
      return;
    }

    deck1.cardEntries.forEach((deck1entry) => {
      var deck2entries = getCardEntry(deck2, deck1entry.card.name);
      if (deck2entries.length === 0) {
        const row = {
          deckName: deck1.name,
          card: deck1entry.card,
          quantity: deck1entry.copies,
        };
        if (row.quantity > 0) {
          rows.push(row);
        }
      } else {
        const deck2entry = deck2entries[0];
        if (deck1entry.copies > deck2entry.copies) {
          const row = {
            deckName: deck1.name,
            card: deck1entry.card,
            quantity: deck1entry.copies - deck2entry.copies,
          };
          rows.push(row);
        }
      }
    });

    deck2.cardEntries.forEach((deck2entry) => {
      var deck1entries = getCardEntry(deck1, deck2entry.card.name);
      if (deck1entries.length === 0) {
        rows.push({
          deckName: deck2.name,
          card: deck2entry.card,
          quantity: deck2entry.copies,
        });
      } else {
        const deck1entry = deck1entries[0];
        if (deck2entry.copies > deck1entry.copies) {
          rows.push({
            deckName: deck2.name,
            card: deck2entry.card,
            quantity: deck2entry.copies - deck1entry.copies,
          });
        }
      }
    });
    setCompareTableRows(rows);
  }

  function handleChangeTargetDeck(event: any) {
    const newValue = event.target.value;
    if (typeof newValue === "string") {
      return;
    } else {
      const newDeck = props.decks.filter((deck) => deck.id === newValue)[0];
      setTargetDeck(newDeck);
    }
  }

  return (
    <Dialog
      open={props.opened}
      onClose={props.onClose}
    //   PaperProps={{
    //     sx: {
    //       width: "100%",
    //       maxWidth: "1500px!important",
    //     },
    //   }}
      >
      <List>
        <ListItem
          sx={{ py: 1.5, fontSize: 20 }}
          style={{ justifyContent: "center" }}
        >
          Compare deck
        </ListItem>

        {/* <ListItem>
                    Are you sure you want to delete deck {props.deck != null ? props.deck.name : ""}?
                </ListItem> */}
        <ListItem>
          <Select
            id="select-deck"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={targetDeck}
            onChange={handleChangeTargetDeck}
          >
            <MenuItem value={99999}>
              <Box sx={{ fontSize: deckNameFontSize }}>Select a deck</Box>
            </MenuItem>
            {props.decks.map((deck) => {
              // const commander = getCommander(deck)
              var deckColorIdentity: Set<string>;
              // if (commander) {
              // deckColorIdentity = new Set(commander.colorIdentity)
              // } else {
              deckColorIdentity = new Set();
              deck.cardEntries.forEach((entry) =>
                entry.card.colorIdentity.forEach((color) =>
                  deckColorIdentity.add(color)
                )
              );
              // }
              return (
                <MenuItem key={`${deck.id}`} value={deck.id}>
                  <Box
                    sx={{
                      fontSize: deckNameFontSize,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {deck.name}
                    <Box>
                      {Array.from(deckColorIdentity).map((color) => (
                        <ColorIcon color={`${color}CDW`}/>
                      ))}
                    </Box>
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </ListItem>
        <ListItem>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Deck </TableCell>
                <TableCell align="left">Card</TableCell>
                <TableCell align="left">Copies</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {compareTableRows.map((row) => {
                return (
                  <Tooltip
                    arrow
                    placement="left"
                    title={
                      <CardMedia
                        key={`tooltip-${row.card.name}`}
                        sx={{
                          height: imageHeight * 0.5,
                          width: imageWidth * 0.5,
                        }}
                        style={{
                          backgroundColor: "White",
                        }}
                        image={row.card.versions[0].frontImageUri}
                      />
                    }
                  >
                    <TableRow
                      key={row.card.name}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 }
                      }}
                      style={{
                        height: "8px"
                      }}
                    >
                      <TableCell align="left" style={{height: "8px"}}>{row.deckName}</TableCell>
                      <TableCell align="left" style={{height: "8px"}}>{row.card.name}</TableCell>
                      <TableCell align="left" style={{height: "8px"}}>{row.quantity}</TableCell>
                    </TableRow>
                  </Tooltip>
                );
              })}
            </TableBody>
          </Table>
        </ListItem>

        <Divider />
        <ListItem style={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={compareDeck}
            sx={{ margin: "10px" }}
          >
            Compare Deck
          </Button>
          <Button
            variant="contained"
            onClick={props.onClose}
            sx={{ margin: "10px" }}
          >
            Cancel
          </Button>
        </ListItem>
      </List>
    </Dialog>
  );
});
