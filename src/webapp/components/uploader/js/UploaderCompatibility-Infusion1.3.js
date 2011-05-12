/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

/*********************************************************************************************
 * Note: this file should not be included in any Infusion build.                             *
 * Instead, users can choose to add this file manually if they need backwards compatibility. *
 *********************************************************************************************/
 
(function ($, fluid) {
    
    fluid.registerNamespace("fluid.compat.fluid_1_3.uploader");
    fluid.staticEnvironment.uploaderCompatibility = fluid.typeTag("fluid.uploader.fluid_1_3");

    fluid.compat.fluid_1_3.uploader.optionsRules = {
        "queueSettings.fileTypes": { 
            type: "fluid.uploader.fileTypeTransformer", 
            path: "queueSettings.fileTypes"
        }
    };
    
    // TODO: Implement an IoC-resolved version.
})(jQuery, fluid_1_4);
