import { Box } from '@mui/material';
import { MTGCardDTO } from '../../../../mtg-common/src/DTO';
import MTGCardPopup from './MTGCardPopup';
import axios from 'axios';
import HTMLParser from 'node-html-parser';
import { imageWidth, gridCardSizeFactor, imageHeight, numberFormat } from '../../constants';
import MTGCardCollectionCounterBox from './MTGCardCollectionCounterBox';
import { CardState, useCardState } from '../hooks/CardState';
import MTGCardImage, { CardImageProps } from './MTGCardImage';
import { EnabledTab } from '../MagicCollectionManager';
import { DeckState } from '../hooks/DeckState';
import MTGCardDeckCounterBox, { MTGCardCollectionCounterBoxProps } from './MTGCardDeckCounterBox';
import { fetchCardBuyPriceFromMagicersSingle } from '../../functions/magicers';
import { FC, memo, useState } from 'react';

export interface CardComponentProps {
    card: MTGCardDTO,
    enabledTab: EnabledTab
    deckState: DeckState
}

export const MTGCardComponent = memo((props: CardComponentProps) => {
    const card = props.card
    const { primaryVersion, primaryImage, variantImages, flipCard, ownedCopies, subtractOwnedCopy, addOwnedCopy } = useCardState(card)
    const cardState = new CardState(card, primaryVersion, primaryImage, variantImages, flipCard, ownedCopies, subtractOwnedCopy, addOwnedCopy)

    const [cardPopupOpened, setCardPopupOpened] = useState<boolean>(false);
    const [buyPrice, setBuyPrice] = useState<number | undefined>(undefined);
    const [sellPrice, setSellPrice] = useState<string>("");

    const fetchBuyPrice = (): void => {
        if (buyPrice === undefined) {
            fetchCardBuyPriceFromMagicersSingle(card).then(price => setBuyPrice(price))
        }
    }

    const fetchSellPrice = () => {
        if (sellPrice === "") {
            const cardName = card.name
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
                    setSellPrice("-")
                } else if (prices.length === 1) {
                    setSellPrice(`${numberFormat.format(prices[0])}`)
                } else {
                    const lowest = numberFormat.format(Math.min(...prices))
                    const highest = numberFormat.format(Math.max(...prices))
                    setSellPrice(`${lowest} - ${highest}`)
                }
            })
        }
    }

    const handleOpenPopup = () => {
        setCardPopupOpened(true);
        fetchBuyPrice()
        fetchSellPrice()
    };

    const handleClose = () => {
        setCardPopupOpened(false);
    };

    const imageProps: CardImageProps = {
        cardState,
        sizeFactor: gridCardSizeFactor,
        handleOpenPopup
    }

    const deckCounterBoxProps: MTGCardCollectionCounterBoxProps = {
        cardState,
        deckState: props.deckState
    }

    return (
        <Box
            sx={{
                width: imageWidth * gridCardSizeFactor,
                height: imageHeight * gridCardSizeFactor * 1.15

            }}>
            <MTGCardImage {...imageProps} />
            {props.enabledTab === EnabledTab.COLLECTION &&
                <MTGCardCollectionCounterBox {...cardState} />
            }
            {props.enabledTab === EnabledTab.DECK &&
                <MTGCardDeckCounterBox {...deckCounterBoxProps} />
            }
            {
                <MTGCardPopup
                    cardState={cardState}
                    opened={cardPopupOpened}
                    onClose={handleClose}
                    buyPrice={buyPrice}
                    sellPrice={sellPrice}
                />}
        </Box>
    );
});