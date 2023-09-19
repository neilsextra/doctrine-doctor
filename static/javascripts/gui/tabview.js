/**
 * Inactivate Tabs
 * 
 */
function inactivateTabs(group) {
    var iTab, tabcontent, tabbuttons, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementById(group).querySelectorAll(".tabcontent");

    for (iTab = 0; iTab < tabcontent.length; iTab++) {
        tabcontent[iTab].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementById(group).querySelectorAll(".tablinks");
    for (iTab = 0; iTab < tablinks.length; iTab++) {
        tablinks[iTab].className = tablinks[iTab].className.replace(" active", "");
        tablinks[iTab].style.textDecoration = "none";
    }

}

/**
 * Show the Active Tab
 * 
 * @param {*} evt the Tab to Show
 * @param {String} group the group name of the Tab
 * @param {String} tab the name of the Tab
 * @param {String} button the Tab's button
 */
function showTab(evt, group, tab, button) {

    inactivateTabs(group);

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    document.getElementById(button).style.textDecoration = "underline";

    if (evt != null && evt.currentTarget != null) {
        evt.currentTarget.className += " active";
    }

}

/**
 * Active a nominated Tab
 * 
 * @param {*} evt the Tab to Show
 * @param {String} id the tab to activate
 * @param {String} group the group name of the Tab
 * @param {String} tab the name of the Tab
 * @param {String} button the Tab's button
 */
function activateTab(group, tab, button) {

    inactivateTabs(group);

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    document.getElementById(button).style.textDecoration = "underline";
    document.getElementById(tab).className += " active";

}
