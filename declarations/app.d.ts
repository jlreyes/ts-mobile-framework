/*
 * Typescript Mobile Framework Declarations
 * Author: jlreyes
 */
/// <reference path="./jquery.d.ts"/>

module PageTransitioner {
    function transitionLeft(newPage: Page, callback: () => void): void;
    function transitionRight(newPage: Page, callback: () => void): void;
    function transitionFadeIn(newPage: Page, callback: () => void): void;
    function transitionFadeOut(oldPage: Page, callback: () => void): void;
    function replacePage(newPage: Page, callback: () => void): void;
}

module Util {
    function exists(x: any): bool;
    interface PostJSONOpts {
        back?: bool;
        buttons?: {
            text: string;
            callback: (e: Event) => void;
        }[];
        onFailure?: () => void;
        preventInput?: bool;
    }
    function postJSON(command: string, postData: any, callback: (result: any) => void, opts?: PostJSONOpts): void;
    var makeMobile: (jquery: JQuery) => void;
    function cloneObject(oldObj: any): any;
    function deviceWidth(): number;
    function isIOS(): bool;
    function isAndroid(): bool;
    function isChrome(): bool;
}

class Template {
    private mName: string;
    constructor (name: string);
    public render(context: any, callback: (e: any, out: HTMLElement) => void): void;
}

class Intent {
    public pageClass: any;
    public data: any;
    constructor (pageClass: any, data: any);
}

class PageView {
    private mPage: Page;
    private mTemplate: Template;
    private mContext: any;
    private mJquery: JQuery;
    private mIsInflated: bool;
    static sSpecialButtons: any;
    constructor (page: Page, template: Template, context: any);
    public inflate(callback: () => void): void;
    public makeMobile(jquery: JQuery): void;
    private onInflation(jquery: JQuery): JQuery;
    public getPage(): Page;
    public isInflated(): bool;
    public getParent(): JQuery;
    public getJquery(): JQuery;
}

class DialogView extends PageView {
    public makeMobile(jquery: JQuery): void;
    public cancel(): void;
}

class Page {
    private mApp: App;
    private mView: PageView;
    private mIntent : Intent;
    private mTransitionOver : bool;
    constructor (app: App);
    public onStart(intent: Intent): void;
    public onCreate(intentData: any): void;
    public onResume(data?: any): void;
    public onPause(): void;
    public onDestroy(): void;
    public getApp(): App;
    public setView(view: PageView): void;
    public getView(): PageView;
    public getIntent(): Intent;
    public getTransitionOver(): bool;
    public setTransitionOver(b: bool): void;
}

class Dialog extends Page {
}

class SimpleDialog extends Dialog {
    public onCreate(data: any): void;
}

interface SimpleDialogContext {
    title: string;
    message: string;
    buttons?: {
        text: string;
        callback: (e: Event) => void;
    }[];
}

class SimpleDialogView extends DialogView {
    static sTemplate: Template;
    private mButtons: {text : string; callback : (e : Event) => void;}[];
    constructor (page: Page, context: SimpleDialogContext);
    private onInflation(jquery: JQuery): JQuery;
}
interface SelectDialogContext {
    id: string;
    title: string;
    items: {
        text: string;
        value: string;
    }[];
}
class SelectDialog extends Dialog {
    public onCreate(data: any): void;
}
class SelectDialogView extends DialogView {
    static sTemplate: Template;
    private mId: string;
    constructor (page: Page, context: SelectDialogContext);
    private onInflation(jquery: JQuery): JQuery;
}
interface EditTextDialogContext {
    id: string;
    title: string;
    default: EditTextResult;
    onCancel?: (...args: any[]) => void;
}
interface EditTextResult {
    text: string;
    fontSize: string;
    fontColor: string;
}
class EditTextDialog extends Dialog {
    public onCreate(data: any): void;
}
class EditTextDialogView extends DialogView {
    static sTemplate: Template;
    private mId: string;
    private mDefault: EditTextResult;
    private mOnCancel: (...args : any[]) => void;
    constructor (page: Page, context: EditTextDialogContext);
    private onInflation(jquery: JQuery): JQuery;
    public cancel(): void;
}
interface ListDialogContext {
    title: string;
    items: string[];
}
class ListDialog extends Dialog {
    public onCreate(data: any): void;
}
class ListDialogView extends DialogView {
    static sTemplate: Template;
    constructor (page: Page, context: ListDialogContext);
}
interface InputDialogContext {
    id: string;
    title: string;
    placeholder: string;
}
class InputDialog extends Dialog {
    public onCreate(data: any): void;
}
class InputDialogView extends DialogView {
    static sTemplate: Template;
    private mId: string;
    constructor (page: Page, context: InputDialogContext);
    private onInflation(jquery: JQuery): JQuery;
}
interface ColorDialogContext {
    id: string;
    default: string;
}
class ColorDialog extends Dialog {
    public onCreate(data: any): void;
}
class ColorDialogView extends DialogView {
    static sTemplate: Template;
    private mId: string;
    private mDefault: string;
    constructor (page: Page, context: ColorDialogContext);
    private onInflation(jquery: JQuery): JQuery;
}
interface SizeDialogContext {
    id: string;
    default: number;
}
class SizeDialog extends Dialog {
    public onCreate(data: any): void;
}
class SizeDialogView extends DialogView {
    static sTemplate: Template;
    private mId: string;
    private mDefault: number;
    constructor (page: Page, context: SizeDialogContext);
    private onInflation(jquery: JQuery): JQuery;
}
class Socket {
    private mUser: any;
    private mRoomId: number;
    private mErrorCallback: (e : string) => void;
    private mSocket: any;
    private mDisconnectCallback: () => void;
    private mDisconnected: bool;
    private mNewUserCallback: (username : string) => void;
    private mNewUserQueue: string[];
    private mUserDisconnectCallback: (username : string) => void;
    private mDisconnectedUserQueue: string[];
    private mMessageCallbacks: {
        [type : string] : {
           [key : string] : (username: string, data : any) => void;
        };
    };
    private mUnhandledMessages: {
        [key : string] : any[];
    };
    constructor (user: any, roomId: number, errorCallback: (error: string) => void);
    public register(callback: (response: any) => void): void;
    public sendMessage(type: any, message: any): void;
    public destroy(e?: string): void;
    private onDisconnect();
    public setDisconnectCallback(callbac)k: () => void): void;
    public removeDisconnectCallback(): void;
    private onNewUser(username: string);
    public setNewUserCallback(callback: (username: string) => void): void;
    public removeNewUserCallback(): void;
    private onUserDisconnect(username: string);
    public setUserDisconnectCallback(callback: (username: string) => void): void;
    public removeUserDisconnectCallback(): void;
    private onMessage(data: any);
    private handleQueuedMessages(type: string, callback: any);
    public addMessageCallback(type: string, key: string, callback: (username: string, data: any) => void): void;
    public removeMessageCallback(type: string, key: string): void;
    public getUser(): any;
}

module Globals {
    var app: App;
}

class App {
    private mUser: any;
    private mForegroundPage: Page;
    private mBackgroundPage: Page;
    private mHistory: any[];
    private mWaitScreen: JQuery;
    private mLocked: bool;
    private mLockQueue: Intent[];
    constructor (user: any);
    public preventInput(): void;
    public allowInput(): void;
    private lock(): void;
    private unlock(): void;
    private destroyPage(page: Page): void;
    public startPage(intent: Intent): void;
    public back(intentData?: any): void;
    public getPage(): Page;
    public getUser(): any;
    public setUser(user: any): void;
}
