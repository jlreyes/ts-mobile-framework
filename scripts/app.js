var PageTransitioner;
(function (PageTransitioner) {
    var pageContainer1;
    var pageContainer2;
    var activePageContainer;
    var inactivePageContainer;
    function addTransitionEndCallback(pageContainer, callback) {
        var onTransitionEnd = function () {
            pageContainer.unbind("transitionend", onTransitionEnd);
            callback();
        };
        pageContainer.bind("transitionend", onTransitionEnd);
    }
    $(document).ready(function () {
        pageContainer1 = $("#page-container-1");
        pageContainer2 = $("#page-container-2");
    });
    function setCssWithoutTransition(pageContainer, property, value) {
        pageContainer.removeClass("transition");
        pageContainer.css(property, value);
        pageContainer.addClass("transition");
    }
    function swapContainers() {
        var tmp = activePageContainer;
        activePageContainer = inactivePageContainer;
        inactivePageContainer = tmp;
        reorder();
    }
    function reorder() {
        activePageContainer.css("z-index", "2");
        inactivePageContainer.css("z-index", "1");
    }
    function transitionLeft(newPage, callback) {
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("left", Util.deviceWidth());
        inactivePageContainer.css("opacity", "1");
        inactivePageContainer.empty();
        inactivePageContainer.append(newPage.getView().getJquery());
        swapContainers();
        setTimeout(function () {
            activePageContainer.addClass("transition");
            inactivePageContainer.addClass("transition");
            inactivePageContainer.css("left", -Util.deviceWidth());
            activePageContainer.css("left", 0);
            addTransitionEndCallback(activePageContainer, callback);
        }, 0);
    }
    PageTransitioner.transitionLeft = transitionLeft;
    function transitionRight(newPage, callback) {
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("left", -Util.deviceWidth());
        inactivePageContainer.css("opacity", "1");
        if(Util.exists(newPage)) {
            inactivePageContainer.empty();
            inactivePageContainer.append(newPage.getView().getJquery());
        }
        swapContainers();
        setTimeout(function () {
            activePageContainer.addClass("transition");
            inactivePageContainer.addClass("transition");
            inactivePageContainer.css("left", Util.deviceWidth());
            activePageContainer.css("left", 0);
            addTransitionEndCallback(activePageContainer, callback);
        }, 0);
    }
    PageTransitioner.transitionRight = transitionRight;
    function transitionFadeIn(newPage, callback) {
        inactivePageContainer.removeClass("transition");
        inactivePageContainer.css("opacity", "0");
        inactivePageContainer.css("left", "0");
        inactivePageContainer.empty();
        inactivePageContainer.append(newPage.getView().getJquery());
        swapContainers();
        setTimeout(function () {
            activePageContainer.addClass("transition");
            activePageContainer.css("opacity", "1");
            addTransitionEndCallback(activePageContainer, callback);
        }, 0);
    }
    PageTransitioner.transitionFadeIn = transitionFadeIn;
    function transitionFadeOut(oldPage, callback) {
        activePageContainer.css("opacity", "0");
        addTransitionEndCallback(activePageContainer, function () {
            swapContainers();
            callback();
        });
    }
    PageTransitioner.transitionFadeOut = transitionFadeOut;
    function replacePage(newPage, callback) {
        inactivePageContainer = pageContainer2;
        activePageContainer = pageContainer1;
        reorder();
        pageContainer1.append(newPage.getView().getJquery());
        callback();
    }
    PageTransitioner.replacePage = replacePage;
})(PageTransitioner || (PageTransitioner = {}));
var Util;
(function (Util) {
    function exists(x) {
        return (x !== null && x !== undefined);
    }
    Util.exists = exists;
    function postJSON(command, postData, callback, opts) {
        var app = Globals.app;
        if(!Util.exists(opts)) {
            opts = {
            };
        }
        if(opts.preventInput === true) {
            app.preventInput();
        }
        if(opts.back === true) {
            app.back();
        }
        var success = function (data, textStatus, jqXHR) {
            var result = data;
            if(opts.preventInput === true) {
                app.allowInput();
            }
            if(!Util.exists(result.error)) {
                callback(result);
                return;
            }
            if(Util.exists(opts.onFailure)) {
                opts.onFailure();
            }
            var context = {
                title: "Error",
                message: result.error,
                buttons: [
                    {
                        text: "Okay",
                        callback: function () {
                            Globals.app.back();
                        }
                    }
                ]
            };
            if(Util.exists(opts.buttons)) {
                context.buttons = opts.buttons;
            }
            app.startPage(new Intent(SimpleDialog, {
                context: context
            }));
        };
        var url = "/json/" + command;
        $.ajax(url, {
            type: 'POST',
            data: postData,
            success: success,
            dataType: "json"
        });
    }
    Util.postJSON = postJSON;
    Util.makeMobile = function (jquery) {
        var buttonSelector = "button,ul.button-list li,[data-type='button']";
        var buttons = jquery.find(buttonSelector);
        buttons = buttons.add(jquery.filter(buttonSelector));
        var addClass = function () {
            $(this).addClass("active");
        };
        var removeClass = function () {
            $(this).removeClass("active");
        };
        for(var i = 0; i < buttons.length; i++) {
            var button = $(buttons[i]);
            var callback = null;
            var buttonType = button.attr("data-type");
            if(Util.exists(buttonType)) {
                if(buttonType in PageView.sSpecialButtons) {
                    callback = PageView.sSpecialButtons[buttonType];
                }
            }
            button.ontap(addClass, removeClass, callback);
            button.click(function (e) {
                e.preventDefault();
                return false;
            });
        }
    };
    function cloneObject(oldObj) {
        if(typeof oldObj !== "object") {
            return oldObj;
        }
        var newObj = {
        };
        for(var key in oldObj) {
            newObj[key] = cloneObject(oldObj[key]);
        }
        return newObj;
    }
    Util.cloneObject = cloneObject;
    function deviceWidth() {
        return window.innerWidth;
    }
    Util.deviceWidth = deviceWidth;
    function isIOS() {
        return !!(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i));
    }
    Util.isIOS = isIOS;
    function isAndroid() {
        return !!(navigator.userAgent.match(/Android/));
    }
    Util.isAndroid = isAndroid;
    function isChrome() {
        return !!(navigator.userAgent.match(/Chrome/));
    }
    Util.isChrome = isChrome;
    ; ;
})(Util || (Util = {}));
; ;
var Template = (function () {
    function Template(name) {
        this.mName = name;
    }
    Template.prototype.render = function (context, callback) {
        dust.render(this.mName, context, callback);
    };
    return Template;
})();
(function () {
    dust.register("lib-dialog-simple", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-background\"></div><div class=\"dialog-box\"><div class=\"header\"><h1>").reference(ctx.get("title"), ctx, "h").write("</h1></div><div class=\"body\"><div class=\"section\"><p>").reference(ctx.get("message"), ctx, "h").write("</p></div><div id=\"button-container\"></div></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("lib-dialog-select", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Select tab dialog template --><div class=\"select dialog\"><div class=\"dialog-background\"></div><div class=\"dialog-box\"><ul>").section(ctx.get("items"), ctx, {
            "block": body_1
        }, null).write("</ul></div></div>");
    }
    function body_1(chk, ctx) {
        return chk.write("<li data-value=\"").reference(ctx.get("value"), ctx, "h").write("\"data-type=\"button\">").reference(ctx.get("text"), ctx, "h").write("</li>");
    }
    return body_0;
})();
(function () {
    dust.register("lib-dialog-edittext", body_0);
    function body_0(chk, ctx) {
        return chk.write("<div class=\"dialog\"><div class=\"dialog-background\"></div><div class=\"dialog-box\"><div class=\"header\"><h1>").reference(ctx.get("title"), ctx, "h").write("</h1></div><div class=\"body\"><div class=\"section\"><div style=\"display: inline-block;vertical-align:top;margin-right:1em;\"><label for=\"dialog-edittext-fontsize\"style=\"display: block;\">Font Size:</label><select id=\"dialog-edittext-fontsize\"style=\"display: block;\"><option value=\".5em\">Extra Small</option><option value=\".75em\">Small</option><option value=\"1em\">Medium</option><option value=\"2em\">Large</option><option value=\"3em\">Extra Large</option></select></div><div style=\"display:inline-block;vertical-align:top;\"><label for=\"dialog-edittext-fontcolor\"style=\"display:block;\">Color:</label><input id=\"dialog-edittext-fontcolor\"type='text' style=\"display:block;\"/></div></div><div class=\"section\" style=\"text-align:center;\"><textarea id=\"dialog-edittext-input\" style=\"width:100%;height:5em;\">").reference(ctx.getPath(false, [
            "default", 
            "text"
        ]), ctx, "h").write("</textarea></div><div id=\"button-container\" style=\"text-align:center;\"><button id=\"dialog-edittext-okay\" class=\"full\">Okay</button><button id=\"dialog-edittext-cancel\" class=\"full\">Cancel</button></div></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("lib-dialog-list", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- list dialog template --><div class=\"list dialog\"><div class=\"dialog-background\"></div><div class=\"dialog-box\"><h1>").reference(ctx.get("title"), ctx, "h").write("</h1><ul>").section(ctx.get("items"), ctx, {
            "block": body_1
        }, null).write("</ul></div></div>");
    }
    function body_1(chk, ctx) {
        return chk.write("<li>").reference(ctx.getPath(true, []), ctx, "h").write("</li>");
    }
    return body_0;
})();
(function () {
    dust.register("lib-dialog-input", body_0);
    function body_0(chk, ctx) {
        return chk.write("<!-- Simple dialog template --><div class=\"dialog\"><div class=\"dialog-background\"></div><div class=\"dialog-box\"><div class=\"header\"><h1>").reference(ctx.get("title"), ctx, "h").write("</h1></div><div class=\"body\" style=\"text-align:center;\"><div class=\"section\"><input id=\"dialog-input-input\"class=\"full\"type=\"text\"placeholder=\"").reference(ctx.get("placeholder"), ctx, "h").write("\" /></div><div id=\"button-container\"><button id=\"dialog-input-ok\" class=\"full\">Okay</button></div></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("lib-dialog-color", body_0);
    function body_0(chk, ctx) {
        return chk.write("<div class=\"dialog\"><div class=\"dialog-background\"></div><div class=\"dialog-box\"><div class=\"header\"><h1>Choose a Color</h1></div><div class=\"body\" style=\"text-align:center;\"><div class=\"section\"><input id=\"dialog-color-color\" type=\"text\" /></div><div id=\"button-container\"><button id=\"dialog-color-ok\" class=\"full\">Okay</button></div></div></div></div>");
    }
    return body_0;
})();
(function () {
    dust.register("lib-dialog-size", body_0);
    function body_0(chk, ctx) {
        return chk.write("<div class=\"dialog\"><div class=\"dialog-background\"></div><div class=\"dialog-box\"><div class=\"header\"><h1>Choose a Size</h1></div><div class=\"body\" style=\"text-align:center;\"><div class=\"section\" style=\"text-align: center;\"><canvas id=\"dialog-size-canvas\"style=\"display: inline-block;\"width=\"100\" height=\"100\"></canvas><br><input id=\"dialog-size-size\"style=\"display: inline-block;\"type=\"range\"min=\"1\"max=\"25\"step=\"1\" /></div><div id=\"button-container\"><button id=\"dialog-size-ok\" class=\"full\">Okay</button></div></div></div></div>");
    }
    return body_0;
})();
var Intent = (function () {
    function Intent(pageClass, data) {
        this.pageClass = pageClass;
        this.data = data;
    }
    return Intent;
})();
var PageView = (function () {
    function PageView(page, template, context) {
        this.mIsInflated = false;
        this.mPage = page;
        this.mTemplate = template;
        this.mContext = context;
    }
    PageView.sSpecialButtons = {
        back: function () {
            Globals.app.back();
        }
    };
    PageView.prototype.inflate = function (callback) {
        this.mTemplate.render(this.mContext, function (e, out) {
            if(Util.exists(e)) {
                throw e;
            }
            var jquery = $(out);
            this.mJquery = this.onInflation(jquery);
            this.makeMobile(this.mJquery);
            this.mIsInflated = true;
            callback();
        }.bind(this));
    };
    PageView.prototype.makeMobile = function (jquery) {
        Util.makeMobile(jquery);
    };
    PageView.prototype.onInflation = function (jquery) {
        return jquery;
    };
    PageView.prototype.getPage = function () {
        return this.mPage;
    };
    PageView.prototype.isInflated = function () {
        return this.mIsInflated;
    };
    PageView.prototype.getParent = function () {
        return this.mJquery.parent();
    };
    PageView.prototype.getJquery = function () {
        return this.mJquery;
    };
    return PageView;
})();
var Page = (function () {
    function Page(app) {
        this.mTransitionOver = false;
        this.mApp = app;
    }
    Page.prototype.onStart = function (intent) {
        this.mIntent = intent;
        this.onCreate(intent.data);
        if(!Util.exists(this.mView)) {
            throw "onCreate did not set the view!";
        }
        this.mView.inflate(function () {
            this.onResume();
        }.bind(this));
    };
    Page.prototype.onCreate = function (intentData) {
    };
    Page.prototype.onResume = function (data) {
    };
    Page.prototype.onPause = function () {
    };
    Page.prototype.onDestroy = function () {
    };
    Page.prototype.getApp = function () {
        return this.mApp;
    };
    Page.prototype.setView = function (view) {
        this.mView = view;
    };
    Page.prototype.getView = function () {
        return this.mView;
    };
    Page.prototype.getIntent = function () {
        return this.mIntent;
    };
    Page.prototype.getTransitionOver = function () {
        return this.mTransitionOver;
    };
    Page.prototype.setTransitionOver = function (b) {
        this.mTransitionOver = b;
    };
    return Page;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Dialog = (function (_super) {
    __extends(Dialog, _super);
    function Dialog() {
        _super.apply(this, arguments);

    }
    return Dialog;
})(Page);
var DialogView = (function (_super) {
    __extends(DialogView, _super);
    function DialogView() {
        _super.apply(this, arguments);

    }
    DialogView.prototype.makeMobile = function (jquery) {
        _super.prototype.makeMobile.call(this, jquery);
        var self = this;
        var touchSupported = ('ontouchstart' in document.documentElement);
        var tap = "touchstart";
        if(touchSupported === false) {
            tap = "mousedown";
        }
        jquery.find(".dialog-background").bind(tap, function (e) {
            self.cancel.bind(self)();
            e.preventDefault();
            e.stopPropagation();
        });
    };
    DialogView.prototype.cancel = function () {
        var app = this.getPage().getApp();
        app.back();
    };
    return DialogView;
})(PageView);
var SimpleDialog = (function (_super) {
    __extends(SimpleDialog, _super);
    function SimpleDialog() {
        _super.apply(this, arguments);

    }
    SimpleDialog.prototype.onCreate = function (data) {
        var context = data.context;
        this.setView(new SimpleDialogView(this, context));
    };
    return SimpleDialog;
})(Dialog);
var SimpleDialogView = (function (_super) {
    __extends(SimpleDialogView, _super);
    function SimpleDialogView(page, context) {
        var formattedContext = {
            title: context.title,
            message: context.message
        };
        this.mButtons = context.buttons;
        _super.call(this, page, SimpleDialogView.sTemplate, formattedContext);
    }
    SimpleDialogView.sTemplate = new Template("lib-dialog-simple");
    SimpleDialogView.prototype.onInflation = function (jquery) {
        if(!Util.exists(this.mButtons)) {
            this.mButtons = [];
        }
        var buttonContainer = jquery.find("#button-container");
        for(var i = 0; i < this.mButtons.length; i++) {
            var buttonInfo = this.mButtons[i];
            var callback = buttonInfo.callback;
            var button = $("<button>" + buttonInfo.text + "</button>");
            button.addClass("full");
            button.hammer({
            }).bind("tap", callback);
            buttonContainer.append(button);
        }
        return jquery;
    };
    return SimpleDialogView;
})(DialogView);
var SelectDialog = (function (_super) {
    __extends(SelectDialog, _super);
    function SelectDialog() {
        _super.apply(this, arguments);

    }
    SelectDialog.prototype.onCreate = function (data) {
        var context = data.context;
        this.setView(new SelectDialogView(this, context));
    };
    return SelectDialog;
})(Dialog);
var SelectDialogView = (function (_super) {
    __extends(SelectDialogView, _super);
    function SelectDialogView(page, context) {
        this.mId = context.id;
        _super.call(this, page, SelectDialogView.sTemplate, {
    items: context.items
});
    }
    SelectDialogView.sTemplate = new Template("lib-dialog-select");
    SelectDialogView.prototype.onInflation = function (jquery) {
        var app = this.getPage().getApp();
        var id = this.mId;
        var onTap = function (e) {
            var value = this.getAttribute("data-value");
            app.back({
                id: id,
                result: value
            });
        };
        jquery.find("li").hammer({
        }).bind("tap", onTap);
        return jquery;
    };
    return SelectDialogView;
})(DialogView);
var EditTextDialog = (function (_super) {
    __extends(EditTextDialog, _super);
    function EditTextDialog() {
        _super.apply(this, arguments);

    }
    EditTextDialog.prototype.onCreate = function (data) {
        var context = data.context;
        this.setView(new EditTextDialogView(this, context));
    };
    return EditTextDialog;
})(Dialog);
var EditTextDialogView = (function (_super) {
    __extends(EditTextDialogView, _super);
    function EditTextDialogView(page, context) {
        this.mId = context.id;
        this.mDefault = context.default;
        var app = page.getApp();
        this.mOnCancel = function () {
            if(Util.exists(context.onCancel)) {
                context.onCancel();
            }
            app.back();
        }.bind(this);
        _super.call(this, page, EditTextDialogView.sTemplate, context);
    }
    EditTextDialogView.sTemplate = new Template("lib-dialog-edittext");
    EditTextDialogView.prototype.onInflation = function (jquery) {
        var id = this.mId;
        var app = this.getPage().getApp();
        var input = jquery.find("#dialog-edittext-input");
        var fontSize = jquery.find("#dialog-edittext-fontsize");
        var fontColor = jquery.find("#dialog-edittext-fontcolor");
        fontColor.spectrum({
            color: this.mDefault.fontColor,
            showAlpha: true,
            showInput: false
        });
        var selector = "option[value='" + this.mDefault.fontSize + "']";
        var opt = fontSize.find(selector);
        opt.attr("selected", "selected");
        var okay = jquery.find("#dialog-edittext-okay");
        okay.hammer({
        }).bind("tap", function () {
            var val = input.val();
            if(val.length > 0) {
                var result = {
                    text: val,
                    fontSize: fontSize.val(),
                    fontColor: fontColor.spectrum("get").toRgbString()
                };
                app.back({
                    id: id,
                    result: result
                });
                return;
            }
            var context = {
                title: "Error",
                message: "The text you input was invalid",
                buttons: [
                    {
                        text: "Okay",
                        callback: app.back.bind(app)
                    }
                ]
            };
            app.startPage(new Intent(SimpleDialog, {
                context: context
            }));
        }.bind(this));
        var cancel = jquery.find("#dialog-edittext-cancel");
        cancel.hammer({
        }).bind("tap", this.mOnCancel);
        return jquery;
    };
    EditTextDialogView.prototype.cancel = function () {
        this.mOnCancel();
    };
    return EditTextDialogView;
})(DialogView);
var ListDialog = (function (_super) {
    __extends(ListDialog, _super);
    function ListDialog() {
        _super.apply(this, arguments);

    }
    ListDialog.prototype.onCreate = function (data) {
        var context = data.context;
        this.setView(new ListDialogView(this, context));
    };
    return ListDialog;
})(Dialog);
var ListDialogView = (function (_super) {
    __extends(ListDialogView, _super);
    function ListDialogView(page, context) {
        _super.call(this, page, ListDialogView.sTemplate, context);
    }
    ListDialogView.sTemplate = new Template("lib-dialog-list");
    return ListDialogView;
})(DialogView);
var InputDialog = (function (_super) {
    __extends(InputDialog, _super);
    function InputDialog() {
        _super.apply(this, arguments);

    }
    InputDialog.prototype.onCreate = function (data) {
        var context = data.context;
        this.setView(new InputDialogView(this, context));
    };
    return InputDialog;
})(Dialog);
var InputDialogView = (function (_super) {
    __extends(InputDialogView, _super);
    function InputDialogView(page, context) {
        this.mId = context.id;
        _super.call(this, page, InputDialogView.sTemplate, context);
    }
    InputDialogView.sTemplate = new Template("lib-dialog-input");
    InputDialogView.prototype.onInflation = function (jquery) {
        var app = this.getPage().getApp();
        var id = this.mId;
        var input = jquery.find("#dialog-input-input");
        var onTap = function (e) {
            var value = input.val();
            if(value.match(/^\s*$/)) {
                return;
            }
            app.back({
                id: id,
                result: value
            });
        };
        jquery.find("#dialog-input-ok").hammer({
        }).bind("tap", onTap);
        return jquery;
    };
    return InputDialogView;
})(DialogView);
var ColorDialog = (function (_super) {
    __extends(ColorDialog, _super);
    function ColorDialog() {
        _super.apply(this, arguments);

    }
    ColorDialog.prototype.onCreate = function (data) {
        var data;
        var context = data.context;
        this.setView(new ColorDialogView(this, context));
    };
    return ColorDialog;
})(Dialog);
var ColorDialogView = (function (_super) {
    __extends(ColorDialogView, _super);
    function ColorDialogView(page, context) {
        this.mId = context.id;
        this.mDefault = context.default;
        _super.call(this, page, ColorDialogView.sTemplate, context);
    }
    ColorDialogView.sTemplate = new Template("lib-dialog-color");
    ColorDialogView.prototype.onInflation = function (jquery) {
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
        var onTap = function (e) {
            var value = color.spectrum("get").toRgbString();
            app.back({
                id: id,
                result: value
            });
        };
        jquery.find("#dialog-color-ok").hammer({
        }).bind("tap", onTap);
        return jquery;
    };
    return ColorDialogView;
})(DialogView);
var SizeDialog = (function (_super) {
    __extends(SizeDialog, _super);
    function SizeDialog() {
        _super.apply(this, arguments);

    }
    SizeDialog.prototype.onCreate = function (data) {
        var data;
        var context = data.context;
        this.setView(new SizeDialogView(this, context));
    };
    return SizeDialog;
})(Dialog);
var SizeDialogView = (function (_super) {
    __extends(SizeDialogView, _super);
    function SizeDialogView(page, context) {
        this.mId = context.id;
        this.mDefault = context.default;
        _super.call(this, page, SizeDialogView.sTemplate, context);
    }
    SizeDialogView.sTemplate = new Template("lib-dialog-size");
    SizeDialogView.prototype.onInflation = function (jquery) {
        var app = this.getPage().getApp();
        var id = this.mId;
        var canvas = jquery.find("#dialog-size-canvas");
        var ctx = (canvas[0]).getContext("2d");
        var size = jquery.find("#dialog-size-size");
        size.val(this.mDefault.toString());
        var updateCircle = function () {
            var sizeVal = parseInt(size.val());
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
        var onTap = function (e) {
            var value = size.val();
            app.back({
                id: id,
                result: value
            });
        };
        jquery.find("#dialog-size-ok").hammer({
        }).bind("tap", onTap);
        return jquery;
    };
    return SizeDialogView;
})(DialogView);
var Socket = (function () {
    function Socket(user, roomId, errorCallback) {
        this.mUser = user;
        this.mRoomId = roomId;
        var uri = "http://" + location.hostname + ":8080";
        var opts = {
            "force new connection": true,
            reconnect: false
        };
        this.mSocket = io.connect(uri, opts);
        this.mErrorCallback = errorCallback;
        this.mSocket.on("message", this.onMessage.bind(this));
        this.mSocket.on("newUser", this.onNewUser.bind(this));
        this.mSocket.on("userDisconnect", this.onUserDisconnect.bind(this));
        this.mSocket.on("error", this.destroy.bind(this));
        this.mSocket.on("disconnect", this.onDisconnect.bind(this));
    }
    Socket.prototype.register = function (callback) {
        delete this.mDisconnectCallback;
        delete this.mNewUserCallback;
        delete this.mUserDisconnectCallback;
        this.mMessageCallbacks = {
        };
        this.mDisconnected = false;
        this.mNewUserQueue = [];
        this.mDisconnectedUserQueue = [];
        this.mUnhandledMessages = {
        };
        this.mSocket.once("register", callback);
        this.mSocket.emit("register", {
            clientId: this.mUser.id,
            roomId: this.mRoomId
        });
    };
    Socket.prototype.sendMessage = function (type, message) {
        var data = {
        };
        data[type] = message;
        this.mSocket.emit("message", data);
    };
    Socket.prototype.destroy = function (e) {
        this.mSocket.disconnect();
        if(Util.exists(e)) {
            this.mErrorCallback(e);
        }
    };
    Socket.prototype.onDisconnect = function () {
        if(Util.exists(this.mDisconnectCallback)) {
            this.mDisconnectCallback();
        } else {
            this.mDisconnected = true;
        }
    };
    Socket.prototype.setDisconnectCallback = function (callback) {
        if(this.mDisconnected === true) {
            callback();
        } else {
            this.mDisconnectCallback = callback;
        }
    };
    Socket.prototype.removeDisconnectCallback = function () {
        delete this.mDisconnectCallback;
    };
    Socket.prototype.onNewUser = function (username) {
        if(!Util.exists(this.mNewUserCallback)) {
            this.mNewUserQueue.push(username);
            return;
        }
        this.mNewUserCallback(username);
    };
    Socket.prototype.setNewUserCallback = function (callback) {
        this.mNewUserCallback = callback;
        while(this.mNewUserQueue.length > 0) {
            callback(this.mNewUserQueue.shift());
        }
    };
    Socket.prototype.removeNewUserCallback = function () {
        delete this.mNewUserCallback;
    };
    Socket.prototype.onUserDisconnect = function (username) {
        if(!Util.exists(this.mUserDisconnectCallback)) {
            this.mDisconnectedUserQueue.push(username);
            return;
        }
        this.mUserDisconnectCallback(username);
    };
    Socket.prototype.setUserDisconnectCallback = function (callback) {
        this.mUserDisconnectCallback = callback;
        while(this.mDisconnectedUserQueue.length > 0) {
            callback(this.mDisconnectedUserQueue.shift());
        }
    };
    Socket.prototype.removeUserDisconnectCallback = function () {
        delete this.mUserDisconnectCallback;
    };
    Socket.prototype.onMessage = function (data) {
        var username = data.username;
        for(var key in data.message) {
            var handled = false;
            if(key in this.mMessageCallbacks) {
                for(var callbackKey in this.mMessageCallbacks[key]) {
                    handled = true;
                    var message = data.message[key];
                    this.mMessageCallbacks[key][callbackKey](username, message);
                }
            }
            if(handled === false) {
                if(!Util.exists(this.mUnhandledMessages[key])) {
                    this.mUnhandledMessages[key] = [];
                }
                this.mUnhandledMessages[key].push(data);
            }
        }
    };
    Socket.prototype.handleQueuedMessages = function (type, callback) {
        var messages = this.mUnhandledMessages[type];
        if(!Util.exists(messages)) {
            return;
        }
        for(var i = 0; i < messages.length; i++) {
            var username = messages[i].username;
            var message = messages[i].message[type];
            callback(username, message);
        }
    };
    Socket.prototype.addMessageCallback = function (type, key, callback) {
        if(!Util.exists(this.mMessageCallbacks[type])) {
            this.mMessageCallbacks[type] = {
            };
        }
        this.mMessageCallbacks[type][key] = callback;
        this.handleQueuedMessages(type, callback);
    };
    Socket.prototype.removeMessageCallback = function (type, key) {
        delete this.mMessageCallbacks[type][key];
    };
    Socket.prototype.getUser = function () {
        return this.mUser;
    };
    return Socket;
})();
var Globals;
(function (Globals) {
    Globals.app = null;
})(Globals || (Globals = {}));
var App = (function () {
    function App(user) {
        this.mHistory = [];
        this.mLocked = false;
        this.mLockQueue = [];
        this.mUser = user;
        this.mWaitScreen = $("#wait-screen");
        this.mWaitScreen.css("opacity", ".5");
    }
    App.prototype.preventInput = function () {
        this.mWaitScreen.css("opacity", ".5");
        this.mWaitScreen.css("z-index", "100");
    };
    App.prototype.allowInput = function () {
        this.mWaitScreen.css("opacity", "0");
        this.mWaitScreen.css("z-index", "-1");
    };
    App.prototype.lock = function () {
        this.mLocked = true;
    };
    App.prototype.unlock = function () {
        this.mLocked = false;
        var intent = this.mLockQueue.shift();
        if(Util.exists(intent)) {
            this.startPage(intent);
        }
    };
    App.prototype.destroyPage = function (page) {
        page.onPause();
        page.onDestroy();
    };
    App.prototype.startPage = function (intent) {
        if(this.mLocked === true) {
            this.mLockQueue.push(intent);
            return;
        }
        if(Util.exists(this.mForegroundPage) && this.mForegroundPage instanceof Dialog) {
            this.back();
            setTimeout(function () {
                this.startPage(intent);
            }.bind(this), 0);
            return;
        }
        if(Util.exists(this.mBackgroundPage)) {
            if(this.mBackgroundPage instanceof intent.pageClass) {
                this.back();
                return;
            }
        }
        this.lock();
        var foregroundExists = Util.exists(this.mForegroundPage);
        if(foregroundExists === true) {
            if(intent.data.destroy === true) {
                this.destroyPage(this.mForegroundPage);
                this.mForegroundPage = null;
            } else {
                this.mForegroundPage.onPause();
            }
        }
        if(Util.exists(this.mBackgroundPage)) {
            this.destroyPage(this.mBackgroundPage);
        }
        var newPage = new intent.pageClass(this);
        newPage.onStart(intent);
        this.mBackgroundPage = this.mForegroundPage;
        this.mForegroundPage = newPage;
        this.mHistory.unshift(this.mForegroundPage["constructor"]);
        var afterTransition = function () {
            this.mForegroundPage.setTransitionOver(true);
            this.unlock();
        }.bind(this);
        requestAnimationFrame(function () {
            if(foregroundExists === false) {
                PageTransitioner.replacePage(newPage, afterTransition);
                this.allowInput();
            } else {
                if(newPage instanceof Dialog) {
                    PageTransitioner.transitionFadeIn(newPage, afterTransition);
                } else {
                    if(intent.data.destroy) {
                        PageTransitioner.transitionRight(newPage, afterTransition);
                    } else {
                        PageTransitioner.transitionLeft(newPage, afterTransition);
                    }
                }
            }
        }.bind(this));
    };
    App.prototype.back = function (intentData) {
        if(this.mLocked === true) {
            this.mLockQueue.push(null);
            return;
        }
        this.lock();
        var newPage;
        var createNewInstance;
        this.mHistory.shift();
        var lastPage = this.mHistory[0];
        if(!Util.exists(this.mBackgroundPage)) {
            createNewInstance = true;
            if(!Util.exists(lastPage)) {
                if(!Util.exists(intentData) || !Util.exists(intentData.backHint)) {
                    return;
                }
                lastPage = intentData.backHint;
            }
            newPage = new lastPage(this);
            if(!Util.exists(intentData)) {
                intentData = {
                };
            }
            var intent = {
                data: intentData
            };
            this.destroyPage(this.mForegroundPage);
            newPage.onStart(intentData);
        } else {
            createNewInstance = false;
            newPage = this.mBackgroundPage;
            this.destroyPage(this.mForegroundPage);
            newPage.onResume(intentData);
        }
        var oldPage = this.mForegroundPage;
        this.mForegroundPage = newPage;
        this.mBackgroundPage = null;
        var afterTransition = function () {
            this.mForegroundPage.setTransitionOver(true);
            this.unlock();
        }.bind(this);
        requestAnimationFrame(function () {
            if(oldPage instanceof Dialog) {
                PageTransitioner.transitionFadeOut(newPage, afterTransition);
            } else {
                if(createNewInstance) {
                    PageTransitioner.transitionRight(newPage, afterTransition);
                } else {
                    PageTransitioner.transitionRight(null, afterTransition);
                }
            }
        }.bind(this));
    };
    App.prototype.getPage = function () {
        return this.mForegroundPage;
    };
    App.prototype.getUser = function () {
        return this.mUser;
    };
    App.prototype.setUser = function (user) {
        this.mUser = user;
    };
    return App;
})();
//@ sourceMappingURL=app.js.map
