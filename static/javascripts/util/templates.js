const EMPTY_DOCUMENT = {
    "document-hot-topic": Boolean(false),
    "keywords": []

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

const properties = [];
const relationships = {};

class Template {

    constructor(corpus, template) {

        this.properties["corpus"] = corpus;
        this.template = JSON.parse(JSON.stringify(template));

    }

    get corpus() {
        return this.variables["corpus"];
    }

    get id() {
        return this.template["_id"];
    }

    get rev() {
        return this.template["_rev"];
    }

    get corpus() {
        return this.template['corpus'];
    }

    get keywords() {
        return this.template[`${this.template["corpus"]}-keywords`];
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

    getRelationship(name) {
        return getRelationship(name).length = 0 ? {} : relationships(name);
    }

    setRelationship(name, relationship) {
        relationships(name) = relationship;
    }

    getValuesForClass(id, className) {

        const elements = document.getElementById(id).querySelectorAll(`.${className}`);

        for (var element in elements) {
            if (elements[element].value != null) {

                elements[element].value = this.template[elements[element].id];
     
            }

        }
    
    }

    setValuesFromClass(id, className) {

        const elements = document.getElementById(id).querySelectorAll(`.${className}`);

        for (var element in elements) {
            if (elements[element].value != null) {

                this.template[elements[element].id] = elements[element].value;
     
            }

        }
    
    }

    getAttachments() {
        var attachments = this.template["_attachments"];
        var response = [];
        for (attachment in attachments) {
            console.log(`Attachment: ${attachment} : ${attachments[attachment].content_type}`); 

            response.push({
                "name": attachment,
                "content_type": attachments[attachment].content_type,
                "length":  attachments[attachment].length
            });

        } 

        return response;

    }

    addKeyword(keyword) {
        this.template[`${this.template["corpus"]}-keywords`].push(keyword);
    }

    clearKeywords() {
        this.template[`${this.template["corpus"]}-keywords`] = [];
    }

    toJSON() {
        return this.template;
    }

    toString() {
        return JSON.stringify(this.template);
    }

}