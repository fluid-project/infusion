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

        fluid.fetchResources(resourceSpecs, function (resourceSpecs) {
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
            onResourcesLoaded: "fluid.tests.resourceLoader.testTemplateLoader({arguments}.0, {that})"
        }
    });

    fluid.registerNamespace("fluid.tests.resourceLoader.expected");

    fluid.tests.resourceLoader.expected.en = {
        template1: "<div>Test Template 1</div>",
        template2: "<div>Test Template 2</div>",
        template3: "<div>Test Template 3 Localised</div>",
        template4: "<div>Test Template 4 Localised</div>"
    };

    fluid.tests.resourceLoader.expected.fr = {
        template1: "<div>Test Template 1</div>",
        template2: "<div>Test Template 2</div>",
        template3: "<div>Test Template 3 Localised</div>",
        template4: "<div>Gabarit de Test 4 Localisé</div>"
    };

    fluid.tests.resourceLoader.assertTemplatesLoaded = function (resources, locale) {
        fluid.each(fluid.tests.resourceLoader.expected[locale], function (expected, key) {
            jqUnit.assertEquals("The content of " + key + " has been loaded correctly in locale " + locale, expected,
                resources[key].resourceText.trim());
        });
    };

    fluid.tests.resourceLoader.testTemplateLoader = function (resources, resourceLoader) {
        var resourceFetcher = resourceLoader.resourceFetcher;
        var locale = resourceFetcher.options.locale || resourceFetcher.options.defaultLocale;
        fluid.tests.resourceLoader.assertTemplatesLoaded(resources, locale);
        if (locale === "en") {
            // TODO: Old-fashioned test which bangs on the resourceFetcher options - should use the modelised form instead
            resourceFetcher.options.locale = "fr";
            resourceFetcher.refetchAll();
        } else {
            jqUnit.start();
        }
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

    /** FLUID-6441: onResourcesLoaded should still fire even with no resources **/

    fluid.defaults("fluid.tests.FLUID6441", {
        gradeNames: "fluid.resourceLoader"
    });

    jqUnit.asyncTest("FLUID-6441: onResourcesLoaded should still fire even with no resources", function () {
        jqUnit.expect(1);
        var check = function () {
            jqUnit.assert("onResourcesLoaded has fired");
            jqUnit.start();
        };
        fluid.tests.FLUID6441({
            listeners: {
                onResourcesLoaded: check
            }
        });
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

    /** FLUID-6460: Transfer resourceLoader options to XHR **/

    fluid.defaults("fluid.tests.FLUID6460", {
        gradeNames: "fluid.resourceLoader",
        resources: {
            someResource: {
                url: "/notfound",
                options: {
                    responseType: "arraybuffer"
                }
            }
        }
    });

    jqUnit.test("FLUID-6460: Transfer options to XHR", function () {
        var that = fluid.tests.FLUID6460();
        jqUnit.assertEquals("Should have transferred responseType option to XHR property", "arraybuffer", that.resourceFetcher.resourceSpecs.someResource.xhr.responseType);
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
                promiseArgs: "../data/messages1_en.json"
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
        expected: "These courses will require a lot of grading"
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

    /** FLUID-4982: Refetching individual resources */

    fluid.defaults("fluid.tests.fluid4982refetch", {
        gradeNames: ["fluid.modelComponent", "fluid.resourceLoader"],
        members: {
            remoteModel: {
                value: 42
            }
        },
        invokers: {
            fetchModel: "fluid.identity({that}.remoteModel)"
        },
        model: "{that}.resources.modelSource.parsed",
        resources: {
            modelSource: {
                promiseFunc: "{that}.fetchModel"
            }
        }
    });

    jqUnit.test("FLUID-4982: Refetching individual resource", function () {
        var that = fluid.tests.fluid4982refetch();
        jqUnit.assertDeepEq("Initial model correct", {value: 42}, that.model);
        var newModel = {
            newValue: 43
        };
        that.remoteModel = newModel;
        that.resourceFetcher.refetchOneResource("modelSource");

        jqUnit.assertDeepEq("Updated model correct", {newValue: 43}, that.model);
    });

    /** FLUID-4982: Accessing resources via MessageResolver on startup **/

    fluid.defaults("fluid.tests.fluid4982messageResolver", {
        gradeNames: "fluid.resourceLoader",
        resources: {
            messages: {
                dataType: "json",
                locale: "fr",
                url: "../data/messages2.json"
            }
        },
        components: {
            messageResolver: {
                type: "fluid.messageResolver",
                options: {
                    messageBase: "{fluid4982messageResolver}.resources.messages.parsed",
                    listeners: {
                        "onCreate.resolveMessage": "fluid.tests.fluid4982resolveMessage"
                    }
                }
            }
        }
    });

    fluid.tests.fluid4982resolveMessage = function (messageResolver) {
        var resolved = messageResolver.resolve("courses");
        jqUnit.assertEquals("Loaded localised message from resolver", "Après moi, le déluge!", resolved);
        jqUnit.start();
    };

    jqUnit.asyncTest("FLUID-4982: Use of startup resource from messageLoader", function () {
        jqUnit.expect(1);
        fluid.tests.fluid4982messageResolver();
    });

    fluid.defaults("fluid.tests.fluid4982messageResolver2", {
        gradeNames: "fluid.tests.fluid4982messageResolver",
        components: {
            messageResolver: {
                options: {
                    messageBase: {
                        courses: "{fluid4982messageResolver}.resources.messages.parsed.courses"
                    }
                }
            }
        }
    });

    // This style blesses the shortly to be cursed method of "localisation" via "strings" of an old-fashioned renderer component,
    // e.g. the TableOfContents component's strings which are now usually resolved from a resource
    jqUnit.asyncTest("FLUID-4982 II: Use of startup resource from messageLoader via individual fetch", function () {
        jqUnit.expect(1);
        fluid.tests.fluid4982messageResolver2();
    });

    /** FLUID-6413 I - Elementary failure with asynchronous activities during init transaction **/

    fluid.defaults("fluid.tests.fluid6413child", {
        gradeNames: ["fluid.modelComponent", "fluid.resourceLoader"],
        resources: {
            messages: {
                dataType: "json",
                locale: "fr",
                url: "../data/messages2.json"
            }
        },
        workflows: {
        // This replicates the workflow setup in fluid.oldRendererComponent which was used by the old ToC implementation
            local: {
                fetchOldResource: {
                    funcName: "fluid.fluid6143fetchOldResource",
                    priority: "after:concludeComponentObservation"
                },
                waitForOldResource: {
                    waitIO: true,
                    funcName: "fluid.identity",
                    priority: "after:fetchOldResource"
                }
            }
        }
    });

    fluid.fluid6143fetchOldResource = function (shadow) {
        fluid.getForComponent(shadow.that, "resources.messages");
    };

    fluid.defaults("fluid.tests.fluid6413root", {
        gradeNames: "fluid.modelComponent",
        model: null,
        listeners: {
            "onCreate.updateModel": {
                funcName: "fluid.tests.fluid6413update",
                priority: "after:fluid-componentConstruction"
            }
        },
        components: {
            child: {
                type: "fluid.tests.fluid6413child",
                createOnEvent: "onCreate",
                options: {
                    model: {
                        parentModelValue: "{fluid6413root}.model.value"
                    }
                }
            }
        }
    });

    fluid.tests.fluid6413update = function (that) {
        // White-box testing - the transaction should not have suspended
        jqUnit.assertValue("Transaction should be active", fluid.globalInstantiator.currentTreeTransactionId);
        that.applier.change("value", 42);
    };

    jqUnit.asyncTest("FLUID-6413: Elementary failure with long init transaction", function () {
        var transRec = fluid.construct("fluid6413root", {
            type: "fluid.tests.fluid6413root"
        }, {
            returnTransaction: true
        });
        jqUnit.assertEquals("Root component should have finished constructing synchronously", "treeConstructed", transRec.outputShadows[0].that.lifecycleStatus);
        transRec.promise.then(function () {
            var that = transRec.outputShadows[0].that;
            jqUnit.assertEquals("Root model onCreate change applied", 42, that.model.value);
            jqUnit.assertEquals("Child component synced", 42, that.child.model.parentModelValue);
            jqUnit.assertValue("Got messages", that.child.resources.messages.parsed.courses);
            fluid.defaults("fluid.tests.fluid6413child", {}); // Clear out workflows
            jqUnit.start();
        });
    });

    /** FLUID-4982: Recoverable async failure on loading invalid JSON **/

    fluid.defaults("fluid.tests.FLUID4982.badJSONMocks", {
        gradeNames: "fluid.test.mockXHR",
        mergePolicy: {
            "mocks.badJSON.body": "noexpand"
        },
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
            jqUnit.assertTrue("Message recoverable from failed component", err.stack.indexOf("JSON") !== -1);
            jqUnit.assertTrue("onDestroy called for failed component", true, failed.onDestroyCalled);
            jqUnit.assertTrue("afterDestroy called for failed component", true, failed.onDestroyCalled);
            mocks.destroy();
            jqUnit.start();
        });
    });

    jqUnit.asyncTest("FLUID-4982: Unhandled rejection during async construction", function () {
        var mocks = fluid.tests.FLUID4982.badJSONMocks();
        var handler = function (err) {
            fluid.unhandledRejectionEvent.removeListener("test");
            jqUnit.assertTrue("Received error for failed resource", err.message.indexOf("JSON") !== -1);
            mocks.destroy();
            jqUnit.start();
        };
        jqUnit.expect(1);
        fluid.tests.FLUID4982badJSON({model: "{that}.resources.initModel.parsed"});
        fluid.unhandledRejectionEvent.addListener(handler, "test");
    });

    jqUnit.asyncTest("FLUID-4982: No unhandled rejection during async construction with rejection handler", function () {
        var mocks = fluid.tests.FLUID4982.badJSONMocks();
        var transRec = fluid.construct("fluid4982root", {
            type: "fluid.tests.FLUID4982badJSON",
            model: "{that}.resources.initModel.parsed"
        }, {
            returnTransaction: true
        });
        var handler = function (err) {
            jqUnit.fail("Should not have received unhandled exception rejection, instead got " + err.message);
        };
        // Prevent unhandled rejection from the creation promise itself
        transRec.outputShadows[0].that.creationPromise.then(null, fluid.identity);
        transRec.promise.then(null, function (err) {
            jqUnit.assertTrue("Received error for failed resource", err.message.indexOf("JSON") !== -1);
            fluid.invokeLater(function () {
                fluid.unhandledRejectionEvent.removeListener("test");
                jqUnit.start();
            });
            mocks.destroy();
        });
        fluid.unhandledRejectionEvent.addListener(handler, "test");
    });

})();
