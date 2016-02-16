/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0_0 = fluid_2_0_0 || {};

(function ($, fluid) {
    "use strict";

    /****************************************************
     * Preferences Editor GPII auto syncing Integration *
     ****************************************************/

    fluid.defaults("fluid.prefs.panel.gpii", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.gpii": {
                "model.auto": "auto"
            }
        },
        tooltipOptions: {
            delay: 0,
            duration: 0,
            position: {
                at: "left bottom+3"
            },
            styles: {
                tooltip: "fl-prefsEditor-tooltip"
            }
        },
        selectors: {
            gpiiLabel: ".flc-prefsEditor-gpii-label",
            importButton: ".flc-prefsEditor-gpii-import",
            exportButton: ".flc-prefsEditor-gpii-export",
            auto: ".flc-prefsEditor-gpii-auto",
            autoLabel: ".flc-prefsEditor-gpii-auto-label"
        },
        strings: {
            importLabel: "{that}.msgLookup.importLabel",
            exportLabel: "{that}.msgLookup.exportLabel",
            importTooltipContent: "{that}.msgLookup.importTooltipContent",
            exportTooltipContent: "{that}.msgLookup.exportTooltipContent"
        },
        protoTree: {
            gpiiLabel: {messagekey: "gpiiLabel"},
            importButton: {messagekey: "importLabel"},
            exportButton: {messagekey: "exportLabel"},
            gpiiLabel: {messagekey: "gpiiLabel"},
            autoLabel: {messagekey: "autoLabel"},
            auto: "${auto}"
        },
        events: {
            onImport: null,
            beforeExport: null,
            afterExport: null
        },
        listeners: {
            "afterRender.bindImport": {
                "this": "{that}.dom.importButton",
                method: "click",
                args: ["{that}.events.onImport.fire"]
            },
            "afterRender.bindExport": {
                "this": "{that}.dom.exportButton",
                method: "click",
                args: ["{that}.export"]
            }
        },
        invokers: {
            export: {
                funcName: "fluid.prefs.panel.gpii.export",
                args: ["{that}", "{prefsEditor}", "{arguments}.0"]
            }
        },
        components: {
            tooltipForImport: {
                type: "fluid.tooltip",
                container: "{fluid.prefs.panel.gpii}.dom.importButton",
                createOnEvent: "afterRender",
                options: {
                    content: "{fluid.prefs.panel.gpii}.options.strings.importTooltipContent"
                }
            },
            tooltipForExport: {
                type: "fluid.tooltip",
                container: "{fluid.prefs.panel.gpii}.dom.exportButton",
                createOnEvent: "afterRender",
                options: {
                    content: "{fluid.prefs.panel.gpii}.options.strings.exportTooltipContent"
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.tooltipOptions",
            target: "{that fluid.tooltip}.options"
        }]
    });

    fluid.prefs.panel.gpii.export = function (that, prefsEditor, event) {
        // TODO:
        // 1. get UIO preferences from GPII to compare
        // 2. if the saved prefs is same as the local prefs or no saved preferences, do nothing.
        // 3. if the saved prefs is different from the local prefs,
        // (1) the local chang is different from the default prefs, show warning dialog
        // (2) the local change is same as the default prefs, apply the gpii prefs.

        that.events.beforeExport.fire(gpiiPrefs);
        event.preventDefault();
        var localPrefs = prefsEditor.model.preferences,
            stats = {changes: 0, unchanged: 0, changeMap: {}},
            gpiiPrefs = prefsEditor.model.preferences;  // retrieved GPII prefs
        console.log("localPrefs", localPrefs, "gpiiPrefs", gpiiPrefs)

        if (stats.changes > 0) {
            // compare local prefs with default prefss
        }
        that.events.afterExport.fire(gpiiPrefs);
    };

})(jQuery, fluid_2_0_0);
