import { Box } from "@mui/material"
import { deckEntryTextBoxStyle } from "../../style/styles"
import { DeckCardEntryDTO } from "../../../../mtg-common/src/DTO"
import { DeckEntryComponentWithTooltip } from "./DeckEntryCardWithTooltip"
import { DeckState } from "../hooks/DeckState"

export interface DeckCardTypeCounterProps {
  label: String
  deckState: DeckState
  countFn: (entries: DeckCardEntryDTO[]) => number
  filterFn: (entries: DeckCardEntryDTO[]) => DeckCardEntryDTO[]
  setNewCommander: (entry: DeckCardEntryDTO) => void
  isSideboardEntry: boolean
}

export default function DeckCardTypeCounter(props: DeckCardTypeCounterProps) {
  const deckState = props.deckState
  
  return props.countFn(deckState.selectedDeckEntries) > 0 ? (
    <div>
      <Box style={{ textAlign: "left", marginLeft: 25, width: "100%" }} sx={deckEntryTextBoxStyle}>
        {props.label} ({props.countFn(deckState.selectedDeckEntries)})
      </Box>
      {
        props.filterFn(deckState.selectedDeckEntries).map(entry => {
          const deckEntryProps = {
            entry,
            deckState,
            setNewCommander: props.setNewCommander,
            isSideboardEntry: props.isSideboardEntry
          }
          return (
            <DeckEntryComponentWithTooltip key={entry.card.id} {...deckEntryProps} />
          )
        })}
    </div>
  ) : (<div></div>)
}