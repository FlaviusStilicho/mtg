import { DeckDTO, MTGCardDTO } from "mtg-common";
import React from "react";
import { fetchDecks } from "../functions/decks";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  Typography,
} from "@mui/material";
import DeckNameBox from "../components/deckEditor/DeckNameBox";
import { CardRequirementComponent } from "../components/deckEditor/CardRequirementBox";

interface DeckOverviewProps {
  saveDeck: (deck: DeckDTO) => void;
}

interface DeckOverviewState {
  decks: DeckDTO[];
}

export interface CardRequirement {
  card: MTGCardDTO;
  quantityRequired: number;
  isMissingCopies: boolean;
  decksUsed: string[];
}

const deckNameFontSize = 12;

class DeckOverview extends React.Component<
  DeckOverviewProps,
  DeckOverviewState
> {
  constructor(props: DeckOverviewProps) {
    super(props);
    this.state = {
      decks: [],
    };
  }

  componentDidMount() {
    this.refreshDecks();
  }

  toggleDeckActive = async (deck: DeckDTO) => {
    console.log(`toggling deck ${deck.name} to ${!deck.isActive}`);
    deck.isActive = !deck.isActive;
    this.props.saveDeck(deck);
    this.forceUpdate();
  };

  refreshDecks = async () => {
    console.log("refreshing decks");
    var decks = await fetchDecks();
    decks = decks.filter(
      (deck) => deck.cardEntries.length > 0 && deck.format === "commander",
    );
    this.setState({ decks: decks });
  };

  createCombinedCardsList = (): CardRequirement[] => {
    const decks = this.state.decks.filter((deck) => deck.isActive);
    const combinedEntries: Map<string, CardRequirement> = new Map();

    for (const deck of decks) {
      for (const cardEntry of deck.cardEntries) {
        if (cardEntry.copies === 0) continue;
        const cardName = cardEntry.card.name;

        if (!combinedEntries.has(cardName)) {
          const cardRequirement: CardRequirement = {
            card: cardEntry.card,
            quantityRequired: cardEntry.copies,
            isMissingCopies: cardEntry.copies > cardEntry.card.ownedCopies,
            decksUsed: [deck.name],
          };
          combinedEntries.set(cardName, cardRequirement);
        } else {
          const cardRequirement = combinedEntries.get(cardName);
          if (cardRequirement) {
            cardRequirement.quantityRequired += cardEntry.copies;
            cardRequirement.isMissingCopies =
              cardRequirement.quantityRequired >
              cardRequirement.card.ownedCopies;
            cardRequirement.decksUsed.push(deck.name);
          }
        }
      }
    }

    const entriesArray = [...combinedEntries.values()];

    entriesArray.sort((a, b) => {
      // Sort by missing copies
      if (a.isMissingCopies && !b.isMissingCopies) {
        return -1;
      } else if (!a.isMissingCopies && b.isMissingCopies) {
        return 1;
      }

      // Sort by card.convertedManaCost in ascending order
      if (a.card.convertedManaCost !== b.card.convertedManaCost) {
        return a.card.convertedManaCost - b.card.convertedManaCost;
      }

      // Sort by card.name in alphabetical order
      return a.card.name.localeCompare(b.card.name);
    });

    return entriesArray;
  };

  render() {
    const sortedDecks = this.state.decks.sort((a, b) => {
      // Sort decks with isActive=true to the top
      if (a.isActive && !b.isActive) {
        return -1;
      } else if (!a.isActive && b.isActive) {
        return 1;
      } else {
        return 0;
      }
    });

    return (
      <Box
        style={{
          color: "black",
          display: "flex",
        }}
      >
        <Box
          style={{
            flex: "1 1 50%",
            marginLeft: "15px",
            marginRight: "15px",
            minHeight: "1000px",
          }}
          sx={{
            bgcolor: "#54A8F9",
            borderRadius: "10px",
          }}
        >
          <Typography
            variant="h4"
            style={{ marginBottom: "10px", paddingTop: "10px" }}
          >
            Decks{" "}
          </Typography>
          {sortedDecks.map((deck, index) => (
            <Accordion
              key={deck.id}
              style={{
                borderRadius: "7px",
                marginBottom: index < this.state.decks.length - 1 ? "4px" : 0,
                marginLeft: "15px",
                marginRight: "15px",
              }}
            >
              <AccordionSummary>
                <DeckNameBox
                  deck={deck}
                  fontSize={deckNameFontSize}
                  interactive={true}
                  toggleDeckActive={this.toggleDeckActive}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {/* Render the list of cards in the deck here */}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        <Box
          sx={{
            bgcolor: "#4bb5f2",
            borderRadius: "10px",
          }}
          style={{
            flex: "1 1 50%",
            marginLeft: "15px",
            marginRight: "15px",
            minHeight: "1000px",
          }}
        >
          <Typography
            variant="h4"
            style={{ marginBottom: "10px", paddingTop: "10px" }}
          >
            Required cards for active decks
          </Typography>
          <List
            style={{
              paddingLeft: "15px",
              paddingRight: "15px",
            }}
            sx={{}}
          >
            {this.createCombinedCardsList().map((cardRequirement, index) => (
              <CardRequirementComponent
                key={index}
                cardRequirement={cardRequirement}
                style={{ marginTop: index === 0 ? "15px" : undefined }}
              />
            ))}
          </List>
        </Box>
      </Box>
    );
  }
}

export default DeckOverview;
