/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    /***************************************************************************************
     * modelRelay
     *
     * The "model relay" system - a framework sketch for a junction between an applier
     * bound to one model and another. It accepts (currently) two types of handlers:
     * i) a simple string representing a direct relay between changes to one path and another
     * ii) a general (irreversible) transform of the value change. This takes the form of an
     *     object specifying the internal key and a transformation function that returns the
     *     transformed value: {path: <string>, func: <function>}
     ***************************************************************************************/

    fluid.defaults("fluid.uiOptions.modelRelay", {
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "autoInit"],
        mergePolicy: {
            sourceApplier: "nomerge",
            rules: "noexpand"
        },
        sourceApplier: null,  // must be supplied by implementors
        rules: {},  // must be supplied by implementors, in format: "externalModelKey": "internalModelKey"
        postInitFunction: "fluid.uiOptions.modelRelay.postInit"
    });
    
    fluid.uiOptions.modelRelay.postInit = function (that) {
        fluid.transform(that.options.rules, function (internalKey, sourceKey) {
            if (typeof (internalKey) !== "string") {
                if (!internalKey.expander) {
                    fluid.fail("No expander specified for rule " + sourceKey);
                }
            }

            that.applier.modelChanged.addListener(internalKey, function (newModel, oldModel) {
                if (!that.applier.hasChangeSource(sourceKey)) {
                    fluid.fireSourcedChange(that.options.sourceApplier, sourceKey, fluid.get(newModel, internalKey), internalKey);
                }
            });

            that.options.sourceApplier.modelChanged.addListener(sourceKey, function (newModel, oldModel) {
                if (!that.options.sourceApplier.hasChangeSource(internalKey)) {
                    if (typeof (internalKey) !== "string") {
                        var rules = {};
                        rules[internalKey.path] = internalKey;
                        var transformed = fluid.model.transform(newModel, rules);
                        fluid.fireSourcedChange(that.applier, internalKey.path, fluid.get(transformed, internalKey.path), sourceKey);
                    } else {
                        fluid.fireSourcedChange(that.applier, internalKey, fluid.get(newModel, sourceKey), sourceKey);
                    }
                }
            });
        });
    };

})(jQuery, fluid_1_5);
