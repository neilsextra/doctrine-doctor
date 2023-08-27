const EMPTY_DOCUMENT = {
    "title": "",
    "description": "",
    "hot-topic": Boolean(false),
    "document-page": 0,
    "country-of-origin": "",
    "keywords": []

};

const EMPTY_OBSERVATION = {
    "title": "",
    "description": "",
    "hot-topic": Boolean(false),
    "document-page": 0,
    "country-of-origin": "",
    "keywords": []

};

const EMPTY_LESSON = {
    "title": "",
    "description": "",
    "hot-topic": Boolean(false),
    "document-page": 0,
    "country-of-origin": "",
    "keywords": []

};

const EMPTY_INSIGHT = {
    "title": "",
    "description": "",
    "hot-topic": Boolean(false),
    "document-page": 0,
    "country-of-origin": "",
    "keywords": []

};

class Template {

    constructor(template) {

        this.template = JSON.parse(JSON.stringify(template));

        console.log(this.template['title']);

    }

    get title() {
        return this.template["title"];
    }

    get description() {
        return this.template["description"];
    }

    set title(title) {
        this.template["title"] = title;
    }

    set description(description) {
        this.template["description"] = description;
    }

    set hotTopic(hotTopic) {
        this.template["hot-topic"] = new Boolean(hotTopic).toString();
    }

    set documentPage(documentPage) {
        this.template["document-page"] = documentPage;
    }

    set countryOfOrigin(countryOfOrigin) {
        this.template["countryOfOrigin"] = countryOfOrigin;
    }

    addKeyword(keyword) {
        this.template["keywords"].push(keyword);
    }

    toString() {
        return JSON.stringify(this.template);
    }

}