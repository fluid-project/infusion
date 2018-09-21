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

    jqUnit.asyncTest("Basic fetch tests", function () {

        var resourceSpecs = {
            objects: {
                href: "../data/objects.json",
                options: {
                    dataType: "text"
                }
            },
            intake: {
                href: "../data/intake.json",
                options: {
                    dataType: "text"
                }
            }
        };

        fluid.fetchResources(resourceSpecs, function () {
            jqUnit.assertUndefined("No fetch error", resourceSpecs.objects.fetchError);
            jqUnit.assertValue("Request completed", resourceSpecs.objects.completeTime);
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
