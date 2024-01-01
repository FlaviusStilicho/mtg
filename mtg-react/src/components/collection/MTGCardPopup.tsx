import {
  Box,
  Button,
  CardMedia,
  Dialog,
  IconButton,
  List,
  ListItem,
} from "@mui/material";
import { Component } from "react";
import { largeFlipButtonStyle } from "../../style/styles";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import StarIcon from "@mui/icons-material/Star";
import { MTGCardDTO, MTGCardVersionDTO } from "mtg-common";
import {
  imageHeight,
  imageWidth,
  popupImageSizeFactor,
  variantImageSizeFactor,
} from "../../constants";
import PriceInfoTable from "./PriceInfoTable";

export interface MTGCardPopupProps {
  primaryImage: string;
  variantImages: string[];
  primaryVersion: MTGCardVersionDTO;
  flipCard: () => void;
  opened: boolean;
  onClose: () => void;
  sellPrice: string;
  updateCardCopiesInWishlist: (card: MTGCardDTO, add: boolean) => void;
  card: MTGCardDTO;
}

export class MTGCardPopup extends Component<MTGCardPopupProps> {
  shouldComponentUpdate(nextProps: MTGCardPopupProps) {
    if (this.props.opened || nextProps.opened) {
      return true;
    }
    return false;
  }

  escFunction = (event: any): void => {
    if (event.key !== null && this.props.opened) {
      this.props.onClose();
    }
  };

  componentDidUpdate() {
    if (this.props.opened) {
      document.addEventListener("keydown", this.escFunction, false);
    }
  }

  render() {
    // console.log(`rendering popup for ${this.props.card.name}`);
    return (
      <Dialog
        open={this.props.opened}
        onClose={this.props.onClose}
        // fullWidth
        maxWidth="md"
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Box
          style={{
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
          }}
        >
          <List
            style={{
              justifyContent: "center",
              alignItems: "center",
              overflowX: "auto",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {Array.from(new Set(this.props.variantImages)).map(
              (variantImage) => (
                <ListItem
                  key={`listitem-${variantImage}`}
                  style={{ justifyContent: "center" }}
                >
                  <CardMedia
                    key={`cardmedia-${variantImage}}`}
                    sx={{
                      height: imageHeight * variantImageSizeFactor,
                      width: imageWidth * variantImageSizeFactor,
                    }}
                    style={{
                      backgroundColor: "White",
                      borderRadius: "10px",
                    }}
                    image={variantImage}
                  />
                </ListItem>
              ),
            )}
          </List>
        </Box>
        <List>
          <ListItem
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  fontSize: "1.2em",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {this.props.card.name}
              </div>
              <CardMedia
                key={`popup-image-${this.props.primaryImage}`}
                sx={{
                  height: imageHeight * popupImageSizeFactor,
                  width: imageWidth * popupImageSizeFactor,
                }}
                style={{
                  padding: 5,
                  backgroundColor: "White",
                  borderRadius: "10px",
                }}
                image={this.props.primaryImage}
              />
            </Box>
          </ListItem>
          <ListItem
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box>
              {this.props.primaryVersion.backImageUri !== null && (
                <IconButton
                  name="flip-button"
                  style={largeFlipButtonStyle}
                  onClick={this.props.flipCard}
                >
                  <AutorenewIcon
                    sx={{
                      height: 40,
                      width: 40,
                    }}
                  />
                </IconButton>
              )}
              <Button
                variant="contained"
                startIcon={<StarIcon />}
                name="buy-button"
                sx={{ margin: 2 }}
                disabled={this.props.card.priceInfo == null}
                onClick={() => {
                  console.log("buy");
                  this.props.updateCardCopiesInWishlist(this.props.card, true);
                }}
              >
                Wishlist
              </Button>
              {/* <Button
                variant="contained"
                startIcon={<CurrencyExchangeIcon />}
                name="sell-button"
                sx={{ margin: 2 }}
                disabled={Number.isNaN(this.props.sellPrice)}
                onClick={() => {
                  console.log("sell");
                }}
              >
                {this.props.sellPrice}
              </Button> */}
            </Box>
          </ListItem>
          <ListItem>
            {this.props.card.priceInfo &&
              this.props.card.priceInfo.length > 0 && (
                <PriceInfoTable priceInfo={this.props.card.priceInfo} />
              )}
          </ListItem>
        </List>
      </Dialog>
    );
  }
}
