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
        var uploadTests = new jqUnit.TestCase ("Upload Tests");
		
		// set to empty to use demo upload js code instead actual server side upload handlers
		// uploadURL = "../../sample-code/uploader/php/upload.php"; // relative to the swf file
	    var uploadURL = "";
        var flashURL = "../../fluid-components/swfupload/swfupload_f9.swf";
		
		var testVariable; // used to test the whenDone and whenCancel variables
        				
		// init uploader in inline mode, test for ?
		
		
		uploadTests.test ("Upload: init uploader in inline mode", function () {
			
			// initialize the Uploader
            var myUpload = new fluid.Uploader("#fluid-uploader", uploadURL, flashURL);
			
			// test the DOM based state
			jqUnit.assertEquals("init an uploader: status class is <em>start</em>", 
							  true,$('#fluid-uploader>div').hasClass("start"));
			
			// Cancel button is showing
			jqUnit.isVisible("init an uploader: Cancel button is showing", 
							  '.fluid-uploader-cancel');
							  
			// Upload button is enabled
			jqUnit.assertEquals("init an uploader: Cancel button is <em>enabled</em>", 
							  'pointer',$('.fluid-uploader-cancel').css("cursor"));
			
			// Upload button is showing
			jqUnit.isVisible("init an uploader: Upload button is showing", 
							  '.fluid-uploader-upload');
			
			// Upload button is disabled
			jqUnit.assertEquals("init an uploader: Upload button is <em>disabled</em>", 
							  'auto',$('.fluid-uploader-upload').css("cursor"));
			
			// Done button is hidden
			jqUnit.notVisible("init an uploader: Done button is <em>not</em> showing", 
							  '.fluid-uploader-done');
			
			// Resume button is hidden
			jqUnit.notVisible("init an uploader: Resume button is <em>not</em> showing", 
							  '.fluid-uploader-resume');
			
			// Pause button is hidden
			jqUnit.notVisible("init an uploader: Pause button is <em>not</em> showing", 
							  '.fluid-uploader-pause');
							  
			// Instructions are visible
			jqUnit.isVisible("init an uploader: Instructions are showing", 
							  '.fluid-uploader-row-placeholder');
           
		});
		
		uploadTests.test ("Upload: Buttons have the correct events", function () {
			testVariable = ''; // used to test the whenDone and whenCancel variables
			
			var settings =   {
				whenDone: function() {
					testVariable = "Done";
				},
				whenCancel: function() {
					testVariable = "Cancel";
				},
				
				continueAfterUpload: false,
				debug: false
			};
			
			// initialize the Uploader
            var myUpload = new fluid.Uploader("#fluid-uploader", uploadURL, flashURL, settings);
										  
			// test that the variable that we use for the Cancel button has not been set
			jqUnit.assertEquals("Uploader Events: that testVariable is empty", 
							  '',testVariable);
			
			// click the Cancel button
			$('.fluid-uploader-cancel').click();
			
			// test that the variable that we use for the Cancel button has not been set
			jqUnit.assertEquals("after clicking Cancel, testVariable = <em>Cancel</em>", 
							  'Cancel',testVariable);
           
			
			// click the Done button
			$('.fluid-uploader-done').click();
			
			// test that the variable that we use for the Cancel button has not been set
			jqUnit.assertEquals("after clicking Done, testVariable = <em>Done</em>", 
							  'Done',testVariable);
		});
        
        uploadTests.test("formatFileSize()", function () {          
            function testFileSize(testVal, expected) {
                jqUnit.assertEquals("File size " + testVal + " bytes ", expected, fluid.Uploader.formatFileSize(testVal));
            }
            
            testFileSize(0, "0.0 KB");
            testFileSize(1, "0.1 KB");
            testFileSize(10, "0.1 KB");
            testFileSize(50, "0.1 KB");
            testFileSize(100, "0.1 KB");
            testFileSize(150, "0.2 KB");
            testFileSize(200, "0.2 KB");
            testFileSize(400, "0.4 KB");
            testFileSize(600, "0.6 KB");
            testFileSize(800, "0.8 KB");
            testFileSize(900, "0.9 KB");
            testFileSize(910, "0.9 KB");
            testFileSize(950, "1.0 KB");
            testFileSize(999, "1.0 KB");
            testFileSize(1023, "1.0 KB");
            testFileSize(1024, "1.0 KB");
            testFileSize(1025, "1.1 KB");
            testFileSize(10000, "9.8 KB");
            testFileSize(100000, "97.7 KB");
            testFileSize(1000000, "976.6 KB");
            testFileSize(10000000, "9.6 MB");
            testFileSize(100000000, "95.4 MB");
            testFileSize(10000000000, "9536.8 MB");
            testFileSize(-1024, "");
            testFileSize("string", "");
        });
		
		/*
uploadTests.test ("Upload: init uploader in inline mode with browseOnInit = true", function () {
			testVariable = ''; // used to test the whenDone and whenCancel variables
			
			var settings =   {
				whenDone: function() {
					testVariable = "Done";
				},
				whenCancel: function() {
					testVariable = "Cancel";
				},
				browseOnInit: true,
				continueAfterUpload: false,
				debug: false
			};
		
            var myUpload = new fluid.Uploader("#fluid-uploader", uploadURL, flashURL, settings);

			jqUnit.assertEquals("that the uploader status class is <em>browse</em>", 
							  true ,$('#fluid-uploader>div').hasClass("browsing"));
           
		});
*/
	
		// init uploader in inline mode with browseOnInit
		// init uploader with whenCancel as function
		// init uploader, check for event handlers
		
		// init uploader in dialog mode, test for ?
		// click on addbtn, check for dialog
		// init uploader in dialog mode, test for ? with browseOnInit

		/*
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
			var text = "test text";
			progressBar.init(".file-progress-container");
			var updateValue = 50; 
			var pixels = percentToPixels($(".file-progress-container").width(),updateValue);
        	
			progressBar.updateProgress("file",updateValue,text); 
			
			// Progress bar should be visible and should be the correct length.
			jqUnit.isVisible("After file update, file progress bar is visible", 
							 options.fileProgressor);
			var msg = "After file update to " +
					  updateValue + 
					  ", indicator width should be " + 
					  pixels;
			
			// fails because Progress uses an animation and we need to wait for the animation to complete
			jqUnit.assertEquals(msg, pixels, $(options.fileProgressor).width());
			
			 msg = "After file progress update to the context of the file progress string should be &quot;" + text + "&quot;";
			jqUnit.assertEquals(msg, text, $(options.fileText).text());
        });

		progressTests.test ("Progress: total progress update", function () {
			createProgressBar();
			
			// Set the update value to 50% and calculate the appropriate pixels.
			var text = "test text";
			progressBar.init(".file-progress-container");
			var updateValue = 50; 
			var pixels = percentToPixels($(".total-progress-container").width(),updateValue);
        	
			progressBar.updateProgress("total",updateValue,text); 
			
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
			jqUnit.assertEquals(msg, text, $(options.totalText).text());
        });
*/
		

    });
}) (jQuery);
