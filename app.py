from configparser import NoOptionError
from flask import Flask, Blueprint, render_template, request, send_file, Response
import io
from os import environ
import json
import time

from requests import get, post
from pathlib import Path
from datetime import datetime, timedelta
from flask_npm import Npm

import pycouchdb

import chromadb

import parameters as params

views = Blueprint('views', __name__, template_folder='templates')

app = Flask(__name__)

chroma_client = None
document_description_collection = None
document_cache = None

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
def list_documents():
    output = {}

    couchdb_url = request.values.get('couchdb-url')

    print("[ALL_DOCUMENTS] - 'URL: %s' " % (couchdb_url))

    map_func = "function(doc) { emit(doc.name, 1); }"
    
    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.DOCUMENT_COPRUS)

    result = list(instance.all())

    return json.dumps(result, sort_keys=True), 200

@app.route("/list/observations", methods=["GET"])
def list_observations():
    output = {}

    couchdb_url = request.values.get('couchdb-url')

    print("[ALL_OBSERVATIONS] - 'URL: %s' " % (couchdb_url))

    map_func = "function(doc) { emit(doc.name, 1); }"
    
    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.OBSERVATION_CORPUS)

    result = list(instance.all())

    return json.dumps(result, sort_keys=True), 200

@app.route("/list/lessons", methods=["GET"])
def list_lessons():
    output = {}

    couchdb_url = request.values.get('couchdb-url')

    print("[ALL_OBSERVATIONS] - 'URL: %s' " % (couchdb_url))

    map_func = "function(doc) { emit(doc.name, 1); }"
    
    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.LESSON_CORPUS)

    result = list(instance.all())

    return json.dumps(result, sort_keys=True), 200

@app.route("/list/insights", methods=["GET"])
def list_insights():
    output = {}

    couchdb_url = request.values.get('couchdb-url')

    print("[ALL_OBSERVATIONS] - 'URL: %s' " % (couchdb_url))

    map_func = "function(doc) { emit(doc.name, 1); }"
    
    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.INSIGHT_CORPUS)

    result = list(instance.all())

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

@app.route("/delete/document/attachment", methods=["POST", "DELETE"])
def delete_document_attachment():
    output = []
    couchdb_url = request.values.get('couchdb-url')
    document = request.values.get('document')
    attachment_name = request.values.get('attachment-name')
    
    print("[DELETE_DOCUMENT_ATTACHMENT] - 'URL: %s' " % (couchdb_url))
    print("[DELETE_DOCUMENT_ATTACHMENT] - 'DOCUMENT: %s' " % (document))
    print("[DELETE_DOCUMENT_ATTACHMENT] - 'ATTACHMENT: %s' " % (attachment_name))
    
    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.DOCUMENT_COPRUS)

    result = instance.delete_attachment(json.loads(document), attachment_name)

    output.append({
            "status": 'success',
            "attachment": attachment_name
        })
    
    return json.dumps(output, sort_keys=True), 200

@app.route("/save/document", methods=["POST"])
def save_document():
    output = []
    
    couchdb_url = request.values.get('couchdb-url')
    document = request.values.get('document')

    print("[SAVE_DOCUMENT] - 'URL: %s' " % (couchdb_url))
    print("[SAVE_DOCUMENT] - 'JSON: %s' " % (document))
    fileContent = None

    try:
        server = pycouchdb.Server(couchdb_url)
        
        instance = getInstance(server, params.DOCUMENT_COPRUS)

        doc = instance.save(json.loads(document))
        files = request.files

        for file in files:
            fileContent = request.files.get(file)
            instance.put_attachment(doc, fileContent, filename=fileContent.filename, content_type=fileContent.mimetype)

        instance.commit()

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

    output = save(params.OBSERVATION_COPRUS, couchdb_url, document)

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

@app.route("/delete", methods=["POST"])
def delete():
    output = []
    
    couchdb_url = request.values.get('couchdb-url')
    document = request.values.get('document')

    print("[DELETE] - 'URL: %s' " % (couchdb_url))
    print("[DELETE] - 'JSON: %s' " % (document))
    fileContent = None

    try:
        server = pycouchdb.Server(couchdb_url)
        
        instance = getInstance(server, params.DOCUMENT_COPRUS)

        doc = instance.delete(json.loads(document))
  
        instance.commit()

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

@app.route("/connect", methods=["GET"])
def connect():

    output = {}

    couchdb_url = request.values.get('couchdb-url')

    print("[CONNECT] - 'URL: %s' " % (couchdb_url))

    server = pycouchdb.Server(couchdb_url)
    output['version'] = server.info()['version']

    getInstance(server, params.DOCUMENT_COPRUS)
    getInstance(server, params.OBSERVATION_COPRUS)
    getInstance(server, params.LESSON_COPRUS)
    getInstance(server, params.INSIGHT_COPRUS)

    print("[CONNECTED] - 'Version: %s' " % (output['version']))

    return json.dumps(output, sort_keys=True), 200

@app.route("/")
def start():
    return render_template("index.html")

if __name__ == "__main__":
    PORT = int(environ.get('PORT', '8080'))

    chroma_client = chromadb.Client()

    chroma_client.get_or_create_collection(params.DOCUMENT_DESCRIPTION_COLLECTION)

    app.run(host='0.0.0.0', port=PORT)