import { Component, RefObject, createRef } from "react";

import { Button, Grid } from "@mui/material";
import { MTGCardComponent, CardComponentProps } from "./MTGCardComponent";
import { gridCardSizeFactor, imageWidth, drawerWidth } from "../../constants";
import { DeckCardEntryDTO, DeckDTO, MTGCardDTO } from "mtg-common";
import { EnabledTab } from "../MagicCollectionManager";
import { isEqual } from "lodash";

export interface CardGridProps {
  cards: MTGCardDTO[];
  enabledTab: EnabledTab;
  selectedDeck: DeckDTO | null;
  selectedDeckId: number | null;
  selectedDeckEntries: DeckCardEntryDTO[];
  deckManagerOpened?: boolean;
  wishlistOpened?: boolean;
  updateCardCopiesInDeck: (
    card: MTGCardDTO,
    increment: number,
    isSideboard: boolean,
  ) => void;
  getCurrentNumberOfCopiesForCard: (card: MTGCardDTO) => number;
  updateCardCopiesInCollection: (id: number, copies: number) => void;
  updateCardCopiesInWishlist: (card: MTGCardDTO, add: boolean) => void;
  handleLoadMore: any;
}

interface CardGridState {
  gridMaxWidth: number;
  myRef: RefObject<HTMLDivElement>;
}

export class CardGrid extends Component<CardGridProps, CardGridState> {
  constructor(props: CardGridProps) {
    super(props);

    this.state = {
      gridMaxWidth: 0,
      myRef: createRef(),
    };
  }

  handleResize = () => {
    if (this.state.myRef.current !== null) {
      this.setState({
        gridMaxWidth: this.state.myRef.current.clientWidth,
      });
    }
  };

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }

  shouldComponentUpdate(
    nextProps: Readonly<CardGridProps>,
    nextState: Readonly<CardGridState>,
    nextContext: any,
  ): boolean {
    return (
      !isEqual(this.props.cards, nextProps.cards) ||
      !isEqual(this.props.selectedDeckEntries, nextProps.selectedDeckEntries) ||
      this.props.selectedDeckId !== nextProps.selectedDeckId ||
      this.state.gridMaxWidth !== nextState.gridMaxWidth ||
      this.props.deckManagerOpened !== nextProps.deckManagerOpened ||
      this.props.wishlistOpened !== nextProps.wishlistOpened
    );
  }

  render() {
    // console.log("rendering grid")
    var gridActualWidth: number;
    if (
      this.props.enabledTab === EnabledTab.DECK_EDITOR &&
      this.props.deckManagerOpened
    ) {
      gridActualWidth = this.state.gridMaxWidth - drawerWidth;
    } else if (
      this.props.enabledTab === EnabledTab.COLLECTION &&
      this.props.wishlistOpened
    ) {
      gridActualWidth = this.state.gridMaxWidth - drawerWidth;
    } else {
      gridActualWidth = this.state.gridMaxWidth;
    }

    const maxCardsOnScreen =
      gridActualWidth / (imageWidth * gridCardSizeFactor);
    const cardWidth = 12 / maxCardsOnScreen + 0.15;

    return (
      <div
        ref={this.state.myRef as React.RefObject<HTMLDivElement>}
        style={{ width: "100%", overflowY: "auto" }}
      >
        <Grid
          container
          direction="row"
          sx={{ width: gridActualWidth }}
          spacing={1.5}
        >
          {this.props.cards.map((card: MTGCardDTO) => {
            const cardComponentProps: CardComponentProps = {
              card,
              enabledTab: this.props.enabledTab,
              selectedDeckId: this.props.selectedDeckId,
              selectedDeck: this.props.selectedDeck,
              selectedDeckEntries: this.props.selectedDeckEntries,
              getCurrentNumberOfCopiesForCard:
                this.props.getCurrentNumberOfCopiesForCard,
              updateCardCopiesInCollection:
                this.props.updateCardCopiesInCollection,
              updateCardCopiesInWishlist: this.props.updateCardCopiesInWishlist,
              updateCardCopiesInDeck: this.props.updateCardCopiesInDeck,
            };
            return (
              <Grid key={`${card.id}-${card.name}`} item xs={cardWidth}>
                <MTGCardComponent {...cardComponentProps} />
              </Grid>
            );
          })}
        </Grid>
        <Button
          aria-label="load"
          name="load-button"
          variant="contained"
          style={{
            backgroundColor: "3C00E0",
            display: this.props.cards.length === 0 ? "none" : "inline-block",
          }}
          sx={{ borderRadius: "20%" }}
          onClick={this.props.handleLoadMore}
        >
          Load more
        </Button>
      </div>
    );
  }
}
