import { Box, Button, CardMedia, Dialog, IconButton, List, ListItem } from "@mui/material";
import React, { memo } from "react";
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

export const MTGCardPopup = memo((props: MTGCardPopupProps) => {
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
                },
            }}
        >
            <Box style={{ justifyContent: 'center', alignItems: 'center', overflowY: "auto"}}>
                <List style={{ justifyContent: 'center', alignItems: 'center', overflowX: "auto", display: "flex", flexDirection: "row"}}>
                    {
                        Array.from(new Set(cardState.variantImages)).map(variantImage => (
                            <ListItem key={`listitem-${variantImage}-${Date.now()}`} style={{ justifyContent: 'center'}}> 
                                <CardMedia
                                    key={`cardmedia-${variantImage}-${Date.now()}`}
                                    sx={{
                                        height: imageHeight * variantImageSizeFactor,
                                        width: imageWidth * variantImageSizeFactor,
                                    }}
                                    style={{
                                        backgroundColor: "White",
                                        borderRadius: '10px'
                                    }}
                                    image={variantImage}
                                />
                            </ListItem>
                        ))}
                </List>
            </Box>
            <List>
                <ListItem style={{ display: "flex", justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <CardMedia
                            key={Date.now()}
                            sx={{
                                height: imageHeight * popupImageSizeFactor,
                                width: imageWidth * popupImageSizeFactor
                            }}
                            style={{
                                padding: 5,
                                backgroundColor: "White",
                                borderRadius: '10px',
                            }}
                            image={props.cardState.primaryImage}
                        />
                    </Box>
                </ListItem>
                <ListItem style={{ display: "flex", justifyContent: 'center', alignItems: 'center' }}>
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
                            {`${props.buyPrice ? "€ " + props.buyPrice : 'Not available'}`}
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
                </ListItem>
                {/* </Box> */}
            </List>
        </Dialog >
    );
});