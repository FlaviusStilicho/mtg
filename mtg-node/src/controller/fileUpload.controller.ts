import { Request, Response } from "express";
import multer from "multer";
import { extname } from "path";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { MTGCard } from "../entity/MTGCard.entity.ts";
import { logger } from "../index.ts";
import { MTGCardRepository } from "../repository/MTGCard.repository.ts";

export const UploadDelverFile = async (req: Request, res: Response) => {
  try {
    await ProcessdDelverFile(req, res, false);
  } catch (error) {
    res.status(500).send("An error occurred processing the file");
  }
};

export const UploadDelverFileAdditive = async (req: Request, res: Response) => {
  try {
    await ProcessdDelverFile(req, res, true);
  } catch (error) {
    res.status(500).send("An error occurred processing the file");
  }
};

interface ParsedCollectionEntry {
  cardName: string;
  quantity: number;
}

export const ProcessdDelverFile = async (
  req: Request,
  res: Response,
  additive: boolean
) => {
  logger.info(`Processing uploaded Delver file! additive=${additive}`);

  const storage = multer.diskStorage({
    destination: "./uploads/delver/",
    filename(_, file, callback) {
      if (file) {
        const randomName = Math.random().toString(20).substr(2, 12);
        return callback(null, `${randomName}${extname(file.originalname)}`);
      } else {
        return callback(new Error("File is undefined"), null);
      }
    },
  });
  const processFile = multer({ storage }).single("csv");

  processFile(req, res, (err) => {
    if (!err) {
    //   const cards: MTGCard[] = [];
      var cardNameColumn: number = null;
      var quantityColumn: number = null;
      const parsedCollectionEntries: ParsedCollectionEntry[] = [];

      const reader = createInterface({
        input: createReadStream(`./uploads/delver/${req.file.filename}`),
      });

      reader.on("line", async function (line: string) {
        const row: string[] = line
          .split(",")
          .map((value) => value.replace(/^"(.*)"$/, "$1"));

        // Parse the first row and find the Name and Quantity columns
        if (!cardNameColumn) {
          const columns = parseHeader(row);
          cardNameColumn = columns.cardNameColumn;
          quantityColumn = columns.quantityColumn;
        } else {
          const cardCopies = parseInt(row[quantityColumn]);
          var cardName = row[cardNameColumn];
          if (cardName.includes(" //")) {
            // Occurs for doublesided cards
            cardName = cardName.substring(cardName.indexOf(" //") - 1);
          }
          parsedCollectionEntries.push({
            cardName: cardName,
            quantity: cardCopies,
          });
        }
      });

      reader.on("close", async () => {
        const promises: Promise<string>[] = parsedCollectionEntries.map(async (entry) => {
          return await MTGCardRepository.findOneByName(entry.cardName)
            .then(async (card) => {
              card.ownedCopies = additive
                ? card.ownedCopies + entry.quantity
                : entry.quantity;
              await MTGCardRepository.saveCard(card);
            //   cards.push(card);
              if (additive) {
                return `Increased number of owned copies for card '${entry.cardName}' by ${entry.quantity} to ${card.ownedCopies}`;
              } else {
                return `Set number of owned copies for card '${entry.cardName}' to ${card.ownedCopies}`;
              }
            })
            .catch((err) => {
              return `Error updating quantity for card '${entry.cardName}': ${err}`;
            });
        });

        const resultSet = await Promise.all(promises);
        logger.info(resultSet.join("\n"));
        res.send({
          result: resultSet,
        });
      });

    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      logger.error("Uploaded file has unexpected key");
      return res.sendStatus(400);
    } else {
      logger.error(err);
      return res.sendStatus(400);
    }
  });
};

function parseHeader(row: string[]): {
  cardNameColumn: number | null;
  quantityColumn: number | null;
} {
  let cardNameColumn: number | null = null;
  let quantityColumn: number | null = null;

  for (let i = 0; i < row.length; i++) {
    if (row[i] === "Name") {
      cardNameColumn = i;
      logger.info("Name column found");
    }
    if (row[i] === "Quantity") {
      quantityColumn = i;
      logger.info("Quantity column found");
    }
  }

  return { cardNameColumn, quantityColumn };
}
