/*
Copyright 2013-2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * selfVoicing
     *
     * The enactor that enables self voicing of the DOM
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.selfVoicing", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.speak": {
                "model.enabled": "default"
            }
        },
        selectors: {
            controllerScope: ".flc-prefs-selfVoicingWidget"
        },
        events: {
            onInitOrator: null
        },
        modelListeners: {
            "enabled": {
                funcName: "fluid.prefs.enactor.selfVoicing.initOrator",
                args: ["{that}", "{change}.value"],
                namespace: "initOrator"
            }
        },
        components: {
            orator: {
                type: "fluid.orator",
                createOnEvent: "onInitOrator",
                container: "{fluid.prefs.enactor.selfVoicing}.container",
                options: {
                    modelListeners: {
                        "{fluid.prefs.enactor.selfVoicing}.model.enabled": {
                            func: "{tts}.cancel",
                            namespace: "selfVoicing.orator.stopSpeech"
                        }
                    },
                    controller: {
                        scope: "{fluid.prefs.enactor.selfVoicing}.dom.controllerScope",
                        modelListeners: {
                            "{fluid.prefs.enactor.selfVoicing}.model.enabled": {
                                "this": "{that}.container",
                                method: "toggle",
                                args: ["{fluid.prefs.enactor.selfVoicing}.model.enabled"],
                                namespace: "orator.controller.toggleView"
                            }
                        }
                    },
                    selectionReader: {
                        modelListeners: {
                            "{fluid.prefs.enactor.selfVoicing}.model.enabled": {
                                changePath: "text",
                                value: "",
                                source: "selfVoicingEnabled",
                                namespace: "selfVoicing.orator.clearSelectedText"
                            }
                        }
                    }
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.orator",
            target: "{that > orator}.options",
            removeSource: true,
            namespace: "oratorOpts"
        }]
    });

    fluid.prefs.enactor.selfVoicing.initOrator = function (that, enabled) {
        if (enabled && !that.orator) {
            that.events.onInitOrator.fire();
        }
    };

})(jQuery, fluid_3_0_0);
