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
    $(document).ready(function () {
        //fluid.staticEnvironment = fluid.typeTag("fluid.uploader.tests");
        
        var uploaderTests = new jqUnit.TestCase("Uploader Basic Tests");
        
        // Test formatFileSize()
        uploaderTests.test("formatFileSize()", function () {          
            var testFileSize = function (testVal, expected) {
                jqUnit.assertEquals("File size " + testVal + " bytes ", expected, 
                                    fluid.uploader.formatFileSize(testVal));
            };
            
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
            testFileSize(Math.pow(2, 52), "4294967296.0 MB");
            testFileSize(Math.pow(2, 1024), "Infinity MB"); //test "infinity"
        });

        uploaderTests.test("derivePercent()", function () {          
            var total = 5;
            var testPercentage = function (testVal, expected) {
                jqUnit.assertEquals(testVal + "/" + total + " is " + expected + "%", expected, 
                                    fluid.uploader.derivePercent(testVal, total));
            };
            testPercentage(0, 0);
            testPercentage(2.5, 50);
            testPercentage(total, 100);
            testPercentage(10, 200);
            testPercentage(0.1, 2);
            testPercentage(-5, -100);
            testPercentage("1", 20);
            testPercentage("0.2", 4);
            
            //change total to odd number to test rounding
            total = 7;
            testPercentage(0, 0);
            testPercentage(3.5, 50);
            testPercentage(total, 100);
            testPercentage(10, 143); //142.857
            testPercentage(0.1, 1);  //1.42857
            testPercentage(-5, -71); //-71.42857
            testPercentage("3.5", 50); 
            testPercentage("0.1", 1);  //1.42857
            
            //infinity test
            testPercentage(Math.pow(2, 1024), "Infinity");
            total = Math.pow(2, 1024);
            testPercentage(0, 0);
            jqUnit.assertTrue(total + "/" + total + " is not a number", 
                            isNaN(fluid.uploader.derivePercent(total / total)));
        });

        var events = {
            afterFileDialog: fluid.event.getEventFirer(),
            afterFileRemoved: fluid.event.getEventFirer(),
            onUploadStart: fluid.event.getEventFirer(),
            onFileProgress: fluid.event.getEventFirer(),
            afterUploadComplete: fluid.event.getEventFirer()
        };
        var status = $("#statusRegion");
        var totalStatusText = $("#totalFileStatusText");
        
        var checkStatusAfterFiringEvent = function (text, eventName) {
            totalStatusText.text(text);
            events[eventName].fire();
            jqUnit.assertEquals("The status region should match the total text after firing " + eventName, 
                                totalStatusText.text(), status.text());    
        };
        
        uploaderTests.test("ARIA Updater", function () {
            fluid.uploader.ariaLiveRegionUpdater(status, totalStatusText, events);
            
            jqUnit.assertEquals("The status region should be empty to start.", "", status.text());
            
            totalStatusText.text("hello world");
            jqUnit.assertEquals("The status region should be empty after invoking the updater.", "", status.text());
            
            checkStatusAfterFiringEvent("cat", "afterFileDialog");
            checkStatusAfterFiringEvent("dog", "afterFileRemoved");       
            checkStatusAfterFiringEvent("shark", "afterUploadComplete");           
        });
        
        /******************************
         * Uploader Integration Tests *
         ******************************/
        
        uploaderTests.test("Ensure HTML5 uploader is correctly instantiated", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsBinaryXHR");

            var container = $(".flc-uploader");
            var that = fluid.uploader(container);
            
            jqUnit.assertEquals("The HTML5 uploader is in fact the HTML5 version", "fluid.uploader.html5Strategy", that.strategy.typeName);
            jqUnit.assertTrue("The HTML5 strategy contains a local component", that.strategy.local);
            jqUnit.assertTrue("The HTML5 strategy contains a remote component", that.strategy.remote);
            jqUnit.assertTrue("The HTML5 uploader has a container", that.container);
            jqUnit.assertEquals("The HTML5 container has the correct selector", ".flc-uploader", that.container.selector);            
            jqUnit.assertTrue("The HTML5 uploader has a fileQueueView", that.fileQueueView);
            jqUnit.assertTrue("The fileQueueView has a scroller component", that.fileQueueView.scroller);
            jqUnit.assertTrue("The fileQueueView has an eventBinder component", that.fileQueueView.eventBinder);            
            jqUnit.assertTrue("The fileQueueView's container is the file queue", that.fileQueueView.container.hasClass("fl-uploader-queue"));
            jqUnit.assertTrue("The HTML5 uploader has a total progress component", that.totalProgress);
            jqUnit.assertTrue("The total progress component has a progressBar", that.totalProgress.progressBar);
            jqUnit.assertTrue("The HTML5 uploader has all the events", that.events);
            jqUnit.assertTrue("The HTML5 uploader has a file queue", that.queue);
            jqUnit.assertTrue("The HTML5 uploader must have queueSettings", that.options.queueSettings);
            jqUnit.assertTrue("The HTML5 uploader must have an argument map in its options", that.options.argumentMap);
            jqUnit.assertEquals("The argument map must identify the component container as the first argument in the arguments list", 0, that.options.argumentMap.container);
            jqUnit.assertEquals("The argument map must identify the component options as the second argument in the arguments list", 1, that.options.argumentMap.options);
            jqUnit.assertEquals("The HTML5 uploader must have the correct IoC gradeNames value", "fluid.viewComponent", that.options.gradeNames);
        });        
        
        uploaderTests.test("Ensure Flash uploader is correctly instantiated", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsFlash");

            var container = $(".flc-uploader");
            var that = fluid.uploader(container);
            
            jqUnit.assertEquals("The SWF uploader is in fact the Flash version", "fluid.uploader.swfUploadStrategy", that.strategy.typeName);
            jqUnit.assertTrue("The SWF strategy contains a local component", that.strategy.local);
            jqUnit.assertTrue("The SWF strategy contains a remote component", that.strategy.remote);
            jqUnit.assertTrue("The SWF strategy contains an engine component", that.strategy.engine);
            jqUnit.assertTrue("The SWF uploader has a container", that.container);
            jqUnit.assertEquals("The SWF container has the correct selector", ".flc-uploader", that.container.selector);            
            jqUnit.assertTrue("The SWF uploader has a fileQueueView", that.fileQueueView);
            jqUnit.assertTrue("The fileQueueView has a scroller component", that.fileQueueView.scroller);
            jqUnit.assertTrue("The fileQueueView has an eventBinder component", that.fileQueueView.eventBinder);            
            jqUnit.assertTrue("The fileQueueView's container is the file queue", that.fileQueueView.container.hasClass("fl-uploader-queue"));
            jqUnit.assertTrue("The SWF uploader has a total progress component", that.totalProgress);
            jqUnit.assertTrue("The total progress component has a progressBar", that.totalProgress.progressBar);
            jqUnit.assertTrue("The SWF uploader has all the events", that.events);
            jqUnit.assertTrue("The SWF uploader has a file queue", that.queue);
            jqUnit.assertTrue("The SWF uploader must have queueSettings", that.options.queueSettings);
            jqUnit.assertTrue("The SWF uploader must have an argument map in its options", that.options.argumentMap);
        });    

        fluid.uploader.parent = function (options) {
            var that = fluid.initLittleComponent("fluid.uploader.parent", options);
            fluid.initDependents(that);
            return that;
        };
        
        fluid.defaults("fluid.uploader.parent", {
            gradeNames: ["fluid.littleComponent"],
            components: {
                uploader: {
                    type: "fluid.uploader",
                    container: ".flc-uploader"
                }
            }
        });
        
        uploaderTests.test("Ensure HTML5 uploader is correctly instantiated as a subcomponent", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsBinaryXHR");

            var that = fluid.uploader.parent();
            that.uploader = that.options.components.uploader;
            
            jqUnit.assertEquals("The HTML5 uploader is in fact the HTML5 version", "fluid.uploader.html5Strategy", that.uploader.strategy.typeName);
        });
    });
})(jQuery);
