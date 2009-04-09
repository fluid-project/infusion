Fluid Infusion 1.0
==================
Main Project Site:  http://fluidproject.org
User Manual:        http://wiki.fluidproject.org/display/fluid/User+Manual+Table+of+Contents

What's New in 1.0
=================

This release includes

    * New data binding framework: the ChangeApplier
    * Substantial UI Options improvements and refinements, including:
        - a better user interface: improved layout, easier to use, increased contrast
        - new features: table of contents, contrast and line spacing
        - configurable strategy for persisting user preferences, using cookies by default
        - stable API
    * 3 new Fluid Skinning System themes with graphics: Coal, Slate, and Inverted High Contrast
    * New preview component: Progress (previously part of the Uploader component)
    * Improved documentation
    * Better error handling for the Uploader
    * Up to date ARIA support for the Reorderer
    * Consistency across the board: standardized APIs, class names, and source code layout
    * Many bug fixes

What's in this Release
======================

This release is available in two forms:
    Deployment Bundle - infusion-1.0.zip 
    Source Code Bundle - infusion-1.0-src.zip

Both bundles include all the code needed to get started using Fluid, include a single JavaScript file,
fluid-components/js/Fluid-all.js, that is a combination of all other source files. This script is
compressed and suitable for production use.  Developers can include this single file in their pages to
provide all the necessary support for the Fluid component Library.

Both bundles have the following organization:
        components/
        framework/
        integration-demos/
        lib/
        standalone-demos/
        tests/
        LICENSE.txt
        README.txt

The Deployment Bundle also includes a WAR file suitable for deployment in Java-based containers: 
        fluid-components-1.0.war

Also, in the Deployment Bundle, the JavaScript source has been minified: comments and whitespace have been removed. 

Developers wishing to learn about the Fluid code, or debug their applications, should use the Source Code Bundle.

Source Code
-----------
The organization of the full source code for the Fluid library is as follows:

        components/
             inlineEdit/
             pager/
             progress/
             reorderer/
             tableOfContents/
             uiOptions/
             undo/
             uploader/
        framework/
             core/
             fss/
             renderer/
        lib/
             fastXmlPull/
             fckeditor/
             jquery/
             json/
             swfobject/
             swfupload/
             tiny_mce/


Examples and Sample Code
------------------------
Sample code illustrating how Fluid components can be used:

        integration-demos/
             bspace/    (showcases: Inline Edit)
             sakai/     (showcases: Inline Edit, Pager, UI Options, FSS)
             uportal/   (showcases: Reorderer, UI Options, FSS)
        standalone-demos/
             keyboard-a11y/
             pager/
             quick-start-examples/
                  fss/
                  inlineEdit/
                  reorderer/
             renderer/
             reorderer/
             table-of-contents/

Tests
-----
        tests/
            component-tests/
            escalated-tests/
            framework-tests/
            lib/
            manual-tests/
            test-core/

License
-------
Fluid code is licensed under a dual ECL 2.0 / BSD license. The specific licenses can be found in the
license file:
        LICENSE.txt

Fluid also depends upon some third party open source modules. These are contained in their own folders
with their respective licenses inside the fluid source code.


Third Party Software in Fluid
------------------------------
This is a list of publicly available software that is included in the Fluid bundle, along with their licensing terms.

    * jQuery javascript library: http://jquery.com/ (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * jQuery UI javascript widget library: http://ui.jquery.com/ (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * jQuery QUnit testrunner: http://docs.jquery.com/QUnit (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * CSS styling reset from YUI: http://developer.yahoo.com/yui/reset/ (BSD licensed http://developer.yahoo.com/yui/license.html)
    * Douglas Crockford's JSON parsing and stringifying methods: http://www.json.org/ (Public Domain)
    * SWFUpload: http://swfupload.org/ (MIT licensed http://www.opensource.org/licenses/mit-license.php)
    * SWFObject: http://code.google.com/p/swfobject/ (MIT licensed http://www.opensource.org/licenses/mit-license.php)
    * XML for Script's Fast Pull Parser (LGPL licensed http://xmljs.sourceforge.net/)
    * Sample markup and stylesheets from Sakai (http://sakaiproject.org) and uPortal (http://www.uportal.org/)
    * TinyMCE, Javascript HTML WYSIWYG editor control: (LGPL licensed http://tinymce.moxiecode.com/license.php)  
    * FCKeditor, HTML text editor (LGPL licensed http://www.fckeditor.net/license)
    
Readme
------
This file.
        README.txt


Documentation
=============

    http://wiki.fluidproject.org/display/fluid/User+Manual+Table+of+Contents

The Fluid Project uses a wiki for documentation and project collaboration: http://wiki.fluidproject.org.

The User Manual for Fluid releases consists of a number of information pages stored in the Fluid Wiki.
The pages include tutorials, API descriptions, testing procedures, and data-gathering approaches. To make the 
manual pages easy to navigate we have added the following guides:

    * An organized Table of Contents is provided for the reader, with links to
      all manual pages, each with a brief description of the page contents.
    * A link to the Table of Contents appears at the top of the left-side wiki navigation
      bar with the name "User Manual". This makes it easy to return to the Table of
      Contents from anywhere in the wiki hierarchical structure.


Supported Browsers
==================
Firefox 2.x, 3.x: full support
Internet Explorer 6.x, 7.x: full support
Safari 3.1, Opera 9.6: full support (except keyboard interaction, which is not supported by these browsers)

Internet Explorer 8: preliminary testing

For more information on Fluid Infusion browser support, please see:
    http://wiki.fluidproject.org/display/fluid/Browser+Support


Status of Components and Framework Features
===========================================

Production: supports A-Grade browsers, stable for production usage across a wide range of applications and use cases
    * Fluid Skinning System 
    * Infusion Framework Core
    * Inline Edit
    * Reorderer 
    * Undo

Preview: still growing, but with broad browser support. Expect new features in upcoming releases
    * Pager
    * Progress
    * UI Options
    * Uploader
    * Renderer

Sneak Peek: in development; APIs will change. Share your feedback, ideas, and code
    * Table of Contents


Known Issues
============

The Fluid Project uses a JIRA website to track bugs: http://issues.fluidproject.org.
Some of the known issues in this release are described here:

Build System:
    FLUID-2575: The jquery.bgiframe plugin is not included in InfusionAll.js or other custom builds.

FSS:
    FLUID-2504: Flexible columns don't maintain proper alignment under certain conditions
    FLUID-2434: In IE, major font size changes break text positioning within form controls
    FLUID-2397: Opera doesn't seem to repaint certain css changes on the fly, requiring a refresh to see them

Framework:
    FLUID-2577 Renderer performance can be slow on IE 6 and 7 in some contexts.

Inline Edit: 
    FLUID-1600 Pressing the "Tab" key to exit edit mode, places focus on the wrong item
    FLUID-2275 The jquery.tinymce plugin invokes TinyMCE even if it doesn't exist

Uploader: 
  For information related to known issues with Flash 10 compatibility, see http://wiki.fluidproject.org/x/kwZo
    FLUID-2052 Cannot tab away from the "Browse Files" button with Flash 10; using FF3
    FLUID-2032 Cannot Tab to the 'Browse More" button with Flash 10, using FF2

Layout Reorderer: 
    FLUID-1540 Can't use keyboard reordering to move a nested reorderer to the right column, using IE6
    FLUID-2171 In IE, can't reorderer portlets containing Google components
    FLUID-858  Portlet Columns load with no padding between them in IE7

Pager:
    FLUID-2329 The self-rendering mode of the Pager is not the default mode
    FLUID-2467 The style name for the root node is not configurable

Reorderer: 
    FLUID-148 Edge case: visual position of drop target when droppable is at beginning or end of a row
    FLUID-118 Dragging an image offscreen or out of the frame has some unexpected results.

UI Options: 
    FLUID-2397 Line spacing setting does not work in Opera
    FLUID-2398 Minimum font size control changes the text size even when the base size is larger then the minimum.
    FLUID-2411 Refreshing the browser, hitting cancel or reset, breaks the functionality of the sliders: using Opera
    FLUID-2412 Reset doesn't work after saving the initial cookie
    FLUID-2500 Switching from high contrast to any other theme will remove some text from the page: using IE
    FLUID-2506 Keyboard navigation inside the dialog breaks in simple layout mode: using FF
    FLUID-2508 Turning on the table of contents causes an error: using Opera
    FLUID-2510 Using the reset button breaks the preview: using Opera
    FLUID-2523 Re-opening the dialog after closing it with the 'esc' key, doesn't display the preview window: using IE  
