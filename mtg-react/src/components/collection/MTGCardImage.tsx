import { CardMedia } from "@mui/material";
import { imageHeight, imageWidth } from "../../constants";
import { CardState } from "../hooks/CardState";
import { memo } from "react";

export interface CardImageProps {
    cardState: CardState,
    sizeFactor: number,
    handleOpenPopup? : Function
}

export const MTGCardImage = memo((props: CardImageProps) => {
    return (
        <CardMedia
        key={Date.now()}
        sx={{
            height: imageHeight * props.sizeFactor,
            width: imageWidth * props.sizeFactor
        }}
        style={{
            padding: 5,
            backgroundColor: "White",
            borderRadius: '10px'
        }}
        image={props.cardState.primaryImage}
        onClick={() => props.handleOpenPopup ? props.handleOpenPopup() : null }
    />
    )
});