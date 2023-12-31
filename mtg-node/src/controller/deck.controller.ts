import { Request, Response } from "express";
import { Deck, DeckCardEntry } from "../entity/Deck.entity.ts";
import {
  CheckDeckRequest,
  CreateDeckResponse,
  DeleteDeckRequest,
  GetDeckRequest,
  DeckMetadata,
  ListDecksResponse,
  ListDeckNamesResponse,
  DeckDTO,
} from "mtg-common";
import { DeckRepository } from "../repository/Deck.repository.ts";
import { logger } from "../index.ts";
import { DeckCardEntryRepository } from "../repository/DeckCardEntry.repository.ts";
import { CopyDeckRequest } from "mtg-common";
import { UploadDeckDTO } from "mtg-common";
import { MTGCardRepository } from "../repository/MTGCard.repository.ts";

var DECK_CACHE = [];

export const ListDecks = async (
  req: Request,
  res: Response<ListDecksResponse>,
) => {
  if (DECK_CACHE.length > 0) {
    res.send({
      decks: DECK_CACHE,
      total: DECK_CACHE.length,
    });
  } else {
    await DeckRepository.findAndCount().then((result) => {
      const decks = result[0].map((deck) => deck.toDTO());
      const total = result[1];
      logger.info(`Found ${total} decks.`);
      res.send({
        decks,
        total,
      });
    });
  }
};

export const ListDeckNames = async (
  req: Request,
  res: Response<ListDeckNamesResponse>,
) => {
  await DeckRepository.findAndCount().then((result) => {
    const decks: DeckMetadata[] = result[0].map((deck) => {
      const metaData: DeckMetadata = {
        id: deck.id,
        name: deck.name,
        totalCards: deck.totalCards(),
      };
      return metaData;
    });
    const total = result[1];
    res.send({
      decks,
      total,
    });
  });
};

export const CreateDeck = async (
  req: Request<{}, {}, DeckDTO, {}>,
  res: Response<CreateDeckResponse>,
) => {
  Deck.fromDTO(req.body)
    .then((deck) =>
      DeckRepository.save(deck).then((deck) => {
        logger.info(`Created new deck ${deck.name} with id ${deck.id}`);
        res.send({ id: deck.id });
      }),
    )
    .catch((err) => res.status(400).send(err.toString()));
};

export const DeleteDeck = async (
  req: Request<{}, {}, {}, DeleteDeckRequest>,
  res: Response,
) => {
  const deckId = req.query.id;
  await DeckCardEntryRepository.createQueryBuilder()
    .delete()
    .from(DeckCardEntry)
    .where("deckId = :deckId", { deckId })
    .execute();

  DeckRepository.delete(deckId)
    .then((_) => {
      logger.info(`Deleted deck with id ${deckId}`);
      res.sendStatus(200);
    })
    .catch((err) => {
      logger.error(err);
      res.sendStatus(404);
    });
};

export const ClearDecks = async (
  req: Request<{}, {}, {}, {}>,
  res: Response,
) => {
  DeckRepository.clear().then(() => {
    logger.info(`Cleared all decks!`);
    res.sendStatus(200);
  });
};

export const GetDeck = async (
  req: Request<{}, {}, {}, GetDeckRequest>,
  res: Response<DeckDTO>,
) => {
  DeckRepository.findOneByOrFail({ id: req.query.id })
    .then((deck) => {
      logger.info(`Found deck ${deck.name}.`);
      res.send(deck.toDTO());
    })
    .catch(() => res.sendStatus(404));
};

export const UpdateDeck = async (
  req: Request<{}, {}, DeckDTO, {}>,
  res: Response,
) => {
  DECK_CACHE = [];

  Deck.fromDTO(req.body).then((deck) =>
    DeckRepository.save(deck).then((deck) => {
      logger.info(`Saved changes to deck ${deck.name}.`);
      res.sendStatus(200);
    }),
  );
};

export const CopyDeck = async (
  req: Request<{}, CopyDeckRequest, {}>,
  res: Response,
) => {
  DeckRepository.findOneByOrFail({ id: req.body["deckId"] })
    .then((deckInDb) => {
      const deckCopy = deckInDb.copy(req.body["name"]);
      DeckRepository.save(deckCopy).then((newDeck) => {
        DeckCardEntryRepository.save(newDeck.cardEntries).then((result) => {
          logger.info(
            `Copied deck ${deckInDb.name}. New deck has id ${newDeck.id} and name ${req.body["name"]}`,
          );
          res.send({ id: newDeck.id });
        });
      });
    })
    .catch(() => res.sendStatus(404));
};

export const CheckDeck = async (
  req: Request<{}, {}, {}, CheckDeckRequest>,
  res: Response,
) => {
  const [valid, message] = await DeckRepository.findOneByOrFail({
    id: req.query.id,
  }).then((deck) => deck.isValid());
  const responseBody = {
    valid: valid,
  };
  if (message) responseBody["message"] = message;
  res.send(responseBody);
};

export const UploadDeck = async (
  req: Request<{}, {}, UploadDeckDTO, {}>,
  res: Response<CreateDeckResponse>,
) => {
  const dto: UploadDeckDTO = req.body;
  const entries: DeckCardEntry[] = await Promise.all(
    dto.entries.map((entry) =>
      MTGCardRepository.findOneByName(entry.cardName).then(
        (card) => new DeckCardEntry(null, card, entry.quantity, 0, false),
      ),
    ),
  );

  const deck = new Deck(null, dto.name, null, dto.format, entries, false);
  DeckRepository.save(deck)
    .then((newDeck) => {
      deck.cardEntries.map((entry) => (entry.deck = newDeck));
      DeckCardEntryRepository.save(deck.cardEntries).then((result) => {
        logger.info(`Created new deck ${deck.name} with id ${deck.id}`);
        res.send({ id: deck.id });
      });
    })
    .catch((err) => res.status(400).send(err.toString()));
};
