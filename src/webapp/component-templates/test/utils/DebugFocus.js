fluid = fluid || {};

fluid.debug = function () {
    var printId = function (element) {
        return (element) ? element.id : element;
    };

    var outputEventDetails = function (eventType, event, caughtBy) {
        if (typeof console !== 'undefined') {
            console.debug (eventType + " was called on target " + printId (event.target) + ", caught by " + printId (caughtBy));
        }
    };

    var focusOutputter = function (evt) {
        outputEventDetails ("Focus", evt, this);
    };

    var blurOutputter = function (evt) {
        outputEventDetails ("Blur", evt, this);
    };

    var addFocusChangeListeners = function (jQueryElements) {
        jQueryElements.focus (focusOutputter);
        jQueryElements.blur (blurOutputter);
    };

    return {
        listenForFocusEvents: function () {
            var focussableElements  = [];

            var everything = jQuery ("*");
            everything.each (function () {
               if (jQuery (this).hasTabIndex ()) {
                   focussableElements.push (this);
               }
            });

            addFocusChangeListeners (jQuery (focussableElements));
        }
    }; // End of public return.
} (); // End of fluid.debug namespace.

// Call listenForFocusEvents when the document is ready.
jQuery (document).ready (fluid.debug.listenForFocusEvents);
