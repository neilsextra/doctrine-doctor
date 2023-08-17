function CouchDB(url) {

    this.__url = url;

}

CouchDB.prototype.connect = function (bucket) {

return new Promise((accept, reject) => {
    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", `/connect?url=${encodeURIComponent(this.__url)}`, true);

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