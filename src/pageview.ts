/*
 * Typescript for the page view class:
 *     The view for the current page in the mv structure.
 */
/// <reference path="modules/globals.ts"/>
class PageView {
    private mPage : Page;
    /* The template and html for this view */
    private mTemplate : Template;
    private mContext : any;
    private mJquery : JQuery;
    /* True iff this view has been inflated */
    private mIsInflated : bool = false;
    /* Hashmap of special button types to their corresponding
     * function calls */
    private static sSpecialButtons = {
        back: function() {Globals.app.back();}
    };

    constructor(page : Page,
                template : Template,
                context : any) {
        this.mPage = page;
        this.mTemplate = template;
        this.mContext = context;
    }

    /* Inflate this view and call the given callback when done */
    public inflate(callback : () => void) : void {
        this.mTemplate.render(this.mContext, function(e, out) {
            if (Util.exists(e)) throw e;
            var jquery = $(out);
            this.mJquery = this.onInflation(jquery);
            this.makeMobile(this.mJquery);
            this.mIsInflated = true;
            callback();
        }.bind(this));
    }

    /* Calls util.makemobile. Subclasses can override if they want to
     * add mobile features */
    public makeMobile(jquery : JQuery) : void {
        Util.makeMobile(jquery);
    }

    /* Called when this view is inflated. Subclasses should do template
     * modification here. */
    private onInflation(jquery : JQuery) : JQuery {
        return jquery;
    }

    /*
     * GETTERS AND SETTERS
     */
    
    public getPage() : Page {
        return this.mPage;
    }

    public isInflated() : bool {
        return this.mIsInflated;
    }

    public getParent() : JQuery {
        return this.mJquery.parent();
    }

    public getJquery() : JQuery {
        return this.mJquery;
    }
}