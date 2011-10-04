/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global fluid_1_4:true*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function (fluid) {

    fluid.uploader = fluid.uploader || {};
    
    fluid.uploader.mimeTypeRegistry = {
        // Images
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        bmp: "image/bmp",
        png: "image/png",
        tif: "image/tiff",
        tiff: "image/tiff",
        
        // Audio
        mp3: "audio/mpeg",
        m4a: "audio/mp4a-latm",
        ogg: "audio/ogg",
        wav: "audio/x-wav",
        aiff: "audio/x-aiff",
        
        // Video
        mpg: "video/mpeg",
        mpeg: "video/mpeg",
        m4v: "video/x-m4v",
        ogv: "video/ogg",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        
        // Text documents
        html: "text/html",
        htm: "text/html",
        text: "text/plain",
        
        // Office Docs.
        doc: "application/msword",
        docx: "application/msword",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.ms-excel",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.ms-powerpoint"
    };    
})(fluid_1_4);