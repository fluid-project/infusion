/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(function () {
        var errorsViewTests = jqUnit.testCase("Uploader ErrorsView Tests");
        
        /*
        uploaderTests.test("ErrorHandling tests - removeError", function () {
            var testArray = function (errorCode) {
                jqUnit.assertEquals("Error array should contains nothing.", 0, errorHandler.errorMsgs[errorCode].files.length);
            };
            errorHandler.addError(oceanTestFile.fileName, "exceedsUploadLimit");
            errorHandler.addError(oceanTestFile.fileName, "exceedsFileLimit");
            errorHandler.removeError("exceedsUploadLimit");
            testArray("exceedsUploadLimit");
            errorHandler.removeError("exceedsFileLimit");
            testArray("exceedsFileLimit");
        });

        uploaderTests.test("ErrorHandling tests - refreshView", function () {
            //use a new errorHandler
            var errorHandler = fluid.uploader.errorHandler(".flc-uploader-total-errored"); 
            var fileLimitRow = errorHandler.locate("exceedsFileLimit");
            var uploadLimitRow = errorHandler.locate("exceedsUploadLimit");
            var testVisibility = function (element, state) {
                if (state) {
                    jqUnit.assertTrue("This element should be Visible.", element.is(":visible"));
                } else {
                    jqUnit.assertFalse("This element should be Invisible.", element.is(":visible"));
                }
            };
            //Error is invisible at beginning
            testVisibility(errorHandler.container, false);
            testVisibility(uploadLimitRow, false);
            testVisibility(fileLimitRow, false);
            //Adding errors
            errorHandler.addError(oceanTestFile.fileName, "exceedsUploadLimit");
            errorHandler.refreshView();
            testVisibility(errorHandler.container, true);
            testVisibility(uploadLimitRow, true);
            testVisibility(fileLimitRow, false);
            errorHandler.addError(oceanTestFile.fileName, "exceedsFileLimit");
            errorHandler.refreshView();
            testVisibility(uploadLimitRow, true);
            testVisibility(fileLimitRow, true);
            //Delete row
            errorHandler.locate("deleteErrorButton", uploadLimitRow).click();
            testVisibility(uploadLimitRow, false);
            testVisibility(fileLimitRow, true);
            errorHandler.locate("deleteErrorButton", fileLimitRow).click();
            testVisibility(uploadLimitRow, false);
            testVisibility(fileLimitRow, false);
            //When all errors are deleted, error box should disappear.
            testVisibility(errorHandler.container, false);
        });
        */
        
        var testFiles = [
            {
                name: "PictureOfACat.jpg"
            },
            {
                name: "Dog.jpg"
            },
            {
                name: "Sailboat.png"
            },
            {
                name: "virus.exe"
            }
        ];
        
        var makeSection = function () {
            return fluid.uploader.errorsView.section(".flc-uploader-errorPanel-section", {
                model: {
                    errorCode: 0 // Mock error code.
                },
                strings: {
                    header: "Ma'am, there is a latch."
                }
            });    
        };
        
        var checkAddedFiles = function (section, expectedNumFiles, file, expectedIdx) {
            jqUnit.assertEquals("The section instance should have " + expectedNumFiles + " files in its model.",
                expectedNumFiles, section.model.files.length);
            jqUnit.assertEquals("The newly added file should be at index " + expectedIdx + " in the section's model.",
                expectedIdx, $.inArray(file.name, section.model.files));
        };
        
        errorsViewTests.test("ErrorsView.Section.addFile()", function () {
            var section = makeSection();
            
            // Add the first file.
            section.addFile(testFiles[0], 0);
            checkAddedFiles(section, 1, testFiles[0], 0);
            
            // And a second.
            section.addFile(testFiles[2], 0);
            checkAddedFiles(section, 2, testFiles[2], 1);
            
            // Now add a file for a totally different error--it shouldn't be added.
            section.addFile(testFiles[3], 400);
            checkAddedFiles(section, 2, testFiles[3], -1);
        });
        
        errorsViewTests.test("ErrorsView.Section.clear()", function () {
            var section = makeSection();
            section.addFile(testFiles[0], 0);
            section.addFile(testFiles[1], 0);
            
            // Sanity check--we should start with a full model.
            jqUnit.assertEquals("Before clearing all errors, the section's file model should have files in it",
                2, section.model.files.length);
                
            // Clear the queue.
            section.clear();
            jqUnit.assertEquals("After clearing all errors, the section's file model should be empty",
                0, section.model.files.length);
        
            // Clear it again, expecting no errors and a still-empty model.
            section.clear();
            jqUnit.assertEquals("After clearing all errors again, the section's file model should still be empty",
                0, section.model.files.length);
        });
        
        var checkDetailsVisibility = function (section, expectedIsVisible) {
            var assertVisibility = expectedIsVisible ? jqUnit.isVisible : jqUnit.notVisible;
            var toggleText = expectedIsVisible ? section.options.strings.hideFiles : section.options.strings.showFiles;
            assertVisibility("The error details container should be set correctly.", section.locate("errorDetails"));
            jqUnit.assertEquals("The toggle button should be labelled correctly.",
                toggleText, section.locate("showHideFilesToggle").text());
        };
        
        var checkDetailsAreHidden = function (section) {
            checkDetailsVisibility(section, false);
        };
        
        var checkDetailsAreVisible = function (section) {
            checkDetailsVisibility(section, true);
        };
        
        errorsViewTests.test("ErrorsView.Section details visibility", function () {
            var section = makeSection();
            checkDetailsAreHidden(section); // By default, the error details should be hidden.
            
            section.showDetails();
            checkDetailsAreVisible(section);
            
            section.showDetails();
            checkDetailsAreVisible(section);
            
            section.hideDetails();
            checkDetailsAreHidden(section);
            
            section.hideDetails();
            checkDetailsAreHidden(section);
            
            section.toggleDetails();
            checkDetailsAreVisible(section);
            
            section.toggleDetails();
            checkDetailsAreHidden(section);
        });
        
        var checkFilesList = function (section, filesList) {
            jqUnit.assertEquals("The files list should be rendered correctly.",
                filesList, section.locate("erroredFiles").text());
        };
        var checkSection = function (section, filesList, expectedIsVisible) {
            var checkVisibility = expectedIsVisible ? checkDetailsAreVisible : checkDetailsAreHidden;
            checkVisibility(section);
            checkFilesList(section, filesList);
            jqUnit.assertEquals("The title for this section should be renderered correctly.", 
                section.options.strings.header, section.locate("errorTitle").text());
        };
        
        var checkSectionWithHiddenDetails = function (section, filesList) {
            checkSection(section, filesList, false);
        };
        
        var checkSectionWithVisibleDetails = function (section, filesList) {
            checkSection(section, filesList, true);
        };
        
        errorsViewTests.test("ErrorsView.Section.refreshView()", function () {
            var section = makeSection();
            checkSectionWithHiddenDetails(section, "");
            
            section.refreshView();
            checkSectionWithHiddenDetails(section, "");
            
            section.addFile(testFiles[0]);
            checkSectionWithHiddenDetails(section, testFiles[0].name);
            section.showDetails();
            section.refreshView();
            checkSectionWithVisibleDetails(section, testFiles[0].name);
        });
        
        errorsViewTests.test("errorsView.section.renderErrorDetails", function () {
            var section = makeSection();
            fluid.uploader.errorsView.section.renderErrorDetails(section);
            
            // No files.
            checkFilesList(section, "");
            
            // One file.
            section.addFile(testFiles[0], 0);
            checkFilesList(section, testFiles[0].name);
            
            // More files.
            section.addFile(testFiles[1], 0);
            section.addFile(testFiles[2], 0);
            checkFilesList(section, "PictureOfACat.jpg, Dog.jpg, Sailboat.png");
            
        });
    });
})(jQuery);