'use strict'

var tableView = null;
var attributes = null;

function hex2Char(value) {
    const hexToByte = (hex) => {
        var value = parseInt(`0x${hex}`, 16)
        var output = value >= 32 && value <= 127 ? String.fromCharCode(value) : ".";

        return output;

    }

    var hex = [];

    for (var iChar = 0; iChar < value.length; iChar += 2) {

        hex.push(value.substring(iChar, iChar + 2));

    }

    var output = "";

    for (var iHex = 0; iHex < hex.length; iHex++) {
        output += `${hexToByte(hex[iHex])}`;
    }

    return output;

}

function copyToClipboard(type, value) {

    function formatHex(value) {

        const hexToByte = (hex) => {
            var value = parseInt(`0x${hex}`, 16)
            var output = value >= 32 && value <= 127 ? String.fromCharCode(value) : ".";

            return output;

        }

        var hex = [];

        for (var iChar = 0; iChar < value.length; iChar += 2) {

            hex.push(value.substring(iChar, iChar + 2));

        }

        var hexValues = "";
        var charValues = "";

        var iHex = 0;
        var iPos = 0

        var output = "";

        for (; iHex < hex.length; iHex++) {

            iPos += 1;

            hexValues += `${hex[iHex]}|`;
            charValues += `${hexToByte(hex[iHex])}`;

            if (iPos % 16 == 0) {
                output += hexValues;

                output += charValues;

                output += "\n";

                hexValues = "";
                charValues = "";
            }

        }

        if (iHex % 16 != 0) {
            output += hexValues;

            for (var iCount = 0; iPos % 16 != 0; iPos++, iCount++) {

                output += `${iCount < 16 ? "   " : "|"}`;
            }

            output += charValues;

            output += ``;
        }

        return output;

    }

    if (type == "Hex") {

        var hex = value;

        navigator.clipboard.writeText(formatHex(value));


    } else {
        navigator.clipboard.writeText(value);
    }

}

function copyToSearch(type, value) {

    document.getElementById("search-argument").value = (type == "Hex") ? hex2Char(value).split('#')[0] : value.split('#')[0];

}

function copyToLaunch(type, value) {

    document.getElementById("search-argument").value = (type == "Hex") ? hex2Char(value).split('#')[0] : value.split('#')[0];

    search();

}

async function search() {

    document.getElementById("wait-dialog").showModal();

    var message = new Message();

    var result = await message.search(document.getElementById("ldap-url").value,
        document.getElementById("search-argument").value);

    var html = "<table class='result-table'>";

    for (var dn in result.response) {

        html += `<tr onclick="window.select('${result.response[dn]}')">` +
            `<td class='result-table-item' style="white-space: nowrap; text-wrap: nowrap;">${result.response[dn]}</td></tr>`;

    }

    document.getElementById("search-results").innerHTML = html;

    document.getElementById("wait-dialog").close();

}

async function showAttributes(result) {

    function filter(filterType, filterSelection, name, oid, value) {

        if (filterSelection.length == 0) {
            return true;
        } else if (filterType == "name" && name.trim().toLowerCase() == filterSelection.trim().toLowerCase()) {
            return true;
        } else if (filterType == "oid" && oid.trim().toLowerCase() == filterSelection.trim().toLowerCase()) {
            return true;
        } else if (filterType == "value" && value.trim().toLowerCase().includes(filterSelection.trim().toLowerCase())) {
            return true;
        }

        return false;

    }

    if (result == null) {
        return;
    }

    var columns = ["Attribute", "Object-ID", "Syntax", "Type", "Data"];

    var filterTypeOptions = document.getElementById("filter-type");
    var filterType = filterTypeOptions.options[filterTypeOptions.selectedIndex].value;
    var filterSelection = document.getElementById("filter-selection").value;
    var rows = [];
    var timestamps = [];

    for (var entry in result.response) {
        var row = [];

        if (filter(filterType, filterSelection, result.response[entry][0], result.response[entry][1], result.response[entry][4])) {

            for (var field in result.response[entry]) {

                row.push(result.response[entry][field])
            }

            rows.push(row)

        }

    }

    var dataview = new DataView(columns, rows);
    let painter = new Painter();

    let widths = [];

    widths.push(300);
    widths.push(300);
    widths.push(300);
    widths.push(100);
    widths.push(800);

    tableView = new TableView({
        "container": "#artifacts-container",
        "model": dataview,
        "nbRows": dataview.Length,
        "rowHeight": 30,
        "headerHeight": 30,
        "painter": painter,
        "columnWidths": widths
    });

    document.getElementById('artifacts-container').style.display = "inline-block";

    window.setTimeout(function () {
        tableView.setup();
        tableView.resize();
    }, 10);

    tableView.addProcessor(async function (button, row, x, y) {

        function appendHex(value) {

            const hexToByte = (hex) => {

                var value = parseInt(`0x${hex}`, 16)
                var output = value >= 32 && value <= 127 ? String.fromCharCode(value) : ".";

                return output;

            }

            var hex = [];

            console.log(value);

            for (var iChar = 0; iChar < value.length; iChar += 2) {

                hex.push(value.substring(iChar, iChar + 2));

            }

            var hexValues = "";
            var charValues = "";

            var iHex = 0;
            var iPos = 0

            var html = `<table class="hex">`;
            html += `</tr>`;

            for (; iHex < hex.length; iHex++) {

                iPos += 1;

                hexValues += `<td>${hex[iHex]}&nbsp|&nbsp</td>`;
                charValues += `<td>${hexToByte(hex[iHex])}</td>`;

                if (iPos % 16 == 0) {
                    html += hexValues;

                    html += charValues;


                    html += "</tr><tr>";

                    hexValues = "";
                    charValues = "";
                }

            }

            if (iHex % 16 != 0) {
                html += hexValues;

                for (var iCount = 0; iPos % 16 != 0; iPos++, iCount++) {

                    html += `<td>${iCount < 16 ? "&nbsp" : ""}&nbsp;&nbsp;|&nbsp;</td>`;
                }

                html += charValues;

                html += `</tr>`;
            }

            html += `</table>`;

            html += `</div>`;

            return html;

        }

        document.getElementById("artifact-view").style.display = "inline-block";
        document.getElementById("artifact-entry-attribute").innerHTML =
            `Attribute: <b>${rows[row][0]}</b>` +
            `&nbsp;&nbsp;` +
            `<div style="position:absolute; top:5px; right:5px; height:32px;"> ` +
            `<button class="button-no-style" onclick="window.copyToClipboard('${rows[row][3]}', '${rows[row][4]}')">` +
            `<img src="images/clipboard.svg" width="18", height="18"></img> </button>` +
            `&nbsp;` +
            `<button class="button-no-style" onclick="window.copyToSearch('${rows[row][3]}', '${rows[row][4]}')">` +
            `<img src="images/pen-to-square.svg" width="18", height="18"></img> </button>` +
            `&nbsp;` +
            `<button class="button-no-style" onclick="window.copyToLaunch('${rows[row][3]}', '${rows[row][4]}')">` +
            `<img src="images/launch.svg" width="18", height="18"></img> </button>` +
            `</div>`;

        if (rows[row][3] == "String") {
            document.getElementById("artifact-entry-view").innerHTML = `<div class="hex">${rows[row][4].replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
        } else {
            document.getElementById("artifact-entry-view").innerHTML = appendHex(rows[row][4]);
        }

    });

}

async function select(dn) {

    function find(table, dn) {

        for (var iRow = 0, row; row = table.rows[iRow]; iRow++) {

            for (var iCell = 0, col; col = row.cells[iCell]; iCell++) {

                if (dn.trim() == col.innerText.trim()) {
                    return true;
                }
            }
        }

        return false;

    }

    document.getElementById("selected-dn").innerHTML = `${dn}`;

    document.getElementById("wait-dialog").showModal();

    var message = new Message();

    attributes = await message.retrieve(document.getElementById("ldap-url").value, dn);

    showAttributes(attributes);

    var historyStorage = window.localStorage.getItem(document.getElementById("ldap-url").value);

    var searchHistory = historyStorage != null ?  JSON.parse(historyStorage) : [];

    var table = document.getElementById("history-table");

    if (!find(table, dn)) {
        var row = table.insertRow();

        row.setAttribute("onclick", `window.select('${dn}')`, 0);

        var cell = row.insertCell();

        cell.className = "result-table-item";
        cell.style.textWrap = "nowrap";
        cell.style.whiteSpace = "nowrap";

        cell.innerHTML = dn;

        searchHistory.push(dn);

        window.localStorage.setItem(document.getElementById("ldap-url").value, JSON.stringify(searchHistory));

    }

    document.getElementById("dn-download-button").disabled = false;

    document.getElementById("wait-dialog").close();

}

/**
 * Respond to the Document 'ready' event
 */
window.onload = async function () {
    var closeButtons = document.getElementsByClassName("close-button");

    for (var closeButton = 0; closeButton < closeButtons.length; closeButton++) {

        closeButtons[closeButton].addEventListener('click', (e) => {

            document.getElementById(e.target.id.replace(/close\-|cancel\-/, "")).close();

        });

    }

    document.getElementById("ok-connect-dialog").addEventListener('click', async (e) => {
        var message = new Message();

        var result = await message.connect(document.getElementById("ldap-url").value);

        document.getElementById("connect-dialog").close();

        document.getElementById("viewer-status").innerHTML = `<b>Connected:&nbsp;</b>${result.response.host}:${result.response.port}`;

        var historyStorage = window.localStorage.getItem(document.getElementById("ldap-url").value);
       
        var table = document.getElementById("history-table");

        if (historyStorage != null) {
            var searchHistory = JSON.parse(historyStorage);

            for (var iHistory = 0; iHistory < searchHistory.length; iHistory++) {
                var row = table.insertRow();

                row.setAttribute("onclick", `window.select('${searchHistory[iHistory]}')`, 0);

                var cell = row.insertCell();

                cell.className = "result-table-item";
                cell.style.textWrap = "nowrap";
                cell.style.whiteSpace = "nowrap";

                cell.innerHTML = searchHistory[iHistory];
            }

        }


    });

    document.getElementById("search-button").addEventListener('click', (e) => {

        search();

    });

    document.getElementById("filter-button").addEventListener('click', (e) => {

        showAttributes(attributes);

    });

    document.getElementById("filter-history-button").addEventListener('click', (e) => {

        var historyStorage = window.localStorage.getItem(document.getElementById("ldap-url").value);

        if (historyStorage != null) {
            var searchHistory = JSON.parse(historyStorage);

            var table = document.getElementById("history-table");

            table.innerHTML = "";

            for (var iHistory = 0; iHistory < searchHistory.length; iHistory++) {

                if (searchHistory[iHistory].toLowerCase().indexOf(document.getElementById("filter-history").value.toLowerCase()) != -1) {
                    var row = table.insertRow();

                    row.setAttribute("onclick", `window.select('${searchHistory[iHistory]}')`, 0);

                    var cell = row.insertCell();

                    cell.className = "result-table-item";
                    cell.style.textWrap = "nowrap";
                    cell.style.whiteSpace = "nowrap";

                    cell.innerHTML = searchHistory[iHistory];

                }
            }

        }

    });

    document.getElementById("dn-download-button").addEventListener('click', async (e) => {
        var fileUtil = new FileUtil(document);
        var message = new Message();

        var blob = await message.export(document.getElementById("ldap-url").value,
            document.getElementById("selected-dn").innerText);

        fileUtil.saveAs(blob, document.getElementById("selected-dn").innerText + ".asn1");

    });

    document.getElementById("clear-history-button").addEventListener('click', async (e) => {
        var table = document.getElementById("history-table");
        
        window.localStorage.removeItem(document.getElementById("ldap-url").value);
        
        table.innerHTML = "";

    });

    document.getElementById("erase-button").addEventListener('click', async (e) => {
        var table = document.getElementById("history-table");
        
        document.getElementById("search-argument").value = "";

    });

    document.getElementById("connect-dialog").showModal();

    activateTabs('tabs', 'search-panel', 'tab1');

}
