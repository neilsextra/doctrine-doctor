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

views = Blueprint('views', __name__, template_folder='templates')

app = Flask(__name__)

app.register_blueprint(views)

def log(f, message):
    f.write("%s : %s\n" % (str(datetime.now()), message))
    f.flush()
    print("%s : %s\n" % (str(datetime.now()), message))


@app.route("/")
def start():
    return render_template("index.html")


if __name__ == "__main__":
    PORT = int(environ.get('PORT', '8080'))
    app.run(host='0.0.0.0', port=PORT)