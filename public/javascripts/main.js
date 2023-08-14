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
var tree = null;


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

    document.getElementById('connect').addEventListener('click', (e) => {

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

    var closeButtons = document.getElementsByClassName("closeButton");

    for (var closeButton = 0; closeButton < closeButtons.length; closeButton++) {
 
        closeButtons[closeButton].addEventListener('click', (e) => {

            var dialogs = document.getElementsByClassName("dialog")

            for (var dialog = 0; dialog < dialogs.length; dialog++) {
 
                dialogs[dialog].close();
            }

            return false;

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

}