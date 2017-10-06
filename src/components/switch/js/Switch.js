/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /**********
     * Switch *
     **********/

    fluid.defaults("fluid.switchUI", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            on: ".flc-switchUI-on",
            off: ".flc-switchUI-off",
            control: ".flc-switchUI-control"
        },
        strings: {
            // Specified by implementor
            // text of label to apply the switch, must add to "aria-label" in the attrs block
            label: "",
            on: "on",
            off: "off"
        },
        attrs: {
            // Specified by implementor
            // ID of an element to use as a label for the switch
            // "aria-labelledby": "",
            // Should specify either "aria-label" or "aria-labelledby"
            // "aria-label": "{that}.options.strings.label",
            // ID of an element that is controlled by the switch.
            // "aria-controls": ""
            role: "switch",
            tabindex: 0
        },
        model: {
            enabled: false
        },
        modelListeners: {
            enabled: {
                "this": "{that}.dom.control",
                method: "attr",
                args: ["aria-checked", "{change}.value"]
            }
        },
        listeners: {
            "onCreate.addAttrs": {
                "this": "{that}.dom.control",
                method: "attr",
                args: ["{that}.options.attrs"]
            },
            "onCreate.addOnText": {
                "this": "{that}.dom.on",
                method: "text",
                args: ["{that}.options.strings.on"]
            },
            "onCreate.addOffText": {
                "this": "{that}.dom.off",
                method: "text",
                args: ["{that}.options.strings.off"]
            },
            "onCreate.activateable": {
                listener: "fluid.activatable",
                args: ["{that}.dom.control", "{that}.activateHandler"]
            },
            "onCreate.bindClick": {
                "this": "{that}.dom.control",
                method: "on",
                args: ["click", "{that}.toggleModel"]
            }
        },
        invokers: {
            toggleModel: {
                funcName: "fluid.switchUI.toggleModel",
                args: ["{that}"]
            },
            activateHandler: {
                funcName: "fluid.switchUI.activateHandler",
                args: ["{arguments}.0", "{that}.toggleModel"]
            }
        }
    });

    fluid.switchUI.toggleModel = function (that) {
        that.applier.change("enabled", !that.model.enabled);
    };

    fluid.switchUI.activateHandler = function (event, fn) {
        event.preventDefault();
        fn();
    };

})(jQuery, fluid_3_0_0);
