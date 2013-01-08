/* 
 * Template class for index.html
 */
/// <reference path="modules/globals.ts"/>

class Template {

    private mName : string;
    constructor(name : string) {
        this.mName = name;
    }

    public render(context : any,
                  callback : (e : any, out : HTMLElement) => void) {
        dust.render(this.mName, context, callback);
    }
}