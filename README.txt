
Fluid Infusion 0.7
==================
Main Project Site:  http://fluidproject.org
User Manual:        http://wiki.fluidproject.org/display/fluid/User+Manual+Table+of+Contents

What's New in 0.7
=================

This release includes

    * Graceful degradation support in the Uploader
    * Improved documentation
    * Sneak Peek of User Interface Options
    * Preview of the Fluid Skinning System
    * Many bug fixes

What's in this Release
======================

This release is available in two forms:
    fluid-0.7.zip - deployment bundle
    fluid-0.7-src.zip - source code bundle
    
Both bundles have the following organization:
        fluid-components/
        sample-code/
        tests/
        LICENSE.txt
        README.txt

The deployment bundle also includes a WAR file suitable for deployment in Java-based containers: 
	fluid-components-0.7.war

Source Code
-----------
The full source code for the Fluid component library, including JavaScript, HTML templates and CSS:
        fluid-components/
           css/
           html/
           images/
           js/
           swfupload/

Both bundles also include a single JavaScript file, fluid-components/js/Fluid-all.js, that is a
combination of all other source files. This script is compressed and suitable for production use.
Developers can include this single file in their pages to provide all the necessary support for the 
Fluid component Library.

In the deployment bundle, the JavaScript source has been minified: comments and whitespace
have been removed. Developers wishing to learn about the Fluid code, or debug their applications,
should use the source code bundle.

Sample Code
-----------
Sample code illustrating how Fluid components can be used:
        sample-code/
           inline-edit/
           keyboard-a11y/
           pager/
           renderer/
           reorderer/
           uploader/
           shared/

Tests
-----
        tests/
            fluid-tests/
            jquery-tests/
            jqUnit/
            utils/

License
-------
Fluid code is licensed under a dual ECL 2.0 / BSD license. The specific licenses can be found
in the license file:
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
	* jARIA, the jQuery ARIA plugin: http://jqueryjs.googlecode.com/svn/trunk/plugins/jARIA (MIT and GPL licensed http://docs.jquery.com/Licensing)
    * Douglas Crockford's JSON parsing and stringifying methods: http://www.json.org/ (Public Domain)
    * SWFUpload: http://swfupload.org/ (MIT licensed http://www.opensource.org/licenses/mit-license.php)
    * XML for Script's Fast Pull Parser (LGPL licensed http://xmljs.sourceforge.net/)
    * Sample markup and stylesheets from Sakai (http://sakaiproject.org) and uPortal (http://www.uportal.org/)

    
Readme
------
This file.
    README.txt


Documentation
=============

    http://wiki.fluidproject.org/display/fluid/User+Manual+Table+of+Contents

The Fluid Project uses a wiki for documentation and project collaboration: http://wiki.fluidproject.org.

The User Manual for Fluid releases consists of a number of information pages stored in the Fluid Wiki.
The pages fall into a number of categories, including tutorials, API descriptions, testing procedures,
and data-gathering approaches. To make the manual pages easy to locate, identify, and peruse,
we have set up the following aids to navigation:

    * An organized Table of Contents is provided for the reader, with links to
      all manual pages, each with a brief description of the page contents.
    * A link to the Table of Contents appears at the top of the left-side wiki navigation
      bar with the name "User Manual". This makes it easy to return to the Table of
      Contents from anywhere in the wiki hierarchical structure.


Supported Browsers
==================
Firefox 2.x, 3.x: full support
Internet Explorer 6.x, 7.x: full support
Safari 3.1, Opera 9.5: full support (except keyboard interaction, which is not supported by these browsers)


Known Issues
============

The Fluid Project uses a JIRA website to track bugs: http://issues.fluidproject.org.
Some of the known issues in this release are described here:

Uploader: 
  For information related to known issues related to Flash 10 compatibility, see http://wiki.fluidproject.org/x/0QFS
    FLUID-2052 Cannot tab away from the "Browse Files" button with Flash 10; using FF3
    FLUID-2032 Cannot Tab to the 'Browse More" button with Flash 10, using FF2
    FLUID-1983 Uploader not working with flash 9: using IE

Inline Edit: 
    FLUID-2017 Cannot click on links in a rich text inline edit field because it changes into edit mode.
    FLUID-2024 Undo/Redo links set scroll to top
    FLUID-1600 Pressing the "Tab" key to exit edit mode, places focus on the wrong item

Reorderer: 
    FLUID-954 Page won't scroll during DnD, using Opera
    FLUID-148 Edge case: visual position of drop target when droppable is at beginning or end of a row
    FLUID-118 Dragging an image offscreen or out of the frame has some unexpected results.

Layout Reorderer: 
    FLUID-1540 Can't use keyboard reordering to move a nested reorderer to the right column, using IE6
    FLUID-858 Portlet Columns load with no padding between them in IE7

UI Options: 
    FLUID-2121 Focus is not placed on the first focusable item in the user interfact options dialog
    FLUID-2118 Cannot tab to "Close" button: using Opera
    FLUID-2004 Cannot tab to "Edit Appearance": using Opera

Pager: 
    FLUID-2124 Page links are too close together in the renderer version
    FLUID-2084 Pointer does not change style over visited page links: using Opera
    FLUID-835 Pager links are not in the tab order, using Opera 9.5

