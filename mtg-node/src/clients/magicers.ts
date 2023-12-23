import axios from "axios";
import { PriceInformation } from "mtg-common";
import HTMLParser from "node-html-parser";

interface MagicersProduct {
  name: string;
  price: number;
  stock: number;
}

export const fetchCardBuyPriceFromMagicers = async (
  cardNameFull: string,
): Promise<PriceInformation> => {
  const cardName = cardNameFull
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
        return {
          inStock: false,
          store: "Magicers",
          buyPrice: null,
        };
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

      const filteredProducts = parsedProducts
        .filter((product) => product.name.split("(")[0].trim() == cardNameFull)
        .filter((product) => product.stock > 0);

      if (filteredProducts.length === 0) {
        return {
          inStock: false,
          store: "Magicers",
          buyPrice: null,
        };
      } else {
        return {
          inStock: true,
          store: "Magicers",
          buyPrice: filteredProducts
            .map((product) => product.price)
            .filter((price) => price > 0)[0],
        };
      }
    })
    .catch(function (error) {
      console.error(error);
      return {
        inStock: false,
        store: "Magicers",
        buyPrice: null,
      };
    });
};
