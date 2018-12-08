/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global fluid, jQuery*/

(function ($, fluid) {
    "use strict";

    var resources = {
        bundle: {
            url: "json/config.json"
        }
    };

    $(document).ready(function () {
        fluid.fetchResources(resources, function (resourceSpecs) {
            var bundle = JSON.parse(resourceSpecs.bundle.resourceText);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: {
                    template: {
                        url: bundle.templateUrl || "../../src/components/overviewPanel/html/overviewPanelTemplate.html"
                    }
                },
                strings: bundle.strings,
                markup: bundle.markup,
                links: bundle.links
            });
        });
    });
})(jQuery, fluid);
