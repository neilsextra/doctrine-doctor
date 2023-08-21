'use strict'

var splitter = undefined;
var bigTable = undefined;

var xOffset = 20;
var yOffset = 16;

var rows = [];
var types = {};
var columns = null;
var detailsTableHeight = 0;
var tableView = null;
var uploadedFileData = null;

var id = 0;

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
 * @param {*} template the template 
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
function addKeywordField(container)  {
    let keywords = document.getElementById(`${container}`);
    let template = document.querySelector('script[data-template="keyword-entry"]').innerHTML;
    let keywordElement = substitute(template, {
        id: id});

    let fragment = document.createRange().createContextualFragment(keywordElement);

    keywords.appendChild(fragment);

}

/**
 * Delete a keyword from the list
 * 
 * @param {*} elementId 
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
 * @param {*} tab the name of the Tab
 * @param {*} button the Tab's button
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

function resize() { }


/**
 * Respond to the Document 'ready' event
 */
window.onload = function () {

    window.addEventListener('resize', (e) => { });

    document.getElementById('connect-couchdb').addEventListener('click', (e) => {

        document.getElementById("connect-dialog").showModal();

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

                uploadedFileData = await base64Upload(files[file]);

            }

        });

        return false;

    });

    document.getElementById("ok-connect-dialog").addEventListener("click", async function (event) {
        var couchDB = new CouchDB(document.getElementById("couchdb-url").value);

        var result = await couchDB.connect();

        document.getElementById("connect-cancel-dialog").style.visibility = "visible";

        document.getElementById("couchdb-status").innerHTML = `CouchDB Version: ${result['response']['version']} - &#128154;`;

        document.getElementById("connect-dialog").close();

        return false;

    });
    
    document.getElementById("save-document").addEventListener("click", function (event) {
        let parmURL = "/save-document";

        var xhr = new XMLHttpRequest();

        var formData = new FormData();

        formData.append('couchdb-url', document.getElementById("couchdb-url").value);
        formData.append('document-title', document.getElementById("document-title").value);
        formData.append('document-description', document.getElementById("document-description").value);
        formData.append('document-hot-topics', document.getElementById("document-hot-topics").value);
        formData.append('document-page', document.getElementById("document-page").value);
        formData.append('document-country-of-origin', document.getElementById("document-country-of-origin").value);
        formData.append('document-content', uploadedFileData);

        xhr.open("POST", parmURL, true);

        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onload = function () {
            if (xhr.status != 200) {
                console.log('ERROR');
            } else {

            }
            console.log(xhr.response);

            var result = JSON.parse(xhr.response);

            var saveDialog = document.getElementById("save-dialog");

            saveDialog.showModal();

            closeDialogs();

            console.log(xhr.status);

        };

        xhr.onerror = function () {
        };

        xhr.send(new URLSearchParams(formData));

    });

    document.getElementById("save-observation").addEventListener("click", function (event) {
        let parmURL = "/save?corpus=observation";
        var xhr = new XMLHttpRequest();

        var formData = new FormData();

        formData.append('observation-title', document.getElementById("observation-title").value);
        formData.append('observation-description', document.getElementById("observation-description").value);
        formData.append('observation-recommendation', document.getElementById("observation-recommendation").value);
        formData.append('observation-hot-topics', document.getElementById("observation-hot-topics").value);

        xhr.open("POST", parmURL, true);

        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onload = function () {
            if (xhr.status != 200) {
                console.log('ERROR');
            } else {

            }
            console.log(xhr.response);

            var result = JSON.parse(xhr.response);

            var saveDialog = document.getElementById("save-dialog");

            saveDialog.showModal();
    
            closeDialogs();

            console.log(xhr.status);

        };

        xhr.onerror = function () {
        };

        xhr.send(new URLSearchParams(formData));

    });

    var closeButtons = document.getElementsByClassName("closeButton");

    for (var closeButton = 0; closeButton < closeButtons.length; closeButton++) {
 
        closeButtons[closeButton].addEventListener('click', (e) => {

            closeDialogs();

        });

    }

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

    }, 10);

    document.getElementById("connect-dialog").showModal();

}