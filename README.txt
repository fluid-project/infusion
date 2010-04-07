Fluid Infusion 1.2 Beta 1
=========================
Main Project Site:  http://fluidproject.org
Documentation:      http://wiki.fluidproject.org/display/fluid/Infusion+Documentation

What's New in 1.2 Beta 1
========================



What's in this Release
======================


Source Code
-----------
The organization of the full source code for the Infusion library is as follows:

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
             jquery/
             json/
             swfobject/
             swfupload/


Demo Portal
-----------
The bundle now comes with a convenient one-stop-shop for seeing all components in action. It is organized as follows:

        demos/
            fss/
                layout/
                mobile/
                reset/
                text/
                themes/
            inlineEdit/
                rich/
                simple/
            keyboard-a11y/            
            pager/
            portal/                
            progress/
            renderer/
            reorderer/
                gridReorderer/
                imageReorderer/
                layoutReorderer/                
                listReorderer/
            uiOptions/
            uploader/

            
Other Examples and Sample Code
------------------------------
Sample code illustrating how Infusion components can be used:

        integration-demos/
             bspace/    (showcases: Inline Edit)
             sakai/     (showcases: Inline Edit, Pager, UI Options, FSS)
             uportal/   (showcases: Reorderer, UI Options, FSS)
        standalone-demos/
             keyboard-a11y/
             lib/
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
Fluid Infusion code is licensed under a dual ECL 2.0 / BSD license. The specific licenses can be
found in the license file:
        licenses/Infusion-LICENSE.txt

Infusion also depends upon some third party open source modules. These are contained in their own
folders, and their licenses are also present in
        licenses/

Third Party Software in Infusion
--------------------------------
This is a list of publicly available software that is included in the Fluid Infusion bundle, along
with their licensing terms.

    * jQuery javascript library v1.4.2: http://jquery.com/ (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * jQuery UI javascript widget library v1.8: http://ui.jquery.com/ (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * jQuery QUnit 2dbf603: http://docs.jquery.com/QUnit (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * jQuery Chili code highlighter http://code.google.com/p/jquery-chili-js/ (MIT licensed)
    * Douglas Crockford's JSON parsing and stringifying methods (from 2007-11-06): http://www.json.org/ (Public Domain)
    * SWFUpload v2.2.0.1: http://swfupload.org/ (MIT licensed http://www.opensource.org/licenses/mit-license.php)
    * SWFObject v2.1: http://code.google.com/p/swfobject/ (MIT licensed http://www.opensource.org/licenses/mit-license.php)
    * Sample markup and stylesheets from Sakai v2.5 (http://sakaiproject.org) and uPortal v2.6 (http://www.uportal.org/)
    
Other third party software

    * fastXmlPull is based on XML for Script's Fast Pull Parser v3.1
      (see: http://wiki.fluidproject.org/display/fluid/Licensing+for+fastXmlPull.js )
    * fluid.reset.css is based on YUI's CSS reset styling v2.5.2
      see: http://developer.yahoo.com/yui/reset/ (BSD licensed http://developer.yahoo.com/yui/license.html)
    
Readme
------
This file.
        README.txt


Documentation
=============

The Fluid Project uses a wiki for documentation and project collaboration: http://wiki.fluidproject.org.
The main Infusion documentation can be found at:

    http://wiki.fluidproject.org/display/fluid/Infusion+Documentation

The documentation for Infusion consists of a number of information pages stored in the Fluid Wiki.
The pages include tutorials, API descriptions, testing procedures, and data-gathering approaches. To make the 
manual pages easy to navigate we have added the following guides:

    * The above-mentioned landing page, which links to all of our documentation.
    * A link to the documentation appears at the top of the left-side wiki navigation
      bar with the name "Infusion Documentation".


Supported Browsers
==================

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
    * Inline Edit: Dropdown
    * Inline Edit: Rich Text
    * Table of Contents


Known Issues
============

The Fluid Project uses a JIRA website to track bugs: http://issues.fluidproject.org.

