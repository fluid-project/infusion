/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_1_9 = fluid_1_9 || {};

(function ($, fluid) {
    "use strict";

    /**************************************
     * Full No Preview Preferences Editor *
     **************************************/

    fluid.defaults("fluid.prefs.fullNoPreview", {
        gradeNames: ["fluid.prefs.prefsEditorLoader", "autoInit"],
        components: {
            prefsEditor: {
                container: "{that}.container",
                options: {
                    listeners: {
                        onReset: [{
                            listener: "{that}.applyChanges"
                        }, {
                            listener: "{that}.save"
                        }],
                        onReady: {
                            listener: "{fullNoPreview}.events.onReady",
                            args: "{fullNoPreview}"
                        }
                    }
                }
            }
        },
        events: {
            onReady: null
        }
    });

})(jQuery, fluid_1_9);
