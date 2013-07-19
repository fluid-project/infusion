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
     * bound to one model and another. It accepts (currently) one type of handler:
     * a simple string representing a direct relay between changes to one path and another
     ***************************************************************************************/

    fluid.defaults("fluid.uiOptions.modelRelay", {
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "autoInit"],
        listenerNamespaces: [], // keep track of all the added listeners for removal at the destroy of this component
        mergePolicy: {
            sourceApplier: "nomerge"
        },
        listeners: {
            onCreate: "{that}.addListeners",
            onDestroy: "{that}.removeListeners"
        },
        invokers: {
            addListeners: {
                funcName: "fluid.uiOptions.modelRelay.addListeners",
                args: ["{that}.options.rules", "{that}.applier", "{that}.options.sourceApplier", "{that}.options.listenerNamespaces"]
            },
            removeListeners: {
                funcName: "fluid.uiOptions.modelRelay.removeListeners",
                args: ["{that}.options.sourceApplier.modelChanged", "{that}.options.listenerNamespaces"]
            }
        },
        sourceApplier: null,  // must be supplied by implementors
        rules: {}  // must be supplied by implementors, in format: "externalModelKey": "internalModelKey"
    });

    fluid.uiOptions.modelRelay.removeListeners = function (modelChanged, namespaces) {
        fluid.each(namespaces, function (namespace) {
            modelChanged.removeListener(namespace);
        });
    };

    fluid.uiOptions.modelRelay.addListeners = function (rules, applier, sourceApplier, listenerNamespaces) {
        fluid.each(rules, function (internalKey, sourceKey) {
            var uniqueNamespace = fluid.allocateGuid();

            listenerNamespaces.push(uniqueNamespace);

            fluid.addSourceGuardedListener(applier, internalKey, sourceKey, function (newModel) {
                fluid.fireSourcedChange(sourceApplier, sourceKey, fluid.get(newModel, internalKey), internalKey)
            });
            fluid.addSourceGuardedListener(sourceApplier, sourceKey, internalKey, function (newModel) {
                fluid.fireSourcedChange(applier, internalKey, fluid.get(newModel, sourceKey), sourceKey);
            }, undefined, uniqueNamespace);
        });
    };

})(jQuery, fluid_1_5);
