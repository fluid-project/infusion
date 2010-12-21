/*
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, SWFUpload*/

(function ($) {
    $(document).ready(function () {
          
        var makeUploaderEventFirers = function () {
            var mockUploader = {};
            fluid.instantiateFirers(mockUploader, fluid.defaults("fluid.uploader.multiFileUploader"));
            return mockUploader.events;
        };
        
        var container = $("#uploaderContainer");
        var button = $("#browseButton");
        var flashContainer = $("#flashContainer");
        var styles = fluid.defaults("fluid.uploader.swfUploadStrategy").styles;
        var defaultQueueSettings = fluid.defaults("fluid.uploader.multiFileUploader").queueSettings;
        var defaultFlashSettings = fluid.defaults("fluid.uploader.swfUploadStrategy").flashMovieSettings;
        var defaultMergedSettings = $.extend({}, defaultQueueSettings, defaultFlashSettings);
        var events = makeUploaderEventFirers();
        
        var swfUploadSetupTests = new jqUnit.TestCase("SWFUpload for Flash 9 & 10 Setup Tests");
        
        swfUploadSetupTests.test("SWFUpload Flash 10 callFlash() should be unavailable.", function () {
            fluid.uploader.swfUploadStrategy.flash10SetupDOM(container, button, styles);
            jqUnit.assertNotEquals("The Flash 9-compatible version of callFlash() should not be in place.",
                                   SWFUpload.callFlash_Flash9Compatibility, SWFUpload.prototype.callFlash);
        });
        
        swfUploadSetupTests.test("SWFUpload Flash 10 accessibility", function () {
            fluid.uploader.swfUploadStrategy.flash10SetupDOM(container, button, styles);
            jqUnit.assertEquals("The HTML browse button should have been given a tabindex of -1",
                                "-1", button.attr("tabindex"));
        });
        
        swfUploadSetupTests.test("SWFUpload Flash 9 configuration", function () {
            var config = fluid.uploader.swfUploadStrategy.flash9SetupConfig(flashContainer, 
                                                                            defaultMergedSettings, 
                                                                            events);
            jqUnit.assertEquals("We should have specified the correct Flash URL.", 
                                defaultFlashSettings.flashURL,
                                config.flash_url);   
        });
        
        var checkTransparentSettings = function (config) {     
            jqUnit.assertUndefined("The button's image URL should not be set.", 
                                   config.button_image_url);
            jqUnit.assertEquals("The Flash movie's window mode should  be transparent.",
                                SWFUpload.WINDOW_MODE.TRANSPARENT,
                                config.button_window_mode);
            jqUnit.assertNotEquals("The flashButtonPeerId should not be set to the button's id.",
                                   button.attr("id"),
                                   config.button_placeholder_id);
        };
        
        var checkVisibleSettings = function (config) {
            jqUnit.assertEquals("The button's image URL should be set.", 
                                defaultFlashSettings.flashButtonImageURL,
                                config.button_image_url);
            jqUnit.assertEquals("The Flash movie's window mode should not be transparent.",
                                SWFUpload.WINDOW_MODE.OPAQUE,
                                config.button_window_mode);
        };
        
        swfUploadSetupTests.test("Flash 10 visibility", function () {
            var flashOptions = fluid.merge(null, {}, defaultFlashSettings, {
                flashButtonAlwaysVisible: true,
                transparentEvenInIE: false
            });
               
            var defaultConfig = $.extend({}, defaultQueueSettings, flashOptions);                     
            var config = fluid.uploader.swfUploadStrategy.flash10SetupConfig(defaultConfig, 
                                                                             events, 
                                                                             flashContainer, 
                                                                             button);
                                                             
            checkVisibleSettings(config);
        });
        
        swfUploadSetupTests.test("swfUploadSetupDecorator Flash 10 transparency", function () {
            // Mock jQuery's browser property to fake IE.
            $.browser.msie = true;
                        
            // Now try with the transparentEvenInIE option turned on.
            var config = fluid.uploader.swfUploadStrategy.flash10SetupConfig(defaultMergedSettings, 
                                                                            events, 
                                                                            flashContainer, 
                                                                            button);
            checkTransparentSettings(config);
            
            // Mock non-IE browsers.
            $.browser.msie = false;
            config = fluid.uploader.swfUploadStrategy.flash10SetupConfig(defaultMergedSettings, 
                                                                        events, 
                                                                        flashContainer, 
                                                                        button);        
            checkTransparentSettings(config);
        });
        
    });
})(jQuery);
