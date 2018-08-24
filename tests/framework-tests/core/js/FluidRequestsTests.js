/*
Copyright 2014-2015 Raising the Floor - International
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.setLogging(true);

    /**
     * Deferred expander tests (these are in "view" tests since they require a working $.ajax)
     */

    var buildUrl = function (recordType) {
        return "../data/" + recordType + ".json";
    };

    var makeArrayExpander = function (recordType) {
        return fluid.expander.makeFetchExpander({
            url: buildUrl(recordType),
            disposer: function (model) {
                return {
                    items: model,
                    selectionIndex: -1
                };
            },
            options: {
                async: false
            },
            fetchKey: recordType
        });
    };

    jqUnit.asyncTest("Deferred expander Tests", function () {
        var pageBuilder = {
            uispec: {
                objects: "These Objects",
                proceduresIntake: "Are Intake"
            }
        };

        var dependencies = {
            objects: {
                funcName: "cspace.recordList",
                args: [".object-records-group",
                        makeArrayExpander("objects"),
                        "{pageBuilder}.uispec.objects",
                        "stringOptions"]
            },
            proceduresIntake: {
                funcName: "cspace.recordList",
                args: [
                    ".intake-records-group",
                    makeArrayExpander("intake"),
                    "{pageBuilder}.uispec.proceduresIntake",
                    "stringOptions"
                ]
            }
        };

        var resourceSpecs = {};

        var expanded;

        fluid.withEnvironment({
            resourceSpecCollector: resourceSpecs,
            pageBuilder: pageBuilder
        }, function () {
            expanded = fluid.expand(dependencies, {fetcher: fluid.makeEnvironmentFetcher()});
        });

        var func = function () {}; // dummy function to compare equality

        var requiredSpecs = {
            objects: {
                href: "../data/objects.json",
                options: {
                    dataType: "text",
                    success: func,
                    error: func,
                    async: false
                }
            },
            intake: {
                href: "../data/intake.json",
                options: {
                    dataType: "text",
                    success: func,
                    error: func,
                    async: false
                }
            }
        };

        jqUnit.assertCanoniseEqual("Accumulated resourceSpecs", requiredSpecs, resourceSpecs, jqUnit.canonicaliseFunctions);

        var expectedRes = {
            objects: {
                funcName: "cspace.recordList",
                args: [".object-records-group",
                        {items: [1, 2, 3],
                         selectionIndex: -1},
                        "These Objects",
                        "stringOptions"]
            },
            proceduresIntake: {
                funcName: "cspace.recordList",
                args: [
                    ".intake-records-group",
                    {
                        items: [4, 5, 6],
                        selectionIndex: -1
                    },
                    "Are Intake",
                    "stringOptions"
                ]
            }
        };

        fluid.fetchResources(resourceSpecs, function () {
            jqUnit.assertUndefined("No fetch error", resourceSpecs.objects.fetchError);
            jqUnit.assertValue("Request completed", resourceSpecs.objects.completeTime);
            jqUnit.assertDeepEq("Resolved model", expectedRes, expanded);
            jqUnit.start();
        });
    });

    var resourceSpecsWithOverride = {
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
            href: "../data/messages4.json",
            forceCache: true,
            locale: "en",
            defaultLocale: "en"
        }
    };
    var expected = {
        messages1: "marking",
        messages2: "moi",
        messages3: "lower",
        messages4: "grading",
        messages5: "Sherlock"
    };

    var resourceSpecsWithoutOverride = {
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
            href: "../data/messages4.json",
            forceCache: true,
            locale: "en",
            defaultLocale: "en"
        }
    };

    var testLocalizedResourceSpecs = function (message, resourceSpecCollection, fetchResourcesOptions) {

        jqUnit.asyncTest(message, function () {
            var callback = function (resourceSpecs) {
                fluid.each(resourceSpecs, function (resourceSpec, key) {
                    jqUnit.assertValue("Should have resolved resource", resourceSpec.resourceText);
                    jqUnit.assertTrue("Should have found expected text", resourceSpec.resourceText.indexOf(expected[key]) !== -1);
                });
                jqUnit.start();
            };
            jqUnit.expect(2 * Object.keys(expected).length);

            fluid.fetchResources(resourceSpecCollection, callback, fetchResourcesOptions);
        });
    };

    testLocalizedResourceSpecs("Localisation tests - defaultLocale override option", resourceSpecsWithOverride, {defaultLocale: "en"});
    testLocalizedResourceSpecs("Localisation tests - no defaultLocale override option", resourceSpecsWithoutOverride);

})();
