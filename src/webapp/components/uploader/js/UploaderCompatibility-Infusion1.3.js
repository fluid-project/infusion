/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

/**************************************************************************************
 * Note: this file should not be included in the InfusionAll build.                   *
 * Instead, users should add this file manually if backwards compatibility is needed. *
 **************************************************************************************/
 
(function (fluid) {
    
    fluid.registerNamespace("fluid.compat.fluid_1_3.uploader");
    fluid.staticEnvironment.uploader_1_3_Compatibility = fluid.typeTag("fluid.uploader.fluid_1_3");

    fluid.compat.fluid_1_3.uploader.fileTypeTransformer = function (model, expandSpec) {
        var mimeTypeMap = fluid.uploader.mimeTypeRegistry;
        var val = fluid.get(model, expandSpec.path);
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
            expander: {
                type: "fluid.compat.fluid_1_3.uploader.fileTypeTransformer", 
                path: "queueSettings.fileTypes"
            }
        }
    };
    
    fluid.demands("fluid.uploader", "fluid.uploader.fluid_1_3", {
        mergeOptions: {
            transformOptions: {
                transformer: "fluid.model.transformWithRules",
                config: fluid.compat.fluid_1_3.uploader.optionsRules
            }
        }
    });
    
    fluid.demands("fluid.uploader", ["fluid.uploader.fluid_1_2", "fluid.uploader.fluid_1_3"], {
        mergeOptions: {
            transformOptions: {
                transformer: "fluid.model.transformWithRules",
                config: [fluid.compat.fluid_1_2.uploader.optionsRules, fluid.compat.fluid_1_3.uploader.optionsRules]
            }
        }
    });
    
    fluid.uploader.transformOptions = function (options) {
        if (!options) {
            return;
        }
        
        var rules = typeof (fluid.compat.fluid_1_2.uploader) !== "undefined" ? 
            [fluid.compat.fluid_1_2.uploader.optionsRules, fluid.compat.fluid_1_3.uploader.optionsRules] :
            fluid.compat.fluid_1_3.uploader.optionsRules;
        
        options.transformOptions = {
            transformer: "fluid.model.transformWithRules",
            config: rules
        };
        
        return options;
    };
})(fluid_1_4);
