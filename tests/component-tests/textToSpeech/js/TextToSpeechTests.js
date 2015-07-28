/*
Copyright 2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

// Declare dependencies
/* global fluid, jqUnit, speechSynthesis */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.textToSpeech", {
        gradeNames: ["fluid.textToSpeech", "autoInit"],
        model: {
            utteranceOpts: {
                // not all speech synthesizers will respect this setting
                volume: 0
            }
        },
        listeners: {
            "onCreate.cleanUp": "fluid.tests.textToSpeech.cleanUp"
        }
    });

    fluid.tests.textToSpeech.cleanUp = function () {
        speechSynthesis.cancel();
    };

    fluid.defaults("fluid.tests.textToSpeech.startStop", {
        gradeNames: ["fluid.tests.textToSpeech", "autoInit"],
        listeners: {
            "onStart.test": {
                listener: function (that) {
                    jqUnit.assert("The onStart event should have fired");
                    jqUnit.assertTrue("Should be speaking", that.model.speaking);
                    jqUnit.assertFalse("Nothing should be pending", that.model.pending);
                    jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
                    jqUnit.assertDeepEq("The queue should be empty", [], that.queue);
                },
                args: ["{that}"]
            },
            "onStop.test": {
                listener: function (that) {
                    jqUnit.assert("The onStop event should have fired");
                    jqUnit.assertFalse("Should not be speaking", that.model.speaking);
                    jqUnit.assertFalse("Nothing should be pending", that.model.pending);
                    jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
                    jqUnit.assertDeepEq("The queue should be empty", [], that.queue);
                    that.cancel();
                    jqUnit.start();
                },
                args: ["{that}"]
            }
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.pauseResume", {
        gradeNames: ["fluid.tests.textToSpeech", "autoInit"],
        listeners: {
            "onStart.pause": {
                listener: "{that}.pause"
            },
            "onPause.test": {
                listener: function (that) {
                    that.wasPaused = true;
                    jqUnit.assert("The pause event should have fired");
                    jqUnit.assertTrue("Should be speaking", that.model.speaking);
                    jqUnit.assertFalse("Nothing should be pending", that.model.pending);
                    jqUnit.assertTrue("Should be paused", that.model.paused);
                    that.resume();
                },
                args: ["{that}"]
            },
            "onResume.test": {
                listener: function (that) {
                    jqUnit.assert("The resume event should have fired");
                    jqUnit.assertTrue("Should be speaking", that.model.speaking);
                    jqUnit.assertFalse("Nothing should be pending", that.model.pending);
                    jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
                },
                args: ["{that}"]
            },
            "onStop.end": {
                listener: function (that) {
                    that.cancel();
                    jqUnit.start();
                },
                args: ["{that}"]
            }
        }
    });

    // only run the tests in browsers that support the Web Speech API for speech synthesis

    fluid.tests.textToSpeech.runNoTTSTests = function () {
        jqUnit.test("No Tests Run: No TTS Support", function () {
            jqUnit.assert("Does not support SpeechSynthesis");
        });
    };

    fluid.tests.textToSpeech.runTTSTests = function () {
        jqUnit.test("Initialization", function () {
            var that = fluid.tests.textToSpeech();

            jqUnit.assertTrue("The Text to Speech component should have initialized", that);
            jqUnit.assertFalse("Nothing should be speaking", that.model.speaking);
            jqUnit.assertFalse("Nothing should be pending", that.model.pending);
            jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
        });

        jqUnit.asyncTest("Start and Stop Events", function () {
            jqUnit.expect(10);
            var that = fluid.tests.textToSpeech.startStop();
            that.queueSpeech("Testing start and end events");
        });

        // Chrome doesn't properly support pause which causes this test to break.
        // see: https://code.google.com/p/chromium/issues/detail?id=425553&q=SpeechSynthesis&colspec=ID%20Pri%20M%20Week%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified
        if (!window.chrome) {

            jqUnit.asyncTest("Pause and Resume Events", function () {
                jqUnit.expect(8);
                var that = fluid.tests.textToSpeech.pauseResume();
                that.queueSpeech("Testing pause and resume events");
            });
        }
    };

    var runTests = fluid.textToSpeech.checkTTSSupport();
    runTests.then(fluid.tests.textToSpeech.runTTSTests, fluid.tests.textToSpeech.runNoTTSTests);
})();
