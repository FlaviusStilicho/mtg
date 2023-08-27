import { Box } from "@mui/material";
import { deckEntryTextBoxStyle } from "../../style/styles";
import { DeckCardEntryDTO, DeckDTO, MTGCardDTO } from "../../../../mtg-common/src/DTO";
import { DeckEntryComponentWithTooltip } from "./DeckEntryCardWithTooltip";
import { Component } from "react";

export interface DeckEntryGroupingProps {
  label: String;
  selectedDeckEntries: DeckCardEntryDTO[]
  selectedDeck: DeckDTO| null;
  updateDeckEntries: (entry: DeckCardEntryDTO) => void
  updateCardCopiesInDeck: (card: MTGCardDTO, increment: number, isSideboard: boolean) => void
  countFn: (entries: DeckCardEntryDTO[]) => number;
  filterFn: (entries: DeckCardEntryDTO[]) => DeckCardEntryDTO[];
  setNewCommander: (entry: DeckCardEntryDTO) => void;
  isSideboardEntry: boolean;
}

export class DeckCardTypeCounter extends Component<DeckEntryGroupingProps> {
  shouldComponentUpdate(nextProps: DeckEntryGroupingProps) {
    return this.props.selectedDeckEntries !== nextProps.selectedDeckEntries;
  }

  render() {
    // console.log(`rendering counter ${this.props.label}`);

    return this.props.countFn(this.props.selectedDeckEntries) > 0 ? (
      <div>
        <Box
          style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
          sx={deckEntryTextBoxStyle}
        >
          {this.props.label} (
          {this.props.countFn(this.props.selectedDeckEntries)})
        </Box>
        {this.props
          .filterFn(this.props.selectedDeckEntries)
          .map((entry) => {
            const deckEntryProps = {
              entry,
              selectedDeck: this.props.selectedDeck,
              updateDeckEntries: this.props.updateDeckEntries,
              updateCardCopiesInDeck: this.props.updateCardCopiesInDeck,
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