function createTree(div, backColor, contextMenu, callbacks) {
    var expand_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAP1BMVEUAAACVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpabOh2duAAAAFHRSTlMAAQsOFBheY3h5e4WGiLfD197g6AKE2vwAAAA4SURBVBhXY2DAAlgFmFEF2ESE0US4iBDhxBDhICzCKCjChyLAKyLEhI/PQ4DPjcZnR+MzsPAj8QFk4gLFdH6sXAAAAABJRU5ErkJggg==";
    var collapse_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAOVBMVEUAAACVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaaVpaapFRCOAAAAEnRSTlMABQYQERQVHjthZnBzfo7p6/GnIDUbAAAAR0lEQVQYV53IORaAMAwD0QHCZjZb9z8sDc8EyqjSH2hYX/0OOGJMFz9hVZbi2gBTTAAMrh3ekn5KZTDFclUGkz4G+xlm2ncDeu4CtLEndvMAAAAASUVORK5CYII=";
    var menu_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAIVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABt0UjBAAAACnRSTlMAAQOUl5q3vMDcYnh4SwAAAEFJREFUCFtjYIADDkcog2upAJSxKhDGgApxrYIKARkQISBjlQGMkQBlLFeAMoqgiiECQEYR1ECoAAMnVICBCWIBAIEPE827Ja8hAAAAAElFTkSuQmCC";
    var empty_image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    function checkParentage(source, target) {

        if (source == null || target == null) {
            return false;
        }

        if (source.id == target.id) {
            return false;
        }

        if (source.childNodes.length == 0) {
            return true;
        }

        let parent = target;

        while (parent != null) {
            if (parent.id == source.id) {

                return false;
            }

            parent = parent.parent;

        }

        return true;

    }

    function createSimpleElement(type, id, className) {
        element = document.createElement(type);
        if (id != undefined) {
            element.id = id;
        }

        if (className != undefined) {
            element.className = className;
        }

        return element;
        
    }

    function createImgElement(id, className, src, width, height) {
        element = document.createElement('img');
        if (id != undefined) {
            element.id = id;
        }

        if (className != undefined) {
            element.className = className;
        }

        if (src != undefined) {
            element.src = src;
        }

        if (width != undefined) {
            element.style.width = `${width}px`;
        }

        if (height != undefined) {
            element.style.height = `${height}px`;
        }

        return element;

    }

    /**
     * Get an elements position
     * 
     * @param {element} el the elemnt position
     * 
     * @return the x,y coordinates of the element
     */
    function getPosition(el) {
        var xPos = 0;
        var yPos = 0;

        while (el) {
            if (el.tagName == "BODY") {
                // deal with browser quirks with body/window/document and page scroll
                var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                var yScroll = el.scrollTop || document.documentElement.scrollTop;

                xPos += (el.offsetLeft - xScroll + el.clientLeft);
                yPos += (el.offsetTop - yScroll + el.clientTop);
            } else {
                // for all other non-BODY elements
                xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                yPos += (el.offsetTop - el.scrollTop + el.clientTop);
            }

            el = el.offsetParent;
        }

        return {
            x: xPos,
            y: yPos
        };
    }

    /**
     * Get the size of the view area
     * 
     * return the size (x,y) of the view area
     * 
     */
    function getWindowSize() {
        var win = window,

            doc = document,
            docElem = doc.documentElement,
            body = doc.getElementsByTagName('body')[0],
            x = win.innerWidth || docElem.clientWidth || body.clientWidth,
            y = win.innerHeight || docElem.clientHeight || body.clientHeight;

        return {
            x: x,
            y: y
        }
    }
    /**
     * Create the Separator
     * @param {element} ulElement 
     * @param {object} tree 
     * @param {object} node 
     */
    function createSeparator(ulElement, tree, node) {
        node.separator = document.createElement('li');
        node.separator.style.height = "2px";
        node.separator.id = `sep-${node.id}`;
        node.separator.ondragover = function(event) {
            for (var i = 0; i < event.dataTransfer.types.length; i++) {
                var type = event.dataTransfer.types[i];
            }

            if (!checkParentage(nodeTree.draggedNode, node)) {
                return false;
            }

            event.preventDefault();

        }

        node.separator.ondragenter = function(event) {

            if (!checkParentage(nodeTree.draggedNode, node)) {
                return false;
            }

            event.preventDefault();
            node.separator.innerHTML = "<hr/>";
            node.separator.style.height = "15px";

        }

        node.separator.ondragleave = function(event) {
            event.preventDefault();
            let data = event.dataTransfer.getData("text");

            node.separator.style.height = "2px";

            while (node.separator.firstChild) {
                node.separator.removeChild(node.separator.firstChild);
            }

        }

        node.separator.ondrop = function(event) {
            event.preventDefault();

            node.separator.style.height = "2px";
            node.separator.innerHTML = "&nbsp;";

            var index = tree.draggedNode.parent.childNodes.indexOf(tree.draggedNode);
            var cloneLi = tree.draggedNode.elementLi.cloneNode(true);

            tree.draggedNode.ulElement.removeChild(tree.draggedNode.separator);

            tree.draggedNode.parent.elementLi.getElementsByTagName("ul")[0].removeChild(tree.draggedNode.elementLi);

            nodeTree.draggedNode.elementLi = cloneLi;
            nodeTree.draggedNode.ulElement = node.ulElement;

            createSeparator(node.ulElement, tree, nodeTree.draggedNode);

            nodeTree.draggedNode.parent.childNodes.splice(index, 1);

            var span = cloneLi.getElementsByTagName("span")[0];
            var images = cloneLi.getElementsByClassName("exp_col");

            decorateNode(tree, nodeTree.draggedNode, span, images[0]);

            node.ulElement.appendChild(cloneLi);

            var separator = document.getElementById(`sep-${node.id}`);

            node.ulElement.insertBefore(tree.draggedNode.separator, separator);
            node.ulElement.insertBefore(cloneLi, separator);

            index = node.parent.childNodes.indexOf(node);
            node.parent.childNodes.splice(index, 0, tree.draggedNode);

            invokeCallack('removechild', tree, tree.draggedNode.parent);

            redrawNode(tree.draggedNode.parent);

            nodeTree.draggedNode = null;

        }

        node.separator.innerHTML = `&nbsp;`;

        ulElement.appendChild(node.separator);

    }

    function decorateNode(tree, node, span, toggleColumn) {

        span.ondblclick = function() {
            if (tree.callbacks && tree.callbacks.hasOwnProperty('ondblclick')) {
                tree.callbacks['ondblclick'](node);
            }
            tree.doubleClickNode(node);
        };

        span.ondragstart = function(event) {

            if (tree.editing) {
                tree.draggedNode = null;
                return;
            }

            tree.draggedNode = node;

            event.dataTransfer.setData("text/plain", node.id);

        };

        span.onclick = function() {

            nodeTree.selectNode(node);

            if (nodeTree.callbacks && nodeTree.callbacks.hasOwnProperty('onclick')) {
                nodeTree.callbacks['onclick'](node);
            }

        };

        span.oncontextmenu = function(e) {
            nodeTree.selectNode(node);
            nodeTree.nodeContextMenu(e, node);
        };

        span.ondrop = function(event) {

            if (!checkParentage(nodeTree.draggedNode, node)) {
                return false;
            }

            if (nodeTree.callbacks && nodeTree.callbacks.hasOwnProperty('ondrop')) {
                nodeTree.callbacks['ondrop'](event);
            }

            span.style.color = null;

            var index = tree.draggedNode.parent.childNodes.indexOf(tree.draggedNode);
            tree.draggedNode.parent.childNodes.splice(index, 1);

            var parent = tree.draggedNode.parent;

            node.moveChildNode(nodeTree.draggedNode);

            invokeCallack('addchild', tree, node);

            redrawNode(tree.draggedNode.parent);
            redrawNode(parent);

            invokeCallack('addchild', tree, tree.draggedNode.parent);
            invokeCallack('removechild', tree, parent);

            nodeTree.draggedNode = null;

        }

        span.ondragover = function(event) {

            if (!checkParentage(nodeTree.draggedNode, node)) {
                return false;
            }

            event.preventDefault();

            if (tree.callbacks && tree.callbacks.hasOwnProperty('ondropover')) {
                tree.callbacks['ondragover'](event);
            }

            span.style.color = 'rgba(0, 0, 0, 0.2)';

        }

        span.ondragleave = function(event) {
            span.style.color = null;
        }

        toggleColumn.onclick = function() {
            tree.toggleNode(node);
        };

    }

    function invokeCallack(callback, tree, node) {
        if (tree.callbacks && tree.callbacks.hasOwnProperty(callback)) {
            tree.callbacks[callback](node);
        }

    }

    function redrawNode(node) {

        if (node.childNodes.length == 0) {
            var img = node.elementLi.getElementsByTagName("img")[0];

            img.style.visibility = "hidden";
            node.expanded = false;

        }

    }

    var tree = {
        name: 'tree',
        div: div,
        ulElement: null,
        childNodes: [],
        backcolor: backColor,
        contextMenu: contextMenu,
        selectedNode: null,
        draggedNode: null,
        nodeCounter: 0,
        contextMenuDiv: null,
        rendered: false,
        callbacks: callbacks,
        editing: false,
        removeTree: function() {

            while (div.lastElementChild) {
                div.removeChild(treeNode.lastElementChild);
            }

        },

        createNode: function(text, expanded, icon, parentNode, tag, contextMenu) {
            let nodeTree = this;
            node = {
                id: 'node_' + this.nodeCounter,
                text: text,
                icon: icon,
                parent: parentNode,
                expanded: expanded,
                childNodes: [],
                tag: tag,
                contextMenu: contextMenu,
                elementLi: null,
                ulElement: null,
                separator: null,
                removeNode: function() {
                    nodeTree.removeNode(this);
                },
                editNode: function() {
                    nodeTree.editNode(this);
                },
                toggleNode: function(event) {
                    nodeTree.toggleNode(this);
                },
                expandNode: function(event) {
                    nodeTree.expandNode(this);
                },
                expandSubtree: function() {
                    nodeTree.expandSubtree(this);
                },
                setText: function(text) {
                    this.text = text;
                    nodeTree.setText(this, text);
                },
                setIcon: function(icon) {
                    this.icon = icon;
                    nodeTree.setIcon(this, icon);
                },
                collapseNode: function() {
                    nodeTree.collapseNode(this);
                },
                collapseSubtree: function() {
                    nodeTree.collapseSubtree(this);
                },
                removeChildNodes: function() {
                    nodeTree.removeChildNodes(this);
                },
                createChildNode: function(text, expanded, icon, tag, contextMenu) {
                    return nodeTree.createNode(text, expanded, icon, this, tag, contextMenu);
                },
                moveChildNode: function(node) {
                    return nodeTree.moveChildNode(this, node);

                }

            }

            this.nodeCounter++;

            if (this.rendered) {
                if (parentNode == undefined) {
                    this.drawNode(this.ulElement, node);
                } else {
                    var v_ul = parentNode.elementLi.getElementsByTagName("ul")[0];
                    var v_img = parentNode.elementLi.getElementsByTagName("img")[0];

                    if (parentNode.childNodes.length == 0) {

                        if (parentNode.expanded) {
                            parentNode.elementLi.getElementsByTagName("ul")[0].style.display = 'block';

                            v_img.style.visibility = "visible";
                            v_img.src = collapse_image;
                            v_img.id = 'toggle_off';
                        } else {
                            parentNode.elementLi.getElementsByTagName("ul")[0].style.display = 'none';
                            v_img.style.visibility = "visible";
                            v_img.src = expand_image;
                            v_img.id = 'toggle_on';
                        }

                    }

                    v_img.style.visibility = "visible";

                    this.drawNode(v_ul, node);

                }
            }

            if (parentNode == undefined) {
                this.childNodes.push(node);
                node.parent = this;
            } else {
                parentNode.childNodes.push(node);
            }

            return node;

        },
        moveChildNode: function(parentNode, childNode) {
            parentNode.elementLi.getElementsByTagName("ul")[0].appendChild(childNode.elementLi);

            parentNode.childNodes.push(childNode);
            var v_img = parentNode.elementLi.getElementsByTagName("img")[0];

            v_img.style.visibility = "visible";

            childNode.parent = parentNode;

        },
        drawTree: function() {
            this.rendered = true;

            var divTree = document.getElementById(this.div);
            divTree.innerHTML = '';

            ulElement = createSimpleElement('ul', this.name, 'tree');
            this.ulElement = ulElement;

            for (var i = 0; i < this.childNodes.length; i++) {
                this.drawNode(ulElement, this.childNodes[i]);
            }

            divTree.appendChild(ulElement);

        },
        drawNode: function(ulElement, node) {
            nodeTree = this;

            var icon = (node.icon == null) ? createImgElement(null, 'icon_tree', empty_image) :
                createImgElement(null, 'icon_tree', node.icon);

            var v_li = document.createElement('li');
            node.elementLi = v_li;
            node.ulElement = ulElement;

            var span = createSimpleElement('span', null, 'node');
            span.draggable = true;

            var toggleColumn = null;

            if (node.childNodes.length == 0) {
                toggleColumn = createImgElement('toggle_off', 'exp_col', collapse_image, 12, 12);
                toggleColumn.style.visibility = "hidden";
            } else {
                toggleColumn = (node.expanded) ? createImgElement('toggle_off', 'exp_col', collapse_image, 12, 12) :
                    createImgElement('toggle_on', 'exp_col', expand_image, 12, 12);
            }

            decorateNode(nodeTree, node, span, toggleColumn);

            span.appendChild(icon);

            v_a = createSimpleElement('a', null, null);
            v_a.innerHTML = `&nbsp;${node.text}`;

            span.appendChild(v_a);

            v_li.appendChild(toggleColumn);
            v_li.appendChild(span);

            if (node.parent.name != 'tree') {
                createSeparator(ulElement, nodeTree, node);
            }

            ulElement.appendChild(v_li);

            var v_ul = createSimpleElement('ul', 'ul_' + node.id, null);
            v_li.appendChild(v_ul);

            if (node.childNodes.length > 0) {

                if (!node.expanded) {
                    v_ul.style.display = 'none';
                }

                for (var iNode = 0; iNode < node.childNodes.length; iNode++) {
                    this.drawNode(v_ul, node.childNodes[iNode]);
                }

            }

        },
        setText: function(node, text) {
            var element = node.elementLi.getElementsByTagName('span')[0].lastChild;
            element.innerHTML = text;
        },
        setIcon: function(node, icon) {
            var element = node.elementLi.getElementsByTagName('span')[0].firstChild;
            element.src = icon;
        },
        expandTree: function() {
            for (var iNode = 0; iNode < this.childNodes.length; iNode++) {
                if (this.childNodes[iNode].childNodes.length > 0) {
                    this.expandSubtree(this.childNodes[iNode]);
                }
            }
        },
        expandSubtree: function(node) {
            this.expandNode(node);
            for (var iNode = 0; iNode < node.childNodes.length; iNode++) {
                if (node.childNodes[iNode].childNodes.length > 0) {
                    this.expandSubtree(node.childNodes[iNode]);
                }
            }
        },
        collapseTree: function() {
            for (var iNode = 0; iNode < this.childNodes.length; iNode++) {
                if (this.childNodes[iNode].childNodes.length > 0) {
                    this.collapseSubtree(this.childNodes[iNode]);
                }
            }
        },
        collapseSubtree: function(node) {
            this.collapseNode(node);
            for (var i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].childNodes.length > 0) {
                    this.collapseSubtree(node.childNodes[i]);
                }
            }
        },
        expandNode: function(node) {

            if (node.childNodes.length > 0 && node.expanded == false) {

                if (this.nodeBeforeOpenEvent != undefined) {
                    this.nodeBeforeOpenEvent(node);
                }

                var img = node.elementLi.getElementsByTagName("img")[0];

                node.expanded = true;

                img.id = "toggle_off";
                img.src = collapse_image;
                elem_ul = img.parentElement.getElementsByTagName("ul")[0];
                elem_ul.style.display = 'block';

                if (this.nodeAfterOpenEvent != undefined) {
                    this.nodeAfterOpenEvent(node);
                }

            }

        },
        collapseNode: function(node) {
            if (node.childNodes.length > 0 && node.expanded == true) {
                var img = node.elementLi.getElementsByTagName("img")[0];

                node.expanded = false;
                if (this.nodeBeforeCloseEvent != undefined) {
                    this.nodeBeforeCloseEvent(node);
                }

                img.id = "toggle_on";
                img.src = expand_image;
                elem_ul = img.parentElement.getElementsByTagName("ul")[0];
                elem_ul.style.display = 'none';

            }
        },
        toggleNode: function(node) {
            if (node.childNodes.length > 0) {
                if (node.expanded) {
                    node.collapseNode();
                } else {
                    node.expandNode();
                }
            }
        },
        resetDragDrop: function() {
            this.draggedNode = null;
        },
        doubleClickNode: function(node) {
            this.toggleNode(node);
        },
        selectNode: function(node) {
            var span = node.elementLi.getElementsByTagName("span")[0];
            span.className = 'node_selected';

            if (this.selectedNode != null && this.selectedNode != node) {
                this.selectedNode.elementLi.getElementsByTagName("span")[0].className = 'node';
            }
            this.selectedNode = node;

        },
        removeNode: function(node) {
            var index = node.parent.childNodes.indexOf(node);

            node.elementLi.parentNode.removeChild(node.elementLi);
            node.parent.childNodes.splice(index, 1);

            if (node.parent.childNodes.length == 0) {
                var v_img = node.parent.elementLi.getElementsByTagName("img")[0];
                v_img.style.visibility = "hidden";
            }

        },
        removeChildNodes: function(node) {

            if (node.childNodes.length > 0) {
                var v_ul = node.elementLi.getElementsByTagName("ul")[0];

                var v_img = node.elementLi.getElementsByTagName("img")[0];
                v_img.style.visibility = "hidden";

                node.childNodes = [];
                v_ul.innerHTML = "";
            }

        },
        editNode: function(node) {
            function updateNode(node, box, text) {
                text.innerHTML = box.value
                text.style.display = "inline";
                text.style.marginLeft = "4px";

                node.text = box.value;

                node.elementLi.getElementsByTagName("span")[0].className = 'node_selected';
                box.onblur = null;
                box.parentNode.removeChild(box);
                nodeTree.editing = false;
            }
            var span = node.elementLi.getElementsByTagName("span")[0];

            var box = document.createElement('input');

            node.elementLi.getElementsByTagName("span")[0].className = 'node';

            var text = node.elementLi.getElementsByTagName('span')[0].lastChild;
            text.innerHTML = "";
            text.style.display = "none";

            box.style.width = "50%";
            box.className = "box";
            node.elementLi.getElementsByTagName('span')[0].appendChild(box);
            box.value = node.text;
            box.focus();
            box.select();
            nodeTree.editing = true;

            box.addEventListener("keyup", function(event) {
                if (event.keyCode == 13) {
                    event.preventDefault();
                    updateNode(node, box, text);

                }
            });

            box.onblur = function(event) {
                event.preventDefault();
                updateNode(node, box, text);
            }

        },
        nodeContextMenu: function(event, node) {
            if (event.button == 2) {
                event.preventDefault();
                event.stopPropagation();

                if (node.contextMenu != undefined) {

                    nodeTree = this;

                    var v_menu = this.contextMenu[node.contextMenu];
                    var v_div;

                    if (this.contextMenuDiv == null) {
                        v_div = createSimpleElement('ul', 'ul_cm', 'menu');
                        document.body.appendChild(v_div);
                    } else {
                        v_div = this.contextMenuDiv;

                        v_div.onclick = function() {
                            if (tree.contextMenuDiv != null) {
                                tree.contextMenuDiv.style.display = 'none';
                            }
                        }

                    }

                    v_div.innerHTML = '';

                    var v_left = event.pageX - 5;
                    var v_right = event.pageY - 5;

                    var position = getPosition(this.selectedNode.elementLi);
                    var size = getWindowSize();
                    var height = v_menu.elements.length * 40;


                    if (position.y + height > size.y) {
                        position.y = size.y - height;
                    }

                    console.log(`${JSON.stringify(position)} : ${JSON.stringify(size)} : ${height}`);

                    v_div.style.display = 'block';
                    v_div.style.position = 'absolute';
                    v_div.style.left = (position.x + 6) + 'px';
                    v_div.style.top = (position.y + 27) + 'px';

                    for (var iItem = 0; iItem < v_menu.elements.length; iItem++)(function(iItem) {
                        var v_li = createSimpleElement('li', null, null);
                        var v_span = createSimpleElement('span', null, null);

                        v_span.onclick = function() {
                            v_menu.elements[iItem].action(node)
                        };

                        var v_a = createSimpleElement('a', null, null);
                        var v_ul = createSimpleElement('ul', null, ' sub-menu');

                        v_a.appendChild(document.createTextNode(v_menu.elements[iItem].text));

                        v_li.appendChild(v_span);

                        if (v_menu.elements[iItem].icon != undefined) {
                            var v_img = createImgElement('null', 'null', v_menu.elements[iItem].icon);
                            v_li.appendChild(v_img);
                        }

                        v_li.appendChild(v_a);
                        v_li.appendChild(v_ul);
                        v_div.appendChild(v_li);

                        if (v_menu.elements[iItem].submenu != undefined) {
                            var v_span_more = createSimpleElement('div', null, null);
                            v_span_more.appendChild(createImgElement(null, 'menu_img', menu_image, 8, 8));
                            v_li.appendChild(v_span_more);
                            nodeTree.contextMenuListItem(v_menu.elements[iItem].submenu, v_ul, node);
                        }

                    })(iItem);
                    
                    v_div.onclick = function() {
                        if (tree.contextMenuDiv != null) {
                            tree.contextMenuDiv.style.display = 'none';
                        }
                    }
                    this.contextMenuDiv = v_div;
                    

                }
            }
        },
        contextMenuListItem: function(submenu, p_ul, p_node) {
            nodeTree = this;

            for (var iSubmenu = 0; iSubmenu < submenu.elements.length; iSubmenu++)(function(iSubmenu) {
                var v_li = createSimpleElement('li', null, null);
                var v_span = createSimpleElement('span', null, null);

                v_span.onclick = function() {
                    submenu.elements[iSubmenu].action(p_node)
                };

                var v_a = createSimpleElement('a', null, null);
                var v_ul = createSimpleElement('ul', null, 'sub-menu');

                v_a.appendChild(document.createTextNode(submenu.elements[iSubmenu].text));

                v_li.appendChild(v_span);

                if (submenu.elements[iSubmenu].icon != undefined) {
                    var v_img = createImgElement('null', 'null', submenu.elements[iSubmenu].icon);
                    v_li.appendChild(v_img);
                }

                v_li.appendChild(v_a);
                v_li.appendChild(v_ul);
                p_ul.appendChild(v_li);

                if (submenu.elements[iSubmenu].p_submenu != undefined) {
                    var v_span_more = createSimpleElement('div', null, null);
                    v_span_more.appendChild(createImgElement(null, 'menu_img', menu_image));
                    v_li.appendChild(v_span_more);
                    nodeTree.contextMenuListItem(submenu.elements[iSubmenu].p_submenu, v_ul, p_node);
                }

            })(iSubmenu);
        }

    }

    window.addEventListener("click", function() {
        if (tree.contextMenuDiv != null) {
            tree.contextMenuDiv.style.display = 'none';
        }
    });

    return tree;

}