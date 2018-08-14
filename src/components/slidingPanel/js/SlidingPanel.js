/*
Copyright 2011-2015 OCAD University
Copyright 2011 Lucendo Development Ltd.
Copyright 2016 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";
    /**********************
     * Sliding Panel *
     *********************/

    fluid.defaults("fluid.slidingPanel", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            panel: ".flc-slidingPanel-panel",
            toggleButton: ".flc-slidingPanel-toggleButton",
            toggleButtonLabel: ".flc-slidingPanel-toggleButton"
        },
        strings: {
            showText: "show",
            hideText: "hide",
            panelLabel: "panel"
        },
        events: {
            onPanelHide: null,
            onPanelShow: null,
            afterPanelHide: null,
            afterPanelShow: null
        },
        listeners: {
            "onCreate.bindClick": {
                "this": "{that}.dom.toggleButton",
                "method": "click",
                "args": ["{that}.togglePanel"]
            },
            "onCreate.bindModelChange": {
                listener: "{that}.applier.modelChanged.addListener",
                args: ["isShowing", "{that}.refreshView"]
            },
            "onCreate.setAriaProps": "{that}.setAriaProps",
            "onCreate.setInitialState": {
                listener: "{that}.refreshView"
            },
            "onPanelHide.setText": "{that}.setShowText",
            "onPanelShow.setText": "{that}.setHideText",
            "onPanelHide.operate": {
                listener: "{that}.operateHide",
                priority: "after:setText"
            },
            "onPanelShow.operate": {
                listener: "{that}.operateShow",
                priority: "after:setText"
            },
            "onCreate.setAriaStates": "{that}.setAriaStates"
        },
        members: {
            panelId: {
                expander: {
                    // create an id for panel
                    // and set that.panelId to the id value
                    funcName: "fluid.allocateSimpleId",
                    args: "{that}.dom.panel"
                }
            }
        },
        model: {
            isShowing: false
        },
        modelListeners: {
            "isShowing": {
                funcName: "{that}.setAriaStates",
                excludeSource: "init"
            }
        },
        invokers: {
            operateHide: {
                "this": "{that}.dom.panel",
                "method": "slideUp",
                "args": ["{that}.options.animationDurations.hide", "{that}.events.afterPanelHide.fire"]
            },
            operateShow: {
                "this": "{that}.dom.panel",
                "method": "slideDown",
                "args": ["{that}.options.animationDurations.show", "{that}.events.afterPanelShow.fire"]
            },
            hidePanel: {
                func: "{that}.applier.change",
                args: ["isShowing", false]
            },
            showPanel: {
                func: "{that}.applier.change",
                args: ["isShowing", true]
            },
            setAriaStates: {
                funcName: "fluid.slidingPanel.setAriaStates",
                args: ["{that}", "{that}.model.isShowing"]
            },
            setAriaProps: {
                funcName: "fluid.slidingPanel.setAriaProperties",
                args: ["{that}", "{that}.panelId"]
            },
            togglePanel: {
                funcName: "fluid.slidingPanel.togglePanel",
                args: ["{that}"]
            },
            refreshView: {
                funcName: "fluid.slidingPanel.refreshView",
                args: ["{that}"]
            },
            setShowText: {
                "funcName": "fluid.slidingPanel.setText",
                "args": ["{that}.dom.toggleButtonLabel", "{that}.options.strings.showText", "{that}.options.strings.showTextAriaLabel"]
            },
            setHideText: {
                "funcName": "fluid.slidingPanel.setText",
                "args": ["{that}.dom.toggleButtonLabel", "{that}.options.strings.hideText", "{that}.options.strings.hideTextAriaLabel"]
            }
        },
        animationDurations: {
            hide: 400,
            show: 400
        }
    });

    fluid.slidingPanel.setText = function (element, text, textAriaLabel) {
        element = $(element);
        element.text(text);
        element.attr("aria-label", textAriaLabel);
    };

    fluid.slidingPanel.togglePanel = function (that) {
        that.applier.change("isShowing", !that.model.isShowing);
    };

    fluid.slidingPanel.refreshView = function (that) {
        that.events[that.model.isShowing ? "onPanelShow" : "onPanelHide"].fire();
    };

    // panelId is passed in to ensure that it is evaluated before this
    // function is called.
    fluid.slidingPanel.setAriaProperties = function (that, panelId) {
        that.locate("toggleButton").attr({
            "role": "button",
            "aria-controls": panelId
        });
        that.locate("panel").attr({
            "aria-label": that.options.strings.panelLabel,
            "role": "group"
        });
    };

    fluid.slidingPanel.setAriaStates = function (that, isShowing) {
        that.locate("toggleButton").attr("aria-pressed", isShowing);
        that.locate("panel").attr("aria-expanded", isShowing);
    };

})(jQuery, fluid_3_0_0);
