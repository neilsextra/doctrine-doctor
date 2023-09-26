const EMPTY_DOCUMENT = {
    "document-hot-topic": Boolean(false),
    "document-keywords": []

};

const EMPTY_OBSERVATION = {
    "observation-hot-topic": Boolean(false),
    "observation-keywords": []

};

const EMPTY_LESSON = {
    "lesson-hot-topic": Boolean(false),
    "lesson-keywords": []

};

const EMPTY_INSIGHT = {
    "insight-hot-topic": Boolean(false),
    "insight-keywords": []

};

const DOCUMENT = "document";
const OBSERVATION = "observation";
const LESSON = "lesson";
const INSIGHT = "insight";

class Template {

    constructor(corpus, template) {

        this.properties = {};
        this.properties["corpus"] = corpus;

        this.template = JSON.parse(JSON.stringify(template));

    }

    get corpus() {
        return this.properties["corpus"];
    }

    get id() {
        return this.template["_id"];
    }

    get rev() {
        return this.template["_rev"];
    }

    get keywords() {
        return this.template[`${this.properties["corpus"]}-keywords`];
    }
    
    get trackings() {
        return this.template[`${this.properties["corpus"]}-tracking`];
    }

    get date() {
        return this.template[`${this.properties["corpus"]}-date`];
    }

    getValue(field) {
        return this.template[field];
    }

    set id(id) {
        this.template["_id"] = id;
    }

    setValue(entry, value) {
        this.template[entry] = value;
    }

    setDate() {
        var date = new Date();

        var dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDay() + 1)).slice(-2);

        this.template[`${this.properties["corpus"]}-date`] = dateString;

    }

    setTracking(tableId) {
        const table = document.getElementById(tableId);
        var tracking = [];

        for (var iRow = 0, row; (iRow < table.rows.length) && (row = table.rows[iRow]); iRow++) {
            var trackingDate = row.querySelector(".tracking-date");
            var trackingComment = row.querySelector(".tracking-comment");

            if (trackingDate != null && trackingDate != "") {

                
                tracking.push({
                    "tracking-date": trackingDate.value,
                    "tracking-comment": trackingComment.value       
                });
    
            }

        }

        this.template[`${this.properties["corpus"]}-tracking`] = tracking;

    }

    hasProperty(property) {
        return (this.template.hasOwnProperty(property));
    }

    setMember(name) {
        this.template[`${this.properties["corpus"]}-${name}`] = [];
    }

    addMember(name, member) {
       this.template[`${this.properties["corpus"]}-${name}`].push(member);
    }

    getValuesForClass(id, className) {

        const elements = document.getElementById(id).querySelectorAll(`.${className}`);

        for (var element in elements) {

            if (this.hasProperty(elements[element].id)) {

                elements[element].value = this.template[elements[element].id];

            }

        }

    }

    setValuesFromClass(id, className) {

        const elements = document.getElementById(id).querySelectorAll(`.${className}`);

        for (var element in elements) {
            if (elements[element].value != null && elements[element].value != "") {
                // Remove non-printable characters   
                this.template[elements[element].id] = elements[element].value.replace(/[^ -~]+/g, '');

            }

        }

    }

    getAttachments() {
        var attachments = this.template["_attachments"];
        var response = [];
        for (attachment in attachments) {
 
            response.push({
                "name": attachment,
                "content_type": attachments[attachment].content_type,
                "length": attachments[attachment].length
            });

        }

        return response;

    }

    addKeyword(keyword) {
        this.template[`${this.properties["corpus"]}-keywords`].push(keyword);
    }

    clearKeywords() {
        this.template[`${this.properties["corpus"]}-keywords`] = [];
    }

    toJSON() {
        return this.template;
    }

    toString() {
        return JSON.stringify(this.template);
    }

}