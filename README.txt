Fluid Infusion 1.3
====================
Main Project Site:  http://fluidproject.org
Documentation:      http://wiki.fluidproject.org/display/fluid/Infusion+Documentation


What's New in 1.3?
==================

    * Sneak Peek at the new Inversion of Control (IoC) system
    * Uploader support for HTML 5
         o Flash-free for modern browsers!
         o Substantially improved keyboard and screen reader accessibility
         o Comprehensive automatic progressive enhancement based on browser capabilities
    * Tons of accessibility improvements
         o Better feedback for the Progress component
         o Enhanced screen reader support for the Inline Edit component
         o Location and movement announcements for the Reorderer component
         o No wrap option for the Reorderer component
    * The new Infusion Builder site, which allows you to create custom builds: 
         http://builder.fluidproject.org
    * Renderer improvements
    * Transactional change applier
    * Bug fixes
    * Many improved demos


What's in this Release?
=======================

This release is available in three forms:
    Deployment Bundle - infusion-1.3.zip 
    Source Code Bundle - infusion-1.3-src.zip
    Your own custom build, using the new Infusion Builder: http://builder.fluidproject.org
    
In addition to source code, samples and tests, both bundles include at the top level a single JavaScript file,
InfusionAll.js, which is a combination of all other source files. Developers can include this single file in 
their pages to provide all the necessary support for the Infusion component Library. In the Deployment Bundle,
this script is compressed and suitable for production use.

The Deployment Bundle also includes a WAR file suitable for deployment in Java-based containers: 
        fluid-components-1.3.war

Source Code
-----------
The organization of the full source code for the Infusion library is as follows:

        components/
             inlineEdit/
             pager/
             progress/
             reorderer/
             tableOfContents/
             tooltip/
             uiOptions/
             undo/
             uploader/
        framework/
             core/
             enhancement/
             fss/
             renderer/
        lib/
             fastXmlPull/
             jquery/
             json/
             swfobject/
             swfupload/

In the Deployment Bundle, the JavaScript source has been minified: comments and whitespace have
been removed. 

Developers wishing to learn about the Fluid Infusion code, or debug their applications, should use
the Source Code Bundle.

Demo Portal
-----------
The bundle now comes with a convenient one-stop-shop for seeing all components in action. You can
find the demo portal in the "demos" folder in the release bundle or on our Website at:

    http://fluidproject.org/products/infusion/infusion-demos/

When run from a local file system, several of these demos require you to enable local file AJAX 
if you're using Firefox 3 and higher. Here's more information:

    http://kb.mozillazine.org/Security.fileuri.strict_origin_policy
    http://ejohn.org/blog/tightened-local-file-security/
    
        
Other Examples and Sample Code
------------------------------
Sample code illustrating how Infusion components can be used:

        integration-demos/
             sakai/     (showcases: Inline Edit, Pager, UI Options, FSS)
             uportal/   (showcases: Reorderer, UI Options, FSS)
        standalone-demos/
             pager/
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
Fluid Infusion code is licensed under both the ECL 2.0 and new BSD licenses. The specific licenses can be
found in the license file:
        licenses/Infusion-LICENSE.txt

Infusion also depends upon some third party open source modules. These are contained in their own
folders, and their licenses are also present in
        licenses/
        
More information about Infusion licensing is available in our wiki:

    http://wiki.fluidproject.org/display/fluid/Fluid+Licensing


Third Party Software in Infusion
--------------------------------
This is a list of publicly available software that is included in the Fluid Infusion bundle, along
with their licensing terms.

    * jQuery javascript library v1.4.2: http://jquery.com/ (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * jQuery UI javascript widget library v1.8: http://ui.jquery.com/ (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * jQuery UI tooltip plugin from the tooltip branch on github for jQuery UI v1.9: (MIT and GPL licensed http://docs.jquery.com/Licensing)
            https://github.com/jquery/jquery-ui/tree/tooltip
            commit  48a5977d3325869abd7b
            tree    43fd0cda4af2cdcd33f5
            parent  bdd815e8dcdeace8be6d 
    * jQuery QUnit revision 2dbf603: http://docs.jquery.com/QUnit (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * jQuery Mockjax: https://github.com/appendto/jquery-mockjax (MIT and GPL licensed) 
    * jQuery Chili code highlighter http://code.google.com/p/jquery-chili-js/ (MIT licensed)
    * Douglas Crockford's JSON parsing and stringifying methods (from 2007-11-06): http://www.json.org/ (Public Domain)
    * SWFUpload v2.2.0.1: http://swfupload.org/ (MIT licensed http://www.opensource.org/licenses/mit-license.php)
    * SWFObject v2.2: http://code.google.com/p/swfobject/ (MIT licensed http://www.opensource.org/licenses/mit-license.php)
    * Sample markup and stylesheets from Sakai v2.5 (http://sakaiproject.org) and uPortal v2.6 (http://www.uportal.org/)

Other third party software

    * fastXmlPull is based on XML for Script's Fast Pull Parser v3.1
      (see: http://wiki.fluidproject.org/display/fluid/Licensing+for+fastXmlPull.js )
    * fluid.reset.css is based on YUI's CSS reset styling v2.5.2
      see: http://developer.yahoo.com/yui/reset/ (BSD licensed http://developer.yahoo.com/yui/license.html)
    

Documentation
=============

The Fluid Project uses a wiki for documentation and project collaboration: http://wiki.fluidproject.org
The main Infusion documentation can be found at:

    http://wiki.fluidproject.org/display/fluid/Infusion+Documentation

The documentation for Infusion consists of a number of information pages stored in the Fluid Wiki.
The pages include tutorials, API descriptions, testing procedures, and data-gathering approaches. To make the 
manual pages easy to navigate, we have added the following guides:

    * The above-mentioned landing page, which links to all of our documentation.
    * A link to the documentation appears at the top of the left-side wiki navigation
      bar with the name "Infusion Documentation".

NOTE: Starting with Infusion 1.3, we are beginning to migrate our documentation to a new home.
Some of our Sneak Peek functionality is now documented at
    http://wiki.fluidproject.org/display/docs/Infusion+Documentation+Home


Supported Browsers
==================

The following browsers are fully supported and were actively tested against for Infusion 1.3:

Mac OS X 10.6:
    * Safari 5
    * Firefox 3.6
    * Firefox 4
   
Windows XP:
    * Firefox 3.6
    * Internet Explorer 6
    * Internet Explorer 7
    * Internet Explorer 8
    * Google Chrome
    
Windows 7:
    * Firefox 3.6
    * Firefox 4
    * Internet Explorer 8
    * Internet Explorer 9
    
For more information on Fluid Infusion browser support, please see:
    http://wiki.fluidproject.org/display/fluid/Browser+Support


Status of Components and Framework Features
===========================================

Production: supports A-Grade browsers, stable for production usage across a wide range of
applications and use cases
    * Fluid Skinning System 
    * Infusion Framework Core
    * Inline Edit: Simple Text
    * Renderer
    * Reorderer: List, Grid, Layout, Image
    * Undo

Preview: still growing, but with broad browser support. Expect new features in upcoming releases
    * Pager
    * Progress
    * UI Options
    * Uploader

Sneak Peek: in development; APIs will change. Share your feedback, ideas, and code
    * IoC
    * Transactional ChangeApplier
    * Inline Edit: Dropdown
    * Inline Edit: Rich Text
    * Mobile Fluid Skinning System
    * Table of Contents
    * Model Transformation
    * Progressive Enhancement


Known Issues
============

The Fluid Project uses a JIRA website to track bugs: http://issues.fluidproject.org
Some of the known issues in this release are described here:

FSS:
    FLUID-2504: Flexible columns don't maintain proper alignment under certain conditions
    FLUID-2434: In IE, major font size changes break text positioning within form controls

Framework:
    FLUID-2577: Renderer performance can be slow on IE 6 and 7 in some contexts.

Inline Edit: 
    FLUID-3632: Chrome 4 in WIN XP does not allow tabbing out of tinyMCE editor's edit field
    FLUID-3811: Previous edits are persisting in Edit Mode despite demo being reloaded in IE8
    FLUID-1600: Pressing the "Tab" key to exit edit mode places focus on the wrong item

Layout Reorderer: 
    FLUID-3864: Layout Reorderer failed to move portlets back to the first column in three-columns view with keyboard
    FLUID-3089: If columns become stacked, can't drag item into lower column
    FLUID-858:  Portlet Columns load with no padding between them in IE7

Pager:
    FLUID-2880: The Pager will be refactored. Note that as a result of this, there will be significant changes to the Pager API
    FLUID-2329: The self-rendering mode of the Pager is not the default mode
    FLUID-3584: Clicking page numbers throws an error: using IE 6

Renderer: 
    FLUID-3493: Renderer appears to corrupt templates containing empty tags on Opera (maybe others)
    FLUID-3277: Attempt to add children to leaf component in tree results in "targetlump is undefined" error
    FLUID-3276: Enclosing branch nodes within markup which has "headers" attribute causes them to become invisible to the renderer

Reorderer: 
    FLUID-3288: Moving an item with the keyboard "loses" the "ctrl-key is down" status
    FLUID-118:  Dragging an image offscreen or out of the frame has some unexpected results.

UI Options: 
    FLUID-3621: The text in buttons does not change size.
    FLUID-2481: "Links" selection does not work correctly in UIOptions
    FLUID-2398: Minimum font size control changes the text size even when the base size is larger then the minimum.
    
Uploader: 
    FLUID-4017: Total file progress information is inaccurate when uploading files with the HTML 5 version of Uploader
    FLUID-4018: The "Stop" button is unavailable in the HTML 5 version of Uploader
    FLUID-3992: When JavaScript is turned off, the Uploader is still visible beneath the Simple Uploader
    FLUID-3996: Deleting files on the local filesystem after they have been added to the Uploader's queue will cause inconsistent behaviour
    FLUID-3997: Can't tab to the "Browse/Add More" button with the keyboard in IE with Flash 10
    FLUID-3999: "Add more" button is not disabled while uploading other files
    FLUID-2052: Cannot tab away from the "Browse Files" button with Flash 10*
    * For information related to known issues with Flash 10 compatibility, 
      see http://wiki.fluidproject.org/x/kwZo
