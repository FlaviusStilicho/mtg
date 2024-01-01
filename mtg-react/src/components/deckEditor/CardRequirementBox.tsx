import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import { imageHeight, imageWidth } from "../../constants";
import { deckEntryTextBoxStyle } from "../../style/styles";
import { CardMedia, Tooltip } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { Component } from "react";
import {
  fetchCardPrice,
  getLowestCardPriceStr,
} from "../../functions/cardPrice";
import { CardRequirement } from "../../overview/DeckOverview";
import PriceInfoTable from "../collection/PriceInfoTable";

export interface CardRequirementComponentProps {
  cardRequirement: CardRequirement;
  style?: any;
}

interface CardRequirementComponentState {
  buyPrice: string;
}

const iconWidth = 16;
const iconHeight = 16;

export class CardRequirementComponent extends Component<
  CardRequirementComponentProps,
  CardRequirementComponentState
> {
  render() {
    const card = this.props.cardRequirement.card;
    const manaCostArray = card.manaCost
      .split("}")
      .map((mc) => mc.substring(1))
      .filter((mc) => mc !== "");
    const numberOwned = card.ownedCopies;
    const numberRequired = this.props.cardRequirement.quantityRequired;
    const isMissingCopies = this.props.cardRequirement.isMissingCopies;

    // fetchBuyPrice = (): void => {
    if (card.priceInfo == null && isMissingCopies) {
      fetchCardPrice(card.name).then((priceInfo) => {
        card.priceInfo = priceInfo;
        this.forceUpdate();
      });
    }
    // };

    return (
      <ListItem
        key={`entry-listitem-${card.name}`}
        sx={{ py: 0.4, px: 0.8 }}
        style={this.props.style}
      >
        <Tooltip
          arrow
          placement="left"
          title={
            <Box>
              <CardMedia
                key={`tooltip-${card.name}`}
                sx={{
                  height: imageHeight * 0.5,
                  width: imageWidth * 0.5,
                }}
                style={{
                  backgroundColor: "White",
                }}
                image={card.versions[0].frontImageUri}
              />
              {card.priceInfo && card.priceInfo.length > 0 && (
                <PriceInfoTable priceInfo={card.priceInfo} />
              )}
            </Box>
          }
        >
          <Box
            bgcolor={isMissingCopies ? "#e3c2c2" : "White"}
            sx={{
              width: "100%",
              border: "2px solid",
              borderRadius: "7px",
              flexDirection: "row",
              display: "flex",
            }}
          >
            <Box style={{ width: "45%" }} sx={deckEntryTextBoxStyle}>
              {card.name}
            </Box>
            <Box
              style={{
                textAlign: "left",
                marginRight: 5,
                width: "7%",
              }}
              sx={deckEntryTextBoxStyle}
            >
              {getLowestCardPriceStr(card.priceInfo)}
            </Box>
            <Box
              style={{ textAlign: "left", marginRight: 5, width: "15%" }}
              sx={deckEntryTextBoxStyle}
            >
              {manaCostArray.map((manaCost) => {
                var fileName = manaCost;
                if (fileName.includes("/")) {
                  fileName = fileName.replace("/", "");
                }
                return (
                  <Box
                    component="img"
                    key={`deck-entry-${manaCost}-${uuidv4()}`}
                    sx={{
                      height: iconHeight,
                      width: iconWidth,
                      maxHeight: iconHeight,
                      maxWidth: iconWidth,
                      paddingLeft: 0,
                      paddingRight: 0,
                    }}
                    src={`http://localhost:3000/mana/${fileName}.png`}
                  />
                );
              })}
            </Box>
            <Box
              style={{ textAlign: "right", marginRight: 2, width: "25%" }}
              sx={deckEntryTextBoxStyle}
            >
              {numberRequired} / {numberOwned}
            </Box>
          </Box>
        </Tooltip>
      </ListItem>
    );
  }
}
