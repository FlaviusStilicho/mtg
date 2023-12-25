import axios from "axios";
import { PriceInformation } from "../../../mtg-common/dist/DTO";

export const fetchCardPrice = async (
  cardName: string,
): Promise<PriceInformation[]> => {
  return await axios.get(`http://localhost:8000/price/${cardName.replace("//", "--")}`).then((res) => res.data);
};

export const getLowestCardPrice = (
  priceInformation: PriceInformation[],
): number | null => {
  if (priceInformation === undefined || priceInformation.length === 0) {
    return null;
  }

  const inStock: PriceInformation[] = priceInformation.filter(
    priceInfo => priceInfo.inStock,
  );
  const hasPrice: PriceInformation[] = inStock.filter(
    priceInfo => priceInfo.buyPrice !== null,
  );
  const prices: number[] = hasPrice.map((info) => info.buyPrice!);
  if (prices.length === 0) {
    return null;
  } else {
    console.log("Lowest price: " + Math.min(...prices));
    return Math.min(...prices);
  }
};

export const getLowestCardPriceStr = (
  priceInformation: PriceInformation[],
): string => {
  const price: number | null = getLowestCardPrice(priceInformation);
  return price == null ? "N/A" : `€ ${price}`;
};

export const isCardInStock = (
  priceInformation: PriceInformation[],
): boolean => {
  if (!priceInformation || priceInformation.length === 0) {
    return false;
  }
  const inStock: PriceInformation[] = priceInformation.filter(
    (priceInfo) => priceInfo.inStock,
  );
  return inStock.length > 0;
};

export const sortPriceInfo = (a: PriceInformation, b: PriceInformation) => {
  if (a.inStock && !b.inStock) {
    return -1;
  } else if (!a.inStock && b.inStock) {
    return 1;
  } else {
    if (a.buyPrice && !b.buyPrice) {
      return -1;
    } else if (!a.buyPrice && b.buyPrice) {
      return 1;
    } else if (a.buyPrice && b.buyPrice) {
      return a.buyPrice - b.buyPrice;
    } else {
      return a.store.localeCompare(b.store);
    }
  }
};