/*
Copyright 2008-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, jqUnit, fluid*/
(function ($) {
    
    var createProgressBar = function (containerSelector, options) {
        return fluid.progress(containerSelector, options);
    };
    
    $(document).ready(function () {
        
        var progressTests = new jqUnit.TestCase("Progress Tests (Defaults)");
        var text = "test text";
               
        var options, progressBar;
        
        // 1
        progressTests.test("Initialization", function () {
            
            // create a new progress bar with defaults
            progressBar = createProgressBar("#progress-container");
           
               // 1.1
            jqUnit.notVisible("Before update, ensure default progress bar is not visible", 
                    ".flc-progress");
            // 1.2
            jqUnit.notExists("Before update, ensure update text doesn't exist", 
                         ":contains(" + text + ")");         
        });
        
        // 2
        progressTests.test("Show and Hide", function () {
            
            // create a new progress bar with defaults
            progressBar = createProgressBar("#progress-container");
            
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
        progressTests.test("Update percent", function () {            
            progressBar = createProgressBar("#progress-container");
            
            // update with just number
            progressBar.update(50);
            
            // 3.1
            jqUnit.isVisible("After update, ensure default progress bar is visible", 
                    ".flc-progress");
                    
            // 3.2
            jqUnit.notExists("After update with out text, ensure update text doesn't exist", 
                             ":contains(" + text + ")");
                             
            // don't test widths here because the animate function will make them fail
        });

        // 4
        progressTests.test("Update text", function () {            
            progressBar = createProgressBar("#progress-container");
            
            // update with just text
            progressBar.update(null, text);
            
            // 4.1
            jqUnit.isVisible("After update, ensure default progress bar is visible", 
                ".flc-progress");
            
            // 4.2
            jqUnit.exists("After update with out percentage, ensure the new text exists", 
                 ":contains(" + text + ")");
            
            // 4.3
            jqUnit.assertEquals("We didn't update the percent so the indicator width should still be at the minimum default width of " + progressBar.options.minWidth + "px; actual ", 
                progressBar.options.minWidth, progressBar.indicator.width());

            // update the text again, and make sure it changed.
            var newText = "hello test!";
            progressBar.update(null, newText);
            
            // 4.4
            jqUnit.exists("New text with out a percentage update, ensure the new text exists", 
                 ":contains(" + newText + ")");
                 
            // 4.5
            // update with null text. It should be the same.
            progressBar.update(null, null);
            jqUnit.exists("After update with null text, ensure the old text remains", 
                 ":contains(" + newText + ")");
            
            // 4.6
            // update with undefined text
            progressBar.update(null);
            jqUnit.exists("After updating the Progressor with out label text defined, the label should be unchanged", 
                 ":contains(" + newText + ")");

            // 4.6
            // update with empty text
            progressBar.update(null, "");
            jqUnit.assertTrue("After updating text with an empty string, the label should be empty", 
                 progressBar.label.text() === "");
                 
        });

         
        progressTests = new jqUnit.TestCase("Progress Tests (No animation)");
        
        // 5
        progressTests.test("Update percent by number, null and zero", function () {            
            progressBar = createProgressBar("#progress-container", {animate: "none"});
            
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
        
        progressTests.test("Update percent by number as string", function () {
            
            var updateString = "50";
            var numericEquivalent = 50;
    
            progressBar = createProgressBar("#progress-container", {animate: "none"});
            
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
        
        progressTests.test("Update percent by string with leading number", function () {            
            var updateString = "50%";
            var numericEquivalent = 50;
    
            progressBar = createProgressBar("#progress-container", {animate: "none"});
            
            // update with just a number
            progressBar.update(updateString);
            
            // 7.1
            jqUnit.isVisible("After update, ensure default progress bar is visible", 
                ".flc-progress");
            
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
        
        progressTests.test("Update text after percent", function () {            
            progressBar = createProgressBar("#progress-container", {animate: "none"});
            
            // update with just percentage
            progressBar.update(50);
            
            // 8.1
            jqUnit.isVisible("After update, ensure default progress bar is visible", 
                ".flc-progress");
            
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
            jqUnit.assertTrue("After updating only text the label should be: \"" + text + '"', 
                 progressBar.label.text() === text);
            
            // 8.6
            jqUnit.assertTrue("and width should still only be 50px", 
                 progressBar.indicator.width() === 50);

        });
       
       
        progressTests = new jqUnit.TestCase("Progress Tests (Other Defaults)");

        // 9
        
        progressTests.test("Min width = 0", function () {            
            progressBar = createProgressBar("#progress-container", {animate: "none", minWidth: 0});
            
            // show but don't update
            progressBar.show();
            
            // 9.1    
            jqUnit.isVisible("After show, ensure default progress bar is visible", 
                ".flc-progress");
            
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


        progressTests = new jqUnit.TestCase("Progress Tests (ARIA)");

        // 10
        
        progressTests.test("ARIA initialization", function () {
            
            var ARIAcontainer = $(".flc-progress-bar");
            
            jqUnit.assertFalse("Before init: role should not exist", ARIAcontainer.attr("role"));
            jqUnit.assertFalse("Before init: valuemin should not exist", ARIAcontainer.attr("aria-valuemin"));
            jqUnit.assertFalse("Before init: valuemax should not exist", ARIAcontainer.attr("aria-valuemax"));
            jqUnit.assertFalse("Before init: valuenow should not exist", ARIAcontainer.attr("aria-valuenow"));
            jqUnit.assertFalse("Before init: busy should not exist", ARIAcontainer.attr("aria-busy"));
            
            progressBar = createProgressBar("#progress-container", {animate: "none"});
            
            jqUnit.assertEquals("After Init: role should be ", "progressbar", ARIAcontainer.attr("role"));
            jqUnit.assertEquals("After Init: valuemin should be ", "0", ARIAcontainer.attr("aria-valuemin"));
            jqUnit.assertEquals("After Init: valuemax should be ", "100", ARIAcontainer.attr("aria-valuemax"));
            jqUnit.assertEquals("After Init: valuenow should be ", "0", ARIAcontainer.attr("aria-valuenow"));
            jqUnit.assertEquals("After Init: busy should be ", "false", ARIAcontainer.attr("aria-busy"));
                  
        });

        // 11
        
        progressTests.test("ARIA Numeric update", function () {
            
            var updateValue, busyVal;
            
            var ARIAcontainer = $(".flc-progress-bar");
            
            progressBar = createProgressBar("#progress-container", {animate: "none"});
            
            jqUnit.assertEquals("Start: busy should be ", "false", ARIAcontainer.attr("aria-busy"));
            jqUnit.assertEquals("Start: valuenow should be ", "0", ARIAcontainer.attr("aria-valuenow"));
            
            updateValue = 10;
            progressBar.update(updateValue);
                  
            busyVal = ARIAcontainer.attr("aria-busy");
            jqUnit.assertTrue("Working: busy should be true", busyVal === "true" || busyVal === true);
            jqUnit.assertEquals("Working: valuenow should be ", updateValue, ARIAcontainer.attr("aria-valuenow"));

            updateValue = 50;
            progressBar.update(updateValue);
                  
            busyVal = ARIAcontainer.attr("aria-busy");
            jqUnit.assertTrue("Working: busy should be true", busyVal === "true" || busyVal === true);
            jqUnit.assertEquals("Working: valuenow should be ", updateValue, ARIAcontainer.attr("aria-valuenow"));

            updateValue = 100;
            progressBar.update(updateValue);
                  
            busyVal = ARIAcontainer.attr("aria-busy");
            jqUnit.assertTrue("Done: busy should be false", busyVal === "false" || !busyVal);
            jqUnit.assertEquals("Done: valuenow should be ", updateValue, ARIAcontainer.attr("aria-valuenow"));

        });


        // 12
        
        progressTests.test("ARIA Text update", function () {
            
            var updateValue, busyVal;
            
            var ARIAcontainer = $(".flc-progress-bar");
            
            var customDoneText = "Upload is fini.";
            
            var customBusyTemplate = "Progress equals %percentComplete"; 
            
            progressBar = createProgressBar("#progress-container", {
                animate: "none", 
                ariaBusyText: customBusyTemplate, 
                ariaDoneText: customDoneText
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

    });
})(jQuery);
