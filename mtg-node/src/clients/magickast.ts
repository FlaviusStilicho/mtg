import axios from "axios";
import { PriceInformation } from "mtg-common";
import { parse, HTMLElement } from "node-html-parser";

const SEARCH_URL = "https://www.magickast.nl/cards/ajax/index?page=1";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0";

export const fetchCardBuyPriceFromMagickast = async (
  cardName: string,
): Promise<PriceInformation> => {
  const { csrfToken, cookies } = await parseTokens();
  const cardEntries = await searchForCards(cardName, csrfToken, cookies);

  const prices: number[] = [];

  for (const entry of cardEntries) {
    const price = parseCardEntry(entry, cardName);
    if (price) {
      prices.push(price);
    }
  }

  return {
    inStock: prices.length > 0,
    store: "Magickast",
    buyPrice: prices.length > 0 ? Math.min(...prices) : null,
  };
};

async function parseTokens(): Promise<{ csrfToken: string; cookies: string }> {
  const options = {
    url: "https://magickast.nl",
    headers: {
      "User-Agent": USER_AGENT,
    },
  };

  const response = await axios.request(options);

  const root = parse(response.data);
  const csrfToken =
    root.querySelector('meta[name="csrf-token"]')!.getAttribute("content") ??
    "";
  var cookieHeader: string | string[] = response.headers?.["set-cookie"] ?? "";
  if (Array.isArray(cookieHeader)) {
    cookieHeader = cookieHeader.join(";");
  }
  const cookies = getCookies(cookieHeader);
  return { csrfToken, cookies };
}

function getCookies(cookie: string) {
  console.log(cookie);
  const sessionTokenMatch = cookie.match(/magickast_session=([^;]+)/);
  const xsrfTokenMatch = cookie.match(/XSRF-TOKEN=([^;]+)/);
  console.log(sessionTokenMatch);
  console.log(xsrfTokenMatch);
  return `XSRF-TOKEN=${xsrfTokenMatch![1]};magickast_session=${
    sessionTokenMatch![1]
  }`;
}

async function searchForCards(
  cardName: string,
  csrfToken: string,
  cookies: string,
): Promise<HTMLElement[]> {
  const form_data = `_token=${csrfToken}&loader_id=1&&foilages%5B%5D=nonfoil&search=${cardName.replace(
    " ",
    "+",
  )}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Cookie: cookies,
    "User-Agent": USER_AGENT,
  };
  const response = await axios.post(SEARCH_URL, form_data, {
    headers,
  });

  const root = parse(response.data);
  const rows: HTMLElement[] = root.querySelectorAll("tbody tr");
  return Array.from(rows);
}

function parseCardEntry(entry: HTMLElement, cardName: string): number | null {
  const cardNameElement = entry.querySelector("a.image-hover");
  const rawCardName = cardNameElement
    ? cardNameElement.textContent?.trim()
    : "N/A";

  if (rawCardName !== cardName) {
    return null;
  }

  const priceElement = entry.querySelector("td.text-end");

  const priceRaw = priceElement?.textContent;
  const price = parseFloat(priceRaw!.trim().substring(1).replace(",", "."));

  const buttonElement = entry.querySelector(
    "button.btn-basket.btn.btn-primary",
  );
  const inStock = buttonElement ? true : false;
  if (inStock) {
    return price;
  } else {
    return null;
  }
}
