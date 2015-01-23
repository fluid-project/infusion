/*
Copyright 2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

// Declare dependencies
/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.textToSpeech", {
        gradeNames: ["fluid.textToSpeech", "autoInit"],
        utteranceOpts: {
            volume: 0
        }
    });

    jqUnit.test("Initialization", function () {
        var that = fluid.tests.textToSpeech();

        jqUnit.assertTrue("The Text to Speech component should have initialized", that);
        jqUnit.assertFalse("Nothing should be speaking", that.isSpeaking());
        jqUnit.assertFalse("Nothing should be pending", that.isPending());
        jqUnit.assertFalse("Shouldn't be paused", that.isPaused());
    });

    jqUnit.asyncTest("Start and Stop Events", function () {
        jqUnit.expect(8);
        var that = fluid.tests.textToSpeech({
            listeners: {
                start: {
                    listener: function (that) {
                        jqUnit.assert("The start event should have fired");
                        jqUnit.assertTrue("Should be speaking", that.isSpeaking());
                        jqUnit.assertFalse("Nothing should be pending", that.isPending());
                        jqUnit.assertFalse("Shouldn't be paused", that.isPaused());
                    },
                    args: ["{that}"]
                },
                end: {
                    listener: function (that) {
                        jqUnit.assert("The end event should have fired");
                        jqUnit.assertFalse("Nothing should be speaking", that.isSpeaking());
                        jqUnit.assertFalse("Nothing should be pending", that.isPending());
                        jqUnit.assertFalse("Shouldn't be paused", that.isPaused());
                        jqUnit.start();
                    },
                    args: ["{that}"]
                }
            }
        });

        that.speak("Testing start and end events");
    });

    jqUnit.asyncTest("Pause and Resume Events", function () {
        jqUnit.expect(8);
        var wasPaused = false;
        var that = fluid.tests.textToSpeech({
            listeners: {
                start: {
                    listener: function (that) {
                        if (!wasPaused) {
                            that.pause();
                        }
                    },
                    args: ["{that}"]
                },
                pause: {
                    listener: function (that) {
                        wasPaused = true;
                        jqUnit.assert("The pause event should have fired");
                        jqUnit.assertTrue("Should be speaking", that.isSpeaking());
                        jqUnit.assertFalse("Nothing should be pending", that.isPending());
                        jqUnit.assertTrue("Should be paused", that.isPaused());
                        that.resume();
                    },
                    args: ["{that}"]
                },
                resume: {
                    listener: function (that) {
                        jqUnit.assert("The resume event should have fired");
                        jqUnit.assertTrue("Should be speaking", that.isSpeaking());
                        jqUnit.assertFalse("Nothing should be pending", that.isPending());
                        jqUnit.assertFalse("Shouldn't be paused", that.isPaused());
                    },
                    args: ["{that}"]
                },
                end: jqUnit.start
            }
        });

        that.speak("Testing pause and resume events");
    });
})();
