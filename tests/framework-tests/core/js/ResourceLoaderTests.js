/*
Copyright 2016, 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function () {
    "use strict";

    jqUnit.module("fetchResources Tests");

    fluid.registerNamespace("fluid.tests.fetchResources");

    jqUnit.asyncTest("Basic fetch tests", function () {

        var resourceSpecs = {
            objects: {
                url: "../data/objects.json",
                options: {
                    dataType: "text"
                }
            },
            intake: {
                url: "../data/intake.json",
                options: {
                    dataType: "text"
                }
            }
        };

        fluid.fetchResources(resourceSpecs, function () {
            jqUnit.assertUndefined("No fetch error", resourceSpecs.objects.fetchError);
            jqUnit.assertValue("Request completed", resourceSpecs.objects.resourceText);
            jqUnit.start();
        });
    });

    fluid.tests.fetchResources.resourceSpecsWithOverride = {
        messages1: { // test exact long locale
            url: "../data/messages1.json",
            locale: "en_ZA"
        },
        messages2: { // test fallback to lang locale
            url: "../data/messages2.json",
            locale: "fr_CH"
        },
        messages3: { // test language default
            url: "../data/messages3.json"
        },
        messages4: { // test cross-language default fallback
            url: "../data/messages1.json",
            locale: "gr"
        },
        messages5: { // test locale and default locale identical - FLUID-5662
            url: "../data/messages4.json",
            locale: "en",
            defaultLocale: "en"
        }
    };

    fluid.tests.fetchResources.expected = {
        messages1: "marking",
        messages2: "moi",
        messages3: "lower",
        messages4: "grading",
        messages5: "Sherlock"
    };

    fluid.tests.fetchResources.resourceSpecsWithoutOverride = {
        messages1: { // test exact long locale
            url: "../data/messages1.json",
            locale: "en_ZA",
            defaultLocale: "en"
        },
        messages2: { // test fallback to lang locale
            url: "../data/messages2.json",
            locale: "fr_CH",
            defaultLocale: "en"
        },
        messages3: { // test language default
            url: "../data/messages3.json",
            defaultLocale: "en"
        },
        messages4: { // test cross-language default fallback
            url: "../data/messages1.json",
            locale: "gr",
            defaultLocale: "en"
        },
        messages5: { // test locale and default locale identical - FLUID-5662
            url: "../data/messages4.json",
            locale: "en",
            defaultLocale: "en"
        }
    };

    fluid.tests.fetchResources.testLocalizedResourceSpecs = function (message, resourceSpecCollection, fetchResourcesOptions) {
        jqUnit.asyncTest(message, function () {
            var callback = function (resourceSpecs) {
                fluid.each(resourceSpecs, function (resourceSpec, key) {
                    jqUnit.assertValue("Should have resolved resource", resourceSpec.resourceText);
                    jqUnit.assertTrue("Should have found expected text",
                        resourceSpec.resourceText.indexOf(fluid.tests.fetchResources.expected[key]) !== -1);
                });
                jqUnit.start();
            };
            jqUnit.expect(2 * Object.keys(fluid.tests.fetchResources.expected).length);

            fluid.fetchResources(resourceSpecCollection, callback, fetchResourcesOptions);
        });
    };

    fluid.tests.fetchResources.testLocalizedResourceSpecs("Localisation tests - defaultLocale override option",
        fluid.tests.fetchResources.resourceSpecsWithOverride, {defaultLocale: "en"});
    fluid.tests.fetchResources.testLocalizedResourceSpecs("Localisation tests - no defaultLocale override option",
        fluid.tests.fetchResources.resourceSpecsWithoutOverride);


    jqUnit.module("ResourceLoader Tests");

    fluid.registerNamespace("fluid.tests.resourceLoader");

    fluid.defaults("fluid.tests.resourceLoader", {
        gradeNames: ["fluid.resourceLoader"],
        resourceOptions: {
            defaultLocale: "en",
            terms: {
                prefix: "../data"
            }
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
        jqUnit.assertEquals("The content of the template1 has been loaded correctly", "<div>Test Template 1</div>", $.trim(resources.template1.resourceText));

        // The template with a full path
        jqUnit.assertEquals("The template2 url has been set correctly", "../data/testTemplate2.html", resources.template2.url);
        jqUnit.assertEquals("The content of the template2 has been loaded correctly", "<div>Test Template 2</div>", $.trim(resources.template2.resourceText));

        // The localised template with a templating path of prefixTerm + name
        jqUnit.assertEquals("The content of the template3 has been loaded correctly", "<div>Test Template 3 Localised</div>", $.trim(resources.template3.resourceText));

        // The localised template with a full path
        jqUnit.assertEquals("The content of the template4 has been loaded correctly", "<div>Test Template 4 Localised</div>", $.trim(resources.template4.resourceText));

        jqUnit.start();
    };

    jqUnit.asyncTest("Test Resource Loader", function () {
        jqUnit.expect(6);
        fluid.tests.resourceLoader();
    });

    // How to use the resource loader
    fluid.defaults("fluid.tests.UI", {
        gradeNames: ["fluid.viewComponent"],
        components: {
            templateLoader: {
                type: "fluid.resourceLoader",
                options: {
                    resourceOptions: {
                        terms: {
                            prefix: "../data"
                        }
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

    /** FLUID-6202: Boiling on resourcesLoaded event **/

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

    jqUnit.asyncTest("FLUID-6202: Boiling on resourcesLoaded event", function () {
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

    /** FLUID-4982: Overlapping, asynchronous component construction **/

    fluid.defaults("fluid.tests.FLUID4982.overlapMocks", {
        gradeNames: "fluid.test.mockXHR",
        mocks: {
            first: {
                url: "/first",
                delay: 200,
                body: "first"
            },
            second: {
                url: "/second",
                delay: 400,
                body: "second"
            },
            failed: {
                url: "/notfound",
                delay: 100,
                status: 404
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID4982base", {
        gradeNames: ["fluid.modelComponent", "fluid.resourceLoader"],
        model: "{that}.resources.initModel.parsed",
        members: {
            creationPromise: "@expand:fluid.promise()"
        },
        listeners: {
            "onCreate.resolveCreation": "{that}.creationPromise.resolve",
            "afterDestroy.resolveDestruction": "fluid.tests.FLUID4982destroy",
            "onDestroy.recordEvent": {
                funcName: "fluid.tests.FLUID4982recordEvent",
                args: ["{that}", "onDestroyCalled"]
            },
            "afterDestroy.recordEvent": {
                funcName: "fluid.tests.FLUID4982recordEvent",
                args: ["{that}", "afterDestroyCalled"]
            }
        }
    });

    fluid.tests.FLUID4982recordEvent = function (component, memberName) {
        component[memberName] = true;
    };

    fluid.tests.FLUID4982destroy = function (that) {
        if (!that.creationPromise.disposition) {
            that.creationPromise.reject(that.resourceFetcher.completionPromise.value);
        }
    };

    fluid.defaults("fluid.tests.FLUID4982first", {
        gradeNames: "fluid.tests.FLUID4982base",
        resources: {
            initModel: {
                url: "/second"
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID4982second", {
        gradeNames: "fluid.tests.FLUID4982base",
        resources: {
            initModel: {
                url: "/first"
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID4982failed", {
        gradeNames: "fluid.tests.FLUID4982base",
        resources: {
            initModel: {
                url: "/notfound"
            }
        }
    });

    jqUnit.asyncTest("FLUID-4982: Overlapping creation of asynchronous components", function () {
        jqUnit.expect(6);
        var mocks = fluid.tests.FLUID4982.overlapMocks();
        var failed = fluid.tests.FLUID4982failed();
        var first = fluid.tests.FLUID4982first();
        var second = fluid.tests.FLUID4982second();
        var rejection = fluid.promise();
        failed.creationPromise.then(null, function (err) {
            rejection.resolve(err);
        });
        var promise = fluid.promise.sequence([rejection, first.creationPromise, second.creationPromise]);
        promise.then(function () {
            jqUnit.assertEquals("First component model resolved", "second", first.model);
            jqUnit.assertEquals("Second component model resolved", "first", second.model);
            jqUnit.assertTrue("Failed component has been destroyed", fluid.isDestroyed(failed));
            jqUnit.assertEquals("Status code recoverable from failed component", 404, failed.creationPromise.value.status);
            jqUnit.assertTrue("onDestroy called for failed component", true, failed.onDestroyCalled);
            jqUnit.assertTrue("afterDestroy called for failed component", true, failed.onDestroyCalled);
            mocks.destroy();
            jqUnit.start();
        });
    });

    /** FLUID-4982: Partially filled out resource blocks **/

    fluid.defaults("fluid.tests.FLUID4982incomplete", {
        gradeNames: "fluid.tests.FLUID4982base",
        resources: {
            initModel: {
                dataType: "json"
            }
        }
    });

    jqUnit.test("FLUID-4982: Improperly filled resource blocks", function () {
        jqUnit.expectFrameworkDiagnostic("Framework exception mentioning valid options on incomplete resource block", function () {
            fluid.tests.FLUID4982incomplete();
        }, ["resource loader", "url"]);
    });

    /** FLUID-4982: Overriding primary resourceLoader blocks with promise or dataSource sources */

    fluid.defaults("fluid.tests.fluid4982overrideBase", {
        gradeNames: ["fluid.modelComponent", "fluid.resourceLoader"],
        model: {
            messages: "{that}.resources.messages.parsed"
        },
        members: {
            creationPromise: "@expand:fluid.promise()"
        },
        listeners: {
            "onCreate.resolveCreation": "{that}.creationPromise.resolve"
        },
        resources: {
            messages: {
                dataType: "json",
                locale: "fr",
                url: "../data/messages2.json"
            }
        },
        components: {
            dataSource: {
                type: "fluid.dataSource.URL",
                options: {
                    url: "../data/messages3_en.json"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.fluid4982overrideDerived", {
        gradeNames: "fluid.tests.fluid4982overrideBase",
        resources: {
            messages: {
                dataSource: "{that}.dataSource",
                // Make sure the ResourceLoader does not attempt to parse the DataSource output as JSON which is already parsed
                dataType: "none"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid4982overridePromise", {
        gradeNames: "fluid.tests.fluid4982overrideBase",
        invokers: {
            fetchMessages: "fluid.tests.fluid4982fetchMessages"
        },
        resources: {
            messages: {
                promiseFunc: "{that}.fetchMessages",
                promiseArgs: "../data/messages3_en.json"
            }
        }
    });

    fluid.tests.fluid4982fetchMessages = function (pathname) {
        return fluid.dataSource.URL.handle.http(null, new URL(pathname, document.location));
    };

    fluid.tests.fluid4982OverrideFixtures = [{
        grade: "fluid.tests.fluid4982overrideBase",
        expected: "Après moi, le déluge!"
    }, {
        grade: "fluid.tests.fluid4982overrideDerived",
        expected: "upper, middle, lower"
    }, , {
        grade: "fluid.tests.fluid4982overridePromise",
        expected: "upper, middle, lower"
    }];

    fluid.tests.fluid4982OverrideFixtures.forEach(function (fixture) {
        jqUnit.asyncTest("FLUID-4982: Overriding resourceLoader block for " + fixture.grade, function () {
            jqUnit.expect(1);
            var base = fluid.invokeGlobalFunction(fixture.grade);
            base.creationPromise.then(function () {
                jqUnit.assertEquals("Loaded localised message", fixture.expected, base.model.messages.courses);
                jqUnit.start();
            });
        });
    });

    /** FLUID-4982: Recoverable async failure on loading invalid JSON **/

    fluid.defaults("fluid.tests.FLUID4982.badJSONMocks", {
        gradeNames: "fluid.test.mockXHR",
        mocks: {
            badJSON: {
                url: "/badJSON",
                delay: 100,
                body: "{ open with ]"
            }
        }
    });

    fluid.defaults("fluid.tests.FLUID4982badJSON", {
        gradeNames: "fluid.tests.FLUID4982base",
        resources: {
            initModel: {
                dataType: "json",
                url: "/badJSON"
            }
        }
    });

    jqUnit.asyncTest("FLUID-4982: Recoverable async failure on bad JSON parse", function () {
        jqUnit.expect(4);
        var mocks = fluid.tests.FLUID4982.badJSONMocks();
        var failed = fluid.tests.FLUID4982badJSON();
        failed.creationPromise.then(null, function (err) {
            jqUnit.assertTrue("Failed component has been destroyed", fluid.isDestroyed(failed));
            jqUnit.assertTrue("Message recoverable from failed component", err.message.indexOf("JSON") !== -1);
            jqUnit.assertTrue("onDestroy called for failed component", true, failed.onDestroyCalled);
            jqUnit.assertTrue("afterDestroy called for failed component", true, failed.onDestroyCalled);
            mocks.destroy();
            jqUnit.start();
        });
    });

})();
