/*
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid_1_4:true, window, swfobject*/

(function ($) {
    $(document).ready(function () {
        
        var mimeTypeCompatibilityTests = new jqUnit.TestCase("Uploader MIME type Compatibility Tests");
        
        mimeTypeCompatibilityTests.test("Convert MIME types into SWFUpload file types", function () {
            var options = {
                queueSettings: {
                    fileTypes: [
                        "image/tiff",
                        "image/png",
                        "image/jpeg"
                    ]
                }
            };            
            var result = fluid.uploader.fileTypeTransformer(options, {
                path: "queueSettings.fileTypes"
            });
            
            jqUnit.assertEquals("The file types string for SWFUpload is", result, "*.tif,*.tiff,*.png,*.jpg,*.jpeg");
        });    
        
        mimeTypeCompatibilityTests.test("Two of the MIME types are invalid", function () {
            var options = {
                queueSettings: {
                    fileTypes: [
                        "*.jpg",
                        "image/png",
                        "*.html"
                    ]
                }
            };            
            var result = fluid.uploader.fileTypeTransformer(options, {
                path: "queueSettings.fileTypes"
            });
            
            jqUnit.assertEquals("The file types string for SWFUpload is", result, "*.png");
        });        
        
        mimeTypeCompatibilityTests.test("All MIME types are invalid:  Accept all file types", function () {
            var options = {
                queueSettings: {
                    fileTypes: [
                        "*.jpg",
                        "image/hello",
                        "*.html"
                    ]
                }
            };            
            var result = fluid.uploader.fileTypeTransformer(options, {
                path: "queueSettings.fileTypes"
            });
            
            jqUnit.assertEquals("The file types string for SWFUpload is", result, "*");
        });        
        
        mimeTypeCompatibilityTests.test("All MIME types are invalid:  Accept all file types", function () {
            var options = {
                queueSettings: {
                    fileTypes: [
                        "*.jpg",
                        "image/hello",
                        "*.html"
                    ]
                }
            };            
            var result = fluid.uploader.fileTypeTransformer(options, {
                path: "queueSettings.fileTypes"
            });
            
            jqUnit.assertEquals("The file types string for SWFUpload is", result, "*");
        });
        
        mimeTypeCompatibilityTests.test("File types provided is not an array.  No transformations performed.", function () {
            var options = {
                queueSettings: {
                    fileTypes: "*.jpg,image/png,*.txt"
                }
            };            
            var result = fluid.uploader.fileTypeTransformer(options, {
                path: "queueSettings.fileTypes"
            });
            
            jqUnit.assertEquals("The file types string for SWFUpload is", result, "*.jpg,image/png,*.txt");
        });                
    });    
})(jQuery);
