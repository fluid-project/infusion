/*
Copyright 2015-2018 OCAD University

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
     * Sinon Spy Utils
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator.domReaderMockTTS", {
        components: {
            tts: {
                type: "fluid.mock.textToSpeech",
                options: {
                    invokers: {
                        // put back the orator's own queueSpeech method, but pass in the
                        // mock queueSpeech function as the speechFn
                        queueSpeech: {
                            funcName: "fluid.orator.domReader.queueSpeech",
                            args: ["{that}", "{that}.mockQueueSpeech", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                        },
                        mockQueueSpeech: {
                            funcName: "fluid.mock.textToSpeech.queueSpeech",
                            args: ["{arguments}.0", "{that}.speechRecord", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
                        }
                    }
                }
            }
        }
    });

    /*******************************************************************************
     * Sinon Spy Utils
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator.spies", {
        members: {
            spies: {}
        }
    });

    fluid.defaults("fluid.tests.orator.domReaderSpies", {
        gradeNames: ["fluid.tests.orator.spies"],
        methods: ["play", "pause"],
        listeners: {
            "onCreate.addSpies": {
                funcName: "fluid.tests.orator.addSpies",
                args: ["{that}.spies", "{that}", "{that}.options.methods"]
            },
            "onDestroy.restore": {
                funcName: "fluid.tests.orator.restoreSpies",
                args: ["{that}.spies", "{that}.options.methods"]
            }
        }
    });

    fluid.tests.orator.addSpy = function (spies, object, method) {
        spies[method] = sinon.spy(object, method);
    };

    fluid.tests.orator.addSpies = function (spies, object, methods) {
        methods = fluid.makeArray(methods);
        fluid.each(methods, function (method) {
            fluid.tests.orator.addSpy(spies, object, method);
        });
    };

    fluid.tests.orator.restoreSpies = function (spies, methods) {
        methods = fluid.makeArray(methods);
        fluid.each(methods, function (method) {
            spies[method].restore();
        });
    };

    fluid.tests.orator.resetSpies = function (spies, methods) {
        methods = fluid.makeArray(methods);
        fluid.each(methods, function (method) {
            spies[method].resetHistory();
        });
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

    fluid.tests.orator.verifyState = function (orator, testPrefix, state) {
        jqUnit.assertEquals(testPrefix + ": The orator's \"enabled\" model value should be set correctly", state, orator.model.enabled);
        fluid.tests.orator.verifyControllerState(orator.controller, state);

        if (state) {
            jqUnit.assertTrue(testPrefix + ": The domReaders's \"play\" method should have been called", orator.domReader.spies.play.called);
            jqUnit.assertFalse(testPrefix + ": The domReaders's \"pause\" method should not have been called", orator.domReader.spies.pause.called);
        } else {
            jqUnit.assertFalse(testPrefix + ": The domReaders's \"play\" method should not have been called", orator.domReader.spies.play.called);
            jqUnit.assertTrue(testPrefix + ": The domReaders's \"pause\" method should have been called", orator.domReader.spies.pause.called);
        }

        fluid.tests.orator.resetSpies(orator.domReader.spies, ["play", "pause"]);
    };
})(jQuery);
