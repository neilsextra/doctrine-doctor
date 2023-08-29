class PDFView {

    constructor(content, viewerID, zoom = 1) {

        this._content = content;
        this._viewerID = viewerID;
        this._state = {
            pdf: null,
            currentPage: 1,
            numPages: 0,
            zoom: zoom
        }

    }

    get zoom() {
        return this._state.zoom = zoom;
    }

    get numberOfPages() {
        return this._state.numPages;
    }

    get currentPage() {
        return this._state.currentPage;
    }

    set viewerID(viewerID) {

        this._viewerID = viewerID

    }

    set zoom(zoom) {

        this._state.zoom = zoom;

    }

    set currentPage(currentPage) {

        this._state.currentPage = currentPage;

    }

    view() {
        var content = this._content;
        var state = this._state;
        var _this = this;

        var loadingTask = pdfjsLib.getDocument({
            data: content
        });

        loadingTask.promise.then(function (pdf) {

            state.pdf = pdf;
            state.numPages = pdf.numPages;
            state.currentPage = 1;
            _this.render();

        });

    }

    render() {
        var state = this._state;

        state.pdf.getPage(state.currentPage).then((page) => {

            var canvas = document.getElementById(this._viewerID);
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

    previous() {
  
        if (this._state.pdf == null || this._state.currentPage == 1) {
            return this._state.currentPage;
        }

        this._state.currentPage -= 1;
 
        this.render();

    }

    next() {

        if (this._state.pdf == null || this._state.currentPage >= this._state.pdf._pdfInfo.numPages) {
            return;
        }

        this._state.currentPage += 1;
        
        this.render();

    };

}