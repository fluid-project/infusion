Fluid Infusion 0.8
==================
Main Project Site:  http://fluidproject.org
User Manual:        http://wiki.fluidproject.org/display/fluid/User+Manual+Table+of+Contents

What's New in 0.8
=================

This release includes

    * Improved Uploader compatibility with Flash 9 and Internet Explorer
    * Improved documentation
    * Fluid Skinning System
    * Preview of User Interface Options
    * Upgrade to the latest version of qUnit automated Javascript test harness
    * Many bug fixes

What's in this Release
======================

This release is available in two forms:
    Deployment Bundle - fluid-0.8.zip 
    Source Code Bundle - fluid-0.8-src.zip

Both bundles include all the code needed to get started using Fluid, include a single JavaScript file, fluid-components/js/Fluid-all.js, that is a combination of all other source files. This script is compressed and suitable for production use.  Developers can include this single file in their pages to provide all the necessary support for the Fluid component Library.

Both bundles have the following organization:
	        fluid-components/
	        sample-code/
	        tests/
	        LICENSE.txt
	        README.txt

The Deployment Bundle also includes a WAR file suitable for deployment in Java-based containers: 
		fluid-components-0.8.war

Also, in the Deployment Bundle, the JavaScript source has been minified: comments and whitespace have been removed. 

Developers wishing to learn about the Fluid code, or debug their applications, should use the Source Code Bundle.

Source Code
-----------
The organization of the full source code for the Fluid component library, including JavaScript, HTML templates and CSS is:
        	fluid-components/
           		css/
           		flash/
           		html/
           		images/
           		js/

Sample Code
-----------
Sample code illustrating how Fluid components can be used*:
        	sample-code/
           		inline-edit/
           		keyboard-a11y/
           		pager/
           		renderer/
           		reorderer/
           		shared/
           
* sample code for the Uploader can be found in fluid-components/html/templates/

Tests
-----
        	tests/
            	fluid-tests/
            	jquery-tests/
            	jqUnit/
            	utils/

License
-------
Fluid code is licensed under a dual ECL 2.0 / BSD license. The specific licenses can be found in the license file:
    	LICENSE.txt

Fluid also depends upon some third party open source modules. These are contained in their own folders with their respective licenses inside the fluid source code.


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
The pages include tutorials, API descriptions, testing procedures, and data-gathering approaches. To make the manual pages easy to navigation we have added the following guides:

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

Inline Edit: 
    FLUID-1600 Pressing the "Tab" key to exit edit mode, places focus on the wrong item

Reorderer: 
    FLUID-148 Edge case: visual position of drop target when droppable is at beginning or end of a row
    FLUID-118 Dragging an image offscreen or out of the frame has some unexpected results.

Layout Reorderer: 
    FLUID-1540 Can't use keyboard reordering to move a nested reorderer to the right column, using IE6
    FLUID-858 Portlet Columns load with no padding between them in IE7

UI Options: 
    FLUID-2121 Focus is not placed on the first focusable item in the user interfact options dialog
    FLUID-2258 In IE 6, the UI Options Dialog may display with missing elements 
    FLUID-2260 In Opera, Activating the Reset or Close button will remove all elements of the UI Options dialog
    FLUID-2261 In Opera, UI Options example throws an error on load
    

Pager: 
    FLUID-835 Pager links are not in the tab order, using Opera 9.5