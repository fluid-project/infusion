/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid = fluid || {};

fluid.debug = (function () {

    var outputEventDetails = function (eventType, event, caughtBy) {
        fluid.log(new Date() + " " + eventType + " was called on target " + fluid.dumpEl(event.target) + ", caught by " + fluid.dumpEl(caughtBy));
    };

    var focusOutputter = function (evt) {
        outputEventDetails("Focus", evt, this);
    };

    var blurOutputter = function (evt) {
        outputEventDetails("Blur", evt, this);
    };

    var addFocusChangeListeners = function (jQueryElements) {
        jQueryElements.focus(focusOutputter);
        jQueryElements.blur(blurOutputter);
    };

    return {
        listenForFocusEvents: function (context) {
            fluid.setLogging(true);
            var focussableElements  = [];

            var everything = context ? jQuery("*", context) : jQuery("*");
            fluid.log("Everything: " + everything.length);
            everything.each(function () {
               //if (jQuery(this).hasTabindex()) {
                focussableElements.push(this);
              // }
            });

            addFocusChangeListeners(jQuery(focussableElements));
        }
    }; // End of public return.
}) (); // End of fluid.debug namespace.

// Call listenForFocusEvents when the document is ready.
jQuery(document).ready(function () {
    fluid.debug.listenForFocusEvents();
});
