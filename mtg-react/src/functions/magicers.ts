import axios from 'axios';
import { MTGCardDTO } from '../../../mtg-common/src/DTO';
import HTMLParser from 'node-html-parser';
import { numberFormat } from '../constants';


export const fetchCardBuyPriceFromMagicers = async (card: MTGCardDTO): Promise<number[]> => {
    const cardName = card.name
        .replaceAll(" ", "-")
        .replaceAll(",", "")
        .replaceAll("'", "");
    return await axios.post('https://www.magicers.nl/inc/ajax_public/productlist.php',
        `action=show&mode=search&db_title=${cardName}&db_stock=0`, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    }).then(response => {
        const root = HTMLParser.parse(response.data);

        var prices: number[] = [];
        root.childNodes.forEach((node: any) => {
            if ('rawAttributes' in node) {
                if (node.rawAttributes['id'].startsWith('product_price_incl')) {
                    const price = Number(node.rawAttributes['value'].replace(",", "."));
                    if (price > 0) {
                        prices.push(price);
                    }
                }
            }
        });
        return prices;
    });
};

export const fetchCardBuyPriceFromMagicersAsString = async (card: MTGCardDTO): Promise<string> => {
    return await fetchCardBuyPriceFromMagicers(card).then((prices: number[]) => {
        if (prices.length === 0) {
            return ("-")
        } else if (prices.length === 1) {
            return (`${numberFormat.format(prices[0])}`)
        } else {
            const lowest = numberFormat.format(Math.min(...prices))
            const highest = numberFormat.format(Math.max(...prices))
            return (`${lowest} - ${highest}`)
        }
    })
}