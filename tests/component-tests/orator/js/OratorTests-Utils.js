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

/* global fluid, jqUnit, sinon */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.orator");

    /*******************************************************************************
     * Grade to add the MockTTS
     *
     * Currently this needs to be added to the environment instead of the DOM Reader.
     * After FLUID-6148 ( https://issues.fluidproject.org/browse/FLUID-6148 )
     * has been addressed it should be possible to place this back as a grade of the
     * DOM Reader under test and to remove the `ttsID` member that is used to force
     * its evaluation.
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator.mockTTS", {
        members: {
            // this is just to force the evaluation of the tts subcomponent.
            ttsID: "{tts}.id"
        },
        components: {
            tts: {
                type: "fluid.textToSpeech",
                options: {
                    gradeNames: ["fluid.mock.textToSpeech"],
                    listeners: {
                        "{mockTTS}.events.onDestroy": {
                            listener: "{that}.destroy",
                            namespace: "destroy"
                        }
                    }
                }
            }
        }
    });

    /*******************************************************************************
     * Sinon Stub Utils
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator.stubs", {
        members: {
            stubs: {}
        }
    });

    fluid.defaults("fluid.tests.orator.domReaderStubs", {
        gradeNames: ["fluid.tests.orator.stubs"],
        methods: ["play", "pause"],
        listeners: {
            "onCreate.addSpies": {
                funcName: "fluid.tests.orator.addStubs",
                priority: "first",
                args: ["{that}.stubs", "{that}", "{that}.options.methods"]
            }
        }
    });

    fluid.tests.orator.addStub = function (stubs, object, method) {
        stubs[method] = sinon.stub(object, method);
    };

    fluid.tests.orator.addStubs = function (stubs, object, methods) {
        methods = fluid.makeArray(methods);
        fluid.each(methods, function (method) {
            fluid.tests.orator.addStub(stubs, object, method);
        });
    };

    fluid.tests.orator.restoreStubs = function (stubs, methods) {
        methods = fluid.makeArray(methods);
        fluid.each(methods, function (method) {
            stubs[method].restore();
        });
    };

    fluid.tests.orator.resetStubs = function (stubs, methods) {
        methods = fluid.makeArray(methods);
        fluid.each(methods, function (method) {
            stubs[method].resetHistory();
        });
    };

    fluid.tests.orator.createSandbox = function (config) {
        return sinon.createSandbox(config);
    };

    /*******************************************************************************
     * Selection Helpers
     *******************************************************************************/

    fluid.registerNamespace("fluid.tests.orator.selection");

    fluid.tests.orator.selection.selectNode = function (node) {
        node = fluid.unwrap(node);
        var range = document.createRange();
        var selection = window.getSelection();

        range.selectNode(node);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    fluid.tests.orator.selection.collapse = function () {
        var selection = window.getSelection();
        selection.removeAllRanges();
    };

    /*******************************************************************************
     * Assertions
     *******************************************************************************/

    fluid.tests.orator.verifyControllerState = function (controller, state) {
        var toggleButton = controller.locate("playToggle");
        jqUnit.assertEquals("The model state should be set correctly", state, controller.model.playing);
        jqUnit.assertEquals("The playing class should only be added if playing is true", state, toggleButton.hasClass(controller.options.styles.play));

        var expectedLabel = state ? "pause" : "play";
        jqUnit.assertEquals("The aria-label should be set correctly", controller.options.strings[expectedLabel], toggleButton.attr("aria-label"));
    };

    fluid.tests.orator.verifySelectionState = function (that, testPrefix, expectedModel) {
        jqUnit.assertDeepEq(testPrefix + ": The model should be set correctly.", expectedModel, that.model);

        if (expectedModel.showUI) {
            jqUnit.assertNodeExists(testPrefix + ": The selection control should be present", that.options.selectors.control);

            var expectedText = that.options.strings[that.model.play ? "stop" : "play"];
            jqUnit.assertEquals(testPrefix + ": The selection control label should have the correct text", expectedText, that.locate("controlLabel").text());
        } else {
            jqUnit.assertNodeNotExists(testPrefix + ": The selection control should not be present", that.options.selectors.control);
        }
    };

    fluid.tests.orator.verifyState = function (orator, testPrefix, state) {
        jqUnit.assertEquals(testPrefix + ": The orator's \"play\" model value should be set correctly", state, orator.model.play);
        fluid.tests.orator.verifyControllerState(orator.controller, state);

        if (state) {
            jqUnit.assertTrue(testPrefix + ": The domReaders's \"play\" method should have been called", orator.domReader.stubs.play.called);
            jqUnit.assertFalse(testPrefix + ": The domReaders's \"pause\" method should not have been called", orator.domReader.stubs.pause.called);
        } else {
            jqUnit.assertFalse(testPrefix + ": The domReaders's \"play\" method should not have been called", orator.domReader.stubs.play.called);
            jqUnit.assertTrue(testPrefix + ": The domReaders's \"pause\" method should have been called", orator.domReader.stubs.pause.called);
        }

        fluid.tests.orator.resetStubs(orator.domReader.stubs, ["play", "pause"]);
    };
})(jQuery);
