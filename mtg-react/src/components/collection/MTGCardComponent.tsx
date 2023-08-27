import { Box } from '@mui/material';
import { MTGCardDTO, DeckDTO, MTGCardVersionDTO, DeckCardEntryDTO } from '../../../../mtg-common/src/DTO';
import axios from 'axios';
import HTMLParser from 'node-html-parser';
import { imageWidth, gridCardSizeFactor, imageHeight, numberFormat } from '../../constants';
import { EnabledTab } from '../MagicCollectionManager';
import { MTGCardDeckCounterBox, MTGCardDeckCounterBoxProps } from './MTGCardDeckCounterBox';
import { fetchCardBuyPriceFromMagicersSingle } from '../../functions/magicers';
import { Component } from 'react';
import { MTGCardCollectionCounterBox } from './MTGCardCollectionCounterBox';
import { MTGCardPopup } from './MTGCardPopup';
import { CardImageProps, MTGCardImage } from './MTGCardImage';
export interface CardComponentProps {
    card: MTGCardDTO,
    enabledTab: EnabledTab
    selectedDeckId: number | null
    selectedDeck: DeckDTO | null
    selectedDeckEntries: DeckCardEntryDTO[]
    getCurrentNumberOfCopiesForCard: Function,
    updateCardCopiesInDeck: Function
    updateCardCopiesInCollection: (id: number, copies: number) => void
    updateCardCopiesInWishlist: (id: number, add: boolean) => void
}

interface CardComponentState {
    cardPopupOpened: boolean,
    buyPrice: number | undefined
    sellPrice: string
    frontSideUp: boolean
    primaryImage: string
    variantImages: string[]
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
            // ownedCopies: this.props.card.ownedCopies
        }
    };

    shouldComponentUpdate(nextProps: CardComponentProps, nextState: CardComponentState) {
        return this.props.card.ownedCopies !== nextProps.card.ownedCopies ||
        this.props.selectedDeckId !== nextProps.selectedDeckId ||
        this.props.selectedDeckEntries !== nextProps.selectedDeckEntries ||
        this.props.getCurrentNumberOfCopiesForCard !== nextProps.getCurrentNumberOfCopiesForCard ||
        // this.props.updateCardCopiesInDeck !== nextProps.updateCardCopiesInDeck ||
        this.state.buyPrice !== nextState.buyPrice ||
        this.state.sellPrice !== nextState.sellPrice ||
        this.state.frontSideUp !== nextState.frontSideUp ||
        this.state.cardPopupOpened !== nextState.cardPopupOpened
      }

    flipCard = (): void => {
        const primaryImage = this.props.card.versions.filter(version => version.isPrimaryVersion).map(version => this.state.frontSideUp ? version.frontImageUri : version.backImageUri).filter(this.notEmpty)[0]
        this.setState({primaryImage})
        const variantImages: string[] = this.props.card.versions.filter(version => version.isPrimaryVersion === false).map(version => this.state.frontSideUp ? version.frontImageUri : version.backImageUri).filter(this.notEmpty)
        this.setState({variantImages})
        this.setState({frontSideUp: !this.state.frontSideUp})
    }

    notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }

    subtractOwnedCopy = (): void => {
        if (this.props.card.ownedCopies > 0) {
            this.props.updateCardCopiesInCollection(this.props.card.id, this.props.card.ownedCopies - 1)
        }
    }

    addOwnedCopy = (): void => {
        this.props.updateCardCopiesInCollection(this.props.card.id, this.props.card.ownedCopies + 1)
    }

    fetchBuyPrice = (): void => {
        if (this.state.buyPrice === undefined) {
            // fetchCardBuyPriceFromMagicersSingle
            fetchCardBuyPriceFromMagicersSingle(this.props.card).then(price => this.setState({buyPrice: price}))
        }
    }

    fetchSellPrice = (): void => {
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

    handleOpenPopup = (): void => {
        this.setState({ cardPopupOpened: true});
        this.fetchBuyPrice()
        this.fetchSellPrice()
    };

    handleClose = (): void => {
        this.setState({ cardPopupOpened: false});
    };
      
    render(){
        // console.log(`rendering card component ${this.props.card.name}`)
        const imageProps: CardImageProps = {
            image: this.state.primaryImage,
            sizeFactor: gridCardSizeFactor,
            handleOpenPopup: this.handleOpenPopup
        }

        const deckCounterBoxProps: MTGCardDeckCounterBoxProps = {
            card: this.props.card,
            selectedDeckId: this.props.selectedDeckId,
            selectedDeck: this.props.selectedDeck,
            selectedDeckEntries: this.props.selectedDeckEntries,
            primaryVersion: this.props.card.versions.filter(version => version.isPrimaryVersion)[0],
            getCurrentNumberOfCopiesForCard: this.props.getCurrentNumberOfCopiesForCard,
            updateCardCopiesInDeck: this.props.updateCardCopiesInDeck,
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
                        updateCardCopiesInWishlist={this.props.updateCardCopiesInWishlist}
                        card={this.props.card}
                    />}
            </Box>
        );
    }
};