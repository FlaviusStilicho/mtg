import axios from "axios";
import { PriceInformation } from "mtg-common";

export const fetchCardBuyPriceFromScryfall = async (
  cardName: string,
): Promise<PriceInformation> => {
  const response = await axios.get(
    `https://api.scryfall.com/cards/named?exact=${cardName}`,
  );
  const data = response.data;
  if (data && data.prices && data.prices["eur"]) {
    return {
      inStock: true,
      store: "Cardmarket",
      buyPrice: data.prices["eur"],
    };
  } else {
    return {
      inStock: false,
      store: "Cardmarket",
      buyPrice: null,
    };
  }
};
