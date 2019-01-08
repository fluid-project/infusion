/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        jqUnit.module("Progress Tests (Defaults)");
        var text = "test text";

        var progressELPaths = {
            listenersShowText:   "listeners.onProgressBegin",
            listenersHiddenText: "listeners.afterProgressHidden",
            showAnimationText:   "showAnimation.onProgressBegin",
            hiddenAnimationText: "hideAnimation.afterProgressHidden"
        };

        // common steps for the progress
        var progressCommonSteps = function (options) {
            // create a new progress bar with defaults
            var progressBar = fluid.progress("#progress-container", options);

            jqUnit.notVisible("Before update, ensure default progress bar is not visible",
                ".flc-progress");

            // show the progress widget, override animation
            progressBar.show();
            jqUnit.isVisible("After show, ensure default progress bar is visible",
                ".flc-progress");
            jqUnit.assertEquals("After show, expected minimal default indicator width of " + progressBar.options.minWidth + "px; actual ",
                progressBar.options.minWidth, progressBar.indicator.width());

            // hide the progress widget, pass 0 delay and false animation,
            progressBar.hide(0);
        };

        var myProgressHide = function (str) {
            jqUnit.notVisible(str + ": After progress hides the afterProgressHidden event gets fired, ensure default progress bar is not visible", ".flc-progress");
        };

        var myProgressShow = function (str) {
            jqUnit.isVisible(str + ": After progress is shown onProgressBegin event gets fired, ensure default progress bar is visible", ".flc-progress");
        };

        var assembleOptions = function (ELPath, callback, options, stopStart) {
            var obj = options || {
                speed: 0
            };

            fluid.set(obj, ELPath, function () {
                callback(ELPath);
                if (!stopStart) {
                    jqUnit.start();
                }
            });
            return obj;
        };

        // progress test with multiple events
        var progressEventTestMultiple = function (ELPath, ELPathSecond, callback) {
            var options = assembleOptions(ELPath, callback);
            var optionConcat = assembleOptions(ELPathSecond, callback, options, true);
            progressCommonSteps(optionConcat);
        };

        // progress test with single event
        var progressEventTest = function (ELPath, callback) {
            var options = assembleOptions(ELPath, callback);
            progressCommonSteps(options);
        };

        // 1
        jqUnit.test("Initialization", function () {
            // create a new progress bar with defaults
            fluid.progress("#progress-container");
            // 1.1
            jqUnit.notVisible("Before update, ensure default progress bar is not visible",
                    ".flc-progress");
            // 1.2
            jqUnit.assertNodeNotExists("Before update, ensure update text doesn't exist",
                         ":contains(" + text + ")");
        });

        // 2
        jqUnit.test("Show and Hide", function () {
            // create a new progress bar with defaults
            var progressBar = fluid.progress("#progress-container");
            // 2.1
            jqUnit.notVisible("Before update, ensure default progress bar is not visible",
                ".flc-progress");
            // show the progress widget, override animation
            progressBar.show(false);
            // 2.2
            jqUnit.isVisible("After show, ensure default progress bar is visible",
                ".flc-progress");
            // 2.3
            jqUnit.assertEquals("After show, expected minimal default indicator width of " + progressBar.options.minWidth + "px; actual ",
                progressBar.options.minWidth, progressBar.indicator.width());
            // hide the progress widget, pass 0 delay and false animation,
            progressBar.hide(0, false);
            // 2.4
            jqUnit.notVisible("After hide, ensure default progress bar is not visible",
                    ".flc-progress");
        });

        // 3
        jqUnit.test("Update percent", function () {
            var progressBar = fluid.progress("#progress-container");

            // update with just number
            progressBar.update(50);
            // 3.1
            jqUnit.isVisible("After update, ensure default progress bar is visible", ".flc-progress");
            // 3.2
            jqUnit.assertNodeNotExists("After update with out text, ensure update text doesn't exist",
                             ":contains(" + text + ")");
            // don't test widths here because the animate function will make them fail
        });

        // 4
        jqUnit.test("Update text", function () {
            var progressBar = fluid.progress("#progress-container");

            // update with just text
            progressBar.update(null, text);
            // 4.1
            jqUnit.isVisible("After update, ensure default progress bar is visible",
                ".flc-progress");
            // 4.2
            jqUnit.assertNodeExists("After update with out percentage, ensure the new text exists",
                 ":contains(" + text + ")");
            // 4.3
            jqUnit.assertEquals("We didn't update the percent so the indicator width should still be at the minimum default width of " + progressBar.options.minWidth + "px; actual ",
                progressBar.options.minWidth, progressBar.indicator.width());
            // update the text again, and make sure it changed.
            var newText = "hello test!";
            progressBar.update(null, newText);
            // 4.4
            jqUnit.assertNodeExists("New text with out a percentage update, ensure the new text exists",
                 ":contains(" + newText + ")");
            // 4.5
            // update with null text. It should be the same.
            progressBar.update(null, null);
            jqUnit.assertNodeExists("After update with null text, ensure the old text remains",
                 ":contains(" + newText + ")");
            // 4.6
            // update with undefined text
            progressBar.update(null);
            jqUnit.assertNodeExists("After updating the Progressor with out label text defined, the label should be unchanged",
                 ":contains(" + newText + ")");
            // 4.7
            // update with empty text
            progressBar.update(null, "");
            jqUnit.assertTrue("After updating text with an empty string, the label should be empty",
                 progressBar.label.text() === "");
            // 4.8
            // update with string template
            progressBar.update(10, "%percentComplete% Complete");
            jqUnit.assertTrue("After updating text with an string template, the label should include the rendered temlpate",
                 progressBar.label.text() === "10% Complete");
        });

        jqUnit.module("Progress Tests (No animation)");

        // 5
        jqUnit.test("Update percent by number, null and zero", function () {
            var progressBar = fluid.progress("#progress-container", {animate: "none"});
            var updateNum = 50;
            // update with just a number
            progressBar.update(updateNum);
            // 5.1
            jqUnit.isVisible("After update, ensure default progress bar is visible",
                ".flc-progress");
            // 5.2
            jqUnit.assertTrue("After updating only pixels the label should still be empty",
                 progressBar.label.text() === "");
            // 5.3
            jqUnit.assertFalse("After update, width of indicator should no longer be 5px",
                progressBar.indicator.width() === 5);
            // 5.4
            jqUnit.assertEquals("After update of the number 50, width of indicator should be",
                  updateNum, progressBar.indicator.width());
            // update with null
            progressBar.update(null);
             // 5.5
            jqUnit.assertEquals("After update with percent = null, indicator should still be",
                  updateNum, progressBar.indicator.width());
            // update with 0
            progressBar.update(0);
             // 5.6
            jqUnit.assertEquals("After update with percent = 0, width of indicator should be the default minimum width",
                progressBar.options.minWidth, progressBar.indicator.width());
        });

        // 6
        jqUnit.test("Update percent by number as string", function () {
            var updateString = "50";
            var numericEquivalent = 50;
            var progressBar = fluid.progress("#progress-container", {animate: "none"});
            // update with just a string
            progressBar.update(updateString);
            // 6.1
            jqUnit.isVisible("After update, ensure default progress bar is visible",
                    ".flc-progress");
            // 6.2
            jqUnit.assertTrue("After updating only pixels the label should still be empty",
                progressBar.label.text() === "");
            // 6.3
            jqUnit.assertFalse("After update, width of indicator should no longer be the default min length of " + progressBar.options.minWidth,
                progressBar.indicator.width() === progressBar.options.minWidth);
            // 6.4
            jqUnit.assertTrue("After update, width of indicator should be " + updateString,
                  numericEquivalent, progressBar.indicator.width());
        });

        // 7
        jqUnit.test("Update percent by string with leading number", function () {
            var updateString = "50%";
            var numericEquivalent = 50;
            var progressBar = fluid.progress("#progress-container", {animate: "none"});

            // update with just a number
            progressBar.update(updateString);
            // 7.1
            jqUnit.isVisible("After update, ensure default progress bar is visible", ".flc-progress");
            // 7.2
            jqUnit.assertTrue("After updating only pixels the label should still be empty",
                progressBar.label.text() === "");
            // 7.3
            jqUnit.assertFalse("After update, width of indicator should no longer be the the default min length of " + progressBar.options.minWidth,
                progressBar.indicator.width() === progressBar.options.minWidth);
            // 7.4
            jqUnit.assertEquals("After update with percent = '" + updateString + "', width of indicator should be",
                numericEquivalent, progressBar.indicator.width());
        });

        // 8
        jqUnit.test("Update text after percent", function () {
            var progressBar = fluid.progress("#progress-container", {animate: "none"});

            // update with just percentage
            progressBar.update(50);
            // 8.1
            jqUnit.isVisible("After update, ensure default progress bar is visible", ".flc-progress");
            // 8.2
            jqUnit.assertTrue("After updating only text the label should still be empty",
                progressBar.label.text() === "");
            // 8.3
            jqUnit.assertFalse("After update, width of indicator should no longer be 5px",
                  progressBar.indicator.width() === 5);
            // 8.4
            jqUnit.assertTrue("After update, width of indicator should be 50px",
                progressBar.indicator.width() === 50);
            // update with just percentage
            progressBar.update(null, text);
            // 8.5
            jqUnit.assertTrue("After updating only text the label should be: '" + text + "'",
                 progressBar.label.text() === text);
            // 8.6
            jqUnit.assertTrue("and width should still only be 50px",
                 progressBar.indicator.width() === 50);
        });

        jqUnit.module("Progress Tests (Other Defaults)");

        // 9
        jqUnit.test("Min width = 0", function () {
            var progressBar = fluid.progress("#progress-container", {animate: "none", minWidth: 0});

            // show but don't update
            progressBar.show();
            // 9.1
            jqUnit.isVisible("After show, ensure default progress bar is visible", ".flc-progress");
            // 9.2
            jqUnit.assertTrue("After show, expected indicator width: 0; actual: " + progressBar.indicator.width(),
                  progressBar.indicator.width() === 0);
            // update with just percentage
            progressBar.update(50);
            // 9.3
            jqUnit.assertTrue("After update to 50, expected indicator width: 50; actual: " + progressBar.indicator.width(),
                progressBar.indicator.width() === 50);
            // update with just percentage
            progressBar.update(0);
            // 9.4
            jqUnit.assertTrue("After update to 0, expected indicator width: 0; actual: " + progressBar.indicator.width(),
                progressBar.indicator.width() === 0);
        });

        jqUnit.module("Progress Tests (ARIA)");

        jqUnit.test("ARIA initialization", function () {
            var ARIAcontainer = $(".flc-progress-bar");

            jqUnit.assertFalse("Before init: role should not exist", ARIAcontainer.attr("role"));
            jqUnit.assertFalse("Before init: valuemin should not exist", ARIAcontainer.attr("aria-valuemin"));
            jqUnit.assertFalse("Before init: valuemax should not exist", ARIAcontainer.attr("aria-valuemax"));
            jqUnit.assertFalse("Before init: valuenow should not exist", ARIAcontainer.attr("aria-valuenow"));
            jqUnit.assertFalse("Before init: busy should not exist", ARIAcontainer.attr("aria-busy"));

            fluid.progress("#progress-container", {animate: "none"});

            jqUnit.assertEquals("After Init: role should be ", "progressbar", ARIAcontainer.attr("role"));
            jqUnit.assertEquals("After Init: valuemin should be ", "0", ARIAcontainer.attr("aria-valuemin"));
            jqUnit.assertEquals("After Init: valuemax should be ", "100", ARIAcontainer.attr("aria-valuemax"));
            jqUnit.assertEquals("After Init: valuenow should be ", "0", ARIAcontainer.attr("aria-valuenow"));
            jqUnit.assertEquals("After Init: busy should be ", "false", ARIAcontainer.attr("aria-busy"));

        });

        // 11
        jqUnit.test("ARIA Numeric update", function () {
            var updateValue, busyVal;
            var ARIAcontainer = $(".flc-progress-bar");
            var progressBar = fluid.progress("#progress-container", {animate: "none"});

            jqUnit.assertEquals("Start: busy should be ", "false", ARIAcontainer.attr("aria-busy"));
            jqUnit.assertEquals("Start: valuenow should be ", "0", ARIAcontainer.attr("aria-valuenow"));

            updateValue = 10;
            progressBar.update(updateValue);

            busyVal = ARIAcontainer.attr("aria-busy");
            jqUnit.assertTrue("Working: busy should be true", busyVal === "true" || busyVal === true);
            jqUnit.assertEquals("Working: valuenow should be ", updateValue, +ARIAcontainer.attr("aria-valuenow"));

            updateValue = 50;
            progressBar.update(updateValue);

            busyVal = ARIAcontainer.attr("aria-busy");
            jqUnit.assertTrue("Working: busy should be true", busyVal === "true" || busyVal === true);
            jqUnit.assertEquals("Working: valuenow should be ", updateValue, +ARIAcontainer.attr("aria-valuenow"));

            updateValue = 100;
            progressBar.update(updateValue);

            busyVal = ARIAcontainer.attr("aria-busy");
            jqUnit.assertTrue("Done: busy should be false", busyVal === "false" || !busyVal);
            jqUnit.assertEquals("Done: valuenow should be ", updateValue, +ARIAcontainer.attr("aria-valuenow"));
        });


        // 12
        jqUnit.test("ARIA Text update", function () {
            var updateValue;
            var ARIAcontainer = $(".flc-progress-bar");
            var customDoneText = "Upload is fini.";
            var customBusyTemplate = "Progress equals %percentComplete";

            var progressBar = fluid.progress("#progress-container", {
                animate: "none",
                strings: {
                    ariaBusyText: customBusyTemplate,
                    ariaDoneText: customDoneText
                }
            });

            jqUnit.assertEquals("Start: busy should be ", "false", ARIAcontainer.attr("aria-busy"));
            jqUnit.assertEquals("Start: valuenow should be ", "0", ARIAcontainer.attr("aria-valuenow"));

            updateValue = 0;
            progressBar.update(updateValue, "Some Text");
            jqUnit.assertEquals("Working: valuetext should still read ", "", ARIAcontainer.attr("aria-valuetext"));

            updateValue = 10;
            progressBar.update(updateValue, "Some Text");
            jqUnit.assertEquals("Working: valuetext should read ", "Progress equals 10", ARIAcontainer.attr("aria-valuetext"));

            updateValue = 100;
            progressBar.update(updateValue, "Some Text");
            jqUnit.assertEquals("Working: valuetext should read ", customDoneText, ARIAcontainer.attr("aria-valuetext"));
        });

        // 13
        jqUnit.test("Changing the aria-valuetext to empty string ", function () {
            var ARIAcontainer = $(".flc-progress-bar");

            var options = {
                strings: {
                    ariaBusyText: ""
                }
            };

            var progressBar = fluid.progress("#progress-container", options);

            //during page load aria-valuetext is set to empty string
            jqUnit.assertEquals("Initialize ariaBusyText to empty string and aria-valuetext should be missing ", undefined, ARIAcontainer.attr("aria-valuetext"));

            //update the progress
            progressBar.update(10);

            //aria-valuetext attribute should be missing due to setting ariaBusyText property to empty string
            jqUnit.assertEquals("After updating progress the aria-valuetext should still be missing and the result should be undefined ", undefined, ARIAcontainer.attr("aria-valuetext"));
        });

        // 14
        jqUnit.asyncTest("Using listeners object progress component fires event after the progress hides ", function () {
            jqUnit.expect(4);
            progressEventTest(progressELPaths.listenersHiddenText, myProgressHide);
        });

        // 15
        jqUnit.asyncTest("Using listeners object progress component fires event after the progress is shown ", function () {
            jqUnit.expect(4);
            progressEventTest(progressELPaths.listenersShowText, myProgressShow);
        });

        // 16
        jqUnit.asyncTest("Using hideAnimation object in progress component fires event after the progress hides ", function () {
            jqUnit.expect(4);
            progressEventTest(progressELPaths.hiddenAnimationText, myProgressHide);
        });

        // 17
        jqUnit.asyncTest("Using showAnimation object in progress component fires event after the progress is shown ", function () {
            jqUnit.expect(4);
            progressEventTest(progressELPaths.showAnimationText, myProgressShow);
        });

        // 18
        jqUnit.asyncTest("Using hideAnimation and listener objects in progress component fires event after the progress hides ", function () {
            jqUnit.expect(5);
            progressEventTestMultiple(progressELPaths.listenersHiddenText, progressELPaths.hiddenAnimationText, myProgressHide);
        });

        //19
        jqUnit.asyncTest("Using showAnimation and listener objects in progress component fires event after the progress is shown ", function () {
            jqUnit.expect(5);
            progressEventTestMultiple(progressELPaths.listenersShowText, progressELPaths.showAnimationText, myProgressShow);
        });

    });
})(jQuery);
