import { Box } from '@mui/material';
import { MTGCardDTO, MTGCardVersionDTO } from '../../../../mtg-common/src/DTO';
import axios from 'axios';
import HTMLParser from 'node-html-parser';
import { imageWidth, gridCardSizeFactor, imageHeight, numberFormat } from '../../constants';
import { CardState, useCardState } from '../hooks/CardState';
import { CardImageProps, MTGCardImage } from './MTGCardImage';
import { EnabledTab } from '../MagicCollectionManager';
import { DeckState } from '../hooks/DeckState';
import { MTGCardDeckCounterBox, MTGCardDeckCounterBoxProps } from './MTGCardDeckCounterBox';
import { fetchCardBuyPriceFromMagicersSingle } from '../../functions/magicers';
import { Component, memo, useState } from 'react';
import { MTGCardCollectionCounterBox } from './MTGCardCollectionCounterBox';
import { MTGCardPopup } from './MTGCardPopup';
import { UpdateCardOwnedCopiesQueryParams } from '../../../../mtg-common/src/requests';
import { debounce } from 'lodash';

export interface CardComponentProps {
    card: MTGCardDTO,
    enabledTab: EnabledTab
    deckState: DeckState
}

interface CardComponentState {
    cardPopupOpened: boolean,
    buyPrice: number | undefined
    sellPrice: string
    frontSideUp: boolean
    primaryImage: string
    variantImages: string[]
    ownedCopies: number
}

export class MTGCardComponent extends Component<CardComponentProps, CardComponentState> {
    constructor(props: CardComponentProps) {
        super(props);

        const primaryVersion: MTGCardVersionDTO = props.card.versions.filter(version => version.isPrimaryVersion)[0]
        const variantVersions: MTGCardVersionDTO[] = props.card.versions.filter(version => version.isPrimaryVersion === false)
        variantVersions.map(version => version.frontImageUri)
        this.state = {
            cardPopupOpened: false,
            buyPrice: undefined,
            sellPrice: "",
            frontSideUp: true,
            primaryImage: primaryVersion.frontImageUri,
            variantImages: variantVersions.map(version => version.frontImageUri),
            ownedCopies: this.props.card.ownedCopies
        }
    };

    flipCard(): void {
        const primaryImage = this.props.card.versions.filter(version => version.isPrimaryVersion).map(version => this.state.frontSideUp ? version.frontImageUri : version.backImageUri).filter(this.notEmpty)[0]
        this.setState({primaryImage})
        const variantImages: string[] = this.props.card.versions.filter(version => version.isPrimaryVersion === false).map(version => this.state.frontSideUp ? version.frontImageUri : version.backImageUri).filter(this.notEmpty)
        this.setState({variantImages})
        this.setState({frontSideUp: !this.state.frontSideUp})
    }

    notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }

    subtractOwnedCopy(): void {
        if (this.state.ownedCopies > 0) {
            this.handleChangeOwnedCopies(this.state.ownedCopies - 1)
        }
    }

    addOwnedCopy(): void {
        this.handleChangeOwnedCopies(this.state.ownedCopies + 1)
    }

    postUpdatedOwnedCopies = debounce((body: UpdateCardOwnedCopiesQueryParams) => {
        axios.post(`http://localhost:8000/cards/ownedCopies`, body)
    }, 1500)

    handleChangeOwnedCopies(newValue: number): void {
        this.setState({ownedCopies: newValue})
        const body: UpdateCardOwnedCopiesQueryParams = {
            cardId: this.props.card.id,
            ownedCopies: newValue
        }
        this.postUpdatedOwnedCopies(body)
    }

    fetchBuyPrice(): void {
        if (this.state.buyPrice === undefined) {
            fetchCardBuyPriceFromMagicersSingle(this.props.card).then(price => this.setState({buyPrice: price}))
        }
    }

    fetchSellPrice():void {
        if (this.state.sellPrice === "") {
            const cardName = this.props.card.name
            axios.post('https://www.magicers.nl/inc/ajax_public/buylist.php',
                `action=list&search=${cardName}`, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            }).then(response => {
                const root: any = HTMLParser.parse(response.data)

                var prices: number[] = []
                try {
                    root.childNodes[3].childNodes.forEach((node: any) => {
                        if ('rawAttributes' in node && 'id' in node.rawAttributes &&
                            node.rawAttributes['id'].startsWith('productrow')) {
                            node.childNodes.forEach((childNode: any) => {
                                if ('rawAttributes' in childNode && 'id' in childNode.rawAttributes && childNode.rawAttributes['id'].startsWith('price')) {
                                    const price = Number(childNode.rawAttributes['data-text'].replace(",", "."))
                                    if (price > 0) {
                                        prices.push(price)
                                    }
                                }
                            })
                        }
                    })
                } catch (err) {

                }
                if (prices.length === 0) {
                    this.setState({sellPrice: "-"})
                } else if (prices.length === 1) {
                    this.setState({sellPrice: `${numberFormat.format(prices[0])}`})
                } else {
                    const lowest = numberFormat.format(Math.min(...prices))
                    const highest = numberFormat.format(Math.max(...prices))
                    this.setState({ sellPrice: `${lowest} - ${highest}`})
                }
            })
        }
    }

    handleOpenPopup(){
        this.setState({ cardPopupOpened: true});
        this.fetchBuyPrice()
        this.fetchSellPrice()
    };

    handleClose(){
        this.setState({ cardPopupOpened: false});
    };

      
    render(){
        console.log("rendering card component")

        const imageProps: CardImageProps = {
            image: this.state.primaryImage,
            sizeFactor: gridCardSizeFactor,
            handleOpenPopup: this.handleOpenPopup
        }

        const deckCounterBoxProps: MTGCardDeckCounterBoxProps = {
            card: this.props.card,
            selectedDeckId: this.props.deckState.selectedDeckId,
            selectedDeck: this.props.deckState.selectedDeck,
            selectedDeckEntries: this.props.deckState.selectedDeckEntries,
            primaryVersion: this.props.card.versions.filter(version => version.isPrimaryVersion)[0],
            getCurrentNumberOfCopiesForCard: this.props.deckState.getCurrentNumberOfCopiesForCard,
            updateCardCopiesInDeck: this.props.deckState.updateCardCopiesInDeck,
            flipCard: this.flipCard
        }

        return (
            <Box
                sx={{
                    width: imageWidth * gridCardSizeFactor,
                    height: imageHeight * gridCardSizeFactor * 1.15

                }}>
                <MTGCardImage {...imageProps} />
                {this.props.enabledTab === EnabledTab.COLLECTION &&
                    <MTGCardCollectionCounterBox 
                        card={this.props.card}
                        primaryVersion={this.props.card.versions.filter(version => version.isPrimaryVersion)[0]}
                        addOwnedCopy={this.addOwnedCopy}
                        subtractOwnedCopy={this.subtractOwnedCopy}
                        flipCard={this.flipCard}
                    />
                }
                {this.props.enabledTab === EnabledTab.DECK &&
                    <MTGCardDeckCounterBox {...deckCounterBoxProps} />
                }
                {
                    <MTGCardPopup
                        primaryImage={this.state.primaryImage}
                        variantImages={this.state.variantImages}
                        primaryVersion={this.props.card.versions.filter(version => version.isPrimaryVersion)[0]}
                        flipCard={this.flipCard}
                        opened={this.state.cardPopupOpened}
                        onClose={this.handleClose}
                        buyPrice={this.state.buyPrice}
                        sellPrice={this.state.sellPrice}
                    />}
            </Box>
        );
    }
};