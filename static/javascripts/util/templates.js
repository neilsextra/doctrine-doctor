const DOCUMENT_TEMPLATE = {
    "title": "",
    "description": "",
    "hot-topic": "False",
    "document-page": 0,
    "country-of-origin": ""
};

function getDocumentTemplate() {

  return  JSON.parse(JSON.stringify(DOCUMENT_TEMPLATE));
  
}