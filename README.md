Title: Typescript Mobile App Framework<br>
Author: James Reyes - jlreyes<br>

Overview
================================================================================
This project is a mobile app framework written in Typescript. The application
framework should work on iOS, Android, Firefox, Chrome, and theoretically, any
modern browser. 

The framework is created for and used in the project Math Canvas
(https://github.com/jlreyes/mathcanvas).

I created this framework for the 15-237 Cross-Platform Mobile Apps course at
CMU for the Math Canvas application. The framework was written in a short time,
so I apoligize for messiness.

Currently I have no plans to expand the framework in itself. However, I plan on
using the framework in future web applications and so it is possible I will add
features. I'll also fix any reported bugs.

Usage
================================================================================
Prereqs:
  * Normalize (http://necolas.github.com/normalize.css/)
  * Jquery
  * Hammer JS (http://eightmedia.github.com/hammer.js/)
  * Dust JS (https://github.com/linkedin/dustjs)
  * Font Awesome (http://fortawesome.github.com/Font-Awesome/)

Optional:
  * Spectrum JS (for color dialog http://bgrins.github.com/spectrum/)
  * Socket.io (for the Socket Class http://socket.io/)

Use the included index.html file for your HTML. You need to provide the scripts
and css above. 

Create your pages and include the javascript and dust templates and include them
in the HTML. You can use the TypeScript declarations file provided in the
declarations folder for Typescript typing.

/scripts/init.js initializes the application. Change the start page class here 
to your start page class.

To see an example check out Math Canvas
(https://github.com/jlreyes/mathcanvas).

Pages
================================================================================
If you're familiar with Android development, you'll feel right at home.

Different tasks and screens are represented as Pages. For example, you may have
a login Page that takes you to your navigation Page. Dialogs/Popups are pages
as well. A page is roughly equivalent to an Activity in Android.

There can only be one page that has focus at a time. The page lifecycle is as
follows:

<pre>
 onStart   +------------> onCreate   +---------------->   onResume

 The page has been        Page initialization             The view is
 requested to be          happens here. The               inflated and the
 started. This should     view is set.                    the page is about
 never be overidden.                                      to be in focus
                                                               +
                                                               |      ^
                                                               |      |
                                                               |      |
                                                               |      |
                                                               |      |
                                                               |      |
                                                               |      |
+----------------------------------+  The page is in use  +----+      |
+                                                                     |
|                                                                     |
|                                                                     |
+--+ onPause +--------------------------------------------------------+
                                                                      |
     Another page is                                                  |
     about to come                                                    |
     into view                                                        v

                                                             onDestroy

                                                             Another page has
                                                             come into view.
                                                             Only two pages may be
                                                             in memory at a time so this
                                                             page is destroyed
</pre>

For more information see the Page class in src/Page.ts


PageViews
================================================================================
A Page holds a PageView which represents and holds the HTML for this page.

A PageViews HTML is represented by a dust template. A pageview must provide
the dust template name to inflate when the pageview is inflated.

The PageView for a page must be set in the <code>onCreate</code> method of a
page. The dust template will then be inflated and the <code>onInflation</code>
method in the PageView will be called passing the inflated HTML as a JQuery
object. All HTML manipulation should happen to the given JQuery element (this
is true in general) because it is not guaranteed that the JQuery is actually
within the DOM. 

```javascript
class MyPageView extends PageView {
  ...
  public onInflation(jquery : JQuery) {
    manipulateJquery(jquery);
  }
  ...
}
```

After inflation, <code>onResume</code> is called in the Page.

Page Dust Templates
================================================================================
Technically, a loaded page can contain any valid HTML. However, I recommend
using the built in classes and structure for an optimal experience.

Here is an example of a generic page (taken from the join room page in
Math Canvas (https://github.com/jlreyes/mathcanvas).

```html
<div class="page">
    <div class="header">
        <button class="icon left">
            <i class="icon-caret-left icon-large"></i>
            <p>Logout</p>
        </button>
        <h1>Rooms</h1>
        <button class="icon right">
            <i class=" icon-plus-sign icon-large"></i>
            <p>Create</p>
        </button>
    </div>
    <div class="body">
        <div class="box">
            <h1>Join Room</h1>
            <form>
                <div style="text-align: center;">
                    <input 
                        class="full"
                        min="0"
                        type="number"
                        placeholder="Room Id"
                        required="required" />
                </div>
                <div style="text-align: center;">
                    <button class="full">Join</button>
                </div>
            </form>
        </div>
        <div class="box">
            <h1>My Rooms</h1>
            <ul class="button-list">
            </ul>
        </div>
    </div>
    <div class="footer">
        <h1>{username}</h1>
    </div>
</div>
```

To see all the HTML options view the templates in Math Canvas.
(https://github.com/jlreyes/mathcanvas).

Dialogs
================================================================================
A Dialog is simply a special type of page. Only one dialog can be open at a
time. If a dialog opens another page, the dialog will be canceled before the
new page/dialog is started.

There are many types of dialogs, each requiring certain intent data to be
passed. You can create a custom dialogs the same way you would create a custom
page. 

You can view the required intent data for the dialogs in src/dialog.ts.
Currently available dialogs:
* Simple Dialog
* Select Dialog
* EditText Dialog
* List Dialog
* Input Dialog
* Color Dialog (requires spectrum (http://bgrins.github.com/spectrum/))
* Size Dialog

The only difference between a page and a dialog is the HTML structure. Here is 
an example of a generic dialog.

```html
<div class="dialog">
    <div class="dialog-background"></div>
    <div class="dialog-box">
        <div class="header"></div>
        <div class="body"></div>
    </div>
</div>
```


Intents
================================================================================
Switching between different pages is accomplished through Intents. When you want
to go to a given page you give the application an intent which the application
uses to launch the page for you.

```javascript
class MyPage extends Page {
  ...
  public myMethod() {
    var app : App = this.getApp();
    var intentData = {};
    app.startPage(new Intent(intentData));
  }
  ...
}
```

When an page is started, it can obtain and use the passed intent data.

```javascript
class MyPage extends Page {
  ...
  public onCreate(intentData? : any) {
    doSomethingWithTheIntentData(intentData);
  }
  ...
}
```

Another way to switch between pages is to call <code>app.back(data)</code>.
This will cause the application to go to the previous page in history. You can
optionally pass a hint to this method so the app will go back to the given
page if there is no more pages in memory (this may change in the future).

Furthermore, you can pass data to <code>app.back(data)</code> that will be
passed to the previous application in memory as intent data. This allows
you to, for example, start a dialog that asks the user for text input. The
result will be passed to the previous page in memory in onResume.

```javascript
class MyPage extends Page {
  ...
  public onResume(intentData? : any) {
    if (Util.exists(intentData) === false) return;
    if (Util.exists(intentData.id) === "dialog-popup") doSomething();
  }
  ...
}
```

Creating a Custom Page
================================================================================
1. Extend the Page class.

```javascript
class MyPage extends Page {
    public onCreate(intentData : any) : void {
        /* Create the view */
        this.setView(new MyView(this));
    }
}
```

2. Extend the PageView class.

```javascript
class MyView extends PageView {
    constructor(page : MyPage) {
        var app : App = page.getApp();
        var dustTemplateName = "myDustTemplate";
        /* The context to pass to the dust template on inflation */
        var context = {title: "Dust is cool!"};
        super(page, dustTemplateName, context);
    }

    private onInflation(jquery : JQuery) : JQuery {
      /* Here is where we modify this view's HTML programmatically */
    }
}
```

3. Compile the Typescript files and include them in your HTML.

4. Create the dust template. Make sure to include the compuled template in your
   HTML and that it has the same name that you pass to the super in the MyView 
   constructor.

```html
<div class="page">
  <div class="header"></div>
  <div class="body"></body>
</div>
```

Examples
================================================================================
<b>TODO</b>

For many, many examples, see Math Canvas.
 (https://github.com/jlreyes/mathcanvas).

License
================================================================================
This work is licensed under the Creative Commons Attribution 3.0 Unported
License. To view a copy of this license, visit 
http://creativecommons.org/licenses/by/3.0/.
