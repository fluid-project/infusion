/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

fluid.registerNamespace("fluid.demo");

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.demo.tableOfContentsOptions", {
        gradeNames: ["fluid.component"],
        distributeOptions: {
            record: {
                resources: {
                    template: {
                        forceCache: true,
                        url: "../../src/components/tableOfContents/html/TableOfContents.html"
                    }
                }
            },
            target: "{/ fluid.tableOfContents.levels}.options"
        }
    });

    fluid.demo.tableOfContentsOptions();

    fluid.demo.initTableOfContents = function () {
        fluid.tableOfContents("body", {
            ignoreForToC: {
                trees: ".demo-toc-trees"
            }
        });
    };
})(jQuery, fluid);
