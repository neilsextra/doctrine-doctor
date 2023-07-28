function FileUtil(document) {

    this._document = document;

};

FileUtil.prototype.saveAs = function (data, fileName) {
    var saveLink = this._document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    var canUseSaveLink = "download" in saveLink;
    var getURL = function () {
        return view.URL || view.webkitURL || view;
    }

    var click = function (node) {
        var event = new MouseEvent("click");
        node.dispatchEvent(event);
    }

    var fileURL = URL.createObjectURL(new Blob([data], { type: 'text/plain' }));

    saveLink.href = fileURL;
    saveLink.download = fileName;

    click(saveLink);

};

FileUtil.prototype.load = function (callback) {
    var loadButton = this._document.createElementNS("http://www.w3.org/1999/xhtml", "input");

    loadButton.setAttribute("type", "file");

    loadButton.addEventListener('change', function (e) {
        var files = e.target.files

        callback(files);

        return false;

    }, false);

    loadButton.click();

};

