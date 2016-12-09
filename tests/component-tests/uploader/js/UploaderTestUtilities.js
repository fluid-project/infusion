/*
Copyright 2011 OCAD University
Copyright 2013 Raising the Floor - US

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.uploader");

    // Enough of an uploader to test local and remote strategies
    fluid.defaults("fluid.tests.uploader.mockUploader", {
        gradeNames: ["fluid.component", "fluid.tests.uploader"],
        queueSettings: fluid.uploader.defaultQueueSettings,
        events: {
            onFileStart: null, // for remote strategy
            onFileProgress: null,
            onFileSuccess: null,
            onFileError: null,
            onFileComplete: null,
            onUploadStop: null,
            afterFileComplete: null,
            afterUploadComplete: null,

            onFileDialog: null, // for local strategy
            onFilesSelected: null,
            afterFileDialog: null,
            afterFileQueued: null,
            onQueueError: null,

            afterReady: null,
            onFileQueued: null
        },
        components: {
            queue: {
                type: "fluid.uploader.fileQueue"
            }
        }
    });


    fluid.tests.uploader.mockFormData = function () {
        var that = {
            data: {}
        };

        that.resetMock = function () {
            that.data = {};
        };

        that.append = function (key, value) {
            that.data[key] = value;
        };

        return that;
    };

})();
