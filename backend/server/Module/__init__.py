from flask import Flask
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin

# firebase 
import firebase_admin
from firebase_admin import initialize_app
from firebase_admin import credentials
from firebase_admin import auth
from firebase_admin import firestore

# .env
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
app.link_email = os.getenv("LINK_EMAIL")
app.link_password = os.getenv("LINK_PASSWORD")

CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app, supports_credentials=True, resources={
    r"/*" :{
        "origins" : "*"
    }
})

# mysql + phpmyadmin
app.config['MYSQL_HOST'] = "host.docker.internal"
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'fyp'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
app.config['MYSQL_CHARSET'] = 'utf8mb4'

mysql = MySQL(app)

# firebase
cred = credentials.Certificate('./config/serviceKey.json')
firebase = initialize_app(cred)
db = firestore.client()
# print(initialize_app)

from Module import routes