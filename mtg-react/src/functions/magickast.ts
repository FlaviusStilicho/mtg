import axios from 'axios';
import { MTGCardDTO } from 'mtg-common';
import { parse, HTMLElement } from 'node-html-parser';

const SEARCH_URL = 'https://www.magickast.nl/cards/ajax/index?page=1';


export const fetchCardBuyPriceFromMagickast = async (card: MTGCardDTO): Promise<number[]> => {
    const cardName = card.name
    const { csrfToken, cookies } = await parseTokens();
    const cardEntries = await searchForCards(cardName, csrfToken, cookies);
  
    const prices: number[] = [];

    for (const entry of cardEntries) {
      const price = parseCardEntry(entry, cardName);
      if (price) {
        prices.push(price);
      }
    }
  
    return prices;
};

async function parseTokens(): Promise<{ csrfToken: string; cookies: string }> {
    const options = {
        url: 'https://magickast.nl',
        headers: {
          'User-Agent': navigator.userAgent,
        },
      };
      
      const response = await axios.request(options);
    // const response = await axios.get('https://magickast.nl', {
    //   headers: {
    //     'User-Agent': navigator.userAgent,
    //   },
    // });
  
    const root = parse(response.data);
    const csrfToken = root.querySelector('meta[name="csrf-token"]')!.getAttribute('content') ?? '';
    var cookieHeader: string | string[] = response.headers?.['set-cookie'] ?? '';
    if (Array.isArray(cookieHeader)) {
        cookieHeader = cookieHeader.join(';');
    }
    const cookies = getCookies(cookieHeader);
    return { csrfToken, cookies };
  }

function getCookies(cookie: string) {
    console.log(cookie)
    const sessionTokenMatch = cookie.match(/magickast_session=([^;]+)/);
    const xsrfTokenMatch = cookie.match(/XSRF-TOKEN=([^;]+)/);
    console.log(sessionTokenMatch)
    console.log(xsrfTokenMatch)
    return `XSRF-TOKEN=${xsrfTokenMatch![1]};magickast_session=${sessionTokenMatch![1]}`;
}
  
async function searchForCards(cardName: string, csrfToken: string, cookies: string): Promise<HTMLElement[]> {
    const form_data = `_token=${csrfToken}&loader_id=1&&foilages%5B%5D=nonfoil&search=${cardName.replace(' ', '+')}`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': cookies,
      'User-Agent': navigator.userAgent,
    };
    const response = await axios.post(SEARCH_URL, form_data, {
      headers,
    });
  
    const root = parse(response.data);
    const rows: HTMLElement[] = root.querySelectorAll('tbody tr');
    return Array.from(rows);
}
  
function parseCardEntry(entry: HTMLElement, cardName: string): number | null {
    const cardNameElement = entry.querySelector('a.image-hover');
    const rawCardName = cardNameElement ? cardNameElement.textContent?.toLowerCase() : "N/A";
    const cleanedCardName = rawCardName?.split(' //')[0];
  
    if (cleanedCardName !== cardName) {
      return  null;
    }
  
    const priceElement = entry.querySelector('td.text-end');

    const priceRaw = priceElement?.textContent;
    const price = parseFloat(priceRaw!.substring(1).replace(',', '.'));
  
    const buttonElement = entry.querySelector('button.btn-basket.btn.btn-primary');
    const inStock = buttonElement ? true : false;
    if(inStock) {
        return price;
    } else {
        return null;
    }
}

export const fetchCardBuyPriceFromMagickastSingle = async (card: MTGCardDTO): Promise<number | undefined> => { 
    if (card.name === 'Island' || card.name === 'Swamp' || card.name === 'Forest' || card.name === 'Plains' || card.name === 'Mountain') {
        return 0
    }
    return await fetchCardBuyPriceFromMagickast(card).then((prices: number[]) => {
        if (prices.length === 0) {
            return (undefined)
        } else if (prices.length === 1) {
            return prices[0]
        } else {
            return Math.min(...prices)
        }
    })    
}