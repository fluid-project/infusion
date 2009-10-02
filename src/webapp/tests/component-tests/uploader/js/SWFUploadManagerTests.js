/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/


(function ($) {
    $(document).ready(function () {      

        var actualBrowser = $.browser;
        
        // Mock swfobject implementation.
        var flashPlayerVersion = {
            major: 10
        };
        
        window.swfobject = {
            getFlashPlayerVersion: function () {
                return flashPlayerVersion;
            }
        };
        
        // Mock Uploader instance.
        var buttonSelector = "#browseButton";
        var mockUploader = {
            container: $("#uploaderContainer"), 
            locate: function (name) {
                return $(buttonSelector);
            },
            
            options: {
                uploadManager: "fluid.demoUploadManager"
            }
        };
        
        var setup = function () {
            buttonSelector = "#browseButton";
            $.browser = actualBrowser;
            flashPlayerVersion.major = 10;
        };
        
        
        var swfUploadManagerTests = new jqUnit.TestCase("SWFUploadManager and SWFUploadSetupDecorator Tests", setup);
        
        swfUploadManagerTests.test("swfUploadSetupDecorator Flash 10: compatibility should be turned off.", function () {
            var decorator = fluid.swfUploadSetupDecorator(mockUploader);
            jqUnit.assertNotEquals("The Flash 9-compatible version of callFlash() should not be in place.",
                                   SWFUpload.callFlash_Flash9Compatibility, SWFUpload.prototype.callFlash);
        });
        
        swfUploadManagerTests.test("swfUploadSetupDecorator initialization", function () {
            var decorator = fluid.swfUploadSetupDecorator(mockUploader);
            jqUnit.assertNotUndefined("The setup decorator should have been successfully instantiated.", decorator);
            jqUnit.assertNotUndefined("The decorator should define a set of returnedOptions.", decorator.returnedOptions);
            jqUnit.assertEquals("To work around a framework bug, we should pass along the configured upload manager type.",
                                mockUploader.options.uploadManager, decorator.returnedOptions.uploadManager.type);                            
        });
        
        swfUploadManagerTests.test("swfUploadSetupDecorator Flash 10 accessibility", function () {
            var decorator = fluid.swfUploadSetupDecorator(mockUploader);
            jqUnit.assertEquals("The HTML browse button should have been given a tabindex of -1",
                                "-1", mockUploader.locate("browseButton").attr("tabindex"));
        });
        
        swfUploadManagerTests.test("swfUploadSetupDecorator Flash 9 configuration", function () {
            flashPlayerVersion.major = 9;
            var decorator = fluid.swfUploadSetupDecorator(mockUploader);
            jqUnit.assertNotEquals("With Flash 9, the flashButtonPeerId should not be empty.", 
                                   "", decorator.returnedOptions.uploadManager.options.flashButtonPeerId);
            jqUnit.assertEquals("We should have specified the Flash 9 movie URL.", 
                                fluid.defaults("fluid.swfUploadSetupDecorator").flash9URL,
                                decorator.returnedOptions.uploadManager.options.flashURL);   
        });
        
        swfUploadManagerTests.test("swfUploadSetupDecorator Flash 10 configuration", function () {
            var decorator = fluid.swfUploadSetupDecorator(mockUploader);
            jqUnit.assertEquals("We should have specified the Flash 10 movie URL.", 
                                fluid.defaults("fluid.swfUploadSetupDecorator").flash10URL,
                                decorator.returnedOptions.uploadManager.options.flashURL);
        });
        
        var checkTransparentSettings = function (decorator) {     
            jqUnit.assertTrue("The decorator should be configured for transparency in IE.", decorator.isTransparent);
            jqUnit.assertUndefined("The button's image URL should not be set.", 
                                   decorator.returnedOptions.uploadManager.options.flashButtonImageURL);
            jqUnit.assertEquals("The Flash movie's window mode should  be transparent.",
                                SWFUpload.WINDOW_MODE.TRANSPARENT,
                                decorator.returnedOptions.uploadManager.options.flashButtonWindowMode);
            jqUnit.assertNotEquals("The flashButtonPeerId should not be set to the button's id.",
                                   mockUploader.locate("browseButton").attr("id"),
                                   decorator.returnedOptions.uploadManager.options.flashButtonPeerId);
        };
        
        var checkVisibleSettings = function (decorator) {
            jqUnit.assertFalse("The decorator should be configured for transparency in IE.", decorator.isTransparent);
            jqUnit.assertEquals("The button's image URL should be set.", 
                                fluid.defaults("fluid.swfUploadSetupDecorator").flashButtonImageURL,
                                decorator.returnedOptions.uploadManager.options.flashButtonImageURL);
            jqUnit.assertEquals("The Flash movie's window mode should not be transparent.",
                                SWFUpload.WINDOW_MODE.OPAQUE,
                                decorator.returnedOptions.uploadManager.options.flashButtonWindowMode);
        };
        
        swfUploadManagerTests.test("swfUploadSetupDecorator Flash 10 visibility", function () {
            var decorator = fluid.swfUploadSetupDecorator(mockUploader, {
                flashButtonAlwaysVisible: true,
                transparentEvenInIE: false
            });
            checkVisibleSettings(decorator);
        });
        
        swfUploadManagerTests.test("swfUploadSetupDecorator Flash 10 transparency", function () {
            // Mock jQuery's browser property to fake IE.
            $.browser.msie = true;
                        
            // Now try with the transparentEvenInIE option turned on.
            decorator = fluid.swfUploadSetupDecorator(mockUploader);
            checkTransparentSettings(decorator);
            
            // Mock non-IE browsers.
            $.browser.msie = false;
            decorator = fluid.swfUploadSetupDecorator(mockUploader);
            checkTransparentSettings(decorator);
        });
    });
})(jQuery);
