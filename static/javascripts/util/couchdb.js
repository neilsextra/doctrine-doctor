function CouchDB(url) {

    this.__url = url;

    this._save = function(corpus, template) {
        return new Promise((accept, reject) => {
            let parmURL = `/save/${corpus}`;

            var xhttp = new XMLHttpRequest();
            var formData = new FormData();

            formData.append('couchdb-url', this.__url);
            formData.append('document', template.toString());

            xhttp.open("POST", parmURL, true);

            xhttp.onload = function () {
                var response = JSON.parse(this.responseText);

                if (this.readyState === 4 && this.status === 200) {
                    var result = JSON.parse(xhttp.response);

                    console.log(xhttp.status);

                    accept({
                        status: this.status,
                        response: response
                    });

                } else {

                    console.log('ERROR');

                    reject({
                        status: this.status,
                        message: this.statusText
                    });

                }

            };

            xhttp.onerror = function () {
            };

            xhttp.send(formData);

        });

    }

}

CouchDB.prototype.connect = function () {

    return new Promise((accept, reject) => {
        var xhttp = new XMLHttpRequest();

        xhttp.open("GET", `/connect?couchdb-url=${encodeURIComponent(this.__url)}`, true);

        xhttp.onreadystatechange = async function () {

            if (this.readyState === 4 && this.status === 200) {
                var paths = [];
                var response = JSON.parse(this.responseText);

                accept({
                    status: this.status,
                    response: response
                });

            } else if (this.status === 500) {

                reject({
                    status: this.status,
                    message: this.statusText
                });

            }

        };

        xhttp.send();

    });

}

CouchDB.prototype.saveDocument = function (template, attachment) {

    return new Promise((accept, reject) => {
        let parmURL = "/save/document";

        var xhttp = new XMLHttpRequest();
        var formData = new FormData();

        formData.append('couchdb-url', this.__url);
        formData.append('document', template.toString());
        formData.append(attachment.name, attachment);

        xhttp.open("POST", parmURL, true);

        xhttp.onload = function () {
            var response = JSON.parse(this.responseText);

            if (this.readyState === 4 && this.status === 200) {
                var result = JSON.parse(xhttp.response);

                console.log(xhttp.status);

                accept({
                    status: this.status,
                    response: response
                });

            } else {

                console.log('ERROR');

                reject({
                    status: this.status,
                    message: this.statusText
                });

            }

        };

        xhttp.onerror = function () {
        };

        xhttp.send(formData);

    });

}

CouchDB.prototype.saveObservation = function (template) { 

    return this._save("observation", template);

}

CouchDB.prototype.saveInsight = function (template) { 

    return this._save("insight", template);
    
}

CouchDB.prototype.saveLesson = function (template) { 

    return this._save("lesson", template);
    
}

CouchDB.prototype.listDocuments = function () {

    return new Promise((accept, reject) => {
        let parmURL = "/list/documents";
        var xhttp = new XMLHttpRequest();

        xhttp.open("GET", `/list/documents?couchdb-url=${encodeURIComponent(this.__url)}`, true);

        xhttp.onreadystatechange = async function () {

            if (this.readyState === 4 && this.status === 200) {
                var paths = [];
                var response = JSON.parse(this.responseText);

                accept({
                    status: this.status,
                    response: response
                });

            } else if (this.status === 500) {

                reject({
                    status: this.status,
                    message: this.statusText
                });

            }

        };

        xhttp.send();

    });

}

CouchDB.prototype.getDocument = function (documentId) {

    return new Promise((accept, reject) => {
        let parmURL = "/list/documents";
        var xhttp = new XMLHttpRequest();

        xhttp.open("GET",
            `/get/document?couchdb-url=${encodeURIComponent(this.__url)}&document-id=${encodeURIComponent(documentId)}`, true);

        xhttp.onreadystatechange = async function () {

            if (this.readyState === 4 && this.status === 200) {
                var paths = [];
                var response = JSON.parse(this.responseText);

                accept({
                    status: this.status,
                    response: response
                });

            } else if (this.status === 500) {

                reject({
                    status: this.status,
                    message: this.statusText
                });

            }

        };

        xhttp.send();

    });

}

CouchDB.prototype.getAttachment = function (template, attachmentName) {

    return new Promise((accept, reject) => {
        let parmURL = "/get/document/attachment";

        var xhttp = new XMLHttpRequest();
        var formData = new FormData();

        formData.append('couchdb-url', this.__url);
        formData.append('document', JSON.stringify(template.toJSON()));
        formData.append('attachment-name', attachmentName);

        xhttp.responseType = "arraybuffer";

        xhttp.open("POST", parmURL, true);

        xhttp.onload = function () {
            if (this.readyState === 4 && this.status === 200) {

                accept(this.response);

            } else {
                console.log('ERROR');

                reject({
                    status: this.status,
                    message: this.statusText
                });

            }

        };

        xhttp.onerror = function () {
        };

        xhttp.send(formData);

    });

}