/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global demo:true, fluid, jQuery*/

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    fluid.contextAware.makeChecks({
        "fluid.supportsTTS": "fluid.textToSpeech.isSupported"
    });

    fluid.defaults("demo.orator", {
        gradeNames: ["fluid.viewComponent", "fluid.contextAware"],
        contextAwareness: {
            textToSpeech: {
                checks: {
                    supported: {
                        contextValue: "{fluid.supportsTTS}",
                        equals: true,
                        gradeNames: "fluid.orator"
                    }
                },
                defaultGradeNames: "demo.orator.unsupported"
            }
        }
    });

    fluid.defaults("demo.orator.unsupported", {
        strings: {
            unsupported: "Text-to-Speech is not supported in this browser"
        },
        selectors: {
            content: ".flc-orator-content"
        },
        listeners: {
            "onCreate.unsupported": {
                "this": "{that}.dom.content",
                method: "text",
                args: ["{that}.options.strings.unsupported"]
            }
        }
    });

})(jQuery, fluid);
