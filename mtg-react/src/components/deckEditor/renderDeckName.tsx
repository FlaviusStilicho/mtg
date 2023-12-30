import Box from "@mui/material/Box";
import { DeckDTO } from "mtg-common";
import { getCommander, getDeckColorIdentity } from "../../functions/util";
import ColorIcon from "../ColorIcon";

export function renderDeckName(deck: DeckDTO, fontSize: number) {
  const commander = getCommander(deck);
  var deckColorIdentity = getDeckColorIdentity(deck);
  return (
      <Box
        sx={{
          fontSize: fontSize,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          {Array.from(deckColorIdentity).map((color) => (
            <ColorIcon
              key={`${deck.id}-${color}-${Date.now()}`}
              color={`${color}`}
            />
          ))}
        </Box>
        {commander ? `${deck.name} [${commander.name}]` : deck.name}
      </Box>
  );
}
