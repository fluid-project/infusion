/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/

(function ($) {
    $(document).ready(function () {        
        
        var html5UploaderTests = new jqUnit.TestCase("Uploader Basic Tests");
        
        var events = {
            afterFileDialog: fluid.event.getEventFirer(),
            afterFileRemoved: fluid.event.getEventFirer(),
            onUploadStart: fluid.event.getEventFirer(),
            onFileProgress: fluid.event.getEventFirer(),
            afterUploadComplete: fluid.event.getEventFirer()
        };
        
        html5UploaderTests.test("Ensure multipart content is correctly built", function () {
            var boundary = 1234567890123456789;
            var file = {
                name: "test",
                type: "image",
                getAsBinary: function () {
                    return "";
                }
            };
            
            var multipart = fluid.uploader.html5Strategy.generateMultiPartContent(boundary, file);
            var parts = multipart.split('\r\n');
            
            jqUnit.assertEquals("The multipart content must contain 7 lines", 7, parts.length);
            jqUnit.assertEquals("The first line of the multipart content should start with two dashes.", 0, parts[0].indexOf("--"));
            jqUnit.assertEquals("The first line of the multipart content must contain the boundary", 2, parts[0].indexOf(boundary));
            jqUnit.assertTrue("The second line of the multipart content must contain the Content-Disposition", parts[1].indexOf('Content-Disposition') !== -1);
            jqUnit.assertTrue("The second line of the multipart content must contain the name attribute with value of 'fileData'", parts[1].indexOf('name=\"fileData\"') !== -1);            
            jqUnit.assertTrue("The second line of the multipart content must contain the file name", parts[1].indexOf('filename') !== -1);
            jqUnit.assertTrue("The file name should be 'test'", parts[1].indexOf(file.name) !== -1);
            jqUnit.assertTrue("The third line of the multipart content must contain the Content-Type", parts[2].indexOf('Content-Type') !== -1);
            jqUnit.assertTrue("The Content-Type should be 'image'", parts[2].indexOf(file.type) !== -1);
            jqUnit.assertTrue("The sixth line of the multipart content must also contain the boundary", parts[5].indexOf(boundary) !== -1);
        });
        
        html5UploaderTests.test("Uploader HTML5 browseHandler", function () {
            var browseButton = $("#browseButton");
            var browseButtonView = fluid.uploader.html5Strategy.browseButtonView("#browseButtonContainer", {
                queueSettings: {
                    fileTypes: ""
                }
            });
            
            var inputs = browseButton.children();
            jqUnit.assertEquals("There should be one multi-file input element at the start", 1, inputs.length);
            jqUnit.assertEquals("The multi-file input element should be visible and in the tab order to start", 
                0, inputs.eq(0).attr("tabindex"));
            
            browseButtonView.renderFreshMultiFileInput();
            inputs = browseButton.children();
            jqUnit.assertEquals("After the first batch of files have processed, there should now be two multi-file input elements", 
                2, inputs.length);
            jqUnit.assertEquals("The original multi-file input element should be removed from the tab order", 
                -1, inputs.eq(0).attr("tabindex"));            
            jqUnit.assertEquals("The second multi-file input element should be visible and in the tab order", 
                0, inputs.eq(1).attr("tabindex"));
            
            inputs.eq(1).focus();
            jqUnit.assertTrue("On focus, the browseButton input has the focus class", browseButton.hasClass("focus"));
            
            inputs.eq(1).blur();
            jqUnit.assertFalse("On blur, the browseButton no longer has the focus class", browseButton.hasClass("focus"));
        });
    });
})(jQuery);