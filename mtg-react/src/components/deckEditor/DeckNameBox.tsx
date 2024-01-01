import React from "react";
import Box from "@mui/material/Box";
import { DeckDTO } from "mtg-common";
import { getCommander, getDeckColorIdentity } from "../../functions/util";
import ColorIcon from "../ColorIcon";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

interface DeckNameBoxProps {
  deck: DeckDTO;
  fontSize: number;
  interactive: boolean;
  toggleDeckActive: (deck: DeckDTO) => void;
}

class DeckNameBox extends React.Component<DeckNameBoxProps> {
  render() {
    const { deck, fontSize, interactive, toggleDeckActive } = this.props;
    const commander = getCommander(deck);
    var deckColorIdentity = getDeckColorIdentity(deck);

    const handleIconButtonClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      toggleDeckActive(deck);
    };

    return (
      <Box
        sx={{
          fontSize: fontSize,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          width: "100%",
          gap: 1,
          margin: 0,
          padding: 0,
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
        <Box sx={{ marginLeft: "auto" }}>
          <IconButton
            sx={{
              margin: 0,
              padding: 0,
            }}
            disabled={!interactive}
            onClick={handleIconButtonClick}
          >
            {deck.isActive ? (
              <CheckIcon style={{ color: "green" }} />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )}
          </IconButton>
        </Box>
      </Box>
    );
  }
}

export default DeckNameBox;
