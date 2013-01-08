/*
 * App initialization
 */
/* Patches */
(function() {
    /* Patch request animation frame */
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(fn){
            setTimeout(function(){
                fn(Date.now());
            }, 1000/60);
        };
    /* Patch bind */
    if (Function.prototype.bind === undefined){
            Function.prototype.bind = function (bind) {
                var self = this;
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    return self.apply(bind || null, args);
                };
            };
    }
})();

/* Create a new app when the dom is ready */
$(document).ready(function() {
    var user = null;
    /* Create the app */
    Globals.app = new MobileApp(user);
    /* Create the first page */
    var intent = new Intent(MyStartPage, {}); /* CHANGE THIS */
    Globals.app.startPage(intent);
});