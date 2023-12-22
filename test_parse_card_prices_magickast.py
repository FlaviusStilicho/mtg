import re
import requests
from bs4 import BeautifulSoup as BS

SEARCH_URL = 'https://www.magickast.nl/cards/ajax/index?page=1'
USER_AGENT='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'

def get_card_price_magickast(card_name):
    card_name = card_name.split(' //')[0].lower()
    csrf_token, cookies = parse_tokens()
    card_entries = search_for_cards(card_name, csrf_token, cookies)

    prices = []
    for entry in card_entries:
        in_stock, price = parse_card_entry(entry, card_name)
        if in_stock: 
            prices.append(price)

    if len(prices) == 0:
        return ('no stock', '-', '-')
    else:
        min_price = min(prices)
        avg_price = sum(prices) / len(prices)
        return ('in stock', str(round(avg_price, 3)), str(min_price))
  
  
def parse_tokens():
    response = requests.get(f"https://magickast.nl", headers={
        'User-Agent': USER_AGENT
    })

    soup = BS(response.content, 'html.parser')
    csrf_meta_tag=soup.find('meta', {'name': 'csrf-token'})
    csrf_token = csrf_meta_tag['content']
    cookies = get_cookies(response.headers.get('Set-Cookie'))
    return csrf_token, cookies
  
  
def get_cookies(cookie):
    session_token_match = re.search(r"magickast_session=([^;]+)", cookie)
    xsrf_token_match = re.search(r"XSRF-TOKEN=([^;]+)", cookie)
    return f"XSRF-TOKEN={xsrf_token_match.group(1)};magickast_session={session_token_match.group(1)}"


def search_for_cards(card_name, csrf_token, cookies):
    form_data = f"_token={csrf_token}&loader_id=1&&foilages%5B%5D=nonfoil&search={card_name.replace(' ', '+')}"
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': cookies,
        'User-Agent': USER_AGENT,
    }
    response=requests.post(SEARCH_URL, headers=headers,data=form_data)

    soup = BS(response.content, 'html.parser')

    tbody = soup.find('tbody')
    rows = tbody.find_all('tr')
    return rows
    

def parse_card_entry(entry, card_name):
    soup=BS(str(entry), 'html.parser')

    card_name_element = soup.find('a', class_='image-hover')
    raw_card_name = card_name_element.get_text(strip=True).lower() if card_name_element else "N/A"
    raw_card_name = raw_card_name.split(' //')[0]

    if not raw_card_name == card_name:
        return False, None

    price_element = soup.find('td', class_='text-end')
    price_raw = price_element.get_text(strip=True)
    price = float(price_raw[1:].replace(',', '.'))

    button_element = soup.find('button', class_='btn-basket btn btn-primary')
    in_stock = bool(button_element)

    return in_stock, price

print(get_card_price_magickast("Atraxa, Praetors' Voice"))