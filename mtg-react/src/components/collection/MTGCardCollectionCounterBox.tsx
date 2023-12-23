import { Box, Button, IconButton, TextField } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import {
  cardTextFieldStyle,
  flipButtonStyle,
  staticButtonStyle,
} from "../../style/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { CardState } from "../hooks/CardState";
import { Component } from "react";
import { MTGCardDTO, MTGCardVersionDTO } from "mtg-common";

export interface CollectionCounterBoxProps {
  card: MTGCardDTO;
  primaryVersion: MTGCardVersionDTO;
  addOwnedCopy: () => void;
  subtractOwnedCopy: () => void;
  flipCard: () => void;
}
export class MTGCardCollectionCounterBox extends Component<CollectionCounterBoxProps> {
  shouldComponentUpdate(nextProps: CardState) {
    //todo replace cardState
    return (
      this.props.card !== nextProps.card ||
      this.props.card.ownedCopies !== nextProps.card.ownedCopies
    );
  }

  render() {
    // console.log(`rendering collection card counter box ${this.props.card.name}`);
    return (
      <Box style={{ alignItems: "center" }}>
        <Button
          aria-label="reduce"
          name="subtract-button"
          variant="contained"
          style={staticButtonStyle}
          sx={{ borderRadius: "20%" }}
          onClick={this.props.subtractOwnedCopy}
        >
          <RemoveIcon fontSize="small" />
        </Button>
        <TextField
          name="current-copies-counter"
          value={this.props.card.ownedCopies}
          variant="standard"
          style={cardTextFieldStyle}
          sx={{ borderRadius: "20%" }}
          InputProps={{
            readOnly: true,
            disabled: true,
            inputProps: {
              style: { textAlign: "center" },
            },
          }}
        ></TextField>
        <Button
          aria-label="increase"
          name="add-button"
          variant="contained"
          style={staticButtonStyle}
          onClick={this.props.addOwnedCopy}
        >
          <AddIcon fontSize="small" />
        </Button>

        {this.props.primaryVersion.backImageUri !== null && (
          <IconButton
            name="flip-button"
            style={flipButtonStyle}
            onClick={this.props.flipCard}
          >
            <AutorenewIcon />
          </IconButton>
        )}
      </Box>
    );
  }
}
