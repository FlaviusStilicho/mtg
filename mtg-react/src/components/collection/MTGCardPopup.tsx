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
import { MTGCardVersionDTO } from '../../../../mtg-common/dist/DTO';
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
  buyPrice: number | undefined;
  sellPrice: string;
}

export class MTGCardPopup extends Component<MTGCardPopupProps> {
  shouldComponentUpdate(nextProps: MTGCardPopupProps) {
    return this.props.primaryImage !== nextProps.primaryImage || 
    this.props.opened !== nextProps.opened ||
    this.props.buyPrice !== nextProps.buyPrice ||
    this.props.sellPrice !== nextProps.sellPrice
  }

  render() {
    return (
      <Dialog
        open={this.props.opened}
        onClose={this.props.onClose}
        fullWidth
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
                disabled={Number.isNaN(this.props.buyPrice)}
                onClick={() => {
                  console.log("buy");
                }}
              >
                {`${
                  this.props.buyPrice
                    ? "€ " + this.props.buyPrice
                    : "Not available"
                }`}
              </Button>
              <Button
                variant="contained"
                startIcon={<CurrencyExchangeIcon />}
                name="sell-button"
                sx={{ margin: 2 }}
                disabled={Number.isNaN(this.props.buyPrice)}
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
