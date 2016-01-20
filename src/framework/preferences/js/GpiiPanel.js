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
        selectorsToIgnore: ["exportButton", "importButton"],
        protoTree: {
            gpiiLabel: {messagekey: "gpiiLabel"},
            autoLabel: {messagekey: "autoLabel"},
            auto: "${auto}"
        },
        events: {
            onImport: null,
            onExport: null
        },
        listeners: {
            "afterRender.setImportButtonLabel": {
                "this": "{that}.dom.importButton",
                method: "html",
                args: ["{that}.options.strings.importLabel"]
            },
            "afterRender.setExportButtonLabel": {
                "this": "{that}.dom.exportButton",
                method: "html",
                args: ["{that}.options.strings.exportLabel"]
            },
            "afterRender.bindImport": {
                "this": "{that}.dom.import",
                method: "click",
                args: ["{that}.events.onImport.fire"]
            },
            "afterRender.bindExport": {
                "this": "{that}.dom.export",
                method: "click",
                args: ["{that}.events.onExport.fire"]
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

})(jQuery, fluid_2_0_0);
