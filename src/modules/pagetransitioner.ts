/* 
 * Module containing methods necessary for page trasitions
 */
module PageTransitioner {
    /* The page containers */
    var pageContainer1 : JQuery;
    var pageContainer2 : JQuery;
    /* The active and non-active page containers */
    var activePageContainer : JQuery;
    var inactivePageContainer : JQuery;

    function addTransitionEndCallback(pageContainer, callback) {
        var onTransitionEnd = function() {
            pageContainer.unbind("transitionend", onTransitionEnd);
            callback();
        };
        pageContainer.bind("transitionend", onTransitionEnd);
    }

    /* Get the page containers on load */
    $(document).ready(function() {
        pageContainer1 = $("#page-container-1");
        pageContainer2 = $("#page-container-2");
    });

    function setCssWithoutTransition(pageContainer : JQuery, 
                                     property : string,
                                     value : any) {
        pageContainer.removeClass("transition");
        pageContainer.css(property, value);
        pageContainer.addClass("transition");
    }

    /* Swaps the active and inactive containers */
    function swapContainers() {
        var tmp = activePageContainer;
        activePageContainer = inactivePageContainer;
        inactivePageContainer = tmp;
        reorder();
    }

    /* Reorders the page containers */
    function reorder() {
        activePageContainer.css("z-index", "2");
        inactivePageContainer.css("z-index", "1");
    }

    /* Move the old page to the left. */
    export function transitionLeft(newPage : Page,
                                   callback: () => void) {
        /* Reset the inactive page container */
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("left", Util.deviceWidth());
        inactivePageContainer.css("opacity", "1");
        /* Add the jquery to the inactive page container */
        inactivePageContainer.empty();
        inactivePageContainer.append(newPage.getView().getJquery());
        /* Do the animation */
        swapContainers();
        setTimeout(function() {
            activePageContainer.addClass("transition");
            inactivePageContainer.addClass("transition");
            inactivePageContainer.css("left", -Util.deviceWidth());
            activePageContainer.css("left", 0);
            addTransitionEndCallback(activePageContainer, callback);
        }, 0);
    }

    /* Move the old page to the right. newPage can be null */
    export function transitionRight(newPage : Page,
                                    callback: () => void) {
        /* Reset the inactive page container */
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("left", -Util.deviceWidth());
        inactivePageContainer.css("opacity", "1");
        if (Util.exists(newPage)) {
            inactivePageContainer.empty();
            inactivePageContainer.append(newPage.getView().getJquery());
        }
        /* Do the animation */
        swapContainers();
        setTimeout(function() {
            activePageContainer.addClass("transition");
            inactivePageContainer.addClass("transition");
            inactivePageContainer.css("left", Util.deviceWidth());
            activePageContainer.css("left", 0);
            addTransitionEndCallback(activePageContainer, callback);
        }, 0);
    }

    /* Fade into new page */
    export function transitionFadeIn(newPage : Page,
                                     callback: () => void) {
        /* set up the inactive page container */
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("opacity", "0");
        inactivePageContainer.css("left", "0");
        /* Add the jquery to the inactive page container */
        inactivePageContainer.empty();
        inactivePageContainer.append(newPage.getView().getJquery());
        /* Set the opacity */
        swapContainers();
        setTimeout(function() {
            activePageContainer.addClass("transition");
            activePageContainer.css("opacity", "1");
            addTransitionEndCallback(activePageContainer, callback);
        }, 0);
    }

    /* Fade out of old page */
    export function transitionFadeOut(oldPage : Page,
                                      callback: () => void) {
        activePageContainer.css("opacity", "0");
        addTransitionEndCallback(activePageContainer, function() {
            swapContainers();
            callback();
        });
    }

    /* Simply replace the active page with the new page */
    export function replacePage(newPage : Page,
                                callback: () => void) {
        /* Set the active and inactive page containers*/
        inactivePageContainer = pageContainer2;
        activePageContainer = pageContainer1;
        /* Reorder the containers and add the html to the dom*/
        reorder();
        pageContainer1.append(newPage.getView().getJquery());
        callback();
    }
}
