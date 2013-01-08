/* 
 * App class for index.html
 */
/// <reference path="modules/globals.ts"/>

class App {
    /* The user that is using this app. NULL if no
     * user */
    private mUser : any;
    /* Only two pages can be in memory at a time */
    private mForegroundPage : Page;
    private mBackgroundPage : Page;
    /* Stack of pages. The topmost page is the current
     * foreground page */
    private mHistory : any[] = [];
    /* Reference to the wait screen */
    private mWaitScreen : JQuery;
    /* Whether or not this app is locked */
    private mLocked : bool = false;
    private mLockQueue : Intent[] = [];

    constructor(user : any) {
        this.mUser = user;
        this.mWaitScreen = $("#wait-screen");
        this.mWaitScreen.css("opacity", ".5");
    }
    
    /* Called when the app needs to prevent user input */
    public preventInput() : void {
        this.mWaitScreen.css("opacity", ".5");
        this.mWaitScreen.css("z-index", "100");
    }

    /* Called when the app will accept user input again */
    public allowInput() : void {
        this.mWaitScreen.css("opacity", "0");
        this.mWaitScreen.css("z-index", "-1");
    }

    /* Lock the app so we cannot start any pages while the lock
     * is active */
    private lock() : void {
        this.mLocked = true;
    }

    /* Unlock the app and execute locked intents */
    private unlock() : void {
        this.mLocked = false;
        var intent = this.mLockQueue.shift();
        if (Util.exists(intent))
            this.startPage(intent);
    }

    /* Helper function that calls the onPause, then onDestroy methods
     * of the given page */
    private destroyPage(page : Page) : void {
        page.onPause();
        page.onDestroy();
    }

    /* Push the given page onto the history stack and put
     * it in view */
    public startPage(intent : Intent) {
        /* See if we are locked */
        if (this.mLocked === true) {
            this.mLockQueue.push(intent);
            return;
        }
        /* We can't start a new page on a dialog. So
         * go back if there is already a dialog */
        if (Util.exists(this.mForegroundPage) &&
                this.mForegroundPage instanceof Dialog) {
            this.back();
            setTimeout(function() {
                this.startPage(intent);
            }.bind(this), 0);
            return;
        }
        /* See if we actually should be calling this.back() */
        if (Util.exists(this.mBackgroundPage)) {
            if (this.mBackgroundPage instanceof intent.pageClass) {
                this.back();
                return;
            }
        }
        this.lock();
        /* Either pause or destroy the foreground */
        var foregroundExists = Util.exists(this.mForegroundPage);
        if (foregroundExists === true) {
            if (intent.data.destroy === true) {
                this.destroyPage(this.mForegroundPage);
                this.mForegroundPage = null;
            }
            else this.mForegroundPage.onPause();
        }
        /* Destroy the background page */
        if (Util.exists(this.mBackgroundPage))
            this.destroyPage(this.mBackgroundPage);
        /* Create the new page */
        var newPage = new intent.pageClass(this);
        newPage.onStart(intent);
        /* Change the pages */
        this.mBackgroundPage = this.mForegroundPage;
        this.mForegroundPage = newPage;
        /* Add the new page to the history */
        this.mHistory.unshift(this.mForegroundPage["constructor"]);
        var afterTransition = function() {
            this.mForegroundPage.setTransitionOver(true);
            this.unlock();
        }.bind(this);
        /* Start the transition */
        requestAnimationFrame(function() {
            if (foregroundExists === false) {
            PageTransitioner.replacePage(newPage, afterTransition);
            this.allowInput();
            } else if (newPage instanceof Dialog)
                PageTransitioner.transitionFadeIn(newPage, afterTransition);
            else if (intent.data.destroy) {
                PageTransitioner.transitionRight(newPage, afterTransition);    
            } else PageTransitioner.transitionLeft(newPage, afterTransition);
        }.bind(this))
    }

    /* Go to the background page from the foreground page,
     * passing the optional intent data if the page has
     * to be restarted */
    public back(intentData? : any) : void {
        /* See if we are locked */
        if (this.mLocked === true) {
            this.mLockQueue.push(null);
            return;
        }
        this.lock();
        /* Determine of the last page and start it */
        var newPage : Page;
        var createNewInstance;
        this.mHistory.shift();
        var lastPage = this.mHistory[0];
        if (!Util.exists(this.mBackgroundPage)) {
            createNewInstance = true;
            if (!Util.exists(lastPage)) {
                /* Try to determine the last logical page */
                if (!Util.exists(intentData) ||
                        !Util.exists(intentData.backHint)) return;
                lastPage = intentData.backHint;
            }
            newPage = new lastPage(this);
            if (!Util.exists(intentData)) intentData = {};
            var intent = {data: intentData}
            this.destroyPage(this.mForegroundPage);
            newPage.onStart(intentData);
        } else {
            createNewInstance = false;
            newPage = this.mBackgroundPage;
            this.destroyPage(this.mForegroundPage);
            newPage.onResume(intentData);
        }
        var oldPage : Page = this.mForegroundPage;
        /* Change the pages */
        this.mForegroundPage = newPage;
        this.mBackgroundPage = null;
        var afterTransition = function() {
            this.mForegroundPage.setTransitionOver(true);
            this.unlock();
        }.bind(this);
        /* Start the view transition after a delay (for better animation) */
        requestAnimationFrame(function() {
            if (oldPage instanceof Dialog)
                PageTransitioner.transitionFadeOut(newPage, afterTransition);
            else if (createNewInstance)
                PageTransitioner.transitionRight(newPage, afterTransition);
            else PageTransitioner.transitionRight(null, afterTransition);
        }.bind(this));
    }

    /*
     * GETTERS AND SETTERS
     */
    public getPage() : Page {
        return this.mForegroundPage;
    }

    public getUser() {
        return this.mUser;
    }

    public setUser(user : any) {
        this.mUser = user;
    }
}