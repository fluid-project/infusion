/*
Copyright 2008-2010 University of Toronto
Copyright 2010-2017 OCAD University
Copyright 2011 Lucendo Development Ltd.
Copyright 2015 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests.prefs");

    jqUnit.module("PrefsEditor Tests");

    fluid.tests.prefs.trackSave = function (that, savedModel) {
        that.saveCalled = true;
        that.savedModel = savedModel;
    };

    fluid.tests.prefs.noteRefreshCalled = function (that) {
        ++that.refreshCount;
    };

    fluid.defaults("fluid.tests.prefs.standardEditor", { // a mixin grade for fluid.prefs.prefsEditor
        gradeNames: ["fluid.prefs.uiEnhancerRelay"],
        components: {
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: "body",
                options: {
                    gradeNames: ["fluid.uiEnhancer.starterEnactors"]
                }
            }
        },
        model: {
            local:{
                state: "{that}.model.state"
            }
        },
        members: {
            saveCalled: false,
            savedModel: null,
            refreshCount: 0
        },
        listeners: {
            "onSave.track": "fluid.tests.prefs.trackSave({prefsEditor}, {arguments}.0)",
            "onPrefsEditorRefresh.noteCalled": "fluid.tests.prefs.noteRefreshCalled({that})"
        }
    });

    fluid.tests.prefs.previewTemplateURL = "TestPreviewTemplate.html";
    fluid.tests.prefs.templatePrefix = "../../../../src/framework/preferences/html";
    fluid.tests.prefs.messagePrefix = "../../../../src/framework/preferences/messages";

    fluid.defaults("fluid.tests.prefs.commonLoader", {
        gradeNames: ["fluid.prefs.initialModel.starter", "fluid.prefs.prefsEditorLoader"],
        terms: {
            templatePrefix: fluid.tests.prefs.templatePrefix,
            messagePrefix: fluid.tests.prefs.messagePrefix
        },
        messageLoader: {
            gradeNames: ["fluid.prefs.starterMessageLoader"]
        },
        templateLoader: {
            gradeNames: ["fluid.prefs.starterFullNoPreviewTemplateLoader"]
        },
        components: {
            prefsEditor: {
                container: "{commonLoader}.container",
                options: {
                    gradeNames: "fluid.tests.prefs.standardEditor"

                }
            }
        }
    });

    fluid.registerNamespace("fluid.tests.prefs.models");

    fluid.tests.prefs.models.bwSkin = {
        preferences: {
            textSize: 1.8,
            textFont: "verdana",
            theme: "bw",
            lineSpace: 2
        }
    };

    fluid.tests.prefs.models.cwSkin = {
        preferences: {
            textSize: 1.1,
            textFont: "italic",
            theme: "cw",
            lineSpace: 1
        }
    };

    fluid.tests.prefs.models.maxTextSize = {
        preferences: {
            textSize: "2.0"
        }
    };

    fluid.tests.prefs.models.minTextSize = {
        preferences: {
            textSize: "1.0"
        }
    };

    fluid.tests.prefs.models.state = {
        state: {
            userData: true
        }
    };

    fluid.tests.prefs.testPrefsEditor = function (onReady, prefsEditorGrades, loaderGrades) {
        fluid.prefs.globalSettingsStore();
        fluid.tests.prefs.commonLoader("#ui-options", {
            gradeNames: fluid.makeArray(loaderGrades),
            distributeOptions: [{
                record: {
                    funcName: onReady,
                    args: ["{prefsEditor}", "{prefsEditorLoader}"],
                    namespace: "runTest"
                },
                target: "{that prefsEditor}.options.listeners.onReady"
            }, {
                record: fluid.makeArray(prefsEditorGrades),
                target: "{that prefsEditor}.options.gradeNames"
            }]
        });
    };

    fluid.tests.prefs.assertInit = function (prefsEditor) {
        var model = prefsEditor.model;

        jqUnit.assertValue("Initialization: Model is set", model);
        var initialModel = fluid.tests.mergeMembers(fluid.defaults("fluid.prefs.initialModel.starter").members.initialModel);
        jqUnit.assertDeepEq("Initialization: Initial model contains the initial start preferences", initialModel.preferences, model.preferences);

        var themeValues = prefsEditor.contrast.options.controlValues.theme;
        jqUnit.assertEquals("Initialization: There are 8 themes in the contrast adjuster", 8, themeValues.length);
        jqUnit.assertEquals("Initialization: The first theme is default", "default", themeValues[0]);

        var fontValues = prefsEditor.textFont.options.controlValues.textFont;
        jqUnit.assertEquals("Initialization: There are 5 font values in font style adjuster", 5, fontValues.length);
        jqUnit.assertTrue("Initialization: There is a default font value", fontValues.indexOf("default") !== -1);

        jqUnit.assertEquals("Initialization: The onPrefsEditorRefresh event has been called once", 1, prefsEditor.refreshCount);
    };

    fluid.tests.prefs.assertPrefs = function (template, prefs, method, expected, model) {
        var t = function (term) {
            return fluid.stringTemplate(template, {p: term});
        };
        var definedPrefs = 0;
        prefs.forEach(function (pref) {
            var expectedPref = expected.preferences[pref];
            if (expectedPref !== undefined) {
                ++definedPrefs;
            }
            jqUnit[method](t(pref), expectedPref, model.preferences[pref]);
        });
        jqUnit.assertTrue(t("- some preference") + " must have had a value", definedPrefs > 0); // guard against model misalignment simply comparing undefined with undefined
    };

    fluid.tests.prefs.assertAdjusterValues = function (testName, prefsEditor) {
        var prefs = prefsEditor.model.preferences;

        var fontVal = $(":selected", prefsEditor.locate("textFont"))[0].value;
        jqUnit.assertEquals(testName + ": Font style set to " + prefs.textFont, prefs.textFont.toString(), fontVal);

        var textSizeVal = $(".flc-textfieldStepper-field", prefsEditor.locate("textSize")).val();
        jqUnit.assertEquals(testName + ": Font Size adjuster set to " + prefs.textSize, prefs.textSize.toString(), textSizeVal);

        var contrastVal = $(":checked", prefsEditor.locate("contrast"))[0].value;
        jqUnit.assertEquals(testName + ": Contrast adjuster set to " + prefs.theme, prefs.theme.toString(), contrastVal);

        var lineSpaceVal = $(".flc-textfieldStepper-field", prefsEditor.locate("lineSpace")).val();
        jqUnit.assertEquals(testName + ": Line Space adjuster set to " + prefs.lineSpace, prefs.lineSpace.toString(), lineSpaceVal);

        var tocVal = $(".flc-switchUI-control", prefsEditor.locate("layoutControls")).attr("aria-checked");
        jqUnit.assertEquals(testName + ": Table of Contents adjuster set to " + prefs.toc, prefs.toc.toString(), tocVal);

        var enhanceInputsVal = $(".flc-switchUI-control", prefsEditor.locate("enhanceInputs")).attr("aria-checked");
        jqUnit.assertEquals(testName + ": Table of Contents adjuster set to " + prefs.inputs, prefs.inputs.toString(), enhanceInputsVal);
    };

    fluid.tests.prefs.assertHasClass = function (msg, elm, className) {
        elm = $(elm);
        jqUnit.assertTrue(msg, elm.hasClass(className));
    };

    fluid.tests.prefs.assertSaved = function (testName, prefsEditor, expected) {
        if (expected) {
            jqUnit.assertTrue(testName + ": Save should have been called", prefsEditor.saveCalled);
        } else {
            jqUnit.assertFalse(testName + ": Save should not have been called", prefsEditor.saveCalled);
        }

        // reset saveCalled so that we can check it again later.
        prefsEditor.saveCalled = false;
    };

    /*********************
     * PrefsEditor Tests *
     *********************/

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader", {
        gradeNames: ["fluid.tests.prefs.commonLoader"],
        distributeOptions: [{
            record: ["fluid.prefs.starterPanels"],
            target: "{that prefsEditor}.options.gradeNames"
        }]
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            settingStore: {
                type: "fluid.prefs.globalSettingsStore"
            },
            prefsEditorLoader: {
                type: "fluid.tests.prefs.prefsEditorLoader",
                container: "#ui-options",
                createOnEvent: "{tester}.events.onTestCaseStart"
            },
            tester: {
                type: "fluid.tests.prefs.prefsEditorLoader.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            prefs: ["textSize", "textFont", "theme"],
            models: {
                bwState: {
                    expander: {
                        "this": "$",
                        method: "extend",
                        args: [{}, true, fluid.tests.prefs.models.bwSkin, fluid.tests.prefs.models.state]
                    }
                }
            }
        },
        modules: [{
            name: "PrefsEditor Loader",
            tests: [{
                expect: 58,
                name: "Save, Reset, and Cancel",
                sequence: [{
                    event: "{tests prefsEditorLoader}.events.onReady",
                    priority: "last:testing",
                    listener: "fluid.tests.prefs.assertInit",
                    args: ["{prefsEditorLoader}.prefsEditor"]
                }, {
                    // Change, save and apply preferences
                    funcName: "{prefsEditorLoader}.prefsEditor.applier.change",
                    args: ["", fluid.tests.prefs.models.bwSkin]
                }, {
                    changeEvent: "{prefsEditorLoader}.prefsEditor.applier.modelChanged",
                    spec: {path: "", priority: "last:testing"},
                    listener: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Save, Apply", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.saveAndApply",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["Change, Save, Apply: The changed preferences should be saved", fluid.tests.prefs.models.bwSkin, "{arguments}.0"]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Save, Apply", "{prefsEditorLoader}.prefsEditor", true]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["Change, Save, Apply: The prefsEditor has been refreshed after preferences are changed", 2, "{prefsEditorLoader}.prefsEditor.refreshCount"]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.getSettings",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["Change, Save, Apply: bw setting was saved", fluid.tests.prefs.models.bwSkin.preferences.theme, "{arguments}.0.preferences.theme"]
                }, {
                    funcName: "fluid.tests.prefs.assertHasClass",
                    args: ["Change, Save, Apply: The body element has the high contrast colour scheme", "body", "fl-theme-bw"]
                }, {
                    funcName: "fluid.tests.prefs.assertPrefs",
                    args: ["Change, Save, Apply: %p has been saved", "{that}.options.testOpts.prefs", "assertEquals", fluid.tests.prefs.models.bwSkin, "{prefsEditorLoader}.prefsEditor.model"]
                }, {
                    funcName: "fluid.tests.prefs.assertAdjusterValues",
                    args: ["Change, Save, Apply", "{prefsEditorLoader}.prefsEditor"]
                }, {
                    // Change, save and apply non-preference model values
                    funcName: "{prefsEditorLoader}.prefsEditor.applier.change",
                    args: ["", fluid.tests.prefs.models.state]
                }, {
                    changeEvent: "{prefsEditorLoader}.prefsEditor.applier.modelChanged",
                    spec: {path: "", priority: "last:testing"},
                    listener: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Save, Apply (non-pref state)", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.saveAndApply",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["Change, Save, Apply (non-pref state): The preferences should be saved", "{that}.options.testOpts.models.bwState", "{arguments}.0"]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Save, Apply (non-pref state)", "{prefsEditorLoader}.prefsEditor", true]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["Change, Save, Apply (non-pref state): The prefsEditor hasn't been refreshed when preferences are not changed", 2, "{prefsEditorLoader}.prefsEditor.refreshCount"]
                }, {
                    funcName: "fluid.tests.prefs.assertAdjusterValues",
                    args: ["Change, Save, Apply (non-pref state)", "{prefsEditorLoader}.prefsEditor"]
                }, {
                    // Change, cancel
                    funcName: "{prefsEditorLoader}.prefsEditor.applier.change",
                    args: ["", fluid.tests.prefs.models.cwSkin]
                }, {
                    changeEvent: "{prefsEditorLoader}.prefsEditor.applier.modelChanged",
                    spec: {path: "", priority: "last:testing"},
                    listener: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Cancel", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    funcName: "{prefsEditorLoader}.prefsEditor.cancel"
                }, {
                    event: "{prefsEditorLoader}.prefsEditor.events.onPrefsEditorRefresh",
                    priority: "last:testing",
                    listener: "jqUnit.assertEquals",
                    args: ["Change, Cancel: The prefsEditor has been refreshed after cancel", 3, "{prefsEditorLoader}.prefsEditor.refreshCount"]
                }, {
                    funcName: "jqUnit.assertDeepEq",
                    args: [
                        "Change, Cancel: The changes should be removed and preferences restored to last saved state",
                        {
                            expander: {
                                "this": "$",
                                method: "extend",
                                args: [{}, true, "{prefsEditorLoader}.initialModel.preferences", fluid.tests.prefs.models.bwSkin.preferences]
                            }
                        },
                        "{prefsEditorLoader}.prefsEditor.model.preferences"]
                }, {
                    funcName: "fluid.tests.prefs.assertAdjusterValues",
                    args: ["Change, Cancel", "{prefsEditorLoader}.prefsEditor"]
                }, {
                    // reset, save
                    funcName: "{prefsEditorLoader}.prefsEditor.reset"
                }, {
                    event: "{prefsEditorLoader}prefsEditor.events.afterReset",
                    listener: "fluid.tests.prefs.assertPrefs",
                    args: ["Reset, Save: Reset model %p", "{that}.options.testOpts.prefs", "assertNotEquals", fluid.tests.prefs.models.bwSkin, "{prefsEditorLoader}.prefsEditor.model"]
                }, {
                    funcName: "jqUnit.assertDeepEq",
                    args: ["Reset, Save: The preferences should be reset to the initial model", "{prefsEditorLoader}.prefsEditor.initialModel.preferences", "{prefsEditorLoader}.prefsEditor.model.preferences"]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["Reset, Save: The prefsEditor has been refreshed after reset", 4, "{prefsEditorLoader}.prefsEditor.refreshCount"]
                }, {
                    funcName: "fluid.tests.prefs.assertAdjusterValues",
                    args: ["Reset, Save", "{prefsEditorLoader}.prefsEditor"]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Reset, Save", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.save",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["Reset, Save: The default preferences shouldn't be saved", fluid.tests.prefs.models.state, "{arguments}.0"]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Reset, Save", "{prefsEditorLoader}.prefsEditor", true]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["Reset, Save: The prefsEditor hasn't been refreshed when preferences are not changed", 4, "{prefsEditorLoader}.prefsEditor.refreshCount"]
                }]
            }]
        }]
    });

    /************************
     * Custom initial model *
     ************************/

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.customInitModel", {
        gradeNames: ["fluid.tests.prefs.prefsEditorLoader"],
        distributeOptions: {
            record: {
                preferences: {
                    theme: "wb",
                    textFont: "times"
                }
            },
            target: "{prefsEditorLoader}.options.members.initialModel"
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.customInitModel.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            settingStore: {
                type: "fluid.prefs.globalSettingsStore"
            },
            prefsEditorLoader: {
                type: "fluid.tests.prefs.prefsEditorLoader.customInitModel",
                container: "#ui-options",
                createOnEvent: "{tester}.events.onTestCaseStart"
            },
            tester: {
                type: "fluid.tests.prefs.prefsEditorLoader.customInitModel.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.customInitModel.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            initialModel: {
                preferences: {
                    textFont: "times",
                    theme: "wb",
                    textSize: 1,
                    lineSpace: 1,
                    toc: false,
                    inputs: false
                }
            }
        },
        modules: [{
            name: "PrefsEditor Loader",
            tests: [{
                expect: 8,
                name: "Custom Initial Model",
                sequence: [{
                    event: "{tests prefsEditorLoader}.events.onReady",
                    priority: "last:testing",
                    listener: "jqUnit.assertDeepEq",
                    args: ["Initialization: The initialModel include the custom prefs", "{that}.options.testOpts.initialModel", "{prefsEditorLoader}.prefsEditor.initialModel"]
                }, {
                    funcName: "jqUnit.assertDeepEq",
                    args: ["Initialization: The model should be set to the initial model", "{that}.options.testOpts.initialModel.preferences", "{prefsEditorLoader}.prefsEditor.initialModel.preferences"]
                }, {
                    funcName: "fluid.tests.prefs.assertAdjusterValues",
                    args: ["Initialization", "{prefsEditorLoader}.prefsEditor"]
                }]
            }]
        }]
    });

    /*********************
     * Integration Tests *
     *********************/

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.integration", {
        gradeNames: ["fluid.tests.prefs.prefsEditorLoader"]
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.integration.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            settingStore: {
                type: "fluid.prefs.globalSettingsStore"
            },
            prefsEditorLoader: {
                type: "fluid.tests.prefs.prefsEditorLoader.integration",
                container: "#ui-options",
                createOnEvent: "{tester}.events.onTestCaseStart"
            },
            tester: {
                type: "fluid.tests.prefs.prefsEditorLoader.integration.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.integration.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "PrefsEditor Loader",
            tests: [{
                expect: 17,
                name: "Integration",
                sequence: [{
                    // Initialization
                    event: "{tests prefsEditorLoader}.events.onReady",
                    priority: "last:testing",
                    listener: "jqUnit.assertDeepEq",
                    args: ["Initialization: The prefs in the initialModel and model should match", "{prefsEditorLoader}.prefsEditor.initialModel.preferences", "{prefsEditorLoader}.prefsEditor.model.preferences"]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.getSettings",
                    resolve: "jqUnit.assertUndefined",
                    resolveArgs: ["Initialization: store should be empty to start", "{arguments}.0"]
                }, {
                    // Change, Save
                    funcName: "{prefsEditorLoader}.prefsEditor.applier.change",
                    args: ["", fluid.tests.prefs.models.bwSkin]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Save", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    jQueryTrigger: "click",
                    element: "{prefsEditorLoader}.prefsEditor.dom.save"
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Save", "{prefsEditorLoader}.prefsEditor", true]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.getSettings",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["Change, Save: store should contained the changed prefs", fluid.tests.prefs.models.bwSkin.preferences, "{arguments}.0.preferences"]
                }, {
                    // Change, Cancel
                    funcName: "{prefsEditorLoader}.prefsEditor.applier.change",
                    args: ["", fluid.tests.prefs.models.cwSkin]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Cancel", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    jQueryTrigger: "click",
                    element: "{prefsEditorLoader}.prefsEditor.dom.cancel"
                }, {
                    funcName: "jqUnit.assertDeepEq",
                    args: [
                        "Change, Cancel: The changes should be removed and preferences restored to last saved state",
                        {
                            expander: {
                                "this": "$",
                                method: "extend",
                                args: [{}, true, "{prefsEditorLoader}.initialModel.preferences", fluid.tests.prefs.models.bwSkin.preferences]
                            }
                        },
                        "{prefsEditorLoader}.prefsEditor.model.preferences"]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Cancel", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.getSettings",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["Change, Save: store should not have changed", fluid.tests.prefs.models.bwSkin.preferences, "{arguments}.0.preferences"]
                }, {
                    // Reset, Cancel
                    jQueryTrigger: "click",
                    element: "{prefsEditorLoader}.prefsEditor.dom.reset"
                }, {
                    funcName: "jqUnit.assertDeepEq",
                    args: ["Reset, Cancel: The preferences should be restored to the initialModel", "{prefsEditorLoader}.initialModel.preferences", "{prefsEditorLoader}.prefsEditor.model.preferences"]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Reset, Cancel", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    jQueryTrigger: "click",
                    element: "{prefsEditorLoader}.prefsEditor.dom.cancel"
                }, {
                    funcName: "jqUnit.assertDeepEq",
                    args: [
                        "Reset, Cancel: The changes should be removed and preferences restored to last saved state",
                        {
                            expander: {
                                "this": "$",
                                method: "extend",
                                args: [{}, true, "{prefsEditorLoader}.initialModel.preferences", fluid.tests.prefs.models.bwSkin.preferences]
                            }
                        },
                        "{prefsEditorLoader}.prefsEditor.model.preferences"]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Reset, Cancel", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    // Reset, Save
                    jQueryTrigger: "click",
                    element: "{prefsEditorLoader}.prefsEditor.dom.reset"
                }, {
                    funcName: "jqUnit.assertDeepEq",
                    args: ["Reset, Save: The preferences should be restored to the initialModel", "{prefsEditorLoader}.initialModel.preferences", "{prefsEditorLoader}.prefsEditor.model.preferences"]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Reset, Save", "{prefsEditorLoader}.prefsEditor", false]
                }, {
                    jQueryTrigger: "click",
                    element: "{prefsEditorLoader}.prefsEditor.dom.save"
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Reset, Save", "{prefsEditorLoader}.prefsEditor", true]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.getSettings",
                    resolve: "jqUnit.assertUndefined",
                    resolveArgs: ["Reset, Save: store should contained the changed prefs", "{arguments}.0.preferences"]
                }]
            }]
        }]
    });

    /*************
     * Auto-save *
     *************/

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.autoSave", {
        gradeNames: ["fluid.tests.prefs.prefsEditorLoader"],
        prefsEditor: {
            autoSave: true
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.autoSave.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            settingStore: {
                type: "fluid.prefs.globalSettingsStore"
            },
            prefsEditorLoader: {
                type: "fluid.tests.prefs.prefsEditorLoader.autoSave",
                container: "#ui-options",
                createOnEvent: "{tester}.events.onTestCaseStart"
            },
            tester: {
                type: "fluid.tests.prefs.prefsEditorLoader.autoSave.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.autoSave.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "PrefsEditor Loader",
            tests: [{
                expect: 4,
                name: "Auto-save",
                sequence: [{
                    event: "{tests prefsEditorLoader}.events.onReady",
                    priority: "last:testing",
                    listener: "jqUnit.assertDeepEq",
                    args: ["Initialization: The prefs in the initialModel and model should match", "{prefsEditorLoader}.prefsEditor.initialModel.preferences", "{prefsEditorLoader}.prefsEditor.model.preferences"]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.getSettings",
                    resolve: "jqUnit.assertUndefined",
                    resolveArgs: ["Initialization: store should be empty to start", "{arguments}.0"]
                }, {
                    // Change, Save
                    funcName: "{prefsEditorLoader}.prefsEditor.applier.change",
                    args: ["", fluid.tests.prefs.models.bwSkin]
                }, {
                    funcName: "fluid.tests.prefs.assertSaved",
                    args: ["Change, Save", "{prefsEditorLoader}.prefsEditor", true]
                }, {
                    task: "{prefsEditorLoader}.prefsEditor.getSettings",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["Change, Save: store should contained the changed prefs", fluid.tests.prefs.models.bwSkin.preferences, "{arguments}.0.preferences"]
                }]
            }]
        }]
    });

    /***********
     * Preview *
     ***********/

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.preview", {
        gradeNames: ["fluid.tests.prefs.prefsEditorLoader"],
        prefsEditor: {
            events: {
                previewReady: null
            },
            components: {
                preview: {
                    type: "fluid.prefs.preview",
                    createOnEvent: "onReady",
                    container: "{prefsEditor}.dom.previewFrame",
                    options: {
                        templateUrl: fluid.tests.prefs.previewTemplateURL,
                        listeners: {
                            "onReady.boilOnPrefsEditorReady": "{prefsEditor}.events.previewReady"
                        }
                    }
                }
            }
        },
        distributeOptions: {
            target: "{that templateLoader}.options",
            record: {
                resources: {
                    prefsEditor: fluid.tests.prefs.templatePrefix + "/FullPreviewPrefsEditor.html"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.preview.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            settingStore: {
                type: "fluid.prefs.globalSettingsStore"
            },
            prefsEditorLoader: {
                type: "fluid.tests.prefs.prefsEditorLoader.preview",
                container: "#ui-options",
                createOnEvent: "{tester}.events.onTestCaseStart"
            },
            tester: {
                type: "fluid.tests.prefs.prefsEditorLoader.preview.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.preview.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "PrefsEditor Loader",
            tests: [{
                expect: 1,
                name: "Preview",
                sequence: [{
                    event: "{tests prefsEditorLoader prefsEditor}.events.previewReady",
                    priority: "last:testing",
                    listener: "fluid.tests.prefs.prefsEditorLoader.preview.tester.assertPreviewURL",
                    args: ["{prefsEditorLoader}.prefsEditor"]
                }]
            }]
        }]
    });

    fluid.tests.prefs.prefsEditorLoader.preview.tester.assertPreviewURL = function (prefsEditor) {
        jqUnit.assertEquals("The preview iFrame is pointing to the specified markup", fluid.tests.prefs.previewTemplateURL, prefsEditor.preview.container.attr("src"));
    };

    /**********
     * Locale *
     **********/

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.locale", {
        gradeNames: ["fluid.tests.prefs.prefsEditorLoader"],
        defaultLocale: "en",
        messagePrefix: "../data/",
        distributeOptions: {
            record: {
                preferences: {
                    locale: "fr"
                }
            },
            target: "{prefsEditorLoader}.options.members.initialModel"
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.locale.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            settingStore: {
                type: "fluid.prefs.globalSettingsStore"
            },
            prefsEditorLoader: {
                type: "fluid.tests.prefs.prefsEditorLoader.locale",
                container: "#ui-options",
                createOnEvent: "{tester}.events.onTestCaseStart"
            },
            tester: {
                type: "fluid.tests.prefs.prefsEditorLoader.locale.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.prefsEditorLoader.locale.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "PrefsEditor Loader",
            tests: [{
                expect: 5,
                name: "Auto-save",
                sequence: [{
                    event: "{tests prefsEditorLoader}.events.onReady",
                    priority: "last:testing",
                    listener: "fluid.tests.prefs.prefsEditorLoader.locale.tester.assertLocale",
                    args: ["{prefsEditorLoader}", "fr", "en"]
                }]
            }]
        }]
    });

    fluid.tests.prefs.prefsEditorLoader.locale.tester.assertLocale = function (prefsEditorLoader, locale, defaultLocale) {
        jqUnit.assertEquals("The locale value in the initial model has been set properly", locale, prefsEditorLoader.initialModel.preferences.locale);
        jqUnit.assertEquals("The locale value in the settings has been set properly", locale, prefsEditorLoader.settings.preferences.locale);
        jqUnit.assertEquals("The locale value in the initial model has been passed to the prefs editor", locale, prefsEditorLoader.prefsEditor.initialModel.preferences.locale);
        jqUnit.assertEquals("The default locale value in the message loader has been set properly", defaultLocale, prefsEditorLoader.messageLoader.options.defaultLocale);
        jqUnit.assertEquals("The locale value in the message loader has been set properly", locale, prefsEditorLoader.messageLoader.options.locale);
    };

    fluid.test.runTests([
        "fluid.tests.prefs.prefsEditorLoader.tests",
        "fluid.tests.prefs.prefsEditorLoader.customInitModel.tests",
        "fluid.tests.prefs.prefsEditorLoader.integration.tests",
        "fluid.tests.prefs.prefsEditorLoader.autoSave.tests",
        "fluid.tests.prefs.prefsEditorLoader.preview.tests",
        "fluid.tests.prefs.prefsEditorLoader.locale.tests"
    ]);

})(jQuery);
