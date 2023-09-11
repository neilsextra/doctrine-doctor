const EMPTY_DOCUMENT = {
    "title": "",
    "author": "",
    "description": "",
    "hot-topic": Boolean(false),
    "document-page": 0,
    "country-of-origin": "",
    "primary-publisher": "",
    "activity-region": "",
    "keywords": []

};

const EMPTY_OBSERVATION = {
    "title": "",
    "author": "",
    "description": "",
    "recommendation": "",
    "hot-topic": Boolean(false),
    "document-page": 0,
    "country-of-origin": "",
    "keywords": []

};

const EMPTY_LESSON = {
    "title": "",
    "author": "",
    "description": "",
    "solution": "",
    "hot-topic": Boolean(false),
    "document-page": 0,
    "country-of-origin": "",
    "keywords": []

};

const EMPTY_INSIGHT = {
    "title": "",
    "author": "",
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

    get id() {
        return this.template["_id"];
    }

    get rev() {
        return this.template["_rev"];
    }
    
    get title() {
        return this.template["title"];
    }

    get author() {
        return this.template["author"];
    }

    get description() {
        return this.template["description"];
    }

    get keywords() {
        return this.template["keywords"];
    }

    get countryOfOrigin() {
        return this.template["country-of-origin"];
    }

    get documentPage() {
        return this.template["document-page"];
    }

    get documentPage() {
        return this.template["document-page"];
    }
    
    get solution() {
        return this.template["solution"];
    }

    set id(id) {
        this.template["_id"] = id;
    }

    set title(title) {
        this.template["title"] = title;
    }

    set author(author) {
        this.template["author"] = author;
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
        this.template["country-of-origin"] = countryOfOrigin;
    }

    set documentPage(documentPage) {
        this.template["documentPage"] = documentPage;
    }
        
    set countryOfOrigin(countryOfOrigin) {
        this.template["country-of-origin"] = countryOfOrigin;
    }
    
    set solution(solution) {
        this.template["solution"] = solution;
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

    clearKeywords() {
        this.template["keywords"] = [];
    }

    toJSON() {
        return this.template;
    }

    toString() {
        return JSON.stringify(this.template);
    }

}