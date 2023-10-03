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

import parameters as params

views = Blueprint('views', __name__, template_folder='templates')

app = Flask(__name__)

Npm(app)

corpus_keywords_cache = {}

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

def link_entries(couchdb_url, source_corpus, source_id, target_corpus, target_id):
    output = []

    try:
        server = pycouchdb.Server(couchdb_url)
        
        print("LINK_ENTRIES: " + params.CORPUS_MAP[source_corpus]);
        print("TARGET_ENTRIES: " + params.CORPUS_MAP[target_corpus]);

        source_instance = getInstance(server, params.CORPUS_MAP[source_corpus])
        target_instance = getInstance(server, params.CORPUS_MAP[target_corpus])

        source_entry = source_instance.get(source_id)
        target_entry = target_instance.get(target_id)

        if not target_corpus in source_entry:
            source_entry[target_corpus] = []

        if not source_corpus in target_entry:
            target_entry[source_corpus] = []

        source_entry[target_corpus].append(target_id)
        target_entry[source_corpus].append(source_id) 

        updated_source = source_instance.save(source_entry)     
        updated_target = target_instance.save(target_entry)     

        print("LINK_SUCCESSFUL");

        output.append({
            "status": 'success',
            "source": json.dumps(updated_source),
            "target": json.dumps(updated_target)
        })

    except Exception as e:
        print(f"{type(e).__name__} was raised: {e}")

        output.append({
            "status": 'fail',
            "error": str(e)
        })   

    return output

def get_link_entries(server, entity):
    output = []
    
    for key, value in params.CORPUS_MAP.items():
        print("[GET_LINK_ENTRIES] - 'Corpus: %s:%s' " % (key, value))
        
        if key in entity:
            instance = getInstance(server, value)

            entities = []

            for id in entity[key]:
                entities.append({
                    "id": id,
                    "entity":instance.get(id)
                    })

            if len(entities) > 0:
                output.append({
                    "corpus": key,
                    "entities": entities
                })

    return output

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

def populate_keywords_cache(couchdb_url, corpus, database):
    server = pycouchdb.Server(couchdb_url)

    instance = getInstance(server, database)
    
    result = list(instance.all())
    
    keywords = {}

    keyword_field = corpus + "-keywords"

    for entity in result:
        if keyword_field in entity["doc"]:
            keywords[entity["id"]] = list(map(lambda x: x.lower(), entity["doc"][keyword_field]))
            
            print(f"ADDED KEYWORDS:  {entity['id']} - {keywords[entity['id']]}")

    corpus_keywords_cache[corpus] = keywords

@app.route("/get/document", methods=["GET"])
def get_document():
    output = {}

    couchdb_url = request.values.get('couchdb-url')
    document_id = request.values.get('document-id')

    print("[GET_DOCUMENT] - 'URL: %s' - %s " % (couchdb_url, document_id))

    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.DOCUMENT_CORPUS)

    result = instance.get(document_id)

    return json.dumps(result, sort_keys=True), 200

@app.route("/get/observation", methods=["GET"])
def get_observation():
    output = {}

    couchdb_url = request.values.get('couchdb-url')
    observation_id = request.values.get('observation-id')

    print("[GET_OBSERVATION] - 'URL: %s' - %s " % (couchdb_url, observation_id))

    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.OBSERVATION_CORPUS)

    result = instance.get(observation_id)

    return json.dumps(result, sort_keys=True), 200

@app.route("/get/insight", methods=["GET"])
def get_insight():
    output = {}

    couchdb_url = request.values.get('couchdb-url')
    insight_id = request.values.get('insight-id')

    print("[GET_INSIGHT] - 'URL: %s' - %s " % (couchdb_url, insight_id))

    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.INSIGHT_CORPUS)

    result = instance.get(insight_id)

    return json.dumps(result, sort_keys=True), 200

@app.route("/get/lesson", methods=["GET"])
def get_lesson():
    output = {}

    couchdb_url = request.values.get('couchdb-url')
    lesson_id = request.values.get('lesson-id')

    print("[GET_LESSON] - 'URL: %s' - %s " % (couchdb_url, lesson_id))

    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.LESSON_CORPUS)

    result = instance.get(lesson_id)

    return json.dumps(result, sort_keys=True), 200

@app.route("/list/documents", methods=["GET"])
def list_documents():
    output = {}

    couchdb_url = request.values.get('couchdb-url')

    print("[ALL_DOCUMENTS] - 'URL: %s' " % (couchdb_url))

    map_func = "function(doc) { emit(doc.name, 1); }"
    
    server = pycouchdb.Server(couchdb_url)
        
    instance = getInstance(server, params.DOCUMENT_CORPUS)

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

@app.route("/search", methods=["GET"])
def search_keywords():
    couchdb_url = request.values.get('couchdb-url')
    corpus = request.values.get('corpus')
    keywords = request.values.get('keywords')
    startDate = request.values.get('start-date')
    endDate = request.values.get('end-date')

    keyword_list = list(map(lambda x: x.lower(), keywords.split(",")))

    ids = []

    for key, value in corpus_keywords_cache[corpus].items():
    
        if not set(keyword_list).isdisjoint(set(value)):
            ids.append(key)

    entities = []

    if len(ids) > 0:
        server = pycouchdb.Server(couchdb_url)
        instance = getInstance(server, params.CORPUS_MAP[corpus])

        for id in ids:
            print("Found: " + id)

            entities.append({
                "id": id,
                "doc":instance.get(id)
        })

    result = {
        "corpus" : corpus,
        "results": entities
    }

    return json.dumps(result, sort_keys=True), 200

@app.route("/retrieve/links", methods=["GET"])
def retrieve_links():
    couchdb_url = request.values.get('couchdb-url')
    corpus = request.values.get('corpus')
    id = request.values.get('id')

    server = pycouchdb.Server(couchdb_url)
    
    instance = getInstance(server, params.CORPUS_MAP[corpus])

    entity = instance.get(id)

    links = get_link_entries(server, entity)
    
    result = {
        "corpus" : corpus,
        "entity": entity,
        "id": id,
        "links": links
    }

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
        
    instance = getInstance(server, params.DOCUMENT_CORPUS)

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
        
    instance = getInstance(server, params.DOCUMENT_CORPUS)

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
        
        instance = getInstance(server, params.DOCUMENT_CORPUS)

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
        
        instance = getInstance(server, params.DOCUMENT_CORPUS)

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

@app.route("/link", methods=["POST"])
def link():
    output = []
    
    couchdb_url = request.values.get('couchdb-url')
    source_corpus = request.values.get('source-corpus')
    target_corpus = request.values.get('target-corpus')
    
    source_id = request.values.get('source-id')
    target_id = request.values.get('target-id')

    print("[LINK] - 'URL: %s' " % (couchdb_url))
    print("[LINK] - 'SOURCE: %s - %s' " % (source_corpus, source_id))
    print("[LINK] - 'TARGET: %s - %s' " % (target_corpus, target_id))

    try:
        output = link_entries(couchdb_url, source_corpus, source_id, target_corpus, target_id)

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

    for key, value in params.CORPUS_MAP.items():
        print("[CHECKING] - 'Corpus: %s:%s' " % (key, value))
        getInstance(server, value)

    print("[CONNECTED] - 'Version: %s' " % (output['version']))

    for key, value in params.CORPUS_MAP.items():
        populate_keywords_cache(couchdb_url, key, value)

    return json.dumps(output, sort_keys=True), 200

@app.route("/")
def start():
    return render_template("index.html")

if __name__ == "__main__":
    PORT = int(environ.get('PORT', '8080'))

    app.run(host='0.0.0.0', port=PORT)