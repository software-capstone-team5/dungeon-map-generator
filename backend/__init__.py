import time
from flask import Flask
from firebase_admin import credentials, firestore, auth, initialize_app
from flask_cors import CORS, cross_origin
from dotenv import dotenv_values

from .database import db
from .authentication import authentication
from .drive import drive

def create_app(env='.env.firebase'):
  app = Flask(__name__)
  cred_file = dotenv_values(env)
  cred = credentials.Certificate(cred_file)
  firebase_db = firestore.client()
  users_collection = firebase_db.collection('Users')
  cors = CORS(app, resources={r'/*': {'origins': '*'}})

  app.register_blueprint(db)
  app.register_blueprint(authentication)
  app.register_blueprint(drive)
  return app