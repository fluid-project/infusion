
Fluid Infusion 0.4beta1
========================
Main Project Site:  http://fluidproject.org
User Manual:        http://wiki.fluidproject.org/display/fluid/User+Manual+Table+of+Contents

This Release is a BETA
======================

This is an early, BETA version of Fluid Infusion 0.4. The contents of this distribution are
a snapshot of the Fluid code as of June 26, 2008. A number of tasks will be carried out between
this BETA and the actual release:

* Blocker issues will be addressed (see Known Issues below).
  To monitor the status of bug resolutions, see the Fluid Issue Tracker, at
      http://issues.fluidproject.org

* The documentation will be completed.
  There are known gaps in the documentation that is included in this BETA.
  If you're eager to see updated documentation before the release, keep an eye on the wiki, at
      http://wiki.fluidproject.org


What's in this Release
======================

This release is available in two forms:
    fluid-0.4beta1.zip - deployment bundle
    fluid-0.4beta1-src.zip - source code bundle
    
Both bundles have the following organization:
        fluid-components/
        sample-code/
        tests/
        LICENSE.txt
        README.txt

The deployment bundle also includes a war file suitable for deployment: fluid-components-0.4beta1.war

Source Code
-----------
The full source code for the Fluid component library, including JavaScript, HTML templates and CSS:
        fluid-components/
           css/
           html/
           images/
           js/
           swfupload/

Both bundles include a single JavaScript file, fluid-components/js/Fluid-all.js, that is a
combination of all other source files. Developers can include this single file in their pages to
provide all the necessary support for the Fluid component Library.

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

    * Manual pages are all flagged with the tag manual for easy identification.
    * An organized table of contents is provided for the reader, with links to
      all manual pages, each with a brief description of the page contents.
    * A link to the table of contents appears at the top of the left-side wiki navigation
      bar with the name User Manual ToC. This makes it easy to return to the table of
      contents from anywhere in the wiki hierarchical structure.


Supported Browsers
==================
Firefox 2.x, 3.x: full support
Internet Explorer 6.x, 7.x: full support


Known Issues
============

The new Inline Edit and Pager components are very preliminary: Much of the functionality is
not yet implemented.

The Fluid Project uses a JIRA website to track bugs: http://issues.fluidproject.org.
Some of the known issues in this release are described here:

* Uploader: Using the sample Uploader from a local file system requires that you change some
  Flash settings. See the file: sample-code/uploader/ReadMe.txt

* Uploader: There are number of client-side and server-side errors which are not communicated to
  the user in a graceful way.

* Uploader: The current Java-based Uploader reference application sometimes throws an error if the
  Uploader is resumed after pausing an upload.

* Uploader: Uploader code will not warn you if you have the wrong version of Flash installed, or no
  version of Flash.

* Uploader: Keyboard handlers and ARIA support are preliminary.

* Reorderer: Once focus is within the group of reorderable elements, shift-tab cannot
  be used to move focus out again. Tabbing forward must be used.

* Reorderer: Drag-and-drop avatar location: In some cases, the drag avatar is disconcertingly
  far away from the cursor.

