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

(function ($) {
    "use strict";

    $(function () {
        jqUnit.module("Uploader errorPanel Tests");

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


        /****************************
         * errorPanel.Section Tests *
         ****************************/

        var makeSection = function () {
            return fluid.uploader.errorPanel.section(".flc-uploader-errorPanel-section", {
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
                expectedIdx, section.model.files.indexOf(file.name));
        };

        jqUnit.test("errorPanel.section.addFile()", function () {
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

        jqUnit.test("errorPanel.section.clear()", function () {
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

        jqUnit.test("errorPanel.section details visibility", function () {
            var section = makeSection();
            checkDetailsAreHidden(section); // By default, the error details should be hidden.

            section.addFile(testFiles[0], 0);
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

        jqUnit.test("errorPanel.section.refreshView()", function () {
            var section = makeSection();
            checkSectionWithHiddenDetails(section, "");

            section.refreshView();
            checkSectionWithHiddenDetails(section, "");

            // Add a file--refreshView() should be called automatically.
            section.addFile(testFiles[0], 0);
            checkSectionWithHiddenDetails(section, testFiles[0].name);

            // Show the details and programmatically refreshView().
            section.refreshView();
            section.showDetails();
            checkSectionWithVisibleDetails(section, testFiles[0].name);
        });

        jqUnit.test("errorPanel.section.renderErrorDetails", function () {
            var section = makeSection();
            fluid.uploader.errorPanel.section.renderErrorDetails(section);

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

        jqUnit.test("errorPanel.section clear errors button", function () {
            var section = makeSection();
            section.addFile(testFiles[0], 0);
            section.showDetails();
            jqUnit.assertEquals("The section's model should have a file in it.", 1, section.model.files.length);
            jqUnit.isVisible("The section's container.should be visible before closing it.", section.container);

            section.locate("deleteErrorButton").trigger("click");
            jqUnit.assertEquals("The section's model should have been cleared.", 0, section.model.files.length);
            jqUnit.notVisible("The section's container.should be hidden after closing it.", section.container);

        });

        /********************
         * errorPanel Tests *
         ********************/

        var addFileAndRefresh = function (errorPanel, section, file) {
            section.addFile(file, section.model.errorCode);
            errorPanel.refreshView();
        };

        var clearAndRefresh = function (errorPanel, section) {
            section.clear();
            errorPanel.refreshView();
        };

        jqUnit.test("errorPanel.refreshView()", function () {
            var errorPanel = fluid.uploader.errorPanel(".flc-uploader-errorsPanel");
            jqUnit.notVisible("On initialization, the error panel should be hidden.", errorPanel.container);

            addFileAndRefresh(errorPanel, errorPanel.fileSizeErrorSection, testFiles[0]);
            jqUnit.isVisible("After a file has been added to a section, the error panel should be visible.",
                errorPanel.container);

            clearAndRefresh(errorPanel, errorPanel.fileSizeErrorSection);
            jqUnit.notVisible("When the errors have been cleared, the error panel should be hidden again.",
                errorPanel.container);

            addFileAndRefresh(errorPanel, errorPanel.numFilesErrorSection, testFiles[1]);
            jqUnit.isVisible("After a file has been added to a section, the error panel should be visible.",
                errorPanel.container);

            addFileAndRefresh(errorPanel, errorPanel.fileSizeErrorSection, testFiles[0]);
            jqUnit.isVisible("After a file has been added to the other section, the error panel should still be visible.",
                errorPanel.container);

            clearAndRefresh(errorPanel, errorPanel.fileSizeErrorSection);
            jqUnit.isVisible("When one section has been cleared but the other still has errors, the container should still be visible.",
                errorPanel.container);

            clearAndRefresh(errorPanel, errorPanel.numFilesErrorSection);
            jqUnit.notVisible("When all sections have been cleared, the error panel should be hidden again.",
                errorPanel.container);
        });

    });
})(jQuery);
