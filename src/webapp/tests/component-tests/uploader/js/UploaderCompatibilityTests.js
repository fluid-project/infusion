/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        
        fluid.registerNamespace("fluid.tests.uploader");
        
        var compatTests = new jqUnit.TestCase("Uploader Compatibility Tests");
        
        /****************************************
         * Infusion 1.2-1.3 Compatibility Tests *
         ****************************************/
         
        var oldOptions = {
            uploadManager: {
                type: "fluid.swfUploadManager",
                options: {
                    uploadURL: "include/lib/upload.php",
                    flashURL: "jscripts/infusion/lib/swfupload/flash/swfupload.swf"
                }
            },

            listeners: {
                onFileSuccess: fluid.identity
            },

            decorators: [{
                type: "fluid.swfUploadSetupDecorator",
                options: {
                    flashButtonImageURL: "jscripts/infusion/components/uploader/images/browse.png"
                }
            }]
        };
        
        var modernOptions = {
            components: {
                strategy: {
                    options: {
                        flashMovieSettings: {
                            flashURL: "jscripts/infusion/lib/swfupload/flash/swfupload.swf",
                            flashButtonImageURL: "jscripts/infusion/components/uploader/images/browse.png"
                        }
                    }
                }
            },

            queueSettings: {
                uploadURL: "include/lib/upload.php",
                flashURL: "jscripts/infusion/lib/swfupload/flash/swfupload.swf" // Lazily moved over in rules.
            },

            listeners: {
                onFileSuccess: fluid.identity
            }
        };
        
        // Choose html5 configuration for all tests since it will cause resolution of multiFileUpload
        // and not complain about absence of SWF
        fluid.staticEnvironment.uploaderConfig = fluid.typeTag("fluid.browser.supportsBinaryXHR");
        
        fluid.defaults("fluid.tests.uploader.parent", {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            components: {
                uploaderContext: {
                    type: "fluid.typeFount",
                    options: {
                        targetTypeName: "fluid.uploader.html5"
                    }
                },
                uploader: {
                    type: "fluid.uploader",
                    container: ".flc-uploader",
                    options: "{parent}.options.uploaderOptions"
                }
            }
        });

        fluid.tests.uploader.noIoC = function (options, rules) {
            return fluid.uploader(".flc-uploader", options);
        };
        
        fluid.tests.uploader.ioc = function (options) {
            var parent = fluid.tests.uploader.parent({
                uploaderOptions: options
            });
            return parent.uploader;
        };
        
        var uploaderConfigs = [{label: "no IoC", uploader: fluid.tests.uploader.noIoC}, {label: "ioc", uploader: fluid.tests.uploader.ioc}];
        
        var testTransformation = function (spec, source, target) {
            for (var sourcePath in spec) {
                var targetPath = spec[sourcePath];
                jqUnit.assertEquals(sourcePath + " should have been transformed to " + targetPath,
                    fluid.get(source, sourcePath), fluid.get(target, targetPath));
            }
        };
        
        var checkUploaderOptions = function (uploader) {
            testTransformation({
                // Flash Settings
                "uploadManager.options.flashURL": "components.strategy.options.flashMovieSettings.flashURL",
                "decorators.0.options.flashButtonImageURL": "components.strategy.options.flashMovieSettings.flashButtonImageURL",
            
                // Queue Settings
                "uploadManager.options.uploadURL": "queueSettings.uploadURL",
                
                // Listeners: move as is.
                "listeners.onFileSuccess": "listeners.onFileSuccess"
            }, oldOptions, uploader.options);
                
            // Ensure that one of the options we don't override is still set correctly.
            testTransformation({
                "components.fileQueueView.type": "components.fileQueueView.type"
            }, fluid.defaults("fluid.uploader.multiFileUploader"), uploader.options);
        };
        
        var testUploaderConfigs = function (rules, optionsTypes, checkFn, msg) {
            fluid.each(uploaderConfigs, function (uploaderConfig) {
                fluid.each(optionsTypes, function (optionsType) {
                    compatTests.test(msg + " " + uploaderConfig.label + " - " + optionsType.label, function () {
                        var uploader = uploaderConfig.uploader.apply(null, [optionsType.options, rules]);
                        checkFn(uploader);
                    });
                });
            });
        };
        
        testUploaderConfigs(fluid.compat.fluid_1_2.uploader.optionsRules, [
            {
                label: "old options", 
                options: oldOptions
            }, 
            {
                label: "modern options", 
                options: modernOptions
            }
        ], checkUploaderOptions, "Uploader 1.2->1.3 options backwards compatibility;");


        /****************************************
         * Infusion 1.3-1.4 Compatibility Tests *
         ****************************************/
        
        var oldImageTypes = "*.jpg;*.png";
        var modernImageTypes =  ["image/jpeg", "image/png"];
        
        var checkUploaderFileTypes = function (uploader) {
            jqUnit.assertDeepEq("File types should be an array of MIME types.", 
                modernImageTypes, uploader.options.queueSettings.fileTypes);
        };

        testUploaderConfigs(fluid.compat.fluid_1_3.uploader.optionsRules, [
            {
                label: "1.3-era options", 
                options: {
                    queueSettings: {
                        fileTypes: oldImageTypes
                    }
                }
            }, 
            {
                label: "modern 1.4 options", 
                options: {
                    queueSettings: {
                        fileTypes: modernImageTypes
                    }
                }
            }
        ], checkUploaderFileTypes, "Uploader 1.3->1.4 options backwards compatibility;");
        
        var rules1_2To1_4 = [
            fluid.compat.fluid_1_2.uploader.optionsRules, 
            fluid.compat.fluid_1_3.uploader.optionsRules
        ];
        
        testUploaderConfigs(rules1_2To1_4, [
            {
                label: "1.2-era options",
                options: {
                    uploadManager: {
                        options: {
                            fileTypes: oldImageTypes
                        }
                    }
                }
            }
        ], checkUploaderFileTypes, "Uploader 1.2->1.4 options backwards compatibility;");
    });
})(jQuery);