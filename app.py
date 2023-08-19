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

import parameters as params

views = Blueprint('views', __name__, template_folder='templates')

app = Flask(__name__)

app.register_blueprint(views)

def createInstance(server, name):
    print(f"Creating: {name}")
    
    instance = server.create(name)
    
    print(f"Created: {name}")
       
    return instance

def getInstance(server, name):


    instance = None

    try:
        instance = server.database(name)
    
    except pycouchdb.exceptions.NotFound as e:
        print(f"{type(e).__name__} was raised: {e}")

    if instance == None:
        instance = createInstance(server, name)

    return instance

@app.route("/save-document", methods=["POST"])
def upload():

    output = {}

    couchdb_url = request.values.get('couchdb-url')

    document_title = request.values.get('document-title')
    document_description = request.values.get('document-description')
    document_hot_topics = request.values.get('document-hot-topics')
    document_page_number = request.values.get('document-page-number')
    document_country_of_origin = request.values.get('document-country-of-origin')

    print("[SAVE-DOCUMENT] - 'URL: %s' " % (couchdb_url))
 
    try:
        uploaded_files = request.files
        for uploaded_file in uploaded_files:
            fileContent = request.files.get(uploaded_file)

    except Exception as e:
        print(f"{type(e).__name__} was raised: {e}")

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

    getInstance(server, params.DOCUMENT_COPRUS)
    getInstance(server, params.OBSERVATION_CORPUS)
    getInstance(server, params.LESSON_CORPUS)
    getInstance(server, params.INSIGHT_CORPUS)

    getInstance(server, params.DD_LINK)
    getInstance(server, params.DD_ATTACHMENT)

    getInstance(server, params.DD_SETTING)

    print("[CONNECTED] - 'Version: %s' " % (output['version']))

    return json.dumps(output, sort_keys=True), 200

@app.route("/")
def start():
    return render_template("index.html")


if __name__ == "__main__":
    PORT = int(environ.get('PORT', '8080'))
    app.run(host='0.0.0.0', port=PORT)