/*
Copyright 2005-2013 jQuery Foundation, Inc. and other contributors
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/*
 * This file contains functions which depend on the presence of a DOM document
 * but which do not depend on the contents of Fluid.js
 */

"use strict";

var fluid = fluid || {}; // eslint-disable-line no-redeclare

// polyfill for $.browser which was removed in jQuery 1.9 and later
// Taken from jquery-migrate-1.2.1.js,
// jQuery Migrate - v1.2.1 - 2013-05-08
// https://github.com/jquery/jquery-migrate
// Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors; Licensed MIT

fluid.uaMatch = function (ua) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) || [];

    return {
        browser: match[ 1 ] || "",
        version: match[ 2 ] || "0"
    };
};

fluid.assignJQueryBrowser = function ($) {
    // Don't clobber any existing jQuery.browser in case it's different
    if (!$.browser) {
        var matched = fluid.uaMatch(navigator.userAgent);
        var browser = {};

        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }
        // Chrome is Webkit, but Webkit is also Safari.
        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        }
        $.browser = browser;
    }
};

fluid.assignJQueryBrowser(jQuery);

// TODO: "Scoped data system" will be replaced by persistent lookup of DOM element ids to components

/*
 * Gets stored state from the jQuery instance's data map.
 * This function is unsupported: It is not really intended for use by implementors.
 */
fluid.getScopedData = function (target, key) {
    var data = $(target).data("fluid-scoped-data");
    return data ? data[key] : undefined;
};

/*
 * Stores state in the jQuery instance's data map. Unlike jQuery's version,
 * accepts multiple-element jQueries.
 * This function is unsupported: It is not really intended for use by implementors.
 */
fluid.setScopedData = function (target, key, value) {
    $(target).each(function () {
        var data = $.data(this, "fluid-scoped-data") || {};
        data[key] = value;

        $.data(this, "fluid-scoped-data", data);
    });
};

/** Global focus manager - makes use of "focusin" event supported in jquery 1.4.2 or later.
 */

fluid.lastFocusedElement = null;

$(document).on("focusin", function (event) {
    fluid.lastFocusedElement = event.target;
});

/** Queries or sets the enabled status of a control. An activatable node
 * may be "disabled" in which case its keyboard bindings will be inoperable
 * (but still stored) until it is reenabled again.
 * This function is unsupported: It is not really intended for use by implementors.
 */

fluid.enabled = function (target, state) {
    target = $(target);
    if (state === undefined) {
        return fluid.getScopedData(target, "enablement") !== false;
    }
    else {
        $("*", target).add(target).each(function () {
            if (fluid.getScopedData(this, "enablement") !== undefined) {
                fluid.setScopedData(this, "enablement", state);
            }
            else if (/select|textarea|input/i.test(this.nodeName)) {
                $(this).prop("disabled", !state);
            }
        });
        fluid.setScopedData(target, "enablement", state);
    }
};

fluid.initEnablement = function (target) {
    fluid.setScopedData(target, "enablement", true);
};

// This utility is required through the use of newer versions of jQuery which will obscure the original
// event responsible for interaction with a target. This is currently use in Tooltip.js and FluidView.js
// "dead man's blur" but would be of general utility

fluid.resolveEventTarget = function (event) {
    while (event.originalEvent && event.originalEvent.target) {
        event = event.originalEvent;
    }
    return event.target;
};


// These functions, `fluid.focus`() and `fluid.blur`, provide a means for programatically triggering focus/blur
// while returning a promise to notify when their actions have completed. The promise will resolve with the
// corresponding event object. Any code which triggers focus or blur synthetically throughout the framework and
// client code must use this function, especially if correct cross-platform interaction is required with the
// "deadMansBlur" function.

async function applyOp(node, func) {
    node = $(node)[0];

    // Only attempt to call the `func` if the node exists.
    if (node) {
        // Wrapping the event listener in a promise so that the promise is resolved when the event fires. The listener
        // is setup such that it will only be activated once.
        // Note: if the event doesn't fire, the promise will never resolve. For example if focus is called on an
        // unfocusable element.
        var promise = new Promise(function (resolve) {
            node.addEventListener(func, resolve, { once: true });
        });
        node[func]();

        return promise;
    }
}

$.each(["focus", "blur"], function (i, name) {
    fluid[name] = function (elem) {
        return applyOp(elem, name);
    };
});
