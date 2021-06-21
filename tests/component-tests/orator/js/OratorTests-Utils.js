/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */

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
        components: {
            tts: {
                type: "fluid.textToSpeech",
                options: {
                    gradeNames: ["fluid.mock.textToSpeech"]
                }
            }
        }
    });

    fluid.defaults("fluid.tests.orator.domReaderRecorder", {
        members: {
            fired: {
                play: false,
                pause: false,
                readFromDOM: false
            }
        },
        listeners: {
            play:  "fluid.tests.orator.recordFired({that}.fired, play)",
            pause: "fluid.tests.orator.recordFired({that}.fired, pause)",
            readFromDOM: "fluid.tests.orator.recordFired({that}.fired, readFromDOM)"
        }
    });

    fluid.tests.orator.clearFired = function (fired) {
        fired.play = false;
        fired.pause = false;
        fired.readFromDOM = false;
    };

    fluid.tests.orator.recordFired = function (fired, which) {
        fired[which] = true;
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

    fluid.tests.orator.selection.selectNodes = function (startNode, endNode, startOffset, endOffset) {
        var range = document.createRange();
        var selection = window.getSelection();

        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    fluid.tests.orator.selection.collapse = function () {
        var selection = window.getSelection();
        selection.removeAllRanges();
    };

    fluid.tests.orator.selection.getSelectionRange = function () {
        return window.getSelection().getRangeAt(0);
    };

    /*******************************************************************************
     * Assertions
     *******************************************************************************/

    // assert that the element is actually in the document, not detached
    fluid.tests.orator.assertNodeInDOM = function (msg, elm) {
        jqUnit.okWithPrefix($.contains(document, fluid.unwrap(elm)), msg);
    };

    // assert that the element is not in the document, may be detached
    fluid.tests.orator.assertNodeNotInDOM = function (msg, elm) {
        jqUnit.okWithPrefix(!$.contains(document, fluid.unwrap(elm)), msg);
    };

    fluid.tests.orator.verifyControllerState = function (controller, state) {
        var toggleButton = controller.locate("playToggle");
        jqUnit.assertEquals("The model state should be set correctly", state, controller.model.playing);
        jqUnit.assertEquals("The playing class should only be added if playing is true", state, toggleButton.hasClass(controller.options.styles.play));

        var expectedLabel = state ? "pause" : "play";
        jqUnit.assertEquals("The aria-label should be set correctly", controller.options.strings[expectedLabel], toggleButton.attr("aria-label"));
    };

    fluid.tests.orator.verifySelectionState = function (that, testPrefix, expectedModel) {
        jqUnit.assertDeepEq(testPrefix + ": The model should be set correctly.", expectedModel, that.model);

        if (expectedModel.text) {
            fluid.tests.orator.assertNodeInDOM(testPrefix + ": The selection control should be present", that.control);
            jqUnit.assertFalse(testPrefix + ": The selection control should not be hidden", that.control.prop("hidden"));

            var expectedText = that.options.strings[that.model.play ? "stop" : "play"];
            var labelText = that.control.find(that.options.selectors.controlLabel).text();
            jqUnit.assertEquals(testPrefix + ": The selection control label should have the correct text", expectedText, labelText);
        } else {
            fluid.tests.orator.assertNodeNotInDOM(testPrefix + ": The selection control should not be present", that.control);
        }
    };

    fluid.tests.orator.verifyState = function (orator, testPrefix, state) {
        jqUnit.assertEquals(testPrefix + ": The orator's \"play\" model value should be set correctly", state, orator.model.play);
        fluid.tests.orator.verifyControllerState(orator.controller, state);

        if (state) {
            jqUnit.assertTrue(testPrefix + ": The domReader's \"play\" method should have been called", orator.domReader.fired.play);
            jqUnit.assertFalse(testPrefix + ": The domReader's \"pause\" method should not have been called", orator.domReader.fired.pause);
        } else {
            jqUnit.assertFalse(testPrefix + ": The domReader's \"play\" method should not have been called", orator.domReader.fired.play);
            jqUnit.assertTrue(testPrefix + ": The domReader's \"pause\" method should have been called", orator.domReader.fired.pause);
        }
        fluid.tests.orator.clearFired(orator.domReader.fired);
    };
})(jQuery);
