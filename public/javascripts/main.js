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

var DOCUMENT_MENU = {
    'context1': {
        elements: [{
                text: 'Document Actions',
                icon: 'images/document-action-icon.png',
                action: function(node) {},
                submenu: {
                    elements: [{
                            text: 'Create Document',
                            icon: 'images/add-document-icon.png',
                            action: function(node) {
                                console.log("show dialog");
                                document.getElementById("add-document-dialog").showModal();
                            }

                        },

                    ]
                }

            }

        ]

    }

};

var CALLBACKS = {

    onclick: function(node) {

    },

    addchild: function(node) {
        node.setIcon('assets/images/folder-icon.png');
    },

    removechild: function(node) {

        if (node.childNodes.length == 0) {
            node.setIcon('assets/images/document-icon.png');
        } else {
            node.setIcon('assets/images/folder-icon.png');
        }

    }

};

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

function resize() {}


/**
 * Respond to the Document 'ready' event
 */
 window.onload = function() {

    window.addEventListener('resize', (e) => {});

    document.getElementById('connect').addEventListener('click', (e) => {

        return false;

    });

    
    document.getElementById('close-add-document-dialog').addEventListener('click', (e) => {
        
        document.getElementById("add-document-dialog").close();
        
        return false;

    });

    tree = createTree('threads', 'white', DOCUMENT_MENU, CALLBACKS);

    let root = tree.createNode('AKC Corpus', true, 'images/book-icon.png', null, null, 'document-menu');

    tree.drawTree();

    tree.selectNode(root);

    root.createChildNode("Documents", false, "images/document-icon.png", null, "context1");
    root.createChildNode("Observations", false, "images/observation-icon.png", null, "context1");
    root.createChildNode("Lessons", false, "images/lesson-icon.png", null, "context1");
    root.createChildNode("Insights", false, "images/insight-icon.png", null, "context1");

}