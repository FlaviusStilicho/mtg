import React, { createRef, useEffect, useState } from "react";

import { Button, Grid } from '@mui/material';
import MTGCardComponent, { CardComponentProps } from "./MTGCardComponent";
import { gridCardSizeFactor, imageWidth, deckManagerDrawerWidth } from '../../constants';
import { MTGCardDTO } from "../../../../mtg-common/src/DTO";
import { EnabledTab } from "../MagicCollectionManager";
import { DeckState } from "../hooks/DeckState";
import { staticButtonStyle } from "../../style/styles";
import RemoveIcon from '@mui/icons-material/Remove';

export interface CardGridProps {
    cards: MTGCardDTO[]
    enabledTab: EnabledTab
    deckState: DeckState
    deckManagerOpened?: boolean
    handleLoadMore: any
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
            style={{ width: "100%", overflowY: "auto" }}>
            <Grid
                container
                direction="row"
                sx={{ width: gridActualWidth }}
                spacing={1.5}>
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
            <Button
                aria-label="load"
                name="load-button"
                variant="contained"
                style={{
                    backgroundColor: "3C00E0"
                }}
                sx={{ borderRadius: '20%' }}
                onClick={props.handleLoadMore}>
                Load more
            </Button>
        </div>
    )
}

export default CardGrid