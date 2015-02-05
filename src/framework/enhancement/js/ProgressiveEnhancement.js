/*
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.enhance");

    // Feature Detection Functions
    fluid.enhance.isBrowser = function () {
        return typeof(window) !== "undefined" && window.document;
    };
    fluid.enhance.supportsBinaryXHR = function () {
        return window.FormData || (window.XMLHttpRequest && window.XMLHttpRequest.prototype && window.XMLHttpRequest.prototype.sendAsBinary);
    };
    fluid.enhance.supportsFormData = function () {
        return !!window.FormData;
    };

    /*
     * An object to hold the results of the progressive enhancement checks, in order to avoid re-evaluating them unnecessarily
     * Keys represent the typeName corresponding to the check
     * Values represent the result of the check
     */
    // unsupported, NON-API value
    fluid.enhance.checked = {};

    /*
     * Takes an object of key/value pairs where the key will be the typeName of a component which will be registered
     * at the global root component if the check passes. The value is either a boolean representing a pre-resolved
     * result, a global function name to be called with zero arguments, or a literal function to be called with zero arguments.
     * {typeName: boolean/"funcName"/func}
     * Note that the function will not be run if its result is already recorded.
     */
    fluid.enhance.check = function (checkList) {
        fluid.each(checkList, function (val, key) {

            if (fluid.enhance.checked[key] === undefined) {
                var results = typeof(val) === "boolean" ? val :
                    (typeof(val) === "string" ? fluid.invokeGlobalFunction(val) : val());

                fluid.enhance.checked[key] = !!results;

                if (results) {
                    fluid.littleComponent({
                        gradeNames: ["fluid.resolveRoot", key]
                    });
                }
            }
        });
    };

    /*
     * Forgets a single item or array of items based on the typeName
     * @param typeName {String|Array} Either a full typename or array of names which should be removed from the global context
     * (the components holding them will be destroyed and they will no longer be resolvable)
     */
    fluid.enhance.forget = function (typeName) {
        var typeNames = fluid.makeArray(typeName);
        fluid.each(typeNames, function (oneTypeName) {
            var tags = fluid.queryIoCSelector(fluid.rootComponent, oneTypeName, true);
            fluid.each(tags, function (tag) {
                tag.destroy();
            });
            delete fluid.enhance.checked[oneTypeName];
        });
    };

    /*
     * Forgets all of the keys added by fluid.enhance.check
     */
    fluid.enhance.forgetAll = function () {
        fluid.each(fluid.enhance.checked, function (val, key) {
            fluid.enhance.forget(key);
        });
    };

    fluid.defaults("fluid.progressiveChecker", {
        gradeNames: ["fluid.typeFount", "fluid.littleComponent", "autoInit", "{that}.check"],
        checks: [], // [{"feature": "{IoC Expression}", "contextName": "context.name"}]
        defaultContextName: undefined,
        invokers: {
            check: {
                funcName: "fluid.progressiveChecker.check",
                args: ["{that}.options.checks", "{that}.options.defaultContextName"]
            }
        }
    });

    fluid.progressiveChecker.check = function (checks, defaultContextName) {
        return fluid.find(checks, function(check) {
            if (check.feature) {
                return check.contextName;
            }
        }, defaultContextName);
    };

    fluid.progressiveChecker.forComponent = function (that, componentName) {
        var defaults = fluid.defaults(componentName);
        var expanded = fluid.expandOptions(fluid.copy(defaults.progressiveCheckerOptions), that);
        var checkTag = fluid.progressiveChecker.check(expanded.checks, expanded.defaultContextName);
        var horizon = componentName + ".progressiveCheck";
        return [horizon, checkTag];
    };

    fluid.defaults("fluid.progressiveCheckerForComponent", {
        gradeNames: ["fluid.typeFount", "fluid.littleComponent", "autoInit", "{that}.check"],
        invokers: {
            check: {
                funcName: "fluid.progressiveChecker.forComponent",
                args: ["{that}", "{that}.options.componentName"]
            }
        }
        // componentName
    });



    fluid.enhance.check({
        "fluid.browser" : "fluid.enhance.isBrowser"
    });

    /**********************************************************
     * This code runs immediately upon inclusion of this file *
     **********************************************************/

    // Use JavaScript to hide any markup that is specifically in place for cases when JavaScript is off.
    // Note: the use of fl-ProgEnhance-basic is deprecated, and replaced by fl-progEnhance-basic.
    // It is included here for backward compatibility only.
    // Distinguish the standalone jQuery from the real one so that this can be included in IoC standalone tests
    if (fluid.enhance.isBrowser() && $.fn) {
        $("head").append("<style type='text/css'>.fl-progEnhance-basic, .fl-ProgEnhance-basic { display: none; } .fl-progEnhance-enhanced, .fl-ProgEnhance-enhanced { display: block; }</style>");
    }

})(jQuery, fluid_2_0);
