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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { MTGCardDTO, MTGCardVersionDTO } from 'mtg-common';
import {
  imageHeight,
  imageWidth,
  popupImageSizeFactor,
  variantImageSizeFactor,
} from "../../constants";

export interface MTGCardPopupProps {
  primaryImage: string
  variantImages: string[]
  primaryVersion: MTGCardVersionDTO
  flipCard: () => void
  opened: boolean;
  onClose: () => void;
  sellPrice: string;
  updateCardCopiesInWishlist: (card: MTGCardDTO, add: boolean) => void;
  card: MTGCardDTO
}

export class MTGCardPopup extends Component<MTGCardPopupProps> {
  shouldComponentUpdate(nextProps: MTGCardPopupProps) {
    return this.props.primaryImage !== nextProps.primaryImage || 
    this.props.opened !== nextProps.opened ||
    this.props.card.priceInfo !== nextProps.card.priceInfo ||
    this.props.sellPrice !== nextProps.sellPrice
  }

  escFunction = (event: any): void => {
    if (event.key !== null && this.props.opened) {
      this.props.onClose()
    }
  }

  componentDidUpdate(){
    if(this.props.opened){
      document.addEventListener("keydown", this.escFunction, false);
    }
  }

  render() {
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
              )
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
                  fontSize: "1.2em", // Increase the font size as desired
                  fontWeight: "bold", // Make the text bold
                  color: "white", // Set the text color to white
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
                startIcon={<ShoppingCartIcon />}
                name="buy-button"
                sx={{ margin: 2 }}
                disabled={this.props.card.priceInfo == null}
                onClick={() => {
                  console.log("buy");
                  this.props.updateCardCopiesInWishlist(this.props.card, true)
                }}
              >
                {`${
                  this.props.card.priceInfo?.buyPrice
                    ? "€ " + this.props.card.priceInfo?.buyPrice
                    : "Not available"
                }`}
              </Button>
              <Button
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
              </Button>
            </Box>
          </ListItem>
        </List>
      </Dialog>
    );
  }
}
