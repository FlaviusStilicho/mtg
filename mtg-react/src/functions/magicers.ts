import axios from 'axios';
import { MTGCardDTO } from '../../../mtg-common/src/DTO';
import HTMLParser from 'node-html-parser';
import { numberFormat } from '../constants';

interface MagicersProduct {
    name: string
    price: number
    stock: number
}

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
        const parsedNodes: object[] = []
        root.childNodes.forEach((node: any) => {
            if ('rawAttributes' in node) {
                if (node.rawAttributes['id'].startsWith('product_name') |
                    node.rawAttributes['id'].startsWith('product_price_incl') |
                    node.rawAttributes['id'].startsWith('product_stock')) {
                    parsedNodes.push(node)
                }
            }
        });
        if (parsedNodes.length % 3 !== 0) {
            console.error('Unable to parse prices, unexpected number of nodes!')
            return []
        }
        const parsedProducts: MagicersProduct[] = [];
        for (let i = 0; i < parsedNodes.length; i += 3) {
            const productNameNode: any = parsedNodes[i]
            const priceNode: any = parsedNodes[i + 1]
            const stockNode: any = parsedNodes[i + 2]
            parsedProducts.push({
                name: productNameNode['rawAttributes']['value'],
                price: Number(priceNode['rawAttributes']['value'].replace(",", ".")),
                stock: Number(stockNode['rawAttributes']['value'])
            })
        }

        // console.log(parsedProducts)
        return parsedProducts.filter(product => product.name.startsWith(card.name))
            .filter(product => product.stock > 1)
            .map(product => product.price)
            .filter(price => price > 0);
    });
};

export const fetchCardBuyPriceFromMagicersAsString = async (card: MTGCardDTO): Promise<string> => {
    if (card.name === 'Island' || card.name === 'Swamp' || card.name === 'Forest' || card.name === 'Plains' || card.name === 'Mountain') {
        return numberFormat.format(0)
    }
    return await fetchCardBuyPriceFromMagicers(card).then((prices: number[]) => {
        if (prices.length === 0) {
            return ("NA")
        } else if (prices.length === 1) {
            return (`${numberFormat.format(prices[0])}`)
        } else {
            const lowest = numberFormat.format(Math.min(...prices))
            // const highest = numberFormat.format(Math.max(...prices))
            // if (lowest === highest) {
            return lowest
            // } else {
            // return (`${lowest} - ${highest}`)
            // }
        }
    })
}