/*
Copyright 2008-2009 University of Toronto
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.defaults("fluid.tests.pageEnhancerTest", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        events: {
            createPageEnhancer: null
        },
        components: {
            settingsStore: {
                type: "fluid.tempStore"
            },
            pageEnhancer: {
                type: "fluid.pageEnhancer",
                options: {
                    creatOnEvent: "createPageEnhancer",
                    uiEnhancer: {
                        options: {
                            gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                            tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
                        }
                    }
                }
            },
            pageEnhancerTester: {
                type: "fluid.tests.pageEnhancerTester"
            }
        }
    });

    fluid.defaults("fluid.tests.pageEnhancerTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Page Enhancer Tests",
            tests: [{
                expect: 6,
                name: "UIEnhancer options passing",
                sequence: [{
                    func: "fluid.tests.testInitialState"
                }, {
                    func: "{pageEnhancerTest}.events.createPageEnhancer.fire"
                }, {
                    func: "fluid.tests.testAfterPageEnhancer"
                }]
            }]
        }]
    });

    fluid.tests.testInitialState = function () {
        jqUnit.assertEquals("Initially white on black class exists", 1, $(".fl-theme-wb").length);
        jqUnit.assertEquals("Initially font-sans class exists", 1, $(".fl-font-sans").length);
        jqUnit.assertEquals("Initially font-arial class exists", 1, $(".fl-font-arial").length);
    };

    fluid.tests.testAfterPageEnhancer = function () {
        jqUnit.assertEquals("The theme class has not been removed", 1, $(".fl-theme-wb").length);
        jqUnit.assertEquals("Things are still styled with 'first-class' ", 3, $(".first-class").length);
        jqUnit.assertEquals("Things are still styled with 'last-class' ", 2, $(".last-class").length);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.pageEnhancerTest"
        ]);
    });
})(jQuery);
