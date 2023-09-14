const EMPTY_DOCUMENT = {
    "corpus" : "document",
    "document-hot-topic": Boolean(false),
    "keywords": []

};

const EMPTY_OBSERVATION = {
    "corpus" : "observation",
    "observation-hot-topic": Boolean(false),
    "observation-keywords": []

};

const EMPTY_LESSON = {
    "corpus" : "lesson",
    "lesson-hot-topic": Boolean(false),
    "lesson-keywords": []

};

const EMPTY_INSIGHT = {
    "corpus" : "insight",
    "insight-hot-topic": Boolean(false),
    "insight-keywords": []

};

class Template {

    constructor(template) {

        this.template = JSON.parse(JSON.stringify(template));

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