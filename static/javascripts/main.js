'use strict'

var bigTable = undefined;

var xOffset = 20;
var yOffset = 16;

var rows = [];
var types = {};
var columns = null;
var detailsTableHeight = 0;
var tableView = null;
var attachment = null;

var id = 0;

/**
 * DataView (required by Table View to display data)
 */
class DataView extends SyncTableModel {

    constructor(columns, data) {
        super();

        this.__columns = columns;
        this.__data = data;
        this.__records = data.length;
    }

    get Length() {
        return this.__records;
    }

    getCellSync(i, j, cb) {

        return this.__data[i][j];

    }

    getHeaderSync(j) {

        return this.__columns[j];

    };

    hasCell(i, j) {

        return i < this.__data.length && j < this.__columns.length;

    }

}

/**
 * Get the ID
 * @returns the ID
 */
function getID() {

    id += 1;

    return id;

}

/**
 * Parameter Substitution for templates
 * 
 * @param {String} template the template 
 * @param {*} values the values as a dictionary
 * @returns 
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
 * Close all the dialogs 
 * 
 */
function closeDialogs() {
    var dialogs = document.getElementsByClassName("dialog")

    for (var dialog = 0; dialog < dialogs.length; dialog++) {

        dialogs[dialog].close();
    }

}

/**
 * Add a keyword input field to a keword container
 * 
 * @param {*} container the Keyword Input Field's parent container 
 */
function addKeywordField(container) {
    let keywords = document.getElementById(`${container}`);
    let template = document.querySelector('script[data-template="keyword-entry"]').innerHTML;
    let keywordElement = substitute(template, {
        id: id
    });

    let fragment = document.createRange().createContextualFragment(keywordElement);

    keywords.appendChild(fragment);

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
function inactivateTabs() {
    var iTab, tabcontent, tabbuttons, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (iTab = 0; iTab < tabcontent.length; iTab++) {
        tabcontent[iTab].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (iTab = 0; iTab < tablinks.length; iTab++) {
        tablinks[iTab].className = tablinks[iTab].className.replace(" active", "");
        tablinks[iTab].style.textDecoration = "none";
    }

}

/**
 * Show the Active Tab
 * 
 * @param {*} evt the Tab to Show
 * @param {String} tab the name of the Tab
 * @param {String} button the Tab's button
 */
function showTab(evt, tab, button) {

    inactivateTabs();

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    document.getElementById(button).style.textDecoration = "underline";

    if (evt != null && evt.currentTarget != null) {
        evt.currentTarget.className += " active";
    }

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
            row.push(documents[doc]['doc'].title);

            var keys = Object.keys(documents[doc]);

            console.log(documents[doc]['doc']._attachments);
            var keys = Object.keys(documents[doc]['doc']._attachments);
            row.push(keys[0]);

            console.log(JSON.stringify(row));

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

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.getDocument(rows[row][0]);

        var template = new Template(result.response);

        let detailTemplate = document.querySelector('script[data-template="entry-details"]').innerHTML;

        let attachments = template.getAttachments();

        document.getElementById("details").innerHTML = substitute(detailTemplate, {
            id: rows[row][0],
            title: template.title,
            name: attachments[0].name,
            content_type: attachments[0].content_type,
            length: attachments[0].length,
            description: template.description
        });

        var content = couchDB.getAttachment(template, attachments[0].name);
        var pdfView = new PDFView(content, "pdf-view", 0.5);

        waitDialog.close();

    });

    document.getElementById('search-table').style.display = "inline-block";

    window.setTimeout(function () {
        tableView.setup();
        tableView.resize();

        callback();

    }, 10);

}

function resize() { }


/**
 * Respond to the Document 'ready' event
 */
window.onload = function () {
    var closeButtons = document.getElementsByClassName("closeButton");

    for (var closeButton = 0; closeButton < closeButtons.length; closeButton++) {

        closeButtons[closeButton].addEventListener('click', (e) => {

            closeDialogs();

        });

    }

    window.addEventListener('resize', (e) => { });

    document.getElementById('connect-couchdb').addEventListener('click', (e) => {

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

    document.getElementById('add-insight').addEventListener('click', (e) => {

        clearDialog(document.getElementById("insight-dialog"));

        document.getElementById("insight-dialog").showModal();

        showTab(null, 'insight-general', 'insight-tab1');

        return false;

    });

    document.getElementById('add-document').addEventListener('click', (e) => {

        clearDialog(document.getElementById("document-dialog"));

        document.getElementById("document-upload-label").innerHTML = "No attachment uploaded";
        document.getElementById("document-dialog").showModal();

        showTab(null, 'document-general', 'document-tab1');

        return false;

    });


    document.getElementById('add-observation').addEventListener('click', (e) => {

        clearDialog(document.getElementById("observation-dialog"));

        document.getElementById("observation-dialog").showModal();

        showTab(null, 'observation-general', 'observation-tab1');

        return false;

    });

    document.getElementById('add-lesson').addEventListener('click', (e) => {

        clearDialog(document.getElementById("lesson-dialog"));

        document.getElementById("lesson-dialog").showModal();

        showTab(null, 'lesson-general', 'lesson-tab1');

        return false;

    });

    document.getElementById('add-insight').addEventListener('click', (e) => {

        document.getElementById("insight-dialog").showModal();

        showTab(null, 'insight-general', 'insight-tab1');

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

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.connect();

        document.getElementById("couchdb-status").innerHTML = `CouchDB Version: ${result['response']['version']} - &#128154;`;

        listDocuments(function () {
            document.getElementById("connect-dialog").close();
            waitDialog.close();
            document.getElementById("connect-cancel-dialog").style.visibility = "visible";
        });

        return false;

    });

    document.getElementById("save-document").addEventListener("click", async function (event) {
        var waitDialog = document.getElementById("wait-dialog");

        waitDialog.showModal();

       var template = new Template(EMPTY_DOCUMENT);

        template.title = document.getElementById("document-title").value;
        template.description = document.getElementById("document-description").value;
        template.hotTopic = new Boolean(document.getElementById("document-hot-topic").value);
        template.pageNo = parseInt(document.getElementById("document-page").value);
        template.countryOfOrigin = document.getElementById("document-country-of-origin").value;

        const keywords = document.getElementById("document-keywords").querySelectorAll(".document-keyword-entry");

        for (var keyword in keywords) {
            console.log(keyword);
        }

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.saveDocument(template, attachment);

        waitDialog.close();

        closeDialogs();

        var saveDialog = document.getElementById("save-dialog");

        saveDialog.showModal();

    });

    document.getElementById("save-observation").addEventListener("click", async function (event) {
        var template = new Template(OBSERVATION);

        template.title = document.getElementById("observation-title").value;
        template.description = document.getElementById("observation-description").value;
        template.hotTopic = new Boolean(document.getElementById("observation-hot-topic").value);
        template.pageNo = parseInt(document.getElementById("observation-page").value);
        template.countryOfOrigin = document.getElementById("observation-country-of-origin").value;

        const keywords = document.getElementById("observation-keywords").querySelectorAll("input[type=text]");

        for (var keyword in keywords) {
            console.log(keyword);
        }

        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);
        var result = await couchDB.saveObservation(template);

        closeDialogs();

        var saveDialog = document.getElementById("save-dialog");

        saveDialog.showModal();

    });

    var corpusSelections = document.getElementsByName("corpus");

    for (var corpusSelection = 0; corpusSelection < corpusSelections.length; corpusSelection++) {

        corpusSelections[corpusSelection].addEventListener('change', (e) => {

            if (e.currentTarget.id == "search-documents") {
                document.getElementById("search-argument").style.backgroundColor = "rgb(230, 255, 255)";
                document.getElementById("search-argument").placeholder = "Search Documents...";
            } else if (e.currentTarget.id == "search-observations") {
                document.getElementById("search-argument").style.backgroundColor = "rgb(255, 255, 230)";
                document.getElementById("search-argument").placeholder = "Search Observations...";
            } else if (e.currentTarget.id == "search-lessons") {
                document.getElementById("search-argument").style.backgroundColor = "rgb(255, 230, 230)";
                document.getElementById("search-argument").placeholder = "Search Lessons...";
            } else if (e.currentTarget.id == "search-insights") {
                document.getElementById("search-argument").style.backgroundColor = "rgb(200, 255, 200)";
                document.getElementById("search-argument").placeholder = "Search Insights...";
            }

        });

    }

    setTimeout(function () {
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

        for (var content = 0; content < collapsible.length; content++) {
            collapsible[content].click();
        }

        setTimeout(function () {
            var collapsible = document.getElementsByClassName("collapsible");

            for (var iCollapsible = 0; iCollapsible < collapsible.length; iCollapsible++) {

                var content = collapsible[iCollapsible].nextElementSibling;

                content.style.transition = "max-height 0.2s ease-out";
            }

        }, 10);


    }, 0);

    document.getElementById("connect-dialog").showModal();

}