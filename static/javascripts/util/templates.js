class Template {

    constructor() {

        const DOCUMENT_TEMPLATE = {
            "title": "",
            "description": "",
            "hot-topic": Boolean(false),
            "document-page": 0,
            "country-of-origin": "",
            "keywords": []
    
        };

        this.template = JSON.parse(JSON.stringify(DOCUMENT_TEMPLATE));

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