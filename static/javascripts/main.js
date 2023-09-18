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

var id = 0;

const SEARCH_TEMPLATES = {

    "document": "search-documents",
    "observation": "search-observations",
    "insight": "search-insights",
    "lesson": "search-lessons",
}

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

    const tableBody = element.querySelectorAll(".table-view");

    tableBody.forEach((item) => {

        item.parentNode.removeChild(item);

    });

}

/**
 * Add a keyword input field to a keword container
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
 * Delete a keyword from the list
 * 
 * @param {String} elementId 
 */
function deleteKeyword(elementId) {
    let element = document.getElementById(elementId);

    element.parentNode.removeChild(element);

}

/**
 * Inactivate Tabs
 * 
 */
function inactivateTabs(group) {
    var iTab, tabcontent, tabbuttons, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementById(group).querySelectorAll(".tabcontent");

    console.log(group);

    for (iTab = 0; iTab < tabcontent.length; iTab++) {
        tabcontent[iTab].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementById(group).querySelectorAll(".tablinks");
    for (iTab = 0; iTab < tablinks.length; iTab++) {
        tablinks[iTab].className = tablinks[iTab].className.replace(" active", "");
        tablinks[iTab].style.textDecoration = "none";
    }

}

/**
 * Show the Active Tab
 * 
 * @param {*} evt the Tab to Show
 * @param {String} group the group name of the Tab
 * @param {String} tab the name of the Tab
 * @param {String} button the Tab's button
 */
function showTab(evt, group, tab, button) {

    inactivateTabs(group);

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    document.getElementById(button).style.textDecoration = "underline";

    if (evt != null && evt.currentTarget != null) {
        evt.currentTarget.className += " active";
    }

}

/**
 * Active a nominated Tab
 * 
 * @param {*} evt the Tab to Show
 * @param {String} id the tab to activate
 * @param {String} group the group name of the Tab
 * @param {String} tab the name of the Tab
 * @param {String} button the Tab's button
 */
function activateTab(group, tab, button) {

    inactivateTabs(group);

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    document.getElementById(button).style.textDecoration = "underline";
    document.getElementById(tab).className += " active";

}

/**
 * Show the Document Deatails
 * @param {String} id the document identifier
 * @param {String} detailsTemplate the HTML template
 */
async function showDocumentDetails(id, detailsTemplate) {
    var waitDialog = document.getElementById("wait-dialog");
    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
    var result = await couchDB.getDocument(id);

    var template = new Template(result.response);

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

    removeAllEventListeners("view-attachment");
    removeAllEventListeners("edit-document");
    removeAllEventListeners("delete-document");

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

        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        clearDialog(document.getElementById("document-dialog"));

        var result = await couchDB.getDocument(id);

        var template = new Template(document, result.response);

        attachment = null;

        activateTab('document-tabs', 'document-general', 'document-tab1');

        document.getElementById("document-template").value = template.toString();

        document.getElementById("document-upload-label").innerHTML = attachments[0].name;
        document.getElementById("current-attachment-name").innerHTML = attachments[0].name;

        template.getValuesForClass("document-dialog", "template-entry");

        populateKeywords("document-keywords", template);

        waitDialog.close();

        document.getElementById("document-dialog").showModal();

        return false;

    });

    document.getElementById('delete-document').addEventListener('click', async (e) => {

        document.getElementById('delete-entry').addEventListener('click', async (e) => {

            waitDialog.showModal();

            var result = await couchDB.getDocument(id);

            var template = new Template(DOCUMENT, result.response);

            couchDB.delete("document", template);

            if (document.getElementById("search-documents").checked) {

                listDocuments(function () {
                    document.getElementById("details").innerHTML = "";
                    waitDialog.close();
                    document.getElementById("save-message").innerHTML = "Document Deleted";
                    document.getElementById("save-dialog").showModal();
                });

            }

        });

        document.getElementById("delete-dialog").showModal();

        return false;

    });

    waitDialog.close();

}

/**
 * Show the Corpus Details
 * @param {String} id the corpus identifier
 * @param {String} corpus the corpus name
 * @param {String} corpus the corpus name
 */
async function showCorpusDetails(id, corpus, detailsTemplate) {
    var waitDialog = document.getElementById("wait-dialog");
    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
    var result = await couchDB.getDocument(id);

    var template = new Template(corpus, result.response);

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

    removeAllEventListeners("edit-document");
    removeAllEventListeners("delete-document");

    document.getElementById('edit-document').addEventListener('click', async (e) => {

        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        clearDialog(document.getElementById("`${corpus}-dialog`"));

        var result = await couchDB.getDocument(id);

        var template = new Template(DOCUMENT, result.response);

        attachment = null;

        document.getElementById("document-template").value = template.toString();

        document.getElementById("document-upload-label").innerHTML = attachments[0].name;
        document.getElementById("current-attachment-name").innerHTML = attachments[0].name;

        template.getValuesForClass("document-dialog", "template-entry");

        populateKeywords("document-keywords", template);

        waitDialog.close();

        document.getElementById("document-dialog").showModal();

        return false;

    });

    document.getElementById('delete-document').addEventListener('click', async (e) => {

        document.getElementById('delete-entry').addEventListener('click', async (e) => {

            waitDialog.showModal();

            var result = await couchDB.getDocument(id);

            var template = new Template(DOCUMENT, result.response);

            couchDB.delete(template.corpus, template);

            if (document.getElementById("search-documents").checked) {

                listDocuments(function () {
                    document.getElementById("details").innerHTML = "";
                    waitDialog.close();
                    document.getElementById("save-message").innerHTML = "Document Deleted";
                    document.getElementById("save-dialog").showModal();
                });

            }

        });

        document.getElementById("delete-dialog").showModal();

        return false;

    });

    waitDialog.close();

}

/**
 * List the Documents
 */
async function listDocuments(callback) {
    document.getElementById('search-table').style.display = "none";

    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
    var result = await couchDB.listDocuments();
    var documents = result.response;
    var rows = [];

    for (var doc in documents) {
        var row = [];

        if (documents[doc]['doc'] != null && documents[doc]['doc']._attachments != null) {
            row.push(documents[doc].id);
            row.push(documents[doc]['doc']['document-title']);

            var keys = Object.keys(documents[doc]);

            console.log(documents[doc]['doc']._attachments);
            var keys = Object.keys(documents[doc]['doc']._attachments);
            row.push(keys[0]);
            rows.push(row);

        }

    }

    var columns = ["ID", "Title", "Attachment"];

    var dataview = new DataView(columns, rows);
    let painter = new Painter();

    let widths = [];

    widths.push(300);
    widths.push(700);
    widths.push(800);

    tableView = new TableView({
        "container": "#search-table",
        "model": dataview,
        "nbRows": dataview.Length,
        "rowHeight": 30,
        "headerHeight": 30,
        "painter": painter,
        "columnWidths": widths
    });

    tableView.addProcessor(async function (row) {
        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        showDocumentDetails(rows[row][0], "document-entry-details");

    });

    document.getElementById('search-table').style.display = "inline-block";

    window.setTimeout(function () {
        tableView.setup();
        tableView.resize();

        callback();

    }, 10);

}


/**
 * List the Observations
 * @param {*} callback called when the list has complted
 */
async function listCorpus(corpus, callback) {
    var listFunctionMap = {
        "observations": function () {

            return couchDB.listObservations();

        }

    }

    document.getElementById('search-table').style.display = "none";

    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);

    var result = await listFunctionMap[corpus]();

    var documents = result.response;
    var rows = [];

    for (var doc in documents) {
        var row = [];

        if (documents[doc]['doc'] != null) {
            var corpusName = documents[doc]['doc']["corpus"];

            row.push(documents[doc].id);
            row.push(documents[doc]['doc'][`${corpusName}-title`]);

            rows.push(row);

        }

    }

    var columns = ["ID", "Title"];

    var dataview = new DataView(columns, rows);
    let painter = new Painter();

    let widths = [];

    widths.push(300);
    widths.push(1300);

    tableView = new TableView({
        "container": "#search-table",
        "model": dataview,
        "nbRows": dataview.Length,
        "rowHeight": 30,
        "headerHeight": 30,
        "painter": painter,
        "columnWidths": widths
    });

    tableView.addProcessor(async function (row) {

        showCorpusDetails(rows[row][0], "");

    });

    document.getElementById('search-table').style.display = "inline-block";

    window.setTimeout(function () {
        tableView.setup();
        tableView.resize();

        callback();

    }, 10);

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

    var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
    var result = await couchDB.save(template);

    document.getElementById(`${template.corpus}-dialog`).close();

    if (document.getElementById(`SEARCH_TEMPLATES[${template.corpus}]`).checked) {

        listCorpus(`SEARCH_TEMPLATES[${template.corpus}]`, function () {
            waitDialog.close();
            document.getElementById("save-message").innerHTML = `${Capitalize(template.corpus)} Saved`;
            document.getElementById("save-dialog").showModal();
        });
    }

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

    window.addEventListener('resize', (e) => { });

    document.getElementById('connect-couchdb').addEventListener('click', (e) => {

        document.getElementById("connect-message").innerHTML = (e != null  && e.message != null) ? e.message : "";

        document.getElementById("connect-dialog").showModal();

        return false;

    });

    document.getElementById('search-database').addEventListener('click', async (e) => {
        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        listDocuments(function () {
            waitDialog.close();
        });

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

        addKeywordField("document-keywords")

        return false;

    });

    document.getElementById('add-observation-keywords').addEventListener('click', (e) => {

        addKeywordField("observation-keywords");

        return false;

    });

    document.getElementById('add-lesson-keywords').addEventListener('click', (e) => {

        addKeywordField("lesson-keywords");

        return false;

    });

    document.getElementById('add-insight-keywords').addEventListener('click', (e) => {

        addKeywordField("insight-keywords");

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

            listDocuments(function () {
                document.getElementById("connect-dialog").close();
                waitDialog.close();
                document.getElementById("cancel-connect-dialog").style.visibility = "visible";
            });

        } catch (e) {
            document.getElementById("connect-message").innerHTML = e.message;
            waitDialog.close();
        }

        return false;

    });

    document.getElementById("save-document").addEventListener("click", async function (event) {
        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

        var template = new Template(DOCUMENT, (document.getElementById("document-template").value == "") ? EMPTY_DOCUMENT
            : JSON.parse(document.getElementById("document-template").value));


        template.setValuesFromClass("document-dialog", "template-entry");
        template.setValue("document-hot-topic", new Boolean(document.getElementById("document-hot-topic").value));

        addKeywords("document-keywords", template);

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.saveDocument(template, attachment);

        closeDialogs();

        if (document.getElementById("search-documents").checked) {
            waitDialog.showModal();

            listDocuments(function () {
                waitDialog.close();
                document.getElementById("save-message").innerHTML = "Document Saved";
                document.getElementById("save-dialog").showModal();
            });
        }

    });

    document.getElementById("add-document-observation").addEventListener("click", async function (event) {

        clearDialog(document.getElementById("observation-dialog"));
        
        activateTab('observation-tabs', 'observation-general', 'observation-tab1')

        document.getElementById("observation-dialog").showModal();

    });

    document.getElementById("add-observation-insight").addEventListener("click", async function (event) {

        clearDialog(document.getElementById("insight-dialog"));
        
        activateTab('insight-tabs', 'insight-general', 'insight-tab1')

        document.getElementById("insight-dialog").showModal();

    });

    document.getElementById("add-observation-lesson").addEventListener("click", async function (event) {

        clearDialog(document.getElementById("lesson-dialog"));
        
        activateTab('lesson-tabs', 'lesson-general', 'lesson-tab1')

        document.getElementById("lesson-dialog").showModal();

    });

    document.getElementById("save-observation").addEventListener("click", async function (event) {

        saveEntry(new Template(OBSERVATION, EMPTY_OBSERVATION));

    });

    document.getElementById("save-lesson").addEventListener("click", async function (event) {

        saveEntry(new Template(LESSON, EMPTY_LESSON));

    });

    document.getElementById("save-insight").addEventListener("click", async function (event) {

        saveEntry(new Template(INSIGHT, EMPTY_INSIGHT));

    });

    var corpusSelections = document.getElementsByName("corpus");

    for (var corpusSelection = 0; corpusSelection < corpusSelections.length; corpusSelection++) {

        corpusSelections[corpusSelection].addEventListener('change', (e) => {
            var waitDialog = document.getElementById("wait-dialog");

            if (e.currentTarget.id == "search-documents") {
                waitDialog.showModal();
                listDocuments(function () {
                    document.getElementById("details").innerHTML = "";
                    waitDialog.close();
                });

                document.getElementById("search-argument").style.backgroundColor = "rgb(230, 255, 255)";
                document.getElementById("search-argument").placeholder = "Search Documents...";

            } else if (e.currentTarget.id == "search-observations") {
                waitDialog.showModal();
                listCorpus("observations", function () {
                    document.getElementById("details").innerHTML = "";
                    waitDialog.close();
                });

                document.getElementById("search-argument").style.backgroundColor = "rgb(255, 255, 230)";
                document.getElementById("search-argument").placeholder = "Search Observations...";

            } else if (e.currentTarget.id == "search-lessons") {
                waitDialog.showModal();
                listCorpus("lessons", function () {
                    document.getElementById("details").innerHTML = "";
                    waitDialog.close();
                });

                document.getElementById("search-argument").style.backgroundColor = "rgb(255, 230, 230)";
                document.getElementById("search-argument").placeholder = "Search Lessons...";
            } else if (e.currentTarget.id == "search-insights") {
                waitDialog.showModal();
                listCorpus("insights", function () {
                    document.getElementById("details").innerHTML = "";
                    waitDialog.close();
                });

                document.getElementById("search-argument").style.backgroundColor = "rgb(200, 255, 200)";
                document.getElementById("search-argument").placeholder = "Search Insights...";
            }

        });

    }

    setCollapsible();

    document.getElementById("connect-dialog").showModal();

}