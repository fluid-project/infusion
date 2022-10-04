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

var assortedContent = assortedContent || {};

/* Our demo script */
assortedContent.slidingPrefsEditor = function () {
    fluid.uiOptions(".flc-prefsEditor-separatedPanel", {
        auxiliarySchema: {
            terms: {
                "templatePrefix": "../../../../../src/framework/preferences/html",
                "messagePrefix": "../../../../../src/framework/preferences/messages"
            },
            "fluid.prefs.tableOfContents": {
                enactor: {
                    "tocTemplate": "../../../../../src/components/tableOfContents/html/TableOfContents.html",
                    "tocMessage": "../../../../../src/framework/preferences/messages/tableOfContents-enactor.json"
                }
            }
        },
        prefsEditorLoader: {
            lazyLoad: true
        }
    });
};
