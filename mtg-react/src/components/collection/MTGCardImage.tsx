import { CardMedia } from '@mui/material';
import { imageHeight, imageWidth } from "../../constants";
import { Component } from 'react';

export interface CardImageProps {
    image: string;
    sizeFactor: number;
    handleOpenPopup?: Function;
}

export class MTGCardImage extends Component<CardImageProps> {
    shouldComponentUpdate(nextProps: CardImageProps) {
        return this.props.image !== nextProps.image
    }

    render() {
        return (
            <CardMedia
                key={Date.now()}
                sx={{
                    height: imageHeight * this.props.sizeFactor,
                    width: imageWidth * this.props.sizeFactor
                }}
                style={{
                    padding: 5,
                    backgroundColor: "White",
                    borderRadius: '10px'
                }}
                image={this.props.image}
                onClick={() => this.props.handleOpenPopup ? this.props.handleOpenPopup() : null}
            />
        );
    }
};