class NetworkView {

    constructor() {
   }

    setEntity(entityHTML) {

        var entityElement = document.getElementById("entity-container");

        entityElement.innerHTML = `<table${entityHTML}</table>`;
    
    }

}