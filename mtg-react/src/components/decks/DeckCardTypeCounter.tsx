import { Box } from "@mui/material";
import { deckEntryTextBoxStyle } from "../../style/styles";
import { DeckCardEntryDTO } from "../../../../mtg-common/src/DTO";
import { DeckEntryComponentWithTooltip } from "./DeckEntryCardWithTooltip";
import { DeckState } from "../hooks/DeckState";
import { Component } from "react";

export interface DeckCardTypeCounterProps {
  label: String;
  deckState: DeckState;
  countFn: (entries: DeckCardEntryDTO[]) => number;
  filterFn: (entries: DeckCardEntryDTO[]) => DeckCardEntryDTO[];
  setNewCommander: (entry: DeckCardEntryDTO) => void;
  isSideboardEntry: boolean;
}

export class DeckCardTypeCounter extends Component<DeckCardTypeCounterProps> {
  shouldComponentUpdate(nextProps: DeckCardTypeCounterProps) {
    return this.props.deckState.selectedDeckEntries !== nextProps.deckState.selectedDeckEntries;
  }

  render() {
    // console.log(`rendering counter ${this.props.label}`);
    const deckState = this.props.deckState;

    return this.props.countFn(deckState.selectedDeckEntries) > 0 ? (
      <div>
        <Box
          style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
          sx={deckEntryTextBoxStyle}
        >
          {this.props.label} (
          {this.props.countFn(deckState.selectedDeckEntries)})
        </Box>
        {this.props
          .filterFn(deckState.selectedDeckEntries)
          .map((entry) => {
            const deckEntryProps = {
              entry,
              deckState,
              setNewCommander: this.props.setNewCommander,
              isSideboardEntry: this.props.isSideboardEntry,
            };
            return (
              <DeckEntryComponentWithTooltip
                key={entry.card.id}
                {...deckEntryProps}
              />
            );
          })}
      </div>
    ) : (
      <div></div>
    );
  }
};