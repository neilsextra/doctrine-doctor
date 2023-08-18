from configparser import NoOptionError
from flask import Flask, Blueprint, render_template, request, send_file, Response
import io
from os import environ
import json


from requests import get, post
from pathlib import Path
from datetime import datetime, timedelta
from flask_npm import Npm

import pycouchdb

views = Blueprint('views', __name__, template_folder='templates')

app = Flask(__name__)

app.register_blueprint(views)

@app.route("/upload", methods=["POST"])
def upload():

    output = {}

    couchdb_url = request.values.get('couchdb-url')

    document_title = request.values.get('document-title')
    document_description = request.values.get('document-description')
    document_hot_topics = request.values.get('document-hot-topics')
    document_page_number = request.values.get('document-page-number')
    document_country_of_origin = request.values.get('document-country-of-origin')

    try:
        uploaded_files = request.files
        for uploaded_file in uploaded_files:
            fileContent = request.files.get(uploaded_file)

    except Exception as e:

        print(str(e))

        output.append({
            "status": 'fail',
            "error": str(e)
        })

    return json.dumps(output, sort_keys=True), 200

@app.route("/connect", methods=["GET"])
def connect():

    output = {}

    couchdb_url = request.values.get('couchdb-url')

    print("[CONNECT] - 'URL: %s' " % (couchdb_url))

    server = pycouchdb.Server(couchdb_url)
    output['version'] = server.info()['version']

    server.info()[]

    print("[CONNECT] - 'Version: %s' " % (output['version']))

    return json.dumps(output, sort_keys=True), 200

@app.route("/")
def start():
    return render_template("index.html")


if __name__ == "__main__":
    PORT = int(environ.get('PORT', '8080'))
    app.run(host='0.0.0.0', port=PORT)