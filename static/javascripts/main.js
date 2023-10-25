'use strict'

var bigTable = undefined;

var xOffset = 20;
var yOffset = 16;

var rows = [];
var types = {};
var columns = null;
var detailsTableHeight = 0;
var tableView = null;
var attachmentView = null;
var attachment = null;

var activeCorpus = DOCUMENT;

var id = 0;

const FAVOURITES_STORAGE = "dd-favourites";
const HISTORY_STORAGE = "dd-history";

const SEARCH_TEMPLATES = {

    "document": "search-documents",
    "observation": "search-observations",
    "insight": "search-insights",
    "lesson": "search-lessons",
};

var networkView = new NetworkView();

/**
 * Get the next ID
 * @returns the next ID
 */
function getID() {

    id += 1;

    return id;

}

/**
 * Capitalize the first letter of a String e.g. "fred" -> "Fred"
 * 
 * @param {String} string the string to capitalize e.g. "fred" -> "Fred"
 * @returns a capitalized String
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Parameter Substitution for templates
 * 
 * @param {String} template the template 
 * @param {*} values the values as a dictionary
 * @returns a string with substituted values that conform to the template
 */
function substitute(template, values) {
    let value = template;

    let keys = Object.keys(values);

    for (let key in keys) {
        value = value.split("${" + keys[key] + "}").join(values[keys[key]]);
    }

    return value;

}

/**
 * Edit an entry
 * 
 * @param {String} corpus the corpus  
 * @param {String} dialogId the dialog to display  
 * @param {String} rowId row identifier
 * @param {String} rowContainerId the container idenifier
 * @param {String} editRowId the editable row identifier
 */
function editElement(corpus, dialogId, rowId, rowContainerId, editRowId) {

    clearDialog(document.getElementById(dialogId));

    document.getElementById(rowContainerId).value = editRowId;
    document.getElementById(dialogId).showModal();

}

/**
 * Edit the Document
 * 
 * @param {String} id the Document Identifier that identifies the doucment ot edit
 * @param {String} attachmentName the attachment file name
 */
async function editDocument(id, attachmentName) {
    var waitDialog = document.getElementById("wait-dialog");

    waitDialog.showModal();

    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
 
    clearDialog(document.getElementById("document-dialog"));

    var result = await couchDB.getDocument(id);

    var template = new Template("document", result.response);

    attachment = null;

    activateTab('document-tabs', 'document-general', 'document-tab1');

    document.getElementById("document-template").value = template.toString();

    document.getElementById("document-upload-label").innerHTML = attachmentName;
    document.getElementById("current-attachment-name").innerHTML = attachmentName;

    template.getValuesForClass("document-dialog", "template-entry");

    populateKeywords("document-keywords", template);
    populateTracking("document-tracking-table", template);

    waitDialog.close();

    document.getElementById("document-dialog").showModal();
}

/**
 * Edit the Corpus Entry
 * 
 * @param {String} corpus the Corpus Name
 * @param {String} id the Corpus Identifier 
 */
async function editCorpusEntry(corpus, id) {
    var waitDialog = document.getElementById("wait-dialog");

    waitDialog.showModal();

    clearDialog(document.getElementById(`${corpus}-dialog`));

    var result = await couchDB.get(corpus, id);

    var template = new Template(corpus, result.response);

    document.getElementById(`${corpus}-template`).value = template.toString();
    template.getValuesForClass(`${corpus}-dialog`, "template-entry");

    populateKeywords(`${corpus}-keywords`, template);
    activateTab(`${corpus}-tabs`, `${corpus}-general`, `${corpus}-tab1`);

    waitDialog.close();

    document.getElementById(`${corpus}-dialog`).showModal();

}

/**
 * Delete a keyword from the list
 * 
 * @param {String} elementId 
 */
function deleteElement(elementId) {
    let element = document.getElementById(elementId);

    element.parentNode.removeChild(element);

}

/**
 * Remove all the event listeners for an element
 * @param {String} id the element Identifier
 */

function removeAllEventListeners(id) {
    var oldElement = document.getElementById(id);
    var newElement = oldElement.cloneNode(true);

    oldElement.parentNode.replaceChild(newElement, oldElement);

}

/**
 * Set the Collapsibe Handler
 */
function setCollapsible() {
    var collapsible = document.getElementsByClassName("collapsible");
    for (var content = 0; content < collapsible.length; content++) {
        collapsible[content].addEventListener("click", function () {

            this.classList.toggle("collapsible-active");

            var content = this.nextElementSibling;

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }

        });

    }
}

/**
 * Clear a specified dilaog
 * @param {*} element  the dialog 'element' to clear
 */
function clearDialog(element) {
    const inputs = element.querySelectorAll("input[type=text]");

    inputs.forEach((item) => {

        item.value = "";

    });

    const checkboxes = element.querySelectorAll("input[type=checkbox]");

    checkboxes.forEach((item) => {

        item.checked = false;

    })

    const dates = element.querySelectorAll("input[type=date]");

    dates.forEach((item) => {

        item.value = "";

    });

    const textareas = element.querySelectorAll("textarea");

    textareas.forEach((item) => {

        item.value = "";

    });

    const keywords = element.querySelectorAll(".keyword-entry");

    keywords.forEach((item) => {

        item.parentNode.removeChild(item);

    });

    const tableBody = element.querySelectorAll(".table-view > tr");

    tableBody.forEach((item) => {

        item.parentNode.removeChild(item);

    });

}

/**
 * lear the Details (only if the Pin is up)"
 */
function clearDetails() {
    if (document.getElementById("pin-view") == null || document.getElementById("pin-view").classList.contains("pin-up")) {
        document.getElementById("details").innerHTML = "";
    }
}

/**
 * Update Local Storage
 * @param {*} storageId the storage identifier
 * @param {*} corpus the corpus name
 * @param {*} id the entry identifier
 * @param {*} title the entry tile
 * @param {*} date the date the entry was added
 */
function updateLocalStorage(storageId, corpus, id, title, date) {
    var favourites = localStorage.getItem(storageId);
    var favouritesMap = favourites == null ? [] : JSON.parse(favourites);

    favouritesMap.push({
        corpus: corpus,
        id: id,
        title, title,
        date: date
    })

    localStorage.setItem(storageId, JSON.stringify(favouritesMap));

}

/**
 * Add the Pin View
 * @param {String} corpus the Corpus Name
 */
function addPin(corpus) {

    document.getElementById("pin-view").addEventListener("click", (e) => {

        if (document.getElementById("pin-view").classList.contains("pin-up")) {
            document.getElementById("pin-up-icon").style.display = "none";
            document.getElementById("pin-down-icon").style.display = "inline-block";
            document.getElementById("pin-view").classList.toggle("pin-up");
            document.getElementById("pin-view").className += " pin-down";
        } else {
            document.getElementById("pin-up-icon").style.display = "inline-block";
            document.getElementById("pin-down-icon").style.display = "none";
            document.getElementById("pin-view").classList.toggle("pin-down");
            document.getElementById("pin-view").className += " pin-up";
        }

    });
}

/**
 * Add a keyword input field to a keyword container
 * 
 * @param {String} container the Keyword Input Field's parent container
 * @param {String} the keyword's value
 */
function addKeywordField(container, value = "") {
    let keywords = document.getElementById(`${container}`);
    let template = document.querySelector('script[data-template="keyword-entry"]').innerHTML;
    let keywordElement = substitute(template, {
        id: getID(),
        value: value
    });

    let fragment = document.createRange().createContextualFragment(keywordElement);

    keywords.appendChild(fragment);

}

/**
 * Get the  Keywords
 * @param {String} id the document identifier
 * @param {*} template the template to update
 */
function addKeywords(id, template) {
    const keywords = document.getElementById(id).querySelectorAll("input[type=text]");

    template.clearKeywords();

    for (var keyword in keywords) {
        if (keywords[keyword].value != null) {
            template.addKeyword(keywords[keyword].value);
        }
    }

}

/** 
 * Populate the keyword list
 * @param {String} id the document identifier
 * @param {*} template the template to update
 */
function populateKeywords(id, template) {

    for (var keyword in template.keywords) {
        addKeywordField(id, template.keywords[keyword]);
    }

}

/** 
 * Populate the tracking
 * @param {String} id the document tracking table
 * @param {*} template the template to update
 */
function populateTracking(id, template) {

    for (var tracking in template.trackings) {

        addTrackingRow(id, new Date(template.trackings[tracking]['tracking-date']), template.trackings[tracking]['tracking-comment']);

    }

}

/**
 * Populate Favourites/History Tables
 * 
 * @param {*} storageCache the Storage Cahce
 * @param {*} tableId the table to populate
 */
function populateLogTable(storageCache, tableId) {

    var cache = localStorage.getItem(storageCache);

    if (cache != null) {
        var cachedMap = JSON.parse(cache);

        const tableBody = document.getElementById(tableId).querySelectorAll(".table-view > tr");

        tableBody.forEach((item) => {

            item.parentNode.removeChild(item);

        });
        for (var entry in cachedMap) {

            addLogRow(tableId, cachedMap[entry].corpus, cachedMap[entry].id, cachedMap[entry].title, cachedMap[entry].date);

        }

    }

}

/**
 * Add a Entry row to the appropriate Log Table
 * 
 * @param {String} table the Log parent table
 * @param {String} corpus the Log records corpus
 * @param {String} id the Object
 * @param {String} title The tracking's comment
 * @param {String} date The tracking's date
 */
function addLogRow(table, corpus, id, title, date) {
    let tableNode = document.getElementById(`${table}`);
    let tableBody = tableNode.querySelector("tbody")
    let template = document.querySelector('script[data-template="log-entry"]').innerHTML;

    let row = substitute(template, {
        corpus: corpus,
        id: id,
        title: title,
        date: date
    })

    let tableRange = new Range();

    tableRange.selectNodeContents(document.createElement('tbody'));

    let fragment = tableRange.createContextualFragment(row);

    tableBody.appendChild(fragment);

}

/**
 * Add a tracking row to the Tracking Table
 * 
 * @param {String} tableBody the Tracking's Input Field's parent table
 * @param {Date} date the Tracking's date value
 * @param {String} comment The tracking's comment
 */
function addTrackingRow(table, date = new Date(), comment = "") {
    let tableNode = document.getElementById(`${table}`);
    let tableBody = tableNode.querySelector("tbody")
    let template = document.querySelector('script[data-template="tracking-entry"]').innerHTML;

    let trackingElement = substitute(template, {
        id: getID(),
        date: date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDay() + 1)).slice(-2),
        comment: comment
    })

    let tableRange = new Range();

    tableRange.selectNodeContents(document.createElement('tbody'));

    let fragment = tableRange.createContextualFragment(trackingElement);

    tableBody.appendChild(fragment);

}

/**
 * Add an observation row to the document's observation table
 * 
 * @param {String} tableBody the Observation Input Field's parent table
 * @param {Template} a template that contains the observation
 */
function addObservationRow(table, template) {
    let tableNode = document.getElementById(`${table}`);
    let tableBody = tableNode.querySelector("tbody")
    let row = document.querySelector('script[data-template="observation-entry"]').innerHTML;

    let trackingElement = substitute(row, {
        id: getID(),
        date: template.getValue("observation-date"),
        title: template.getValue("observation-title"),
        description: template.getValue("observation-description")
    })

    let tableRange = new Range();

    tableRange.selectNodeContents(document.createElement('tbody'));

    let fragment = tableRange.createContextualFragment(trackingElement);

    tableBody.appendChild(fragment);

}

/**
 * Add a lesson row to the document's lesson table
 * 
 * @param {String} tableBody the Lesson Input Field's parent table
 * @param {Template} a template that contains the lesson
 */
function addLessonRow(table, template) {
    let tableNode = document.getElementById(`${table}`);
    let tableBody = tableNode.querySelector("tbody")
    let row = document.querySelector('script[data-template="lesson-entry"]').innerHTML;

    let trackingElement = substitute(row, {
        id: getID(),
        title: template.getValue("lesson-title"),
        description: template.getValue("lesson-description"),
        template: template.toString()
    })

    let tableRange = new Range();

    tableRange.selectNodeContents(document.createElement('tbody'));

    let fragment = tableRange.createContextualFragment(trackingElement);

    tableBody.appendChild(fragment);

}

/**
 * Add a insight row to the document's insight table
 * 
 * @param {String} tableBody the Insight Input Field's parent table
 * @param {Template} a template that contains the insight
 */
function addInsightRow(table, template) {
    let tableNode = document.getElementById(`${table}`);
    let tableBody = tableNode.querySelector("tbody")
    let row = document.querySelector('script[data-template="insight-entry"]').innerHTML;

    let trackingElement = substitute(row, {
        id: getID(),
        title: template.getValue("insight-title"),
        description: template.getValue("insight-description"),
        template: template.toString()
    })

    let tableRange = new Range();

    tableRange.selectNodeContents(document.createElement('tbody'));

    let fragment = tableRange.createContextualFragment(trackingElement);

    tableBody.appendChild(fragment);

}

/**
 * Show the linked entries attached to an entity
 * 
 * @param {*} corpus the corpus identifier
 * @param {*} id the entity identifier
 */
async function showLinks(corpus, id) {
    var waitDialog = document.getElementById("wait-dialog");

    waitDialog.showModal();

    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);

    var result = await couchDB.retrieveLinks(corpus, id);

    var networkDialog = document.getElementById("network-dialog");

    var entityTemplate = new Template(result.response.corpus, result.response.entity);

    let template = document.querySelector('script[data-template="network-entry"]').innerHTML;

    networkView.reset();

    networkView.setEntity(substitute(template, {
        corpus: capitalize(entityTemplate.corpus),
        id: entityTemplate.id,
        title: entityTemplate.getValue(`${result.response.corpus}-title`),
        date: entityTemplate.date
    }));

    template = document.querySelector('script[data-template="network-entity-entry"]').innerHTML;

    var links = result.response.links;

    for (var link in links) {

        var linkedCorpus = links[link].corpus;

        var entities = links[link].entities;
        var htmlTable = "<table>";

        for (var entity in entities) {
            console.log(JSON.stringify([entities[entity].entity]));
            entityTemplate = new Template(linkedCorpus, entities[entity].entity);

            htmlTable += substitute(template, {
                corpus: capitalize(entityTemplate.corpus),
                id: entityTemplate.id,
                title: entityTemplate.getValue(`${entityTemplate.corpus}-title`),
                date: entityTemplate.date
            });

        }

        htmlTable += "</table>";

        networkView.setLinkedEntities(linkedCorpus, htmlTable);

    }

    waitDialog.close();

    networkDialog.showModal();

}

/**
 * Show the Document Details
 * @param {String} id the document identifier
 * @param {String} detailsTemplate the HTML template
 */
async function showDocumentDetails(id, detailsTemplate) {
    var waitDialog = document.getElementById("wait-dialog");

    waitDialog.showModal();

    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
    var result = await couchDB.getDocument(id);

    var template = new Template(DOCUMENT, result.response);

    let detailTemplate = document.querySelector(`script[data-template="${detailsTemplate}"]`).innerHTML;
    let attachments = template.getAttachments();

    document.getElementById("details").innerHTML = substitute(detailTemplate, {
        id: id,
        title: template.getValue("document-title"),
        name: attachments[0].name,
        content_type: attachments[0].content_type,
        length: attachments[0].length,
        description: template.getValue("document-description")
    });

    var content = await couchDB.getAttachment(template, attachments[0].name);
    var pdfView = new PDFView(content, "pdf-view", 0.5);

    pdfView.view();

    removeAllEventListeners("pin-view");
    removeAllEventListeners("view-network");
    removeAllEventListeners("view-attachment");
    removeAllEventListeners("edit-document");
    removeAllEventListeners("delete-document");
    removeAllEventListeners("favourites-document");

    addPin(DOCUMENT);

    document.getElementById("view-network").addEventListener("click", async (e) => {

        showLinks(DOCUMENT, id);

    });

    document.getElementById("view-attachment").addEventListener("click", (e) => {
        pdfView.viewerID = "attachment-view";
        pdfView.zoom = 1.0;

        pdfView.render();

        document.getElementById('pagne-no').textContent = "1";

        var attachmentDialog = document.getElementById("attachment-dialog");

        attachmentDialog.showModal();

        removeAllEventListeners("page-left");
        removeAllEventListeners("page-right");

        document.getElementById('page-left').addEventListener('click', (e) => {

            pdfView.previous();
            document.getElementById('pagne-no').textContent = pdfView.currentPage;

        });

        document.getElementById('page-right').addEventListener('click', (e) => {

            pdfView.next();
            document.getElementById('pagne-no').textContent = pdfView.currentPage;

        });

    });

    document.getElementById('edit-document').addEventListener('click', async (e) => {

        editDocument(id, attachments[0].name);
;
        return false;

    });

    document.getElementById('delete-document').addEventListener('click', async (e) => {

        removeAllEventListeners("delete-entry");

        document.getElementById('delete-entry').addEventListener('click', async (e) => {

            waitDialog.showModal();

            var result = await couchDB.getDocument(id);

            var template = new Template(DOCUMENT, result.response);

            couchDB.delete("document", template);

            document.getElementById("details").innerHTML = "";

            waitDialog.close();

        });

        document.getElementById("delete-dialog").showModal();

        return false;

    });

    document.getElementById('favourites-document').addEventListener('click', async (e) => {

        addLogRow("favourites-entries", DOCUMENT, id, template.getValue("document-title"), template.getValue("document-date"));

        updateLocalStorage(FAVOURITES_STORAGE, DOCUMENT, id, template.getValue("document-title"), template.getValue("document-date"));

    });

    waitDialog.close();

}

/**
 * Process the Document Details selected from the Table View
 * 
 * @param {String} id the document identifier
 * @param {String} detailsTemplate the HTML template
 */
function processDocumentDetails(id, detailsTemplate) {

    if (document.getElementById("pin-view") != null && document.getElementById("pin-view").classList.contains("pin-down")) {
    } else {
        showDocumentDetails(id, detailsTemplate);
    }

}

/**
 * Show the Corpus Details
 
 * @param {String} corpus the corpus name
 * @param {String} id the corpus identifier
 * @param {String} detailsTemplate the details template
 */
async function showCorpusDetails(corpus, id, detailsTemplate) {
    var waitDialog = document.getElementById("wait-dialog");

    waitDialog.showModal();

    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
    var result = await couchDB.get(corpus, id);

    var template = new Template(corpus, result.response);

    let detailTemplate = document.querySelector(`script[data-template="${detailsTemplate}"]`).innerHTML;
    let attachments = template.getAttachments();

    document.getElementById("details").innerHTML = substitute(detailTemplate, {
        id: id,
        corpus: corpus,
        title: template.getValue(`${corpus}-title`),
        description: template.getValue(`${corpus}-description`)
    });

    removeAllEventListeners("view-network");
    removeAllEventListeners("edit-corpus-entry");
    removeAllEventListeners("delete-corpus-entry");
    removeAllEventListeners("favourites-corpus-entry");

    document.getElementById('view-network').addEventListener('click', async (e) => {

        showLinks(corpus, id);

    });


    document.getElementById('edit-corpus-entry').addEventListener('click', async (e) => {

        editCorpusEntry(corpus, id);

        return false;

    });

    document.getElementById('delete-corpus-entry').addEventListener('click', async (e) => {

        removeAllEventListeners("delete-entry");

        document.getElementById('delete-entry').addEventListener('click', async (e) => {

            waitDialog.showModal();

            var result = await couchDB.get(corpus, id);

            var template = new Template(corpus, result.response);

            couchDB.delete(corpus, template);

            document.getElementById("details").innerHTML = "";

            waitDialog.close();

        });

        document.getElementById("delete-dialog").showModal();

        return false;

    });

    document.getElementById('favourites-corpus-entry').addEventListener('click', async (e) => {

        addLogRow("favourites-entries", corpus, id, template.getValue(`${corpus}-title`), template.getValue(`${corpus}-date`));

        updateLocalStorage(FAVOURITES_STORAGE, DOCUMENT, id, template.getValue("document-title"), template.getValue("document-date"));


    });

    waitDialog.close();

}


/**
 * Process the Corpus Details selected from the Table View
 * 
 * @param {String} corpus the active corpus
 * @param {String} id the corpus entry identifier
 * @param {String} detailsTemplate the HTML template
 */
function processCorpusDetails(corpus, id, detailsTemplate) {

    if (document.getElementById("pin-view") != null && document.getElementById("pin-view").classList.contains("pin-down")) {
    } else {
        showCorpusDetails(corpus, id, detailsTemplate);
    }

}

/**
 * populate the document Table with the documents
 * 
 * @param {*} corpusthe name of the corpus
 * @param {*} documents the documents returned from couchDB
 */
async function documentTableBuilder(corpus, documents) {

    document.getElementById('search-table').style.display = "none";

    var rows = [];

    for (var doc in documents) {
        var row = [];

        if (documents[doc]['doc'] != null && documents[doc]['doc']._attachments != null) {
            row.push(documents[doc].id);
            row.push(documents[doc]['doc']['document-title']);

            var keys = Object.keys(documents[doc]);
            var keys = Object.keys(documents[doc]['doc']._attachments);

            row.push(keys[0]);
            rows.push(row);
            row.push(documents[doc]['doc']['document-date']);

        }

    }

    var columns = ["ID", "Title", "Attachment", "Date"];

    var dataview = new DataView(columns, rows);
    let painter = new Painter();

    let widths = [];

    widths.push(300);
    widths.push(700);
    widths.push(800);
    widths.push(200);

    tableView = new TableView({
        "container": "#search-table",
        "model": dataview,
        "nbRows": dataview.Length,
        "rowHeight": 30,
        "headerHeight": 30,
        "painter": painter,
        "columnWidths": widths
    });

    tableView.addProcessor(async function (button, row, x, y) {

        removeAllEventListeners("table-popup-menu-item-view");
        removeAllEventListeners("table-popup-menu-item-link");
        removeAllEventListeners("table-popup-menu-item-edit");

        if (button == 0) {
    
            document.getElementById("active-corpus").value = "document";
            document.getElementById("active-id").value = rows[row][0];

            processDocumentDetails(rows[row][0], "document-entry-details");

        } else if (button == 2) {
            var popupmenu = document.getElementById("table-popup-menu"); 

            popupmenu.style.left = `${x}px`;
            popupmenu.style.top = `${y}px`;
            
            popupmenu.style.display = "inline-block";

            popupmenu.addEventListener('click', (e) => {

                document.getElementById("table-popup-menu").style.display = "none";
               
            });

            document.getElementById("table-popup-menu-item-view").addEventListener('click', (e) => {

                document.getElementById("table-popup-menu").style.display = "none";

                document.getElementById("active-corpus").value = "document";
                document.getElementById("active-id").value = rows[row][0];
    
                processDocumentDetails(rows[row][0], "document-entry-details");

            });

            document.getElementById("table-popup-menu-item-link").addEventListener('click', (e) => {

                document.getElementById("link-dialog").showModal();
    
            });

            document.getElementById("table-popup-menu-item-edit").addEventListener('click', (e) => {

                document.getElementById("table-popup-menu").style.display = "none";
    
                editDocument(rows[row][0], rows[row][2]);

            });

        }

    });

    document.getElementById('search-table').style.display = "inline-block";

    window.setTimeout(function () {
        tableView.setup();
        tableView.resize();

        clearDetails();
        document.getElementById("wait-dialog").close();

    }, 10);

}

/**
 * Populate the Corpus Table
 * 
 * @param {String} corpus the entry
 * @param {*} documents a list of JSON documents returned from couchDB
 */
function corpusTableBuilder(corpus, documents) {

    document.getElementById('search-table').style.display = "none";

    var rows = [];

    for (var doc in documents) {
        var row = [];

        if (documents[doc]['doc'] != null) {

            console.log(JSON.stringify(documents[doc]));

            row.push(documents[doc].id);
            row.push(documents[doc]['doc'][`${corpus}-title`]);
            row.push(documents[doc]['doc'][`${corpus}-date`]);

            rows.push(row);

        }

    }

    var columns = ["ID", "Title", "Date"];

    var dataview = new DataView(columns, rows);
    let painter = new Painter();

    let widths = [];

    widths.push(300);
    widths.push(1300);
    widths.push(300);

    tableView = new TableView({
        "container": "#search-table",
        "model": dataview,
        "nbRows": dataview.Length,
        "rowHeight": 30,
        "headerHeight": 30,
        "painter": painter,
        "columnWidths": widths
    });

    tableView.addProcessor(async function (button, row, x, y) {

        removeAllEventListeners("table-popup-menu-item-view");
        removeAllEventListeners("table-popup-menu-item-link");
        removeAllEventListeners("table-popup-menu-item-edit");

        if (button == 0) {
    
            document.getElementById("active-corpus").value = "document";
            document.getElementById("active-id").value = rows[row][0];

            processCorpusDetails(corpus, rows[row][0], "corpus-entry-details");

        } else if (button == 2) {
            var popupmenu = document.getElementById("table-popup-menu"); 

            popupmenu.style.left = `${x}px`;
            popupmenu.style.top = `${y}px`;
            
            popupmenu.style.display = "inline-block";

            popupmenu.addEventListener('click', (e) => {

                document.getElementById("table-popup-menu").style.display = "none";
               
            });

            document.getElementById("table-popup-menu-item-view").addEventListener('click', (e) => {

                document.getElementById("table-popup-menu").style.display = "none";

                document.getElementById("active-corpus").value = "document";
                document.getElementById("active-id").value = rows[row][0];
    
                processDocumentDetails(rows[row][0], "document-entry-details");

            });

            document.getElementById("table-popup-menu-item-link").addEventListener('click', (e) => {

                document.getElementById("link-dialog").showModal();
    
            });

            document.getElementById("table-popup-menu-item-edit").addEventListener('click', (e) => {

                document.getElementById("table-popup-menu").style.display = "none";
    
                editDocument(rows[row][0], rows[row][2]);

            });

        }

    });

    document.getElementById('search-table').style.display = "inline-block";

    window.setTimeout(function () {
        tableView.setup();
        tableView.resize();

        clearDetails();

        document.getElementById("wait-dialog").close();

    }, 10);

}

/**
 * List the Entites - not a search
 * @param {*} corpus the active corpus
 */
async function listEntities(corpus) {
    document.getElementById("wait-dialog").showModal();

    if (corpus == DOCUMENT) {
        listCorpus(DOCUMENT, documentTableBuilder);

    } else if (corpus == OBSERVATION) {
        listCorpus(OBSERVATION, corpusTableBuilder);

    } else if (corpus == LESSON) {
        listCorpus(LESSON, corpusTableBuilder);

    } else if (corpus == INSIGHT) {
        listCorpus(INSIGHT, corpusTableBuilder);
    }

}

/**
 * List the Observations
 * 
 * @param {String} the name of the corpus
 * @param {*} builder populates the table
 */
async function listCorpus(corpus, builder) {
    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);

    var listFunctionMap = {
        "document": function () {

            return couchDB.listDocuments();

        },
        "observation": function () {

            return couchDB.listObservations();

        },
        "insight": function () {

            return couchDB.listInsights();

        },
        "lesson": function () {

            return couchDB.listLessons();

        }

    }

    var result = await listFunctionMap[corpus]();

    builder(corpus, result.response);

}

/**
 * Search the Entites - this is a search
 * @param {*} corpus the active corpus
 */
async function searchEntities(corpus) {
    document.getElementById("wait-dialog").showModal();

    if (corpus == DOCUMENT) {
        searchCorpus(DOCUMENT, documentTableBuilder);

    } else if (corpus == OBSERVATION) {
        searchCorpus(OBSERVATION, corpusTableBuilder);

    } else if (corpus == LESSON) {
        searchCorpus(LESSON, corpusTableBuilder);

    } else if (corpus == INSIGHT) {
        searchCorpus(INSIGHT, corpusTableBuilder);
    }

}


/**
 * List the Observations
 * 
 * @param {String} the name of the corpus
 * @param {*} builder populates the table
 */
async function searchCorpus(corpus, builder) {
    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);

    var keywords = document.getElementById("search-argument").value;
    var startDate = document.getElementById("search-start-date").value;
    var endDate = document.getElementById("search-end-date").value;

    var result = await couchDB.search(corpus, keywords, startDate, endDate);

    builder(corpus, result.response.results);

}

/**
 * save the Entry to the nominated corpus
 * @param {String} baseTemplate the empty tem
 */
async function saveEntry(corpus, baseTemplate) {
    var waitDialog = document.getElementById("wait-dialog");

    waitDialog.showModal();

    var template = new Template(corpus, baseTemplate);

    template.setValuesFromClass(`${template.corpus}-dialog`, "template-entry");
    template.setValue(`${template.corpus}-hot-topic`,
        new Boolean(document.getElementById(`${template.corpus}-hot-topic`).value));

    addKeywords(`${template.corpus}-keywords`, template);
    template.setTracking(`${template.corpus}-tracking-table`);

    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
    var result = await couchDB.save(template);

    document.getElementById(`${template.corpus}-dialog`).close();

    waitDialog.close();

}

function resize() {

}

/**
 * Respond to the Document 'ready' event
 */
window.onload = function () {
    var closeButtons = document.getElementsByClassName("close-button");

    for (var closeButton = 0; closeButton < closeButtons.length; closeButton++) {

        closeButtons[closeButton].addEventListener('click', (e) => {

            document.getElementById(e.target.id.replace(/close\-|cancel\-/, "")).close();

        });

    }

    window.addEventListener('resize', (e) => {

        resize();

    });

    document.addEventListener("click", (e) => {
        document.getElementById("table-popup-menu").style.display = "none";
      
        return true;

    });

    document.getElementById('connect-couchdb').addEventListener('click', (e) => {

        document.getElementById("connect-message").innerHTML = (e != null && e.message != null) ? e.message : "";

        document.getElementById("connect-dialog").showModal();

        return false;

    });

    document.getElementById('update-settings').addEventListener('click', (e) => {

        document.getElementById("settings-dialog").showModal();

        return false;

    });

    document.getElementById('search-database').addEventListener('click', async (e) => {
        var waitDialog = document.getElementById("wait-dialog");

        if (document.getElementById("search-argument").value.length == 0) {
            listEntities(activeCorpus);
        } else {
            searchEntities(activeCorpus);
        }

        return false;

    });

    document.getElementById('add-document').addEventListener('click', (e) => {

        clearDialog(document.getElementById("document-dialog"));

        document.getElementById("document-template").value = "";
        document.getElementById("document-upload-label").innerHTML = "No attachment uploaded";

        activateTab('document-tabs', 'document-general', 'document-tab1');

        document.getElementById("document-dialog").showModal();

        return false;

    });

    document.getElementById('add-document-keywords').addEventListener('click', (e) => {

        addKeywordField("document-keywords");

        return false;

    });

    document.getElementById('add-document-tracking').addEventListener('click', (e) => {

        addTrackingRow("document-tracking-table");

        return false;

    });


    document.getElementById('add-observation-keywords').addEventListener('click', (e) => {

        addKeywordField("observation-keywords");

        return false;

    });

    document.getElementById('add-observation-tracking').addEventListener('click', (e) => {

        addTrackingRow("observation-tracking-table");

        return false;

    });

    document.getElementById('add-lesson-keywords').addEventListener('click', (e) => {

        addKeywordField("lesson-keywords");

        return false;

    });


    document.getElementById('add-lesson-tracking').addEventListener('click', (e) => {

        addTrackingRow("lesson-tracking-table");

        return false;

    });

    document.getElementById('add-insight-keywords').addEventListener('click', (e) => {

        addKeywordField("insight-keywords");

        return false;

    });


    document.getElementById('add-insight-tracking').addEventListener('click', (e) => {

        addTrackingRow("insight-tracking-table");

        return false;

    });

    document.getElementById('document-upload').addEventListener('click', (e) => {
        var fileUtil = new FileUtil(document);

        fileUtil.load(async function (files) {

            function base64Upload(file) {

                return new Promise((resolve, reject) => {
                    const reader = new window.FileReader();

                    reader.addEventListener('load', () => {
                        resolve({ data: reader.result });
                    });

                    reader.addEventListener('error', err => {
                        reject(err);
                    });

                    reader.addEventListener('abort', () => {
                        reject();
                    });

                    reader.readAsDataURL(file);

                });

            }

            for (var file = 0; file < files.length; file++) {
                document.getElementById('document-upload-label').innerHTML = files[file].name;

                attachment = files[file];

            }

        });

        return false;

    });

    document.getElementById("ok-connect-dialog").addEventListener("click", async function (event) {
        var waitDialog = document.getElementById("wait-dialog");

        document.getElementById("details").innerHTML = "";

        waitDialog.showModal();

        try {
            var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
            var result = await couchDB.connect();

            document.getElementById("couchdb-status").innerHTML = `CouchDB Version: ${result['response']['version']} - &#128154;`;
            document.getElementById("connect-dialog").close();

            listEntities(DOCUMENT);
           
        } catch (e) {
            document.getElementById("connect-message").innerHTML = e.message;
            waitDialog.close();
        }

        return false;

    });

    document.getElementById("ok-apply-settings").addEventListener("click", async function (event) {

        if (document.getElementById("clear-favourites-cache").checked) {
            localStorage.setItem(FAVOURITES_STORAGE, JSON.stringify([]));
        }

        if (document.getElementById("clear-history-cache").checked) {
            localStorage.setItem(HISTORY_STORAGE, JSON.stringify([]));
        }

    });

    document.getElementById("save-document").addEventListener("click", async function (event) {

        if (attachment.length == 0) {

            document.getElementById("error-message").innerHTML = "<b>No</b> document uploaded!"

            document.getElementById("error-dialog").showModal();

            return 

        }
        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        var template = new Template(DOCUMENT, (document.getElementById("document-template").value == "") ? EMPTY_DOCUMENT
            : JSON.parse(document.getElementById("document-template").value));


        template.setValuesFromClass("document-dialog", "template-entry");
        template.setDate();
        template.setValue("document-hot-topic", new Boolean(document.getElementById("document-hot-topic").value));

        addKeywords("document-keywords", template);

        template.setTracking("document-tracking-table");

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.saveDocument(template, attachment);

        template = new Template(DOCUMENT, result.response[0].document);

        waitDialog.close();

        addLogRow("log-history", DOCUMENT, template.id, template.getValue("document-title"), template.getValue("document-date"));
        updateLocalStorage(HISTORY_STORAGE, DOCUMENT, id, template.getValue("document-title"), template.getValue("document-date"));

        document.getElementById("document-dialog").close();

        document.getElementById("save-message").innerHTML = "Document Saved";

        document.getElementById("save-dialog").showModal();

        return false;


    });

    document.getElementById("add-observation").addEventListener("click", async function (event) {

        clearDialog(document.getElementById("observation-dialog"));

        activateTab('observation-tabs', 'observation-general', 'observation-tab1');

        document.getElementById("observation-dialog").showModal();

    });

    document.getElementById("save-observation").addEventListener("click", async function (event) {
        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        var template = new Template(OBSERVATION, (document.getElementById("observation-template").value == "") ? EMPTY_DOCUMENT
            : JSON.parse(document.getElementById("observation-template").value));

        template.setValuesFromClass("observation-dialog", "template-entry");
        template.setDate();

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.save(template);

        template = new Template(OBSERVATION, result.response[0].document);

        addLogRow("log-history", OBSERVATION, template.id, template.getValue("observation-title"), template.getValue("observation-date"));
        updateLocalStorage(HISTORY_STORAGE, OBSERVATION, template.id, template.getValue("observation-title"), template.getValue("observation-date"));

        document.getElementById("observation-dialog").close();

        waitDialog.close();

    });

    document.getElementById("add-insight").addEventListener("click", async function (event) {

        clearDialog(document.getElementById("insight-dialog"));

        activateTab('insight-tabs', 'insight-general', 'insight-tab1')

        document.getElementById("insight-dialog").showModal();

    });

    document.getElementById("save-insight").addEventListener("click", async function (event) {
        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        var template = new Template(INSIGHT, (document.getElementById("insight-template").value == "") ? EMPTY_DOCUMENT
            : JSON.parse(document.getElementById("insight-template").value));
        template.setValuesFromClass("insight-dialog", "template-entry");
        template.setDate();

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.save(template);

        template = new Template(INSIGHT, result.response[0].document);

        addLogRow("log-history", INSIGHT, template.id, template.getValue("insight-title"), template.getValue("insight-date"));
        updateLocalStorage(HISTORY_STORAGE, INSIGHT, template.id, template.getValue("insight-title"), template.getValue("insight-date"));

        document.getElementById("insight-dialog").close();

        waitDialog.close();

    });

    document.getElementById("add-lesson").addEventListener("click", async function (event) {

        clearDialog(document.getElementById("lesson-dialog"));

        activateTab('lesson-tabs', 'lesson-general', 'lesson-tab1')

        document.getElementById("lesson-dialog").showModal();

    });

    document.getElementById("save-lesson").addEventListener("click", async function (event) {
        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        var template = new Template(LESSON, (document.getElementById("lesson-template").value == "") ? EMPTY_DOCUMENT
            : JSON.parse(document.getElementById("lesson-template").value));
        template.setValuesFromClass("lesson-dialog", "template-entry");
        template.setDate();

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.save(template);

        template = new Template(LESSON, result.response[0].document);

        addLogRow("log-history", LESSON, template.id, template.getValue("lesson-title"), template.getValue("lesson-date"));
        updateLocalStorage(HISTORY_STORAGE, LESSON, template.id, template.getValue("lesson-title"), template.getValue("lesson-date"));

        document.getElementById("lesson-dialog").close();

        waitDialog.close();

    });

    document.getElementById("link-entry").addEventListener("click", async function (event) {
        var waitDialog = document.getElementById("wait-dialog");

        var sourceCorpus = document.getElementById("active-corpus").value;
        var sourceId = document.getElementById("active-id").value;

        var targetCorpus = document.getElementById("pinned-corpus").value;
        var targetId = document.getElementById("pinned-id").value;

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);

        var result = await couchDB.link(sourceCorpus, sourceId, targetCorpus, targetId);

        waitDialog.close();
    });

    var corpusSelections = document.getElementsByName("corpus");

    for (var corpusSelection = 0; corpusSelection < corpusSelections.length; corpusSelection++) {

        corpusSelections[corpusSelection].addEventListener('change', (e) => {

            if (e.currentTarget.id == "search-documents") {

                activeCorpus = DOCUMENT;
                listEntities(activeCorpus);

                document.getElementById("search-argument").style.backgroundColor = "rgb(230, 255, 255)";
                document.getElementById("search-argument").placeholder = "Search Documents...";

            } else if (e.currentTarget.id == "search-observations") {

                activeCorpus = OBSERVATION;
                listEntities(activeCorpus);

                document.getElementById("search-argument").style.backgroundColor = "rgb(255, 255, 230)";
                document.getElementById("search-argument").placeholder = "Search Observations...";

            } else if (e.currentTarget.id == "search-lessons") {

                activeCorpus = LESSON;
                listEntities(activeCorpus);

                document.getElementById("search-argument").style.backgroundColor = "rgb(255, 230, 230)";
                document.getElementById("search-argument").placeholder = "Search Lessons...";

            } else if (e.currentTarget.id == "search-insights") {

                activeCorpus = INSIGHT;
                listEntities(activeCorpus);

                document.getElementById("search-argument").style.backgroundColor = "rgb(200, 255, 200)";
                document.getElementById("search-argument").placeholder = "Search Insights...";

            }

        });

    }

    var favourites = localStorage.getItem(FAVOURITES_STORAGE);

    if (favourites != null) {
        var favouriteMap = JSON.parse(favourites);

        for (var favourite in favouriteMap) {

            addLogRow("favourites-entries", favouriteMap[favourite].corpus, favouriteMap[favourite].id, favouriteMap[favourite].title, favouriteMap[favourite].date);

        }

    }

    populateLogTable(FAVOURITES_STORAGE, "favourites-entries");
    populateLogTable(HISTORY_STORAGE, "log-history");

    setCollapsible();

    document.getElementById("connect-dialog").showModal();

}