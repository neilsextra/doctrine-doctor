class PDFView {

    constructor(content, viewerID, zoom = 1) {

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
        var content = this.content;
        var state = this.state;
        var _this = this;

        var loadingTask = pdfjsLib.getDocument({
            data: content
        });

        loadingTask.promise.then(function (pdf) {

            state.pdf = pdf;
            state.numPages = pdf.numPages;
            state.currentPage = 1;
            _this.render(state);

        });

    }

    render(state) {
        state.pdf.getPage(state.currentPage).then((page) => {

            var canvas = document.getElementById(this.viewerID);
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

    left() {
  
        if (this.state.pdf == null || this.state.currentPage == 1) {
            return this.state.currentPage;
        }

        this.state.currentPage -= 1;
 
        this.render(state);

    }

    right() {

        if (state.pdf == null || state.currentPage >= state.pdf._pdfInfo.numPages) {
            return;
        }

        this.state.currentPage += 1;
        
        this.render(state);

    };

}