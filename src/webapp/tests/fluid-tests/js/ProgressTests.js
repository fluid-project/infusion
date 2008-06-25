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

    });
}) (jQuery);
