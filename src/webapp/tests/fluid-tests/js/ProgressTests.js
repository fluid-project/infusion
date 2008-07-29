/* 
Copyright 2008 University of California, Berkeley
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

function percentToPixels(containerWidth,percent) {
    return (containerWidth*percent)/100;
}

(function ($) {
    $(document).ready (function () {
        var progressTests = new jqUnit.TestCase ("Progress Tests");
        
        var options, progressBar;
        
        var createProgressBar = function () {
            options = {
                progress: "#progress-container",
                fileProgressor: ".file-progress-indicator",
                fileText: ".file-text",
                totalProgressor: ".total-progress-indicator",
                totalText: ".total-text",
                totalProgressContainer: ".total-progress-container"
            };
                
            progressBar = new fluid.Progress(options);
        };
        
        progressTests.test ("Progress: invisible upon instantiation", function () {
            createProgressBar();
            
            jqUnit.notVisible("Before update, ensure file progress bar is not visible", 
                              options.fileProgressor);
            jqUnit.notVisible("Before update, ensure total progress bar is not visible", 
                              options.totalProgressor);
        });
        
        progressTests.test ("Progress: initialization", function () {
            createProgressBar();
            
            var text = "test text";
            progressBar.init(".file-progress-container");
               jqUnit.notExists("Before update, ensure update text doesn't exist", 
                             ":contains(" + text + ")");
        });
        
        progressTests.test ("Progress: file progress update", function () {
            createProgressBar();
            
            // Set the update value to 50% and calculate the appropriate pixels.
            var testString = "test text";
            progressBar.init(".file-progress-container");
            var updateValue = 50; 
            var pixels = percentToPixels($(".file-progress-container").width(),updateValue);
            
            progressBar.updateProgress("file",updateValue,testString,true); 
            
            // Progress bar should be visible and should be the correct length.
            jqUnit.isVisible("After file update, file progress bar is visible", 
                             options.fileProgressor);
                             
            var msg = "After file update to " +
                      updateValue + 
                      ", indicator width should be " + 
                      pixels;
            
            // fails because Progress uses an animation and we need to wait for the animation to complete
            jqUnit.assertEquals(msg, pixels, $(options.fileProgressor).width());
            
            msg = "After file progress update to the context of the file progress string should be &quot;" + testString + "&quot;";
            jqUnit.assertEquals(msg, testString, $(options.fileText).html());
        });

        progressTests.test ("Progress: total progress update", function () {
            createProgressBar();
            
            // Set the update value to 50% and calculate the appropriate pixels.
            var text = "test text";
            progressBar.init(".file-progress-container");
            var updateValue = 50; 
            var pixels = percentToPixels($(".total-progress-container").width(),updateValue);
            
            progressBar.updateProgress("total",updateValue,text,true); 
            
            // Total progress bar should be visible and should be the correct length.
            jqUnit.isVisible("After total update, total progress bar is visible", 
                             options.totalProgressor);
            var msg = "After total update to " +
                      updateValue + 
                      ", indicator width should be " + 
                      pixels;
            
            // fails because Progress uses an animation and we need to wait for the animation to complete
            jqUnit.assertEquals(msg, pixels, $(options.totalProgressor).width());
            
             msg = "After total progress update to the context of the total progress string should be &quot;" + text + "&quot;";
            jqUnit.assertEquals(msg, text, $(options.totalText).html());
        });

        progressTests.test("ARIA initialization", function() {
            // ensure nothing exists before
            var container = $("#progress-container .total-progress-container");
            jqUnit.assertFalse("Before Init: role should not exist",container.ariaRole());
            jqUnit.assertFalse("Before Init: valuemin should not exist",container.ariaState("valuemin"));
            jqUnit.assertFalse("Before Init: valuemax should not exist",container.ariaState("valuemax"));
            jqUnit.assertFalse("Before Init: valuenow should not exist",container.ariaState("valuenow"));
            jqUnit.assertFalse("Before Init: busy should not exist",container.ariaState("busy"));
            jqUnit.assertFalse("Before Init: live should not exist",container.ariaState("live"));

            // test for live, role, valuemin, valuemax after
            createProgressBar();
            jqUnit.assertEquals("After Init: role should be ", "progressbar",container.ariaRole());
            jqUnit.assertEquals("After Init: valuemin should be ", "0", container.ariaState("valuemin"));
            jqUnit.assertEquals("After Init: valuemax should be ", "100", container.ariaState("valuemax"));
            jqUnit.assertEquals("After Init: valuenow should be ", "0", container.ariaState("valuenow"));
            jqUnit.assertEquals("After Init: live should be ", "assertive", container.ariaState("live"));
            jqUnit.assertEquals("After Init: busy should be ", "false", container.ariaState("busy"));

        });

        progressTests.test("ARIA update", function() {
            var container = $("#progress-container .total-progress-container");
            createProgressBar();
            jqUnit.assertEquals("Start: busy should be ", "false", container.ariaState("busy"));
            jqUnit.assertEquals("Start: valuenow should be ", "0", container.ariaState("valuenow"));

            var updateValue = 10;
            progressBar.updateProgress("total",updateValue,"Some Text",true); 
            var busyVal = container.ariaState("busy");
            jqUnit.assertTrue("Working: busy should be true", busyVal === "true" || busyVal === true);
            jqUnit.assertEquals("Working: valuenow should be ", updateValue, container.ariaState("valuenow"));

            updateValue = 50;
            progressBar.updateProgress("total",updateValue,"Some Text",true); 
            jqUnit.assertTrue("Working: busy should be true", container.ariaState("busy"));
            jqUnit.assertEquals("Working: valuenow should be ", updateValue, container.ariaState("valuenow"));

            updateValue = 100;
            progressBar.updateProgress("total",updateValue,"Some Text",true); 
            busyVal = container.ariaState("busy");
            jqUnit.assertTrue("Done: busy should be false", busyVal === "false" || !busyVal);
            jqUnit.assertEquals("Done: valuenow should be ", updateValue, container.ariaState("valuenow"));
        });

    });
}) (jQuery);
