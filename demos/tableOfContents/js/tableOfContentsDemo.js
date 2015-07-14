/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    demo.initTableOfContent = function () {
        fluid.staticEnvironment.demo = fluid.typeTag("fluid.tableOfContentsDemo");
        fluid.demands("fluid.tableOfContents.levels", ["fluid.tableOfContents", "fluid.tableOfContentsDemo"], {
            options: {
                resources: {
                    template: {
                        forceCache: true,
                        url: "../../src/components/tableOfContents/html/TableOfContents.html"
                    }
                }
            }
        });

        fluid.tableOfContents("body", {
            ignoreForToC: {
                trees: ".demo-toc-trees"
            }
        });
    };
})(jQuery, fluid);
