Fluid Infusion 1.0
==================
Main Project Site:  http://fluidproject.org
User Manual:        http://wiki.fluidproject.org/display/fluid/User+Manual+Table+of+Contents

What's New in 1.0
=================

This release includes

    * Improved documentation
    * Complete reorganization of the Source Code 
    * Standardization and normalization of classnames used for selectors and styles
    * 3 new Fluid Skinning System themes (Coal, Slate, Inverted High Contrast) with master graphics files
    * Preview of User Interface Options
    * New factoring out and development of Data Binding framework (formerly known as DARApplier)
    * Progress is now a stand-alone component 
    * Many bug fixes

What's in this Release
======================

This release is available in two forms:
    Deployment Bundle - fluid-1.0.zip 
    Source Code Bundle - fluid-1.0-src.zip

Both bundles include all the code needed to get started using Fluid, include a single JavaScript file, fluid-components/js/Fluid-all.js, that is a combination of all other source files. This script is compressed and suitable for production use.  Developers can include this single file in their pages to provide all the necessary support for the Fluid component Library.

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
-----------
Sample code illustrating how Fluid components can be used*:

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
                  pager/
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
manual pages easy to navigation we have added the following guides:

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

For more information on Fluid Infusion browser support, please see: http://wiki.fluidproject.org/display/fluid/Browser+Support

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
	FLUID-2275 The jquery.tinymce plugin invokes TinyMCE even if it doesn't exist

Reorderer: 
    FLUID-148 Edge case: visual position of drop target when droppable is at beginning or end of a row
    FLUID-118 Dragging an image offscreen or out of the frame has some unexpected results.

Layout Reorderer: 
    FLUID-1540 Can't use keyboard reordering to move a nested reorderer to the right column, using IE6
    FLUID-858  Portlet Columns load with no padding between them in IE7

UI Options: 
	FLUID-2412 Reset doesn't work after saving the initial cookie
	FLUID-2397 Line spacing setting does not work in Opera
	FLUID-2523 Re-opening the dialog after closing it with the 'esc' key, doesn't display the preview window: using IE
	FLUID-2510 Using the reset button breaks the preview: using Opera
	FLUID-2508 Turning on the table of contents causes an error: using Opera
	FLUID-2506 Keyboard navigation inside the dialog breaks in simple layout mode: using FF
	FLUID-2500 switching from high contrast to any other theme will remove some text from the page: using IE
	
FSS:
    FLUID-2504: Flexible columns dont maintain proper alignment under certain conditions
    FLUID-2434: In IE, major font size changes break text positioning within form controls
    FLUID-2397: Opera doesnt seem to repaint certain css changes on the fly, requiring a refresh to see them