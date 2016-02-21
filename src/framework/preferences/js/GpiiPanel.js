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
            autoLabel: {messagekey: "autoLabel"},
            auto: "${auto}"
        },
        events: {
            onImport: null,
            onExport: null,
            onFetchGPIIPrefsSuccess: null,
            onFetchGPIIPrefsError: null,

            onGPIIPrefsReadyForImport: {
                events: {
                    onImport: "onImport",
                    onFetchGPIIPrefsSuccess: "onFetchGPIIPrefsSuccess"
                }
            },
            onFetchGPIIPrefsErrorForImport: {
                events: {
                    onImport: "onImport",
                    onFetchGPIIPrefsError: "onFetchGPIIPrefsError"
                }
            },

            onGPIIPrefsReadyForExport: {
                events: {
                    onExport: "onExport",
                    onFetchGPIIPrefsSuccess: "onFetchGPIIPrefsSuccess"
                }
            },
            onFetchGPIIPrefsErrorForExport: {
                events: {
                    onExport: "onExport",
                    onFetchGPIIPrefsError: "onFetchGPIIPrefsError"
                }
            },

            onContinueExport: null,
            onCancelExport: null,
            onGPIIPrefsApplied: null
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
                args: ["{that}.events.onExport.fire"]
            },
            // *** Import ***
            // 1. Fetch GPII pref set
            "onImport.preventDefault": {
                funcName: "fluid.prefs.panel.gpii.preventDefault",
                args: ["{arguments}.0"],
                priority: "before:fetchGPIIPrefs"
            },
            "onImport.fetchGPIIPrefs": {
                func: "{that}.fetchGPIIPrefs"
            },
            // 2. IMPORT - fetch success handling: import GPII prefs to the site and UIO
            "onGPIIPrefsReadyForImport.importGPIIPrefs": {
                funcName: "fluid.prefs.panel.gpii.importGPIIPrefs",
                args: ["{that}", "{prefsEditorLoader}"]
            },
            "onContinueImport.applyGPIIPrefs": {
                func: "{that}.applyGPIIPrefs",
                args: ["{arguments}.0"]
            },
            // 3. IMPORT - fetch error handling: check the existence of the GPII pref set,
            // if user has no GPII pref set, show message of doing export first
            // Q1: Still need to go thru the OAuth login (or sign up here) to know whether a pref set exists or not?
            // Q2: how to handle other error cases? a place to display an error message?
            // Q3: every time of export and import, users will see privacy settings page to determine the prefs to be shared with UIO?
            "onFetchGPIIPrefsErrorForImport.handleImportError": {
                // TODO: show warning message of exporting UIO changes first in order to create the initial GPII pref set
            },
            // *** End of Import ***

            // *** Export ***
            // 1. fetch GPII pref set
            "onExport.preventDefault": {
                funcName: "fluid.prefs.panel.gpii.preventDefault",
                args: ["{arguments}.0"],
                priority: "before:fetchGPIIPrefs"
            },
            "onExport.fetchGPIIPrefs": {
                func: "{that}.fetchGPIIPrefs"
            },
            // TODO: 2. EXPORT - fetch success handling: user has an UIO pref set saved at GPII, save adjusted prefs to GPII
            // Q1: GPII hasn't implmented the OAuth feature that updates existing pref sets?
            // Q2: Are only prefs selected on the privacy settings imported or exported?
            // "onGPIIPrefsReadyForExport.exportGPIIPrefs": {
            //     funcName: "fluid.prefs.panel.gpii.exportGPIIPrefs",
            //     args: ["{that}", "{prefsEditorLoader}"]
            // },
            // TODO: 3. EXPORT - fetch error handling: user doesn't have an UIO pref set saved at GPII, create an UIO set automatically at GPII
            // Q1: GPII hasn't implmented the OAuth feature that creates pref sets?
            // "onFetchGPIIPrefsErrorForExport.exportGPIIPrefs": {
            //     funcName: "fluid.prefs.panel.gpii.exportGPIIPrefs",
            //     args: ["{that}", "{prefsEditorLoader}"]
            // }
            // *** End of Export ***
        },
        invokers: {
            fetchGPIIPrefs: {
                funcName: "fluid.prefs.panel.gpii.fetchGPIIPrefs",
                args: ["{that}"]
            },
            applyGPIIPrefs: {
                funcName: "fluid.prefs.panel.gpii.applyGPIIPrefs",
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

    fluid.prefs.panel.gpii.preventDefault = function (event) {
        event.preventDefault();
    };

    fluid.prefs.panel.gpii.fetchGPIIPrefs = function (that) {
        var data = {
            "fluid_prefs_contrast": "bw"
        };
        that.gpiiPrefs = data;
        that.events.onFetchGPIIPrefsSuccess.fire(data);
        return;

        // TODO: ajax calls to fetch GPII preferences
        // $.ajax({
        //     url: "/preferences/carla",
        //     method: "GET",
        //     success: function (data, textStatus, jqXHR) {
        //         that.events.onFetchGPIIPrefsSuccess.fire(data, textStatus, jqXHR);
        //     },
        //     error: function (jqXHR, textStatus, errorThrown) {
        //         that.events.onFetchGPIIPrefsError.fire(jqXHR, textStatus, errorThrown);
        //     }
        // });
    };

    fluid.prefs.panel.gpii.importGPIIPrefs = function (that, prefsEditorLoader) {
        // The export work flow:
        // 1. if the GPII prefs is same as the local prefs, do nothing.
        // 2. if the GPII prefs is different from the local prefs,
        // (1) the local chang is different from the default prefs, show warning dialog
        // (2) the local change is same as the default prefs, apply the gpii prefs.

        var localPrefs = prefsEditorLoader.prefsEditor.model.preferences,
            gpiiPrefs = fluid.prefs.panel.gpii.consolidateGPIIPrefs(that.gpiiPrefs, localPrefs),
            diffLocalAndGPIIPrefs = {changes: 0, unchanged: 0, changeMap: {}};

        fluid.model.diff(localPrefs, gpiiPrefs, diffLocalAndGPIIPrefs);

        if (diffLocalAndGPIIPrefs.changes > 0) {
            // compare local prefs with default prefs
            var initialCompletePrefs = prefsEditorLoader.settings.preferences,
                diffLocalAndInitPrefs = {changes: 0, unchanged: 0, changeMap: {}};

            fluid.model.diff(localPrefs, initialCompletePrefs, diffLocalAndInitPrefs);

            if (diffLocalAndInitPrefs.changes === 0) {
                console.log("no local prefs changes");
                that.applyGPIIPrefs(gpiiPrefs);
            } else {
                // TODO: Show the export warning dialog
                // Fire onContinueExport event with the argument "gpiiPrefs" when the continue button is pressed
                // Fire onCancelExport event when the cancel button is pressed
                console.log("has local prefs changes, show warning dialog");
                that.events.onContinueExport.fire(gpiiPrefs);
            }
        }
    };

    // This function does:
    // 1. remove GPII preferences that are not included in the local preferences;
    // 2. for the preferences that are in the local object but not in GPII object, add them
    //    with their local values into the GPII preference object. This is because when
    //    applying GPII preferences, the entire GPII prefs object is applied, this would
    //    cause the loss of the preferences that are already at the local but not included
    //    in the GPII prefs object.
    fluid.prefs.panel.gpii.consolidateGPIIPrefs = function (gpiiPrefs, localPrefs) {
        var localPrefKeys = fluid.keys(localPrefs);

        fluid.remove_if(gpiiPrefs, function (value, pref) {
            return ($.inArray(pref, localPrefKeys) === -1);
        });

        return $.extend(true, {}, localPrefs, gpiiPrefs);
    };

    fluid.prefs.panel.gpii.applyGPIIPrefs = function (that, prefsEditor, gpiiPrefs) {
        prefsEditor.applier.change("preferences", gpiiPrefs);
        prefsEditor.events.onPrefsEditorRefresh.fire();
        that.events.onGPIIPrefsApplied.fire(gpiiPrefs);
    };

})(jQuery, fluid_2_0_0);
