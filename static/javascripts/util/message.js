function Message() {
}

Message.prototype.getVariable  = function (name) {

    return new Promise((accept, reject) => {
        var xhttp = new XMLHttpRequest();

        xhttp.open("GET", `/get/variable?name=${name}`);
        
        xhttp.onreadystatechange = async function () {

            if (this.readyState === 4 && this.status === 200) {
                var paths = [];

                alert(this.responseText);

                accept({
                    status: "OK",
                    response: this.responseText
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