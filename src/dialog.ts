/*
 * Typescript for the dialog class:
 *     A dialog is a special kind of page
 */
/// <reference path="modules/globals.ts"/>

class Dialog extends Page {}

class DialogView extends PageView {
    public makeMobile(jquery : JQuery) : void {
        super.makeMobile(jquery);
        /* The area outside of the dialog cancels the dialog */
        var self = this;
        var touchSupported = ('ontouchstart' in document.documentElement);
        var tap = "touchstart";
        if (touchSupported === false) tap = "mousedown";
        jquery.find(".dialog-background").bind(tap, function(e) {
            self.cancel.bind(self)();
            e.preventDefault();
            e.stopPropagation();
        });
    }

    public cancel() {
        var app : App = this.getPage().getApp();
        app.back();
    }
}

/******************************************************************************/
/* SIMPLE DIALOG                                                              */
/******************************************************************************/

class SimpleDialog extends Dialog {
    public onCreate(data : any) {
        var context = data.context;
        this.setView(new SimpleDialogView(this, context));
    }
}

interface SimpleDialogContext {
    title : string;
    message : string;
    buttons? : {
        text: string; callback : (e : Event) => void;
    }[];
}

/* View for this dialog */
class SimpleDialogView extends DialogView {
    private static sTemplate : Template = new Template("lib-dialog-simple");
    private mButtons : {text : string; callback : (e : Event) => void;}[];

    constructor(page : Page,
                context : SimpleDialogContext) {
        var formattedContext = {
            title : context.title,
            message : context.message,
        };
        this.mButtons = context.buttons;
        super(page, SimpleDialogView.sTemplate, formattedContext);
    }

    /* We need to add the passed buttons */
    private onInflation(jquery : JQuery) : JQuery {
        /* Add the buttons */
        if (!Util.exists(this.mButtons)) this.mButtons = [];
        var buttonContainer = jquery.find("#button-container");
        for (var i = 0; i < this.mButtons.length; i++) {
            var buttonInfo = this.mButtons[i];
            var callback = buttonInfo.callback;
            var button = $("<button>" + buttonInfo.text + "</button>");
            button.addClass("full");
            button.hammer({}).bind("tap", callback);
            buttonContainer.append(button);
        }
        return jquery;
    }
}

/******************************************************************************/
/* SELECT DIALOG                                                              */
/******************************************************************************/

interface SelectDialogContext {
    id : string;
    title : string;
    items: {
        text: string;
        value: string;
    }[];
}

class SelectDialog extends Dialog {
    public onCreate(data : any) {
        var context : SelectDialogContext = data.context;
        this.setView(new SelectDialogView(this, context));
    }
}

class SelectDialogView extends DialogView {
    private static sTemplate : Template = new Template("lib-dialog-select");

    private mId : string;

    constructor(page : Page,
                context : SelectDialogContext) {
        this.mId = context.id;
        super(page, SelectDialogView.sTemplate, {items: context.items});
    }

    private onInflation(jquery : JQuery) {
        /* Attach callbacks to the select options */
        var app = this.getPage().getApp();
        var id = this.mId;
        var onTap = function(e) {
            var value = this.getAttribute("data-value");
            app.back({
                id : id,
                result: value
            });
        };
        jquery.find("li").hammer({}).bind("tap", onTap);
        return jquery;
    }
}

/******************************************************************************/
/* EDIT TEXT DIALOG                                                           */
/******************************************************************************/
interface EditTextDialogContext {
    id : string;
    title : string;
    default: EditTextResult;
    onCancel?: (...args : any[]) => void;
}

interface EditTextResult {
    text: string;
    fontSize: string;
    fontColor: string;
}

class EditTextDialog extends Dialog {
    public onCreate(data : any) {
        var context : EditTextDialogContext = data.context;
        this.setView(new EditTextDialogView(this, context));
    }
}

class EditTextDialogView extends DialogView {
    private static sTemplate : Template = new Template("lib-dialog-edittext");
    private mId : string;
    private mDefault : EditTextResult;
    private mOnCancel : (...args : any[]) => void;

    constructor(page : Page,
                context : EditTextDialogContext) {
        this.mId = context.id;
        this.mDefault = context.default;
        var app = page.getApp();
        this.mOnCancel = function() {
            if (Util.exists(context.onCancel)) context.onCancel();
            app.back();
        }.bind(this);
        super(page, EditTextDialogView.sTemplate, context);
    }

    private onInflation(jquery : JQuery) {
        var id = this.mId;
        var app = this.getPage().getApp();
        var input = jquery.find("#dialog-edittext-input");
        var fontSize = jquery.find("#dialog-edittext-fontsize");
        var fontColor = jquery.find("#dialog-edittext-fontcolor");
        /* Initialize the color picker */
        fontColor.spectrum({
            color: this.mDefault.fontColor,
            showAlpha: true,
            showInput: false
        });
        /* Set the default font size */
        var selector = "option[value='" + this.mDefault.fontSize + "']";
        var opt = fontSize.find(selector);
        opt.attr("selected", "selected");
        /* Okay button */
        var okay = jquery.find("#dialog-edittext-okay");
        okay.hammer({}).bind("tap", function() {
            var val = input.val();
            /* If they input nothing, throw an error. Otherwise, return the result */
            if (val.length > 0) {
                var result : EditTextResult = {
                    text: val,
                    fontSize: fontSize.val(),
                    fontColor: fontColor.spectrum("get").toRgbString()
                }
                app.back({id : id, result: result});
                return;
            }
            /* If we get here, there was an error */
            var context = {
                title : "Error",
                message: "The text you input was invalid",
                buttons: [{
                    text: "Okay", callback: app.back.bind(app)
                }]
            };
            app.startPage(new Intent(SimpleDialog, {context:context}));
        }.bind(this));
        /* Cancel button */
        var cancel = jquery.find("#dialog-edittext-cancel");
        cancel.hammer({}).bind("tap", this.mOnCancel);
        return jquery;
    }

    public cancel() {
        this.mOnCancel();
    }
}

/******************************************************************************/
/* LIST DIALOG                                                                */
/******************************************************************************/
interface ListDialogContext {
    title : string;
    items: string[];
}

class ListDialog extends Dialog {
    public onCreate(data : any) {
        var context : ListDialogContext = data.context;
        this.setView(new ListDialogView(this, context));
    }
}

class ListDialogView extends DialogView {
    private static sTemplate : Template = new Template("lib-dialog-list");

    constructor(page : Page,
                context : ListDialogContext) {
        super(page, ListDialogView.sTemplate, context);
    }
}

/******************************************************************************/
/* INPUT DIALOG                                                                */
/******************************************************************************/
interface InputDialogContext {
    id : string;
    title : string;
    placeholder: string;
}

class InputDialog extends Dialog {
    public onCreate(data : any) {
        var context : InputDialogContext = data.context;
        this.setView(new InputDialogView(this, context));
    }
}

class InputDialogView extends DialogView {
    private static sTemplate : Template = new Template("lib-dialog-input");
    private mId : string;

    constructor(page : Page,
                context : InputDialogContext) {
        this.mId = context.id;
        super(page, InputDialogView.sTemplate, context);
    }

    private onInflation(jquery : JQuery) {
        /* Attach callbacks to the select options */
        var app = this.getPage().getApp();
        var id = this.mId;
        var input = jquery.find("#dialog-input-input");
        var onTap = function(e) {
            var value = input.val();
            if (value.match(/^\s*$/)) return;
            app.back({
                id : id,
                result: value
            });
        };
        jquery.find("#dialog-input-ok").hammer({}).bind("tap", onTap);
        return jquery;
    }
}

/******************************************************************************/
/* COLOR DIALOG                                                               */
/******************************************************************************/
interface ColorDialogContext {
    id : string;
    default : string;
}

class ColorDialog extends Dialog {
    public onCreate(data : any) {var data
        var context : ColorDialogContext = data.context;
        this.setView(new ColorDialogView(this, context));
    }
}

class ColorDialogView extends DialogView {
    private static sTemplate : Template = new Template("lib-dialog-color");
    private mId : string;
    private mDefault : string;

    constructor(page : Page,
                context : ColorDialogContext) {
        this.mId = context.id;
        this.mDefault = context.default;
        super(page, ColorDialogView.sTemplate, context);
    }

    private onInflation(jquery : JQuery) {
        var app = this.getPage().getApp();
        var id = this.mId;
        var color = jquery.find("#dialog-color-color");
        color.spectrum({
            color: this.mDefault,
            flat: true,
            showInput: true,
            showAlpha: true,
            preferredFormat: "hex"
        });
        var onTap = function(e) {
            var value = color.spectrum("get").toRgbString();
            app.back({
                id : id,
                result: value
            });
        };
        jquery.find("#dialog-color-ok").hammer({}).bind("tap", onTap);
        return jquery;
    }
}

/******************************************************************************/
/* SIZE DIALOG                                                                */
/******************************************************************************/
interface SizeDialogContext {
    id : string;
    default : number;
}

class SizeDialog extends Dialog {
    public onCreate(data : any) {var data
        var context : SizeDialogContext = data.context;
        this.setView(new SizeDialogView(this, context));
    }
}

class SizeDialogView extends DialogView {
    private static sTemplate : Template = new Template("lib-dialog-size");
    private mId : string;
    private mDefault : number;

    constructor(page : Page,
                context : SizeDialogContext) {
        this.mId = context.id;
        this.mDefault = context.default;
        super(page, SizeDialogView.sTemplate, context);
    }

    private onInflation(jquery : JQuery) {
        var app = this.getPage().getApp();
        var id = this.mId;
        var canvas = jquery.find("#dialog-size-canvas");
        var ctx = (<any> canvas[0]).getContext("2d");
        var size = jquery.find("#dialog-size-size");
        size.val(this.mDefault.toString());
        var updateCircle = function() {
            var sizeVal : number = parseInt(size.val());
            var width = 100;
            var height = 100;
            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, sizeVal, 0, Math.PI * 2, false);
            ctx.fillStyle = "black";
            ctx.fill();
        }.bind(this);
        updateCircle();
        size.change(updateCircle);
        var onTap = function(e) {
            var value = size.val()
            app.back({
                id : id,
                result: value
            });
        };
        jquery.find("#dialog-size-ok").hammer({}).bind("tap", onTap);
        return jquery;
    }
}
