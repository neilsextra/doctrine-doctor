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

        console.log(JSON.stringify(this.toJSON()));

    }

    get title() {
        return this.template["title"];
    }

    get description() {
        return this.template["description"];
    }

    get keyWords() {
        return this.template["keywords"];
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
        
        this.template["keywords"].push(keyword);
        
    }

    toJSON() {
        return this.template;
    }

    toString() {
        return JSON.stringify(this.template);
    }

}