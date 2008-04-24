
Fluid Infusion v0.3 BETA
========================
http://fluidproject.org


This Release is a BETA
======================

This is an early, BETA version of Fluid Infusion v0.3. The contents of this distribution are a snapshot of the Fluid code and documentation as of April 25, 2008. A number of tasks will be carried out between this BETA and the actual release:

* Blocker issues will be addressed (see Known Issues below).
  To monitor the status of bug resolutions, see the Fluid Issue Tracker, at
      http://issues.fluidproject.org

* The documentation will be completed.
  There are known gaps in the documentation that is included in this BETA.
  If you're eager to see updated documentation before the release, keep an eye on the wiki, at
      http://wiki.fluidproject.org


What's in this Release
======================

The "fluid-0.3.zip" has the following organization:
        fluid-components/
        sample-code/
        tests/
        documentation/
        LICENSE.txt
        README.txt

Source Code
-----------
The full source code for the Fluid component library, including JavaScript, HTML templates and CSS:
        fluid-components/
           css/
           html/
           images/
           js/
           swfupload/

Sample Code
-----------
Sample code illustrating how Fluid components can be used:
        sample-code/
           keyboard-a11y/
           reorderer/
           uploader/

Tests
-----
        tests/

Documentation
-------------
The Fluid Project uses a wiki for documentation and project collaboration: http://wiki.fluidproject.org.
A collection of pages from the wiki, providing documentation for this release, is included in PDF format:
    documentation/Fluid-0.3.pdf

The PDF documentation contains the user experience toolkit, tutorials on how to use Fluid components, and API documentation.

Note that some links in this PDF file will redirect the user to Fluid's live wiki space.

License
-------
Fluid code is licensed under a dual ECL 2.0 / BSD license. The specific licenses can be found in the license file:
    LICENSE.txt

Readme
------
This file.
    README.txt


Supported Browsers
==================
Firefox 2.x, 3.x: full support
Safari 2.x, 3.x: keyboard support not available
Camino 1.5.x: reordering by keyboard not supported.
Internet Explorer 6.x, 7.x: full support


Known Issues
============
The Fluid Project uses a JIRA website to track bugs: http://issues.fluidproject.org. Some of the known issues in this BETA release are described here:

* Multi-file Uploader: The Multi-file Uploader is still in early ALPHA state. In the v0.3 release of Infusion, it will be in BETA.

* Reorderer: Once focus is within the group of reorderable elements, shift-tab cannot be used to move focus out again. Tabbing forward must be used.

* Layout Customizer: There are a number of refinements needed to the interface of the uPortal reorderable portlets example.

* Reorderer: Drag-and-drop avatar location: In some cases, the drag avatar is disconcertingly far away from the cursor.

* Reorderer: Reordering either via mouse-based drag-and-drop, or using the keyboard, is sometimes slow when there are a relatively large number of orderable items.  In short, the Reorderer does not scale well with respect to the number of orderable items.

* Reorderer: Reordering via mouse-based drag-and-drop, attempting to drop outside the space of existing items sometimes incorrectly displays a drop location indicator, despite the fact that a drop is not permitted in this case.
