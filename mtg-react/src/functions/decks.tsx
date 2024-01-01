import axios from "axios";
import { DeckDTO, ListDecksResponse, NewDeckEntryDTO } from "mtg-common";

export async function fetchDecks(): Promise<DeckDTO[]> {
  return await axios.get(`http://localhost:8000/decks/`).then((response) => {
    const data: ListDecksResponse = response.data;
    const decks = data.decks;
    decks.forEach((deck) => {
      if (deck["cardEntries"] === undefined) deck["cardEntries"] = [];
    });
    console.log("completed fetching decks");
    return decks;
  });
}

export async function parseMTGGoldfishFile(
  file: File,
): Promise<NewDeckEntryDTO[]> {
  const fileContent = await file.text();
  const lines = fileContent.split("\n");
  const deckEntries: NewDeckEntryDTO[] = [];

  for (const line of lines) {
    const lineParts = line.trim().split(" ");
    const quantityStr = lineParts.shift();
    const cardName = lineParts.join(" ");

    if (quantityStr && cardName) {
      const quantity = parseInt(quantityStr, 10);

      if (!isNaN(quantity)) {
        const deckEntry: NewDeckEntryDTO = {
          quantity,
          cardName,
        };
        deckEntries.push(deckEntry);
      }
    }
  }
  return deckEntries;
}
