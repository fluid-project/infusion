/*
Copyright 2018-2019 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.localization
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.localizationEnactor", {
        gradeNames: ["fluid.prefs.enactor.localization"],
        model: {
            lang: "default"
        },
        langMap: {
            en: "",
            fr: "fr-ca"
        },
        pathnames: {
            original: "/about/",
            english: "/about/",
            french: "/fr-ca/about/"
        },
        localizationScheme: "urlPath",
        langSegIndex: 1
    });

    fluid.tests.prefs.enactor.localizationEnactor.getPathname = function (that) {
        return that.options.recordedPathname || that.options.pathnames.original;
    };

    fluid.tests.prefs.enactor.localizationEnactor.setPathname = function (that, pathname) {
        that.options.recordedPathname = pathname;
    };

    fluid.defaults("fluid.tests.localizationTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            localization: {
                type: "fluid.tests.prefs.enactor.localizationEnactor",
                createOnEvent: "{localizationTester}.events.onTestCaseStart",
                options: {
                    invokers: {
                        getPathname: {
                            funcName: "fluid.tests.prefs.enactor.localizationEnactor.getPathname",
                            args: ["{that}"]
                        },
                        setPathname: {
                            funcName: "fluid.tests.prefs.enactor.localizationEnactor.setPathname",
                            args: ["{that}", "{arguments}.0"]
                        }
                    }
                }
            },
            localizationTester: {
                type: "fluid.tests.localizationTester"
            }
        }
    });

    fluid.defaults("fluid.tests.localizationTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.enactor.localization",
            tests: [{
                expect: 13,
                name: "Localization",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{localizationTests localization}.events.onCreate",
                    args: ["The localization enactor was created"]
                },
                {
                    func: "fluid.tests.localizationTester.assertLocale",
                    args: ["Init", "{localization}", {
                        lang: "default",
                        urlPathname: "{localization}.options.pathnames.original"
                    }]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["lang", "en"]
                },
                {
                    changeEvent: "{localization}.applier.modelChanged",
                    spec: {path: "lang", priority: "last:testing"},
                    listener: "fluid.tests.localizationTester.assertLocale",
                    // The setPathname function isn't called because the URL hasn't changed. That is why the
                    // expectedPathname is the same as before.
                    args: ["English", "{localization}", {
                        lang: "en",
                        urlPathname: "{localization}.options.pathnames.english"
                    }]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["lang", "fr"]
                },
                {
                    changeEvent: "{localization}.applier.modelChanged",
                    spec: {path: "lang", priority: "last:testing"},
                    listener: "fluid.tests.localizationTester.assertLocale",
                    args: ["French", "{localization}", {
                        lang: "fr",
                        urlPathname: "{localization}.options.pathnames.french"
                    }, "{localization}.options.pathnames.french"]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["lang", "default"]
                },
                {
                    changeEvent: "{localization}.applier.modelChanged",
                    spec: {path: "lang", priority: "last:testing"},
                    listener: "fluid.tests.localizationTester.assertLocale",
                    args: ["Set to Default", "{localization}", {
                        lang: "default",
                        urlPathname: "{localization}.options.pathnames.french"
                    }]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["lang", "en"]
                },
                {
                    changeEvent: "{localization}.applier.modelChanged",
                    spec: {path: "lang", priority: "last:testing"},
                    listener: "fluid.tests.localizationTester.assertLocale",
                    args: ["Set back to English", "{localization}", {
                        lang: "en",
                        urlPathname: "{localization}.options.pathnames.english"
                    }, "{localization}.options.pathnames.english"]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["lang", "es"]
                },
                {
                    changeEvent: "{localization}.applier.modelChanged",
                    spec: {path: "lang", priority: "last:testing"},
                    listener: "fluid.tests.localizationTester.assertLocale",
                    args: ["Unsupported Language", "{localization}", {
                        lang: "es",
                        urlPathname: "{localization}.options.pathnames.english"
                    }]
                }]
            }]
        }]
    });

    fluid.tests.localizationTester.assertLocale = function (prefix, that, expectedModel, setPathname) {
        jqUnit.assertDeepEq(prefix + ": The model property is set correctly: " + expectedModel.lang, expectedModel, that.model);
        var message = setPathname ? ": The correct URL pathname is set" : ": The pathname is not set.";
        jqUnit.assertEquals(prefix + message, setPathname, that.options.recordedPathname);
        //reset recordedPathname
        that.options.recordedPathname = undefined;
    };

    /*********************************************************************************
     *Tests for referencing a global fluid.prefs.enactor.localization via model relay
     ********************************************************************************/

    fluid.defaults("fluid.tests.localizationExistingTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        events: {
            onLocalizationReady: null
        },
        components: {
            testComponent: {
                type: "fluid.modelComponent",
                createOnEvent: "onLocalizationReady",
                options: {
                    model: {
                        lang: "{localization}.model.lang"
                    }
                }
            },
            tester: {
                type: "fluid.tests.localizationExistingTester"
            }
        }
    });

    fluid.tests.localizationExistingTests.initLocalization = function (that) {
        that.localization = fluid.prefs.enactor.localization();
        that.events.onDestroy.addListener(that.localization.destroy, "destroyLocalization");
        that.events.onLocalizationReady.fire();
    };

    fluid.defaults("fluid.tests.localizationExistingTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Global Localization",
            tests: [{
                expect: 1,
                name: "Model Relay",
                sequence: [{
                    funcName: "fluid.tests.localizationExistingTests.initLocalization",
                    args: ["{localizationExistingTests}"]
                }, {
                    func: "{localizationExistingTests}.localization.applier.change",
                    args: ["lang", "en"]
                }, {
                    changeEvent: "{testComponent}.applier.modelChanged",
                    spec: {path: "lang", priority: "last:testing"},
                    func: "jqUnit.assertDeepEq",
                    args: ["The model relay to the global localization component should have updated the test component's model", {lang: "en"}, "{testComponent}.model"]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.localizationTests",
            "fluid.tests.localizationExistingTests"
        ]);
    });

})(jQuery);
