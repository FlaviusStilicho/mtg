import { Request, Response } from "express";
import {
  AddCategory,
  MTGCard,
  RemoveCategory,
  Update,
} from "../entity/MTGCard.entity.ts";
import { logger } from "../index.ts";
import {
  MTGCardDTO,
  CardQueryParameters,
  UpdateCardOwnedCopiesQueryParams,
  PriceInformation,
} from "mtg-common";

import { MTGCardRepository } from "../repository/MTGCard.repository.ts";
import { fetchCardBuyPriceFromMagicers } from "../clients/magicers.ts";
import { fetchCardBuyPriceFromMagickast } from "../clients/magickast.ts";

interface GetCardsQueryParams {
  take: number;
  page: number;
  query: CardQueryParameters;
}

export const GetCards = async (
  req: Request<{}, {}, {}, GetCardsQueryParams>,
  res: Response,
) => {
  try {
    const take = Number(req.query.take) || 25;
    const page = Number(req.query.page) || 1;

    const [data, total] = await MTGCard.Query(take, page, {
      ...req.query.query,
    });

    const cards: MTGCardDTO[] = data.map((card) => {
      return card.toDTO();
    });

    logger.info(`cards found: ${cards.length}, page: ${page}, total: ${total}`);
    res.send({
      cards: cards,
      page,
      last_page: Math.ceil(total / take),
    });
  } catch (err) {
    res.status(400).send({
      cards: [],
      error: err,
    });
  }
};

export const UpdateCard = async (req: Request, res: Response) => {
  await Update(req.body.id, req.body.data);

  logger.debug(`Card ${req.body.id} successfully updated!`);
  res.sendStatus(200);
};

export const UpdateCardOwnedCopies = async (
  req: Request<{}, {}, UpdateCardOwnedCopiesQueryParams, {}>,
  res: Response,
) => {
  const card = await MTGCardRepository.findOneById(req.body.cardId);
  logger.info(
    `Updating ownedCopies of card ${card.name} from ${card.ownedCopies} to ${req.body.ownedCopies}`,
  );
  card.ownedCopies = req.body.ownedCopies;
  await MTGCardRepository.saveCard(card);
};

export const GetCardPrice = async (req: Request, res: Response) => {
  const cardName: string = req.params.cardName.replace("--", "//");
  logger.info(`Fetching buy price for ${cardName}`);

  const magicersPrice = await fetchCardBuyPriceFromMagicers(cardName);
  const magickastPrice = await fetchCardBuyPriceFromMagickast(cardName);
  // const scryfallPrice = await fetchCardBuyPriceFromScryfall(card);

  res.send([magicersPrice, magickastPrice]);
};

export const AddCardCategory = async (req: Request, res: Response) => {
  await AddCategory(req.body.cardId, req.body.category);
  res.sendStatus(200);
};

export const RemoveCardCategory = async (req: Request, res: Response) => {
  await RemoveCategory(req.body.cardId, req.body.category);
  res.sendStatus(200);
};
