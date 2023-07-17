import { Box } from "@mui/material"
import { deckEntryTextBoxStyle } from "../../style/styles"
import { DeckCardEntryDTO } from "../../../../mtg-common/src/DTO"
import { DeckEntryComponentWithTooltip } from "./DeckEntryCardWithTooltip"

export interface DeckCardTypeCounterProps {
  label: String
  selectedDeckEntries: DeckCardEntryDTO[]
  countFn: (entries: DeckCardEntryDTO[]) => number
  filterFn: (entries: DeckCardEntryDTO[]) => DeckCardEntryDTO[]
  addCardCopyToDeck: Function,
  subtractCardCopyFromDeck: Function
}

export default function DeckCardTypeCounter(props: DeckCardTypeCounterProps) {
  
  return props.countFn(props.selectedDeckEntries) > 0 ? (
    <div>
      <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
        {props.label} ({props.countFn(props.selectedDeckEntries)})
      </Box>
      {
        props.filterFn(props.selectedDeckEntries).map(entry => {
          const deckEntryProps = {
            entry,
            addCardCopyToDeck: props.addCardCopyToDeck,
            subtractCardCopyFromDeck: props.subtractCardCopyFromDeck
          }
          return (
            <DeckEntryComponentWithTooltip {...deckEntryProps} />
          )
        })}
    </div>
  ) : (<div></div>)
}