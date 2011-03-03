/*
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid_1_4:true, window, swfobject*/

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {

    fluid.uploader = fluid.uploader || {};
    
    fluid.uploader.mimeTypeRegistry = {
        JPG: {
            extension: "image/jpeg",
            fileTypeExtension: "*.jpg"                
        },
        JPEG: {
            extension: "image/jpeg",
            fileTypeExtension: "*.jpeg"
        },
        PNG: {
            extension: "image/png",
            fileTypeExtension: "*.png"
        },
        TIF: {
            extension: "image/tiff",
            fileTypeExtension: "*.tif"
        },
        TIFF: {
            extension: "image/tiff",
            fileTypeExtension: "*.tiff"            
        }
    };    
})(jQuery, fluid_1_4);        