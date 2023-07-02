import React, {  createRef, useEffect, useState } from "react";

import { Grid } from '@mui/material';
import MTGCardComponent, { CardComponentProps } from "./MTGCardComponent";
import { gridCardSizeFactor, imageWidth, deckManagerDrawerWidth } from '../../constants';
import { MTGCardDTO } from "../../../../mtg-common/src/DTO";
import { EnabledTab } from "../MagicCollectionManager";
import { DeckState } from "../hooks/DeckState";

export interface CardGridProps {
    cards: MTGCardDTO[]
    handleUpdateCards: React.Dispatch<React.SetStateAction<MTGCardDTO[]>>
    enabledTab: EnabledTab
    deckState: DeckState
    deckManagerOpened?: boolean
}

const CardGrid = (props: CardGridProps) => {
    const divRef: any = createRef()

    const [gridMaxWidth, setWidth] = useState(0)

    useEffect(() => {
        setWidth(divRef.current.clientWidth)
    }, [divRef])

    const gridActualWidth = props.enabledTab === EnabledTab.DECK && props.deckManagerOpened ? gridMaxWidth - deckManagerDrawerWidth : gridMaxWidth
    const maxCardsOnScreen = gridActualWidth / (imageWidth * gridCardSizeFactor)
    const cardWidth = (12 / maxCardsOnScreen) + 0.15

    return (
        <div
            ref={divRef as React.RefObject<HTMLDivElement>}
            className="SearchGrid" style={{ width: "100%", overflow: 'hidden' }} >
            <Grid
                container
                direction="row"
                sx={{ width: gridActualWidth }}
                spacing={1.5}
            >
                {props.cards.map((card: MTGCardDTO) => {
                    if (props.deckState === undefined) {
                        throw Error()
                    }
                    const cardComponentProps: CardComponentProps = {
                        card,
                        enabledTab: props.enabledTab,
                        deckState: props.deckState
                    }
                    return (
                        <Grid key={card.id} item xs={cardWidth}>
                            <MTGCardComponent {...cardComponentProps} />
                        </Grid>
                    )
                })}
            </Grid>
        </div>
    )
}

export default CardGrid