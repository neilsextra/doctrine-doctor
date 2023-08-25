function CouchDB(url) {

    this.__url = url;

}

CouchDB.prototype.connect = function (bucket) {

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

    CouchDB.prototype.saveDocument = function (template, attachment) {

        return new Promise((accept, reject) => {
            let parmURL = "/save/document";

            var xhr = new XMLHttpRequest();
            var formData = new FormData();

            formData.append('couchdb-url', this.__url);
            formData.append('document', template.toString());
            formData.append(attachment.name, attachment);

            xhr.open("POST", parmURL, true);

            xhr.onload = function () {
                var response = JSON.parse(this.responseText);

                if (this.readyState === 4 && this.status === 200) {
                    var result = JSON.parse(xhr.response);

                    console.log(xhr.status);

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

            xhr.onerror = function () {
            };

            xhr.send(formData);

        });

    }

}