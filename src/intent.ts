/*
 * Intent for app.ts.
 *  An intent is what pages use to start other pages.
 */
/// <reference path="modules/globals.ts"/>

class Intent {
    constructor(public pageClass : any,
                public data : any) {}
}