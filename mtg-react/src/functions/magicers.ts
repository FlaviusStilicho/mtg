import axios from 'axios';
import { MTGCardDTO } from '../../../mtg-common/src/DTO';
import HTMLParser from 'node-html-parser';

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

        return parsedProducts.filter(product => product.name.startsWith(card.name) && !product.name.includes('Emblem'))
            .filter(product => product.stock > 1)
            .map(product => product.price)
            .filter(price => price > 0);
    });
};

export const fetchCardBuyPriceFromMagicersSingle = async (card: MTGCardDTO): Promise<number | undefined> => {
    if (card.name === 'Island' || card.name === 'Swamp' || card.name === 'Forest' || card.name === 'Plains' || card.name === 'Mountain') {
        return 0
    }
    return await fetchCardBuyPriceFromMagicers(card).then((prices: number[]) => {
        if (prices.length === 0) {
            return (undefined)
        } else if (prices.length === 1) {
            return prices[0]
        } else {
            return Math.min(...prices)
        }
    })
}


export const fetchCardBuyPriceFromMagickast = async (card: MTGCardDTO): Promise<number[]> => {
    const cardName = card.name

    return await axios.get(`https://magickast.nl/cards/search/${cardName}`).then(async (response) => {
        const root = HTMLParser.parse(response.data);
        console.log(root)
        const tokenElement = root.querySelector('meta[name="csrf-token"]')
        if(tokenElement === null){
            console.error("Couldn't fetch Magickast CSRF token")
            return []
        }
        const csrfToken = tokenElement['rawAttributes']['content']
        console.log(csrfToken)

        var bodyFormData = new FormData();
        bodyFormData.append('search', cardName);
        bodyFormData.append('_token', csrfToken);
    
        return await axios.post(`https://magickast.nl/cards/ajax/index?page=1`, {
            data: bodyFormData,
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "referer": `https://magickast.nl/cards/search/${cardName}`
        }}).then(response => {
            const root = HTMLParser.parse(response.data);
            console.log(root)
            // TODO: Continue here. Request gives a session expired error. Session token is called magickast_session. Perhaps it's embedd in html.
            return []
        })
    })
};

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