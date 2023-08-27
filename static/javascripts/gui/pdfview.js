class PDFView {

    constructor(content, viewerID, zoom = 1) {

        console.log("PDFVIEW: " + viewerID);

        this.content = content;
        this.viewerID = viewerID;
        this.state = {
            pdf: null,
            currentPage: 1,
            numPages: 0,
            zoom: zoom
        }

    }

    view() {
        var loadingTask = pdfjsLib.getDocument({
            data: content
        });

        var state = this.state;
        var viewerID = this.viewerID;

        loadingTask.promise.then(function (pdf) {
            state.pdf = pdf;
            state.numPages = pdf.numPages;
            state.currentPage = 1;
            document.getElementById().value = state.currentPage;
            render();
        });

    }

    render() {
        var state = this.state;
        
        state.pdf.getPage(state.currentPage).then((page) => {

            var canvas = document.getElementById("pdf_renderer");
            var ctx = canvas.getContext('2d');
            var viewport = page.getViewport({
                scale: state.zoom
            });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({
                canvasContext: ctx,
                viewport: viewport
            });
            
        });
    }

}