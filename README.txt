
Fluid Infusion 0.6beta1
========================
Main Project Site:  http://fluidproject.org
User Manual:        http://wiki.fluidproject.org/display/fluid/User+Manual+Table+of+Contents

What's New in 0.6beta1
======================

This beta release includes
  * A sneak peak at the Fluid Client-side Renderer (working in FireFox and Safari)
  * A preview of the Fluid Skinning System
  * Numerous bug fixes

What's in this Release
======================

This release is available in two forms:
    fluid-0.6beta1.zip - deployment bundle
    fluid-0.6beta1-src.zip - source code bundle
    
Both bundles have the following organization:
        fluid-components/
        sample-code/
        tests/
        LICENSE.txt
        README.txt

The deployment bundle also includes a WAR file suitable for deployment in Java-based containers: 
	fluid-components-0.6beta1.war

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

* Renderer: The Fluid renderer is provided in this release as a "sneak peek" of the features we have planned.
  It is not intended for production use, and its APIs will change significantly over the course of the next few 
  releases. Try it out and share your early feedback with us, but don't rely on it for daily use yet. 
  At the moment, the Renderer only works in FireFox and Safari.

* Uploader: The Uploader is currently NOT COMPATIBLE with Flash 10 (released on 9/26/2008). This 
  bug is caused by a change in Adobe's security protocols for Flash 10, which block the SWFUpload 
  code from calling the OS File browser. The SWFUpload community is still implementing a fix based 
  on overlaying a transparent Flash object over the HTML Browse button. The Uploader in Fluid 0.6 
  will include this fix, or a fix of our own. 

* Uploader: After pausing, queue sometimes won't resume

* Reorderer: Nested Reorderers sometimes don't work as expected.

* Keyboard accessibility jQuery plug-in: There is a naming clash with jQuery UI's ui.selectable.js

* Keyboard control in the Safari and Opera browsers is not yet fully supported.
