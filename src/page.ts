/*
 * Typescript for the page class:
 *     A page within the application. That is,
 *     the model in the mv structure.
 */
/// <reference path="modules/globals.ts"/>

class Page {
    private mApp : App;
    private mView : PageView;
    private mIntent : Intent;
    private mTransitionOver : bool = false;

    constructor(app : App) {
        this.mApp = app;
    }

    /* Called when the page is first started. This
     * shouldn't be overidden by subclasses */
    public onStart(intent : Intent) : void {
        this.mIntent = intent;
        this.onCreate(intent.data);
        /* Inflate the view and wait for it to finish */
        if (!Util.exists(this.mView))
            throw "onCreate did not set the view!";
        this.mView.inflate(function() {
            this.onResume();
        }.bind(this));
    }

    /* Called when the page is first created. The view is
     * expected to be initialized and set here.
     * intentData is the data passed by the intent */
    public onCreate(intentData : any) : void {}

    /* Called when the page becomes in view. At this point, the page view is
     * in the dom. data is an optional variable containing data sent by
     * the page we resumed from. */
    public onResume(data? : any) : void {}

    /* Called when this page leaves the foreground.*/
    public onPause() : void {}

    /* Called when this page is about to be destroyed. */
    public onDestroy() : void {}

    /*
     * GETTERS AND SETTERS
     */
    public getApp() : App {return this.mApp;}

    public setView(view : PageView) : void {
        this.mView = view;
    }

    public getView() : PageView {
        return this.mView;
    }

    public getIntent() : Intent {
        return this.mIntent;
    }

    public getTransitionOver() : bool {
        return this.mTransitionOver;
    }

    public setTransitionOver(b : bool) {
        this.mTransitionOver = b;
    }
}