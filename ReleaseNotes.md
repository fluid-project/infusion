# Release Notes for Fluid Infusion 2.0 #

[Main Project Site](http://fluidproject.org)

[Documentation](https://github.com/fluid-project/infusion-docs)

## What's New in 2.0? ##

* 

## Downloading Infusion ##

You can dowload the source code for Infusion from [GitHub](https://github.com/fluid-project/infusion).

You can create your own custom build of Infusion using the [grunt build script](README.md#how-do-i-create-an-infusion-package):

## Demos ##

Infusion ships with a demos for seeing all of the components in action. You can
find them in the _**demos**_ folder in the release bundle or on our [web site](http://fluidproject.org/products/infusion/infusion-demos/).

When run from a local file system, several of these demos require you to enable local file AJAX
if you're using Firefox 3 and higher. Here's more information:

* http://kb.mozillazine.org/Security.fileuri.strict_origin_policy
* http://ejohn.org/blog/tightened-local-file-security/

## License ##

Fluid Infusion is licensed under both the ECL 2.0 and new BSD licenses.

More information is available in our [wiki](http://wiki.fluidproject.org/display/fluid/Fluid+Licensing).


## Third Party Software in Infusion ##

This is a list of publicly available software that is redistributed with Fluid Infusion,
categorized by license:

### MIT License ###
* [jQuery javascript library v1.11.0](http://jquery.com/)
* [jQuery UI button, dialog, draggable, mouse, position, resizable, slider, tabs, and tooltip javascript widgets v1.10.4](http://ui.jquery.com/)
* [jQuery QUnit v1.12.0](http://qunitjs.com)
* [jQuery QUnit Composite v1.0.1](https://github.com/jquery/qunit-composite)
* [jQuery Mockjax v1.5.3](https://github.com/appendto/jquery-mockjax)
* [jQuery scrollTo v1.4.2](http://flesler.blogspot.com/2007/10/jqueryscrollto.html)
* [jQuery Touch Punch v0.2.2](http://touchpunch.furf.com/)
* [jquery.simulate](https://github.com/eduardolundgren/jquery-simulate)
* [Micro Clearfix](http://nicolasgallagher.com/micro-clearfix-hack/)
* [Buzz v1.1.0](http://buzz.jaysalvat.com)
* [html5shiv v3.7.2](https://code.google.com/p/html5shiv/)

### zlib/libpng License ###
* [fastXmlPull is based on XML for Script's Fast Pull Parser v3.1](http://wiki.fluidproject.org/display/fluid/Licensing+for+fastXmlPull.js)

### BSD License ###
* fss-reset-global.css and fss-reset-contextual are based on [YUI's CSS reset styling v2.5.2](http://developer.yahoo.com/yui/reset/)
* fss-base-global.css and fss-base-contextual are based on YUI's CSS [base](http://developer.yahoo.com/yui/base/) and [fonts](http://developer.yahoo.com/yui/fonts/) styling v2.5.2

### ECL 2.0 ###
* Sample markup and stylesheets from [Sakai v2.5](http://sakaiproject.org)

### Apache 2.0 ###
* [Open Sans Light font](http://www.google.com/fonts/specimen/Open+Sans)

### Public Domain ###
* Douglas Crockford's [JSON.js (from 2007-11-06)](http://www.json.org/)
* fss-layout.css uses some styles, related to hiding content, based on HTML5 [Boilerplate v1.0](https://github.com/paulirish/html5-boilerplate/blob/master/README.md)

## Documentation ##

We are in the process of migrating our documentation to a new space. The markdown files for the documentation can be found in [github](https://github.com/fluid-project/infusion-docs).

The new space is dedicated to only Infusion documentation, and provides improved navigation.

Some of our documentation remains in the wiki space: Links to these pages are indicated with _**wiki**_. From any of these pages, you can return to the main documentation space using your
browser's Back button.

## Supported Browsers ##

Infusion 2.0 was tested with the following browsers:

* 

For more information see the [Fluid Infusion browser support](http://wiki.fluidproject.org/display/docs/Browser+Support) wiki page.


## Status of Components and Framework Features ##

### Production ###

Supported by tested browsers, and stable for production usage across a wide range of applications and use cases

* Infusion Framework Core
* Inline Edit: Simple Text
* Renderer
* Reorderer: List, Grid, Layout, Image
* Undo

### Preview ###

Still growing, but with broad browser support. Expect new features in upcoming releases

* IoC
* Pager
* Preferences Framework
* Progress
* UI Options
* Uploader

### Sneak Peek ###
In development; APIs will change. Share your feedback, ideas, and code

* Inline Edit: Dropdown
* Inline Edit: Rich Text
* Table of Contents
* Model Relay
* Model Transformation
* Progressive Enhancement
* etc.

## Known Issues ##

The Fluid Project uses a [JIRA](http://issues.fluidproject.org) website to track bugs. Some of the known issues in this release are described here:

### Framework ###

* [FLUID-3661: in the event system, fire should return true if event is not prevented](http://issues.fluidproject.org/browse/FLUID-3661)
* [FLUID-4302: Framework usability issues: situation with ambiguously named component and DOM binder was hard to diagnose](http://issues.fluidproject.org/browse/FLUID-4302)

### Inline Edit ###

* [FLUID-1600: Pressing the "Tab" key to exit edit mode places focus on the wrong item](http://issues.fluidproject.org/browse/FLUID-1600)

### Layout Reorderer ###
* [FLUID-3864: Layout Reorderer failed to move portlets back to the first column in three-columns view with keyboard](http://issues.fluidproject.org/browse/FLUID-3864)
* [FLUID-3089: If columns become stacked, can't drag item into lower column](http://issues.fluidproject.org/browse/FLUID-3089)

### Renderer ###

* [FLUID-3493: Renderer appears to corrupt templates containing empty tags on Opera (maybe others)](http://issues.fluidproject.org/browse/FLUID-3493)
* [FLUID-4322: Renderer can corrupt tag nesting structure in some cases with branch containers](http://issues.fluidproject.org/browse/FLUID-4322)

### Reorderer ###

* [FLUID-3925: With no wrapping on, the keyboard movement keystrokes are captured by the browser where a wrap would have occurred.](http://issues.fluidproject.org/browse/FLUID-3925)

### UI Options / Preferences Framework ###

* [FLUID-4394: Fat Panel UI Options' iFrame HTML page doesn't play nice with a concatenated build of Infusion](http://issues.fluidproject.org/browse/FLUID-4394)
* [FLUID-4426: Sliding Panel needs ARIA and/or to move focus to beginning of panel when opened to alert screen readers of new content](http://issues.fluidproject.org/browse/FLUID-4426)
* [FLUID-4491: Line spacing doesn't affect elements that have a line-height style set](http://issues.fluidproject.org/browse/FLUID-4491)
* [FLUID-5066: UIO Integrators shouldn't have to edit Infusion's copy of html templates to add panels, css](http://issues.fluidproject.org/browse/FLUID-5066)
* [FLUID-5218: Prefs editor requires iFrame template to be in the same place as panel templates; it probably shouldn't](http://issues.fluidproject.org/browse/FLUID-5218)
* [FLUID-5223: If there's exactly one text field in the prefs editor, pressing enter on most inputs causes the form to submit](http://issues.fluidproject.org/browse/FLUID-5223)
* [FLUID-5255: ToC template path is not configurable by UIO integrators](http://issues.fluidproject.org/browse/FLUID-5255)

### Undo ###

* [FLUID-3697: Undo hard-codes selector classes instead of using user-configured values](http://issues.fluidproject.org/browse/FLUID-3697)
