/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

fluid = fluid || {};

fluid.debug = function () {

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

            var everything = context? jQuery("*", context) : jQuery("*");
            fluid.log("Everything: " + everything.length);
            everything.each(function () {
               //if (jQuery(this).hasTabindex()) {
                   focussableElements.push(this);
              // }
            });

            addFocusChangeListeners(jQuery(focussableElements));
        }
    }; // End of public return.
} (); // End of fluid.debug namespace.

// Call listenForFocusEvents when the document is ready.
//jQuery(document).ready(fluid.debug.listenForFocusEvents);
