import { DeckDTO } from "mtg-common";
import React from "react";
import { fetchDecks } from "../functions/decks";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import { renderDeckName } from "../components/deckEditor/renderDeckName";

interface DeckOverviewProps {
  //     enabledTab: EnabledTab
}

interface DeckOverviewState {
  decks: DeckDTO[];
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

  refreshDecks = async () => {
    console.log("refreshing decks");
    this.setState({ decks: await fetchDecks() });
  };

  render() {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 50%" }}>
        {this.state.decks.map((deck, index) => (
            <Accordion 
                key={deck.id}
                style={{
                borderRadius: "10px",
                marginBottom: index < this.state.decks.length - 1 ? "4px" : 0,
              }}>
              <AccordionSummary>
                {renderDeckName(deck, deckNameFontSize)}
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {/* Render the list of cards in the deck here */}
                </Typography>
              </AccordionDetails>
            </Accordion>
        ))}
        </div>
        <div style={{ flex: "1 1 50%" }}>
          HELLO WORLD
          {/* Right panel content */}
        </div>
      </div>
    );
  }
}

export default DeckOverview;