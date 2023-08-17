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

        document.getElementById("insight-dialog").showModal();

        return false;

    });

    document.getElementById('add-document').addEventListener('click', (e) => {

        document.getElementById("document-dialog").showModal();

        showTab(null, 'document-general', 'document-tab1');

        return false;

    });


    document.getElementById('add-observation').addEventListener('click', (e) => {

        document.getElementById("observation-dialog").showModal();

        showTab(null, 'observation-general', 'observation-tab1');

        return false;

    });

    document.getElementById('add-lesson').addEventListener('click', (e) => {

        document.getElementById("lesson-dialog").showModal();

        showTab(null, 'lesson-general', 'lesson-tab1');

        return false;

    });

    document.getElementById('add-insight').addEventListener('click', (e) => {

        document.getElementById("insight-dialog").showModal();

        showTab(null, 'insight-general', 'insight-tab1');

        return false;

    });

    document.getElementById('ok-connect-dialog').addEventListener('click', (e) => {


        document.getElementById("connect-dialog").close();

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

    });
    
    document.getElementById("save-document").addEventListener("click", function (event) {
        let parmURL = "/save?corpus=document";

        var xhr = new XMLHttpRequest();

        var formData = new FormData();

        formData.append('couchdb-url', document.getElementById("couchdb-url").value);
        formData.append('document-title', document.getElementById("document-title").value);
        formData.append('document-description', document.getElementById("document-description").value);
        formData.append('document-hot-topics', document.getElementById("document-hot-topics").value);
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