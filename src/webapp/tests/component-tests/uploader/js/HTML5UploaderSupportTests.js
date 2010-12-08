/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/

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
        
        html5UploaderTests.test("Uploader HTML5 browseHandler", function () {
            var browseButton = $("<a href='#' name='browseButton'>Nothing</a>");
            var addFilesFn = function() {};
            var browseHandler = fluid.uploader.html5.browseHandler(events, browseButton, addFilesFn);
            var inputs = browseButton.children();

            jqUnit.assertEquals("There should be one multi-file input element at the start", 1, inputs.length);
            jqUnit.assertEquals("The multi-file input element should be visible and in the tab order to start", 0, inputs.eq(0).attr("tabindex"));
            
            browseHandler.renderFreshMultiFileInput();
            inputs = browseButton.children();
            
            jqUnit.assertEquals("After the first batch of files have processed, there should now be two multi-file input elements", 2, inputs.length);
            jqUnit.assertEquals("The original multi-file input element should be removed from the tab order", -1, inputs.eq(0).attr("tabindex"));            
            jqUnit.assertEquals("The second multi-file input element should be visible and in the tab order", 0, inputs.eq(1).attr("tabindex"));
        });
    })
})(jQuery);