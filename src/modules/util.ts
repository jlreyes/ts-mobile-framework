/*
 * Utility functions
 * Author: jlreyes
 */
/// <reference path="globals.ts"/>
module Util {
    export function exists(x : any) : bool {
        return (x !== null && x !== undefined);
    }


    export interface PostJSONOpts {
        back? : bool; /* Go back */
        buttons? : {text : string;
                 callback : (e : Event) => void;}[];
        onFailure? : () => void;
        preventInput? : bool;
    }
    /* Posts a json command to the server and passes the result to the callback.
     * If an error is received, a dialog is created that explains the error */
    export function postJSON(command : string, postData : any,
                             callback : (result : any) => void,
                             opts? : PostJSONOpts) {
        var app = Globals.app;
        if (!Util.exists(opts)) opts = {};
        if (opts.preventInput === true) app.preventInput();
        if (opts.back === true) app.back();
        /* Ajax success function */
        var success = function(data, textStatus, jqXHR) {
            var result = data;
            /* allow input if we disabled it */
            if (opts.preventInput === true) app.allowInput();
            /* If there was no error, call the callback */
            if (!Util.exists(result.error)) {
                callback(result);
                return;
            }
            /* If we get here, there was an error */
            if (Util.exists(opts.onFailure)) opts.onFailure();
            var context : SimpleDialogContext =
            {
                title : "Error",
                message : result.error,
                buttons : [
                    {
                        text : "Okay",
                        callback : function() {
                            Globals.app.back();
                        }
                    }
                ]
            }
            if (Util.exists(opts.buttons))
                context.buttons = opts.buttons;
            app.startPage(new Intent(SimpleDialog, {context: context}));
        };
        /* Send the ajax */
        var url = "/json/" + command;
        $.ajax(url, {
          type: 'POST',
          data: postData,
          success: success,
          dataType: "json"
        });
    }

    /* Searches the given jquery element for buttons and 
     * makes them more-compatible for mobile */
    export var makeMobile = function (jquery : JQuery) {
        /* Button listeners */
        var buttonSelector = "button,ul.button-list li,[data-type='button']"
        var buttons = jquery.find(buttonSelector);
        buttons = buttons.add(jquery.filter(buttonSelector));
        var addClass = function() {
                $(this).addClass("active");
        };
        var removeClass = function() {
                $(this).removeClass("active");
        };
        for (var i = 0; i < buttons.length; i++) {
            var button = $(buttons[i]);
            /* Determine the callback */
            var callback = null;
            var buttonType = button.attr("data-type");
            if (Util.exists(buttonType)) {
                if (buttonType in PageView.sSpecialButtons)
                    callback = PageView.sSpecialButtons[buttonType];
            }
            /* Create the listener */
            button.ontap(addClass, removeClass, callback);
            button.click(function(e){
                e.preventDefault();
                return false;
            });
        }
    }

    export function cloneObject(oldObj : any) {
        if (typeof oldObj !== "object") return oldObj;
        var newObj = {};
        for (var key in oldObj) {
            newObj[key] = cloneObject(oldObj[key]);
        }
        return newObj;
    }

    export function deviceWidth() {
        return window.innerWidth;
    }

    export function isIOS() {
        return  !!(navigator.userAgent.match(/iPhone/i) ||
                   navigator.userAgent.match(/iPod/i) ||
                   navigator.userAgent.match(/iPad/i));
    }

    export function isAndroid() {
        return !!(navigator.userAgent.match(/Android/));
    }

    export function isChrome() {
        return !!(navigator.userAgent.match(/Chrome/));
    };
};