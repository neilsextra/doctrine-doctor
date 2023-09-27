class NetworkView {

    constructor() {

        var networkWrapper = document.getElementById('network-wrapper'),
            rectWrapper = networkWrapper.getBoundingClientRect();

        new LeaderLine(
            document.getElementById('document-container-start-point'),
            document.getElementById('document-container-end-point'),
            {
                color: 'rgb(110, 110, 110)',
                path: "arc"
            }
        );

        var line1 = document.querySelector('.leader-line:last-of-type');

        new LeaderLine(
            document.getElementById('observation-container'),
            document.getElementById('entity-container'),
            {
                color: 'rgb(110, 110, 110)',
                path: "arc"
            } 
        );

        var line2 = document.querySelector('.leader-line:last-of-type');

        new LeaderLine(
            document.getElementById('insight-container'),
            document.getElementById('entity-container'),
            {
                color: 'rgb(110, 110, 110)',
                path: "arc"
            } 
        );

        var line3 = document.querySelector('.leader-line:last-of-type');

        new LeaderLine(
            document.getElementById('lesson-container-start-point'),
            document.getElementById('lesson-container-end-point'),
            {
                color: 'rgb(110, 110, 110)',
                path: "arc"
            }    
        );

        var line4 = document.querySelector('.leader-line:last-of-type');

        
        networkWrapper.style.transform = 'translate(-' +
            (rectWrapper.left) + 'px, -' +
            (rectWrapper.top ) + 'px)';

        networkWrapper.appendChild(line1);
        networkWrapper.appendChild(line2);
        networkWrapper.appendChild(line3);
        networkWrapper.appendChild(line4);

    }

}