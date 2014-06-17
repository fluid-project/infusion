/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    /***************************************************************************************
     * modelRelay
     *
     * The "model relay" system - a framework sketch for a junction between an applier
     * bound to one model and another. It accepts (currently) one type of handler:
     * a simple string representing a direct relay between changes to one path and another
     ***************************************************************************************/

    fluid.defaults("fluid.prefs.modelRelay", {
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
                funcName: "fluid.prefs.modelRelay.addListeners",
                args: ["{that}.options.rules", "{that}.applier", "{that}.options.sourceApplier", "{that}.options.listenerNamespaces"]
            },
            removeListeners: {
                funcName: "fluid.prefs.modelRelay.removeListeners",
                args: ["{that}.options.sourceApplier.modelChanged", "{that}.options.listenerNamespaces"]
            }
        },
        // sourceApplier: {external}.applier must be supplied by implementors
        rules: {}  // must be supplied by implementors, in format: "externalModelKey": "internalModelKey"
    });

    fluid.prefs.modelRelay.removeListeners = function (modelChanged, namespaces) {
        fluid.each(namespaces, function (namespace) {
            modelChanged.removeListener(namespace);
        });
    };

    fluid.prefs.modelRelay.addListeners = function (rules, applier, sourceApplier, listenerNamespaces) {
        fluid.each(rules, function (internalKey, sourceKey) {
            var uniqueNamespace = fluid.allocateGuid();

            listenerNamespaces.push(uniqueNamespace);

            fluid.addSourceGuardedListener(applier, internalKey, sourceKey, function (newModel) {
                fluid.fireSourcedChange(sourceApplier, sourceKey, fluid.get(newModel, internalKey), internalKey);
            });
            fluid.addSourceGuardedListener(sourceApplier, sourceKey, internalKey, function (newModel) {
                fluid.fireSourcedChange(applier, internalKey, fluid.get(newModel, sourceKey), sourceKey);
            }, null, uniqueNamespace);
        });
    };

})(jQuery, fluid_2_0);
