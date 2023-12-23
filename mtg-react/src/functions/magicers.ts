import axios from "axios";
import { MTGCardDTO, PriceInformation, Store } from "mtg-common";
import HTMLParser from "node-html-parser";
import { fetchCardBuyPriceFromMagickastSingle } from "./magickast";

interface MagicersProduct {
  name: string;
  price: number;
  stock: number;
}

export const fetchCardBuyPriceFromMagicers = async (
  card: MTGCardDTO,
): Promise<number[]> => {
  const cardName = card.name
    .replaceAll(" ", "-")
    .replaceAll(",", "")
    .replaceAll("'", "");
  return await axios
    .post(
      "https://www.magicers.nl/inc/ajax_public/productlist.php",
      `action=show&mode=search&db_title=${cardName}&db_stock=0`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      },
    )
    .then((response) => {
      const root = HTMLParser.parse(response.data);
      const parsedNodes: object[] = [];
      root.childNodes.forEach((node: any) => {
        if ("rawAttributes" in node) {
          if (
            node.rawAttributes["id"].startsWith("product_name") |
            node.rawAttributes["id"].startsWith("product_price_incl") |
            node.rawAttributes["id"].startsWith("product_stock")
          ) {
            parsedNodes.push(node);
          }
        }
      });
      if (parsedNodes.length % 3 !== 0) {
        console.error("Unable to parse prices, unexpected number of nodes!");
        return [];
      }
      const parsedProducts: MagicersProduct[] = [];
      for (let i = 0; i < parsedNodes.length; i += 3) {
        const productNameNode: any = parsedNodes[i];
        const priceNode: any = parsedNodes[i + 1];
        const stockNode: any = parsedNodes[i + 2];
        parsedProducts.push({
          name: productNameNode["rawAttributes"]["value"],
          price: Number(priceNode["rawAttributes"]["value"].replace(",", ".")),
          stock: Number(stockNode["rawAttributes"]["value"]),
        });
      }

      return parsedProducts
        .filter(
          (product) =>
            product.name.startsWith(card.name) &&
            !product.name.includes("Emblem"),
        )
        .filter((product) => product.stock > 1)
        .map((product) => product.price)
        .filter((price) => price > 0);
    })
    .catch(function (error) {
      console.error(error);
      return [];
    });
};

export const fetchCardBuyPriceFromMagicersSingle = async (
  card: MTGCardDTO,
): Promise<number | undefined> => {
  if (
    card.name === "Island" ||
    card.name === "Swamp" ||
    card.name === "Forest" ||
    card.name === "Plains" ||
    card.name === "Mountain"
  ) {
    return 0;
  }
  return await fetchCardBuyPriceFromMagicers(card).then((prices: number[]) => {
    if (prices.length === 0) {
      return undefined;
    } else if (prices.length === 1) {
      return prices[0];
    } else {
      return Math.min(...prices);
    }
  });
};

export const fetchCardBuyPrice = async (
  card: MTGCardDTO,
): Promise<PriceInformation | null> => {
  console.log("Fetching buy price for " + card.name);
  const magicersPrice = await fetchCardBuyPriceFromMagicersSingle(card);
  // const magickastPrice = await fetchCardBuyPriceFromMagickastSingle(card);
  // const scryfallPrice = await fetchCardBuyPriceFromScryfall(card);

  const prices: number[] = [];
  if (magicersPrice) {
    prices.push(magicersPrice);
  }
  // if (magickastPrice) {
  //     prices.push(magickastPrice);
  // }
  // if (scryfallPrice) {
  //     prices.push(scryfallPrice);
  // }

  const lowestPrice = Math.min(...prices);

  if (lowestPrice === magicersPrice) {
    return {
      buyPrice: lowestPrice,
      store: Store.MAGICERS,
    };
  }
  // else if (lowestPrice === magickastPrice) {
  //     return {
  //         buyPrice: lowestPrice,
  //         store: Store.MAGICKAST
  //     }
  // }
  // else if (lowestPrice === scryfallPrice) {
  //     return {
  //         buyPrice: lowestPrice,
  //         store: Store.SCRYFALL
  //     }
  // }
  else {
    return null;
  }
};
