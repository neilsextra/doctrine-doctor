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

Npm(app)

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

def save(corpus, couchdb_url, document):
    output = []
    print("[SAVE: %s] - 'URL: %s' " % (corpus, couchdb_url))
    fileContent = None

    try:
        server = pycouchdb.Server(couchdb_url)
        
        instance = getInstance(server, corpus)

        doc = instance.save(json.loads(document))

        output.append({
            "status": 'success',
            "document": doc
        })

    except Exception as e:
        print(f"{type(e).__name__} was raised: {e}")

        output.append({
            "status": 'fail',
            "error": str(e)
        })   

    return output

@app.route("/get/document", methods=["GET"])
def get_document():
    output = {}

    couchdb_url = request.values.get('couchdb-url')
    document_id = request.values.get('document-id')

    print("[GET_DOCUMENT] - 'URL: %s' - %s " % (couchdb_url, document_id))

    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.DOCUMENT_COPRUS)

    result = instance.get(document_id)

    return json.dumps(result, sort_keys=True), 200

@app.route("/list/documents", methods=["GET"])
def all_documents():
    output = {}

    couchdb_url = request.values.get('couchdb-url')

    print("[ALL_DOCUMENTS] - 'URL: %s' " % (couchdb_url))

    map_func = "function(doc) { emit(doc.name, 1); }"
    
    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.DOCUMENT_COPRUS)

    result = list(instance.all())

    print(result)

    return json.dumps(result, sort_keys=True), 200

@app.route("/get/document/attachment", methods=["POST"])
def get_attachment():
    couchdb_url = request.values.get('couchdb-url')
    document = request.values.get('document')
    attachment_name = request.values.get('attachment-name')
    
    print("[GET_DOCUMENT_ATTACHMENT] - 'URL: %s' " % (couchdb_url))
    print("[GET_DOCUMENT_ATTACHMENT] - 'DOCUMENT: %s' " % (document))
    print("[GET_DOCUMENT_ATTACHMENT] - 'ATTACHMENT: %s' " % (attachment_name))
    
    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.DOCUMENT_COPRUS)

    bytes = instance.get_attachment(json.loads(document), attachment_name, False)

    return send_file(io.BytesIO(bytes), mimetype='application/pdf')

@app.route("/save/document", methods=["POST"])
def save_document():
    output = []
    
    couchdb_url = request.values.get('couchdb-url')
    document = request.values.get('document')

    print("[SAVE_DOCUMENT] - 'URL: %s' " % (couchdb_url))
    fileContent = None

    try:
        files = request.files

        for file in files:
            fileContent = request.files.get(file)

            print(fileContent.filename)
            print(fileContent.mimetype)

        server = pycouchdb.Server(couchdb_url)
        
        instance = getInstance(server, params.DOCUMENT_COPRUS)

        doc = instance.save(json.loads(document))

        instance.put_attachment(doc, fileContent, filename=fileContent.filename, content_type=fileContent.mimetype)

        output.append({
            "status": 'success',
            "document": doc
        })

    except Exception as e:
        print(f"{type(e).__name__} was raised: {e}")

        output.append({
            "status": 'fail',
            "error": str(e)
        })

    return json.dumps(output, sort_keys=True), 200

@app.route("/save/observation", methods=["POST"])
def save_observation():

    couchdb_url = request.values.get('couchdb-url')
    document = request.values.get('document')

    output = save(params.OBSERVATION_CORPUS, couchdb_url, document)

    return json.dumps(output, sort_keys=True), 200

@app.route("/save/insight", methods=["POST"])
def save_insight():
    
    couchdb_url = request.values.get('couchdb-url')
    document = request.values.get('document')

    output = save(params.INSIGHT_CORPUS, couchdb_url, document)

    return json.dumps(output, sort_keys=True), 200

@app.route("/save/lesson", methods=["POST"])
def save_lesson():
    
    couchdb_url = request.values.get('couchdb-url')
    document = request.values.get('document')

    output = save(params.LESSON_CORPUS, couchdb_url, document)

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
    getInstance(server, params.DD_SETTING)

    print("[CONNECTED] - 'Version: %s' " % (output['version']))

    return json.dumps(output, sort_keys=True), 200

@app.route("/")
def start():
    return render_template("index.html")

if __name__ == "__main__":
    PORT = int(environ.get('PORT', '8080'))
    app.run(host='0.0.0.0', port=PORT)