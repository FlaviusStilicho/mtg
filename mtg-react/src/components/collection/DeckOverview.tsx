import { DeckDTO } from "mtg-common";
import React from "react";

interface DeckOverviewProps {
  //     enabledTab: EnabledTab
}

interface DeckOverviewState {
  decks: DeckDTO[];
}

class DeckOverview extends React.Component<
  DeckOverviewProps,
  DeckOverviewState
> {
  constructor(props: DeckOverviewProps) {
    super(props);
    this.state = {
      decks: [],
    };
  }

  render() {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 50%" }}>
          HELLO
          {/* Left panel content */}
        </div>
        <div style={{ flex: "1 1 50%" }}>
          WORLD
          {/* Right panel content */}
        </div>
      </div>
    );
  }
}

export default DeckOverview;
