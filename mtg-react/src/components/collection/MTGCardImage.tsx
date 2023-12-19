import { CardMedia } from '@mui/material';
import { imageHeight, imageWidth } from "../../constants";
import { Component, SyntheticEvent } from 'react';

export interface CardImageProps {
    image: string;
    sizeFactor: number;
    handleOpenPopup?: Function;
}

export class MTGCardImage extends Component<CardImageProps> {
    shouldComponentUpdate(nextProps: CardImageProps) {
        return this.props.image !== nextProps.image
    }

    handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.src = "/placeholder-card.jpg";
    };

    render() {
        return (
            <CardMedia
                sx={{
                    height: imageHeight * this.props.sizeFactor,
                    width: imageWidth * this.props.sizeFactor
                }}
                style={{
                    backgroundColor: "White",
                    borderRadius: '10px'
                }}
                component="img"
                src={this.props.image}
                onError={this.handleError}
                onClick={() => this.props.handleOpenPopup ? this.props.handleOpenPopup() : null}
            />
        );
    }
}