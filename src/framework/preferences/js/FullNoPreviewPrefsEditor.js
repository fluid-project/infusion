/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0_0 = fluid_2_0_0 || {};

(function ($, fluid) {
    "use strict";

    /**************************************
     * Full No Preview Preferences Editor *
     **************************************/

    fluid.defaults("fluid.prefs.fullNoPreview", {
        gradeNames: ["fluid.prefs.prefsEditorLoader"],
        components: {
            prefsEditor: {
                container: "{that}.container",
                options: {
                    listeners: {
                        "afterReset.applyChanges": {
                            listener: "{that}.applyChanges"
                        },
                        "afterReset.save": {
                            listener: "{that}.save"
                        },
                        "{prefsEditorLoader}.events.onPrefsEditorMsgReady": [{
                            "this": "{that}.dom.reset",
                            method: "attr",
                            args: ["value", "{prefsEditorMsgLookup}.msgLookup.reset"]
                        }, {
                            "this": "{that}.dom.cancel",
                            method: "attr",
                            args: ["value", "{prefsEditorMsgLookup}.msgLookup.cancel"]
                        }, {
                            "this": "{that}.dom.save",
                            method: "attr",
                            args: ["value", "{prefsEditorMsgLookup}.msgLookup.save"]
                        }]
                    }
                }
            }
        },
        events: {
            onReady: null
        },
        listeners: {
            "onPrefsEditorReady.escalate": {
                listener: "{that}.events.onReady.fire",
                args: ["{that}"]
            }
        }
    });

})(jQuery, fluid_2_0_0);
