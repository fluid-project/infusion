/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

/*******************************************************************************
 * selfVoicing
 *
 * The enactor that enables self voicing of the DOM
 *******************************************************************************/

fluid.defaults("fluid.prefs.enactor.selfVoicing", {
    gradeNames: ["fluid.prefs.enactor", "fluid.prefs.enactor.ignorableSelectorHolder", "fluid.viewComponent"],
    preferenceMap: {
        "fluid.prefs.speak": {
            "model.enabled": "value"
        }
    },
    // from ignorableSelectorHolder:
    // ignoreSelectorForEnactor - an enactor receives a selector in this field which marks material in the document to be ignored
    selectors: {
        controller: ".flc-prefs-selfVoicingWidget"
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
                model: {
                    enabled: "{selfVoicing}.model.enabled"
                },
                controller: {
                    parentContainer: "{fluid.prefs.enactor.selfVoicing}.dom.controller"
                }
            }
        }
    },
    distributeOptions: {
        oratorOpts: {
            source: "{that}.options.orator",
            target: "{that > orator}.options"
        },
        ignoreSelectorForEnactor: {
            source: "{that}.options.ignoreSelectorForEnactor.forEnactor",
            target: "{that > orator > domReader > parser}.options.ignoredSelectors.forEnactor"
        }
    }
});

fluid.prefs.enactor.selfVoicing.initOrator = function (that, enabled) {
    if (enabled && !that.orator) {
        that.events.onInitOrator.fire();
    }
};
