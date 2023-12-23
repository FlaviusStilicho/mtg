import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import {
  navBarHeight,
  drawerWidth,
  manaCurveChartOptions,
  imageHeight,
  imageWidth,
} from "../../constants";
import {
  buttonBackgroundStyle,
  deckEntryTextBoxStyle,
  listItemStyle,
  searchTextFieldStyle,
} from "../../style/styles";
import {
  Button,
  CardMedia,
  IconButton,
  Select,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import {
  CreateDeckWindow,
  CreateDeckWindowProps,
} from "./windows/CreateDeckWindow";
import {
  DeckCardEntryDTO,
  DeckDTO,
  MTGCardDTO,
  WishlistEntryDTO,
} from "mtg-common";
import {
  filterCreatures,
  filterInstants,
  filterLands,
  filterNoncreatureArtifacts,
  filterSorceries,
  getNumberOfCreatures,
  getNumberOfInstants,
  getNumberOfLands,
  getNumberOfNoncreatureArtifacts,
  getNumberOfPlaneswalkers,
  getNumberOfSorceries,
  filterPlaneswalkers,
  getNumberOfBattles,
  filterBattles,
  getNumberOfNoncreatureEnchantment,
  filterNoncreatureEnchantments,
  numberOfCardsAvailable,
  costToFinishDeck,
  filterSideboard,
  getNumberOfSideboardCards,
  getCommander,
  countCardsByRarity,
} from "../../functions/util";
import { exportToCsv } from "../../functions/exportToCsv";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { DeckEntriesPanel } from "./DeckEntryGrouping";
import { CopyDeckWindow, CopyDeckWindowProps } from "./windows/CopyDeckWindow";
import {
  DeleteDeckWindow,
  DeleteDeckWindowProps,
} from "./windows/DeleteDeckWindow";
import { EditDeckWindow, EditDeckWindowProps } from "./windows/EditDeckWindow";
import {
  CompareDeckWindow,
  CompareDeckWindowProps,
} from "./windows/CompareDeckWindow";
import { DevotionCountersBox } from "./DevotionCountersBox";
import { SelectChangeEvent } from "@mui/material/Select";
import { renderDeckName } from "./renderDeckName";
import RarityIcon from "../RarityIcon";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

export const deckNameFontSize = 10;

export interface DeckManagerProps extends MuiAppBarProps {
  deckManagerOpened?: boolean;
  fetchDecks: () => void;
  decks: DeckDTO[];
  selectedDeck: DeckDTO | null;
  selectedDeckId: number | null;
  selectedDeckEntries: DeckCardEntryDTO[];
  selectedDeckNotes: string;
  handleChangeSelectedDeck: (event: SelectChangeEvent<number>) => void;
  updateDeckEntries: (entry: DeckCardEntryDTO) => void;
  updateDeckNotes: (text: string, deckId: number) => void;
  updateCardCopiesInDeck: (
    card: MTGCardDTO,
    increment: number,
    isSideboard: boolean,
  ) => void;
  saveDeck: () => void;
  isCardInWishlist: (card: MTGCardDTO) => boolean;
  updateCardCopiesInWishlist: (card: MTGCardDTO, add: boolean) => void;
  wishlistEntries: WishlistEntryDTO[];
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}

// TODO convert to class and check equality of deck entry prices
export default function DeckManagerDrawer(props: DeckManagerProps) {
  // console.log("rendering deck manager")
  const [createDeckWindowOpened, setCreateDeckWindowOpened] =
    useState<boolean>(false);
  const [editDeckWindowOpened, setEditDeckWindowOpened] =
    useState<boolean>(false);
  const [copyDeckWindowOpened, setCopyDeckWindowOpened] =
    useState<boolean>(false);
  const [deleteDeckWindowOpened, setDeleteDeckWindowOpened] =
    useState<boolean>(false);
  const [compareDeckWindowOpened, setCompareDeckWindowOpened] =
    useState<boolean>(false);

  const commonCount = countCardsByRarity(props.selectedDeckEntries, "common");
  const commonLandCount = countCardsByRarity(
    filterLands(props.selectedDeckEntries),
    "common",
  );
  const uncommonCount = countCardsByRarity(
    props.selectedDeckEntries,
    "uncommon",
  );
  const uncommonLandCount = countCardsByRarity(
    filterLands(props.selectedDeckEntries),
    "uncommon",
  );
  const rareCount = countCardsByRarity(props.selectedDeckEntries, "rare");
  const rareLandCount = countCardsByRarity(
    filterLands(props.selectedDeckEntries),
    "rare",
  );
  const mythicCount = countCardsByRarity(props.selectedDeckEntries, "mythic");
  const mythicLandCount = countCardsByRarity(
    filterLands(props.selectedDeckEntries),
    "mythic",
  );

  const closeCreateDeckWindow = () => {
    setCreateDeckWindowOpened(false);
  };

  const createDeckWindowProps: CreateDeckWindowProps = {
    opened: createDeckWindowOpened,
    onClose: closeCreateDeckWindow,
    fetchDecks: props.fetchDecks,
  };

  const windows = [];
  windows.push(<CreateDeckWindow {...createDeckWindowProps} />);

  if (props.selectedDeck != null) {
    const closeEditDeckWindow = () => {
      setEditDeckWindowOpened(false);
    };

    const closeCopyDeckWindow = () => {
      setCopyDeckWindowOpened(false);
    };

    const closeDeleteDeckWindow = () => {
      setDeleteDeckWindowOpened(false);
    };

    const closeCompareDeckWindow = () => {
      setCompareDeckWindowOpened(false);
    };

    const editDeckWindowProps: EditDeckWindowProps = {
      opened: editDeckWindowOpened,
      onClose: closeEditDeckWindow,
      deck: props.selectedDeck,
      fetchDecks: props.fetchDecks,
    };

    const copyDeckWindowProps: CopyDeckWindowProps = {
      opened: copyDeckWindowOpened,
      onClose: closeCopyDeckWindow,
      deck: props.selectedDeck,
      fetchDecks: props.fetchDecks,
    };

    const deleteDeckWindowProps: DeleteDeckWindowProps = {
      opened: deleteDeckWindowOpened,
      onClose: closeDeleteDeckWindow,
      deck: props.selectedDeck,
      fetchDecks: props.fetchDecks,
    };

    const compareDeckWindowProps: CompareDeckWindowProps = {
      opened: compareDeckWindowOpened,
      onClose: closeCompareDeckWindow,
      deck: props.selectedDeck,
      decks: props.decks,
    };

    if (props.selectedDeck != null) {
      windows.push(<EditDeckWindow {...editDeckWindowProps} />);
      windows.push(<CopyDeckWindow {...copyDeckWindowProps} />);
      windows.push(<DeleteDeckWindow {...deleteDeckWindowProps} />);
      windows.push(<CompareDeckWindow {...compareDeckWindowProps} />);
    }
  }

  useEffect(() => {
    // console.log("rerendering deck manager")
  }, [props.decks]);

  const calculateMissingCopies = (entry: DeckCardEntryDTO): number => {
    const missingCopies = entry.copies - entry.card.ownedCopies;
    return missingCopies > 0 ? missingCopies : 0;
  };

  const exportDeckToCsv = () => {
    if (props.selectedDeckId !== 0) {
      const deckName = props.decks.filter(
        (deck) => deck.id === props.selectedDeckId,
      )[0].name;
      var cardsMap: string[][] = props.selectedDeckEntries.map((entry) => [
        entry.card.name,
        entry.copies.toString(),
        calculateMissingCopies(entry).toString(),
      ]);
      // filter out entries that are not missing
      cardsMap = cardsMap.filter((entry) => parseInt(entry[2]) > 0);
      exportToCsv(deckName, cardsMap, [
        "Card name",
        "copies",
        "missing copies",
      ]);
    } else {
      console.error("No deck selected");
    }
  };

  const getNumberOfCardsAtManaCost = (cmc: string): number => {
    var total = 0;
    if (cmc === "7+") {
      props.selectedDeckEntries.forEach((entry) => {
        if (entry.card.convertedManaCost >= 7) {
          total += entry.copies;
        }
      });
    } else {
      props.selectedDeckEntries.forEach((entry) => {
        if (entry.card.convertedManaCost === Number(cmc)) {
          total += entry.copies;
        }
      });
    }
    return total;
  };

  const manaCurveChartLabels = ["1", "2", "3", "4", "5", "6", "7+"];
  const manaCurveChartData = {
    labels: manaCurveChartLabels,
    datasets: [
      {
        label: "Mana Curve",
        data: manaCurveChartLabels.map((cmc) =>
          getNumberOfCardsAtManaCost(cmc),
        ),
        backgroundColor: "rgba(255, 0, 0, 0.8)",
      },
    ],
  };

  const forceUpdate = useForceUpdate();

  const setNewCommander = (entry: DeckCardEntryDTO): void => {
    if (props.selectedDeck === null) {
      return;
    }
    const currentCommanderEntries: DeckCardEntryDTO[] =
      props.selectedDeck.cardEntries.filter((entry) => entry.isCommander);
    if (currentCommanderEntries.length > 1) {
      console.error(`Deck ${props.selectedDeck.name} has multiple commanders!`);
      return;
    } else if (currentCommanderEntries.length === 0) {
      // console.log(`Deck ${props.selectedDeck.name} has no commander yet.`)
    } else if (currentCommanderEntries[0] === entry) {
      console.log(
        `${entry.card.name} is already commander of deck ${props.selectedDeck.name}!`,
      );
      return;
    } else if (currentCommanderEntries[0] !== entry) {
      console.log(
        `${currentCommanderEntries[0].card.name} is already commander of deck ${props.selectedDeck.name}! Unassigning!`,
      );
      currentCommanderEntries[0].isCommander = false;
    }
    console.log(
      `Assigning ${entry.card.name} as new commander of deck ${props.selectedDeck.name}!`,
    );
    entry.isCommander = true;
    forceUpdate();
  };

  const currentCommander = getCommander(props.selectedDeck);
  const [availableMissingCards, unavailableMissingCards] =
    numberOfCardsAvailable(props.selectedDeckEntries);

  const [isNotesOpened, setExpanded] = useState<boolean>(false);

  const toggleNotes = () => {
    setExpanded(!isNotesOpened);
  };

  const handleDeckNotesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (props.selectedDeckId === null || props.selectedDeckId === undefined) {
      throw Error("Cannot update notes when no deck is selected");
    }
    props.updateDeckNotes(event.target.value, props.selectedDeckId);
  };

  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
        PaperProps={{
          sx: {
            height: `calc(100% - ${navBarHeight}px)`,
            top: navBarHeight,
            bgcolor: "#4bb5f2",
            overflowX: "hidden",
          },
        }}
        variant="persistent"
        anchor="right"
        open={props.deckManagerOpened}
      >
        <List>
          <ListItem sx={{ ...listItemStyle, fontSize: 18 }}>
            Deck
            <IconButton
              color="inherit"
              aria-label="create-deck"
              edge="end"
              onClick={() => setCreateDeckWindowOpened(true)}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="edit-deck-metadata"
              edge="end"
              disabled={props.selectedDeckId === 0}
              onClick={() => setEditDeckWindowOpened(true)}
              sx={{
                marginLeft: "5px",
              }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="copy-deck-metadata"
              edge="end"
              disabled={props.selectedDeckId === 0}
              onClick={() => setCopyDeckWindowOpened(true)}
              sx={{
                marginLeft: "5px",
              }}
            >
              <ContentCopyIcon />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="delete-deck"
              edge="end"
              disabled={props.selectedDeckId === 0}
              onClick={() => setDeleteDeckWindowOpened(true)}
              sx={{
                marginLeft: "5px",
              }}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
          <ListItem sx={{ ...listItemStyle }}>
            <Select
              id="select-deck"
              style={searchTextFieldStyle}
              sx={{ ...buttonBackgroundStyle }}
              value={props.selectedDeckId ? props.selectedDeckId : undefined}
              renderValue={(selectedDeckId) =>
                props.selectedDeck !== null
                  ? props.selectedDeck.name
                  : "Select a deck"
              }
              onChange={props.handleChangeSelectedDeck}
            >
              {props.decks.map((deck) => {
                return renderDeckName(deck);
              })}
            </Select>
          </ListItem>

          {currentCommander !== null ? (
            <List>
              <ListItem sx={{ ...listItemStyle, fontSize: 18 }}>
                <Box>Commander: {currentCommander.name}</Box>
                <Divider />
              </ListItem>
              <ListItem
                sx={{ ...listItemStyle, fontSize: 18 }}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <CardMedia
                  sx={{
                    height: imageHeight * 0.4,
                    width: imageWidth * 0.4,
                  }}
                  style={{
                    padding: 5,
                    backgroundColor: "White",
                    borderRadius: "10px",
                  }}
                  image={
                    currentCommander.versions.filter(
                      (version) => version.isPrimaryVersion,
                    )[0].frontImageUri
                  }
                />
              </ListItem>
            </List>
          ) : (
            <></>
          )}
          <Divider />

          {props.selectedDeck != null ? (
            <Accordion
              expanded={isNotesOpened}
              onChange={toggleNotes}
              style={{
                textAlign: "center",
                marginLeft: 25,
                width: "90%",
                borderRadius: "10px",
                overflow: "hidden",
              }}
              disabled={props.selectedDeckId === null}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="deck-notes"
                style={{ minHeight: "unset", height: "30px" }}
                id="deck-notes-header"
              >
                <Typography>Notes</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  id="deck-notes-input"
                  multiline
                  value={props.selectedDeckNotes}
                  onChange={handleDeckNotesChange}
                  style={{ textAlign: "left", width: "90%", paddingRight: 0 }}
                />
              </AccordionDetails>
            </Accordion>
          ) : (
            <></>
          )}

          <Divider />
          <Box
            style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
            sx={deckEntryTextBoxStyle}
          >
            Total:{" "}
            {props.selectedDeckEntries.length > 0
              ? props.selectedDeckEntries
                  .map((entry) => entry.copies)
                  .reduce((a, b) => a + b)
              : 0}{" "}
            cards
          </Box>
          <Box
            style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
            sx={deckEntryTextBoxStyle}
          >
            {availableMissingCards > 0 || unavailableMissingCards > 0
              ? `Missing cards: ${availableMissingCards} available, ${unavailableMissingCards} unavailable`
              : ``}
          </Box>
          <Box
            style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
            sx={deckEntryTextBoxStyle}
          >
            {availableMissingCards > 0 || unavailableMissingCards > 0
              ? `Cost to complete: € ${costToFinishDeck(
                  props.selectedDeckEntries,
                ).toFixed(2)}`
              : ``}
          </Box>

          <Divider />

          <Box
            style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
            sx={deckEntryTextBoxStyle}
          >
            <RarityIcon rarity="Common" /> Commons: {commonCount}{" "}
            {commonLandCount > 0 && `(of which are lands: ${commonLandCount})`}
          </Box>
          <Box
            style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
            sx={deckEntryTextBoxStyle}
          >
            <RarityIcon rarity="Uncommon" /> Uncommons: {uncommonCount}{" "}
            {uncommonLandCount > 0 &&
              `(of which are lands: ${uncommonLandCount})`}
          </Box>
          <Box
            style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
            sx={deckEntryTextBoxStyle}
          >
            <RarityIcon rarity="Rare" /> Rares: {rareCount}{" "}
            {rareLandCount > 0 && `(of which are lands: ${rareLandCount})`}
          </Box>
          <Box
            style={{ textAlign: "left", marginLeft: 25, width: "100%" }}
            sx={deckEntryTextBoxStyle}
          >
            <RarityIcon rarity="Mythic" /> Mythic Rares: {mythicCount}{" "}
            {mythicLandCount > 0 && `(of which are lands: ${mythicLandCount})`}
          </Box>

          <Divider />

          <DevotionCountersBox entries={props.selectedDeckEntries} />

          <Bar
            style={{
              paddingLeft: 30,
              paddingRight: 30,
              color: "black",
            }}
            options={manaCurveChartOptions}
            data={manaCurveChartData}
          />
          <Divider />

          <DeckEntriesPanel
            label="Lands"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfLands}
            filterFn={filterLands}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />

          <DeckEntriesPanel
            label="Creatures"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfCreatures}
            filterFn={filterCreatures}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />

          <DeckEntriesPanel
            label="Planeswalkers"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfPlaneswalkers}
            filterFn={filterPlaneswalkers}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />

          <DeckEntriesPanel
            label="Noncreature artifacts"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfNoncreatureArtifacts}
            filterFn={filterNoncreatureArtifacts}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />

          <DeckEntriesPanel
            label="Sorceries"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfSorceries}
            filterFn={filterSorceries}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />

          <DeckEntriesPanel
            label="Instants"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfInstants}
            filterFn={filterInstants}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />

          <DeckEntriesPanel
            label="Enchantments"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfNoncreatureEnchantment}
            filterFn={filterNoncreatureEnchantments}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />

          <DeckEntriesPanel
            label="Battles"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfBattles}
            filterFn={filterBattles}
            setNewCommander={setNewCommander}
            isSideboardEntry={false}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />

          <Divider />
          <DeckEntriesPanel
            label="Sideboard"
            selectedDeckEntries={props.selectedDeckEntries}
            selectedDeck={props.selectedDeck}
            updateDeckEntries={props.updateDeckEntries}
            updateCardCopiesInDeck={props.updateCardCopiesInDeck}
            countFn={getNumberOfSideboardCards}
            filterFn={filterSideboard}
            setNewCommander={setNewCommander}
            isSideboardEntry={true}
            isCardInWishlist={props.isCardInWishlist}
            updateCardCopiesInWishlist={props.updateCardCopiesInWishlist}
            wishlistEntries={props.wishlistEntries}
          />
          <Divider />
          {props.selectedDeck ? (
            <div>
              <ListItem>
                <Button
                  color="inherit"
                  aria-label="save deck"
                  variant="contained"
                  onClick={props.saveDeck}
                  sx={{
                    ...buttonBackgroundStyle,
                    ...listItemStyle,
                  }}
                >
                  <SaveIcon /> Save Changes
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  color="inherit"
                  aria-label="compare deck"
                  variant="contained"
                  onClick={() => setCompareDeckWindowOpened(true)}
                  sx={{
                    ...buttonBackgroundStyle,
                    ...listItemStyle,
                  }}
                >
                  <SaveIcon /> Compare decks
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  color="inherit"
                  aria-label="download-deck"
                  variant="contained"
                  onClick={exportDeckToCsv}
                  sx={{
                    ...buttonBackgroundStyle,
                    ...listItemStyle,
                  }}
                >
                  <SaveAltIcon /> Download card list
                </Button>
              </ListItem>
            </div>
          ) : (
            <></>
          )}
        </List>
        {windows}
      </Drawer>
    </Box>
  );
}
