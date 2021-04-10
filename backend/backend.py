import time
from flask import Flask

app = Flask(__name__)
import db

@app.route('/time')
def get_current_time():
    return {'time': time.time()}