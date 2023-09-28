class NetworkView {

    constructor() {
   }

    setEntity(entityHTML) {

        var entityElement = document.getElementById("entity-container");

        entityElement.innerHTML = `<table${entityHTML}</table>`;
    
    }

    reset() {
     
        document.getElementById(`document-container-entities`).innerHTML = "";
        document.getElementById(`observation-container-entities`).innerHTML = "";
        document.getElementById(`insight-container-entities`).innerHTML = "";
        document.getElementById(`lesson-container-entities`).innerHTML = "";
    
    }

    setLinkedEntities(corpus, table) {
        var entitiesElement = document.getElementById(`${corpus}-container-entities`);

        entitiesElement.innerHTML = table;


    }

}