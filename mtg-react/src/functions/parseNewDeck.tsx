import { NewDeckEntryDTO } from "mtg-common";

export async function parseMTGGoldfishFile(file: File): Promise<NewDeckEntryDTO[]> {
    const fileContent = await file.text();
    const lines = fileContent.split('\n');
    const deckEntries: NewDeckEntryDTO[] = [];
  
    for (const line of lines) {
      const lineParts = line.trim().split(' ');
      const quantityStr = lineParts.shift();
      const cardName = lineParts.join(' ');
  
      if (quantityStr && cardName) {
        const quantity = parseInt(quantityStr, 10);
  
        if (!isNaN(quantity)) {
          const deckEntry: NewDeckEntryDTO = {
            quantity,
            cardName
          };
          deckEntries.push(deckEntry);
        }
      }
    }
    return deckEntries;
}