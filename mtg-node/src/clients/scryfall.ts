import axios from "axios";
import { MTGCardDTO } from "mtg-common";

export const fetchCardBuyPriceFromScryfall = async (
  card: MTGCardDTO,
): Promise<number | undefined> => {
  const response = await axios.get(
    `https://api.scryfall.com/cards/named?exact=${card.name}`,
  );
  const data = response.data;
  // console.log(data)
  if (data && data.prices && data.prices["eur"]) {
    // console.log(data.prices['eur']);
    return data.prices["eur"];
  } else {
    return undefined;
  }
};
