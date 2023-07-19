import { Box, Button, CardMedia, Dialog, IconButton, List, ListItem } from "@mui/material";
import React from "react";
import { largeFlipButtonStyle } from "../../style/styles";
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { imageHeight, imageWidth, popupImageSizeFactor, variantImageSizeFactor } from "../../constants";
import { CardState } from '../hooks/CardState';

export interface MTGCardPopupProps {
    cardState: CardState
    opened: boolean;
    onClose: () => void;
    buyPrice: number | undefined
    sellPrice: string
}

const MTGCardPopup: React.FC<MTGCardPopupProps> = (props) => {
    const cardState = props.cardState

    const listStyle: any = {
        "display": "flex",
        "overflowX": "auto",
        "flexDirection": 'row',
    }

    return (
        <Dialog
            open={props.opened}
            onClose={props.onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    textAlign: 'center',
                    display: "flex",
                    justifyContent: 'center',
                    alignItems: 'center'
                },
            }}
        >
            <List style={listStyle}>
                {
                    cardState.variantImages.map(variantImage => (
                        <ListItem key={`listitem-${variantImage}-${Date.now()}`}>
                            <CardMedia
                                key={`cardmedia-${variantImage}-${Date.now()}`}
                                sx={{
                                    height: imageHeight * variantImageSizeFactor,
                                    width: imageWidth * variantImageSizeFactor,
                                    margin: 2
                                }}
                                style={{
                                    padding: 2,
                                    backgroundColor: "White",
                                    borderRadius: '10px'
                                }}
                                image={variantImage}
                            />
                        </ListItem>
                    ))}
            </List>
            <Box style={{ justifyContent: 'center', }}>
                <CardMedia
                    key={Date.now()}
                    sx={{
                        height: imageHeight * popupImageSizeFactor,
                        width: imageWidth * popupImageSizeFactor
                    }}
                    style={{
                        padding: 5,
                        backgroundColor: "White",
                        borderRadius: '10px'
                    }}
                    image={props.cardState.primaryImage}
                />
                <Box >
                    {cardState.primaryVersion.backImageUri !== null &&
                        <IconButton
                            name="flip-button"
                            style={largeFlipButtonStyle}
                            onClick={
                                cardState.flipCard
                            }
                        >
                            <AutorenewIcon sx={{
                                height: 40,
                                width: 40
                            }} />
                        </IconButton>
                    }
                    <Button
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        name="buy-button"
                        sx={{ margin: 2 }}
                        disabled={Number.isNaN(props.buyPrice)}
                        onClick={() => {
                            console.log("buy")
                        }}>
                        {`€ ${props.buyPrice}`}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<CurrencyExchangeIcon />}
                        name="sell-button"
                        sx={{ margin: 2 }}
                        disabled={Number.isNaN(props.buyPrice)}
                        onClick={() => {
                            console.log("sell")
                        }}>
                        {props.sellPrice}
                    </Button>
                </Box>
            </Box>
        </Dialog >
    );
}
export default MTGCardPopup;