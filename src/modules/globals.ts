/*
 * Typescript file containing references to all the project references.
 */
/* Declarations */
/// <reference path="../declarations/jquery.d.ts"/>
/* Modules */
/// <reference path="pagetransitioner.ts"/>
/// <reference path="util.ts"/>
/* Templates */
/// <reference path="../template.ts"/>
/// <reference path="../templates/simple-dialog-view.ts"/>
/// <reference path="../templates/select-dialog-view.ts"/>
/// <reference path="../templates/edittext-dialog-view.ts"/>
/// <reference path="../templates/list-dialog-view.ts"/>
/// <reference path="../templates/input-dialog-view.ts"/>
/// <reference path="../templates/color-dialog-view.ts"/>
/// <reference path="../templates/size-dialog-view.ts"/>
/* Main files */
/// <reference path="../intent.ts"/>
/// <reference path="../pageview.ts"/>
/// <reference path="../page.ts"/>
/// <reference path="../dialog.ts"/>
/// <reference path="../socket.ts"/>
/// <reference path="../app.ts"/>

declare var dust;
declare var hammer;
declare var Hammer;
declare var Recaptcha;

module Globals {
    export var app : App = null;
}