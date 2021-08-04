from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from datetime import datetime
import re
from urllib.parse import unquote

chrome_options = Options() # 啟動無頭模式
# chrome_options.add_argument('--headless')  #規避google bug
# chrome_options.add_argument('--disable-gpu')

def get_ras_event(url, email, password):
    driver = webdriver.Chrome(executable_path='./selenium/chromedriver.exe', chrome_options=chrome_options)

    driver.get(unquote(url))

    # login
    element = driver.find_element_by_xpath('//*[@id="userNameInput"]')
    element.send_keys(email)
    password = driver.find_element_by_xpath('//*[@id="passwordInput"]')
    password.send_keys(password)
    driver.execute_script("Login.submitLoginRequest()")

    # header
    header = driver.find_element_by_xpath('//*[@id="ContentPlaceHolder2_lbName"]')
    title = header.get_attribute('innerHTML')

    body = driver.find_element_by_xpath('//*[@id="ContentPlaceHolder2_panelDetails"]')
    desc = body.get_attribute('innerText')

    body_array = desc.split('\n')

    date_index = body_array.index('Date:')
    date_split = body_array[date_index+1].split('(')
    date = date_split[0]
    time = date_split[1].split('-')
    start = time[0].rstrip()
    end = time[1].lstrip().rstrip(')')

    start_time = datetime.strptime(date+start, '%d %B %Y, %A %H:%S %p').__str__()
    end_time = datetime.strptime(date+end, '%d %B %Y, %A %H:%S %p').__str__()

    location_index = body_array.index('Location:')
    location = body_array[location_index+1]

    online = False

    case = ['zoom', 'online', 'webinar']
    for text in case:
        if re.search(text, location, re.IGNORECASE):
            online = True

    data = {
        'title' : title,
        'desc' : "\n".join(body_array[2:date_index+2]),
        'start_time': start_time,
        'end_time': end_time,
        'location': location,
        'online': online
    }
    driver.close()
    return data

