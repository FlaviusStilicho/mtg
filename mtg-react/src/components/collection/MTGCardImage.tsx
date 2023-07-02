import { CardMedia } from "@mui/material";
import { imageHeight, imageWidth } from "../../constants";
import { CardState } from "../hooks/CardState";

export interface CardImageProps {
    cardState: CardState,
    sizeFactor: number,
    handleOpenPopup? : Function
}

const MTGCardImage: React.FC<CardImageProps> = (props) => {
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
        onClick={() => props.handleOpenPopup? props.handleOpenPopup() : null }
    />
    )
}

export default MTGCardImage