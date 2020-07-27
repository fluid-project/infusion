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

/* global fluid, jqUnit */

(function () {
    "use strict";

    jqUnit.module("PrefsEditor ResourceLoader Tests");

    fluid.registerNamespace("fluid.tests.resourceLoader");

    fluid.defaults("fluid.tests.resourceLoader", {
        gradeNames: ["fluid.resourceLoader"],
        defaultLocale: "en",
        terms: {
            prefix: "../data"
        },
        resources: {
            template1: "%prefix/testTemplate1.html",
            template2: "../data/testTemplate2.html",
            template3: "%prefix/testTemplate3.html",
            template4: "../data/testTemplate4.html"
        },
        listeners: {
            onResourcesLoaded: "fluid.tests.resourceLoader.testTemplateLoader"
        }
    });

    fluid.tests.resourceLoader.testTemplateLoader = function (resources) {
        // The template with a templating path of prefixTerm + name
        jqUnit.assertEquals("The template1 url has been set correctly", "../data/testTemplate1.html", resources.template1.url);
        jqUnit.assertTrue("\"forceCache\" option for the template1 has been set", resources.template1.forceCache);
        jqUnit.assertEquals("The content of the template1 has been loaded correctly", "<div>Test Template 1</div>", $.trim(resources.template1.resourceText));

        // The template with a full path
        jqUnit.assertEquals("The template2 url has been set correctly", "../data/testTemplate2.html", resources.template2.url);
        jqUnit.assertTrue("\"forceCache\" option for the template2 has been set", resources.template2.forceCache);
        jqUnit.assertEquals("The content of the template2 has been loaded correctly", "<div>Test Template 2</div>", $.trim(resources.template2.resourceText));

        // The localised template with a templating path of prefixTerm + name
        jqUnit.assertEquals("The content of the template3 has been loaded correctly", "<div>Test Template 3 Localised</div>", $.trim(resources.template3.resourceText));

        // The localised template with a full path
        jqUnit.assertEquals("The content of the template4 has been loaded correctly", "<div>Test Template 4 Localised</div>", $.trim(resources.template4.resourceText));

        jqUnit.start();
    };

    jqUnit.asyncTest("Test Resource Loader", function () {
        jqUnit.expect(8);
        fluid.tests.resourceLoader();
    });

    // How to use the resource loader
    fluid.defaults("fluid.tests.UI", {
        gradeNames: ["fluid.viewComponent"],
        components: {
            templateLoader: {
                type: "fluid.resourceLoader",
                options: {
                    terms: {
                        prefix: "../data"
                    },
                    resources: {
                        template1: "%prefix/testTemplate1.html"
                    },
                    listeners: {
                        "onResourcesLoaded.escalate": "{fluid.tests.UI}.events.onTemplatesReady"
                    }
                }
            },
            renderUI: {
                type: "fluid.viewComponent",
                container: "{fluid.tests.UI}.container",
                createOnEvent: "onTemplatesReady",
                options: {
                    listeners: {
                        "onCreate.appendTemplate": {
                            "this": "{that}.container",
                            "method": "append",
                            args: ["{templateLoader}.resources.template1.resourceText"]
                        },
                        "onCreate.escalate": {
                            listener: "{fluid.tests.UI}.events.onUIReady",
                            priority: "after:append"
                        }
                    }
                }
            }
        },
        events: {
            onTemplatesReady: null,
            onUIReady: null
        },
        listeners: {
            "onUIReady.runTest": {
                listener: "fluid.tests.testUI",
                args: ["{that}"]
            }
        }
    });

    fluid.tests.testUI = function (that) {
        var containerContent = that.renderUI.container.html();
        jqUnit.assertEquals("The content of the template1 has been added to the container 1", "<div>Test Template 1</div>", $.trim(containerContent));

        jqUnit.start();
    };

    jqUnit.asyncTest("Use Resource Loader with other components", function () {
        jqUnit.expect(1);
        fluid.tests.UI(".flc-container");
    });

    /** FLUID-6202: testing real cause of fault, synchrony in FluidRequests.js **/

    fluid.defaults("fluid.tests.FLUID6202parent2", {
        gradeNames: "fluid.component",
        events: {
            compositeEvent: {
                events: {
                    templateLoader: "{that}.templateLoader.events.onResourcesLoaded",
                    messageLoader: "{that}.messageLoader.events.onResourcesLoaded"
                }
            }
        },
        components: {
            templateLoader: {
                type: "fluid.tests.FLUID6202resources"
            },
            messageLoader: {
                type: "fluid.tests.FLUID6202resources"
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID6202resources", {
        gradeNames: "fluid.resourceLoader",
        resources: {
            template1: "../data/testTemplate1.html"
        }
    });

    jqUnit.asyncTest("FLUID-6202: Forced instantiation of resource loaders with cached content", function () {
        jqUnit.expect(1);
        var restart = function () {
            jqUnit.assert("Composite event has fired");
            jqUnit.start();
        };
        fluid.tests.FLUID6202parent2({
            listeners: {
                compositeEvent: restart
            }
        });
    });

})();
