from configparser import NoOptionError
from flask import Flask, Blueprint, render_template, request, send_file, Response
import io
from os import environ
import datetime
import string
import json
import sys
import os
import time
import re
import operator
import urllib.parse
from requests import get, post
from pathlib import Path
from datetime import datetime, timedelta
from flask_npm import Npm

views = Blueprint('views', __name__, template_folder='templates')

app = Flask(__name__)

app.register_blueprint(views)

@app.route("/connect", methods=["GET"])
def connect():

    output = {}

    url = request.values.get('url')

    print("[CONNECT] - '%s' " % (url))

    output['response'] = "ok"

    return json.dumps(output, sort_keys=True), 200

@app.route("/")
def start():
    return render_template("index.html")


if __name__ == "__main__":
    PORT = int(environ.get('PORT', '8080'))
    app.run(host='0.0.0.0', port=PORT)