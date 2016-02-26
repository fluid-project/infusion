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
                    events: {
                        onPrefsEditorMsgReady: {
                            events: {
                                "onPrefsEditorMsgLookupReady": "{prefsEditorLoader}.events.onPrefsEditorMsgLookupReady",
                                "onReady": "onReady"
                            }
                        }
                    },
                    listeners: {
                        "afterReset.applyChanges": {
                            listener: "{that}.applyChanges"
                        },
                        "afterReset.save": {
                            listener: "{that}.save"
                        },
                        "onReady.escalate": {
                            listener: "{fullNoPreview}.events.onReady",
                            args: "{fullNoPreview}"
                        },
                        "onPrefsEditorMsgReady.setResetLabel": {
                            "this": "{that}.dom.reset",
                            method: "attr",
                            args: ["value", "{prefsEditorMsgLookup}.msgLookup.reset"]
                        },
                        "onPrefsEditorMsgReady.setCancelLabel": {
                            "this": "{that}.dom.cancel",
                            method: "attr",
                            args: ["value", "{prefsEditorMsgLookup}.msgLookup.cancel"]
                        },
                        "onPrefsEditorMsgReady.setSaveLabel": {
                            "this": "{that}.dom.save",
                            method: "attr",
                            args: ["value", "{prefsEditorMsgLookup}.msgLookup.save"]
                        },
                    }
                }
            }
        },
        events: {
            onReady: null
        }
    });

})(jQuery, fluid_2_0_0);
