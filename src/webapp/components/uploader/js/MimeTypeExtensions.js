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
            type: "image/jpeg",
            ext: "*.jpg"                
        },
        JPEG: {
            type: "image/jpeg",
            ext: "*.jpeg"
        },
        BMP: {
            type: "image/bmp",
            ext: "*.bmp"
        },
        PNG: {
            type: "image/png",
            ext: "*.png"
        },
        TIF: {
            type: "image/tiff",
            ext: "*.tif"
        },
        TIFF: {
            type: "image/tiff",
            ext: "*.tiff"            
        },
        MP3: {
            type: "audio/mpeg",
            ext: "*.mp3"
        },
        WAV: {
            type: "audio/x-wav",
            ext: "*.wav"
        },        
        HTML: {
            type: "text/html",
            ext: "*.html"
        },
        HTM: {
            type: "text/html",
            ext: "*.htm"
        },
        TXT: {
            type: "text/plain",
            ext: "*.txt"
        },
        MPG: {
            type: "video/mpeg",
            ext: "*.mpg"
        },
        MPEG: {
            type: "video/mpeg",
            ext: "*.mpeg"
        },
        MOV: {
            type: "video/quicktime",
            ext: "*.mov"
        },
        AVI: {
            type: "video/x-msvideo",
            ext: "*.avi"
        }
    };    
})(jQuery, fluid_1_4);        