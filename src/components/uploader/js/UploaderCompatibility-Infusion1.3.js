/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_1_9 = fluid_1_9 || {};

/**************************************************************************************
 * Note: this file should not be included in the InfusionAll build.                   *
 * Instead, users should add this file manually if backwards compatibility is needed. *
 **************************************************************************************/

(function (fluid) {
    "use strict";

    fluid.registerNamespace("fluid.compat.fluid_1_3.uploader");

    fluid.enhance.check({"fluid.uploader.fluid_1_3" : true});

    fluid.compat.fluid_1_3.uploader.fileTypeTransformer = function (val) {
        var mimeTypeMap = fluid.uploader.mimeTypeRegistry;
        if (fluid.isArrayable(val) || typeof (val) !== "string") {
            return val;
        }

        var exts = val.split(";");
        if (exts.length === 0) {
            return undefined;
        }

        var mimeTypes = [];
        fluid.each(exts, function (ext) {
            ext = ext.substring(2);
            var mimeType = mimeTypeMap[ext];
            if (mimeType) {
                mimeTypes.push(mimeType);
            }
        });

        return mimeTypes;
    };

    fluid.compat.fluid_1_3.uploader.optionsRules = {
        // TODO: Remove these when model transformation can handle additive transformations.
        "gradeNames": "gradeNames",
        "components": "components",
        "invokers": "invokers",
        "queueSettings": "queueSettings",
        "demo": "demo",
        "selectors": "selectors",
        "focusWithEvent": "focusWithEvent",
        "styles": "styles",
        "events": "events",
        "listeners": "listeners",
        "strings": "strings",
        "mergePolicy": "mergePolicy",

        "queueSettings.fileTypes": {
            transform: {
                type: "fluid.compat.fluid_1_3.uploader.fileTypeTransformer",
                inputPath: "queueSettings.fileTypes"
            }
        }
    };

    fluid.demands("fluid.uploader", "fluid.uploader.fluid_1_3", {
        options: fluid.transformOne(fluid.compat.fluid_1_3.uploader.optionsRules)
    });

    // TODO: In theory, this could be done with a mergePolicy on "transformOptions", if only we could ensure a scheme
    // for ordering fluid_1_2.uploader before fluid_1_3.uploader in the sequence
    fluid.demands("fluid.uploader", ["fluid.uploader.fluid_1_2", "fluid.uploader.fluid_1_3"], {
        options: fluid.transformMany([fluid.compat.fluid_1_2.uploader.optionsRules, fluid.compat.fluid_1_3.uploader.optionsRules])
    });

})(fluid_1_9);
