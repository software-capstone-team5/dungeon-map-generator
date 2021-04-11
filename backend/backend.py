import time
from flask import Flask

app = Flask(__name__)
import db
import authentication
import drive

@app.route('/time')
def get_current_time():
    return {'time': time.time()}