/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        fluid.registerNamespace("fluid.tests.uploader");

        // Choose html5 configuration for all tests since it will cause resolution of multiFileUpload
        fluid.tests.uploader.commonTags = {
            "fluid.browser.supportsBinaryXHR": true,
            "fluid.browser.supportsFormData": true
        };

        fluid.contextAware.makeChecks(fluid.tests.uploader.commonTags);
        fluid.contextAware.forgetChecks("fluid.uploader.requiredApi");

        fluid.setLogging(true);

        jqUnit.module("Uploader Compatibility Tests");

        /****************************************
         * Infusion 1.2-1.3 Compatibility Tests *
         ****************************************/

        fluid.tests.uploader.oldOptions = {
            uploadManager: {
                type: "fluid.swfUploadManager",
                options: {
                    uploadURL: "include/lib/upload.php"
                }
            },

            listeners: {
                onFileSuccess: [fluid.identity]
            }
        };

        fluid.tests.uploader.modernOptions = {
            queueSettings: {
                uploadURL: "include/lib/upload.php"
            },

            listeners: {
                onFileSuccess: [fluid.identity]
            }
        };


        fluid.defaults("fluid.tests.uploader.parentWrapper", {
            gradeNames: ["fluid.component"],
            components: {
                uploader: {
                    type: "fluid.uploader",
                    container: ".flc-uploader",
                    options: "{parentWrapper}.options.uploaderOptions"
                }
            }
        });

        fluid.tests.uploader.noIoC = function (options, rules) {
            var transRec = (fluid.isArrayable(rules) ? fluid.transformMany : fluid.transformOne) (rules);
            return fluid.uploader(".flc-uploader", $.extend(true, options, transRec));
        };

        fluid.tests.uploader.ioc = function (options) {
            var parent = fluid.tests.uploader.parentWrapper({uploaderOptions: options});
            return parent.uploader;
        };

        fluid.tests.uploader.uploaderConfigs = [{label: "no IoC", uploader: fluid.tests.uploader.noIoC}, {label: "ioc", uploader: fluid.tests.uploader.ioc}];

        fluid.tests.uploader.testTransformation = function (spec, source, target) {
            for (var sourcePath in spec) {
                var targetPath = spec[sourcePath];
                var sourceItem = fluid.get(source, sourcePath);
                var targetItem = fluid.get(target, targetPath);
                jqUnit.assertDeepEq(sourcePath + " should have been transformed to " + targetPath, sourceItem, targetItem);
            }
        };

        fluid.tests.uploader.checkUploaderOptions = function (uploader) {
            fluid.tests.uploader.testTransformation({
                // Queue Settings
                "uploadManager.options.uploadURL": "queueSettings.uploadURL",

                // Listeners: move as is.
                "listeners.onFileSuccess": "listeners.onFileSuccess"
            }, fluid.tests.uploader.oldOptions, uploader.options);

            // Ensure that one of the options we don't override is still set correctly.
            fluid.tests.uploader.testTransformation({
                "components.fileQueueView.type": "components.fileQueueView.type"
            }, fluid.defaults("fluid.uploader.multiFileUploader"), uploader.options);
        };

        fluid.tests.uploader.testUploaderConfigs = function (options) {
            fluid.each(fluid.tests.uploader.uploaderConfigs, function (uploaderConfig) {
                fluid.each(options.optionsTypes, function (optionsType) {
                    jqUnit.test(options.message + " " + uploaderConfig.label + " - " + optionsType.label, function () {
                        fluid.contextAware.makeChecks(options.tags);
                        fluid.constructSingle([], {
                            type: options.distributor,
                            singleRootType: "fluid.uploader.compatibility.distributor"
                        });
                        var uploader = uploaderConfig.uploader(fluid.copy(optionsType.options), options.rules);
                        options.checkFn(uploader);
                        fluid.contextAware.forgetChecks(Object.keys(options.tags));
                        fluid.destroySingle([], "fluid.uploader.compatibility.distributor");
                    });
                });
            });
        };

        fluid.tests.uploader.testUploaderConfigs({
            rules: fluid.compat.fluid_1_2.uploader.optionsRules,
            tags: {"fluid.uploader.requiredApi": {
                value: "fluid_1_2"
            }},
            distributor: "fluid.uploader.compatibility.distributor.1_3",
            optionsTypes: [
                {
                    label: "old options",
                    options: fluid.tests.uploader.oldOptions
                },
                {
                    label: "modern options",
                    options: fluid.tests.uploader.modernOptions
                }
            ],
            checkFn: fluid.tests.uploader.checkUploaderOptions,
            message: "Uploader 1.2->1.3 options backwards compatibility;"
        });


        /****************************************
         * Infusion 1.3-1.4 Compatibility Tests *
         ****************************************/

        fluid.tests.uploader.oldImageTypes = "*.jpg;*.png";
        fluid.tests.uploader.modernImageTypes =  ["image/jpeg", "image/png"];

        fluid.tests.uploader.checkUploaderFileTypes = function (uploader) {
            jqUnit.assertDeepEq("File types should be an array of MIME types.",
                fluid.tests.uploader.modernImageTypes, uploader.options.queueSettings.fileTypes);
        };

        fluid.tests.uploader.testUploaderConfigs({
            rules: fluid.compat.fluid_1_3.uploader.optionsRules,
            tags: {"fluid.uploader.requiredApi": {
                value: "fluid_1_3"
            }},
            distributor: "fluid.uploader.compatibility.distributor.1_4",
            optionsTypes: [
                {
                    label: "1.3-era options",
                    options: {
                        queueSettings: {
                            fileTypes: fluid.tests.uploader.oldImageTypes
                        }
                    }
                },
                {
                    label: "modern 1.4 options",
                    options: {
                        queueSettings: {
                            fileTypes: fluid.tests.uploader.modernImageTypes
                        }
                    }
                }
            ],
            checkFn: fluid.tests.uploader.checkUploaderFileTypes,
            message: "Uploader 1.3->1.4 options backwards compatibility;"
        });

        fluid.tests.uploader.rules1_2To1_4 = [
            fluid.compat.fluid_1_2.uploader.optionsRules,
            fluid.compat.fluid_1_3.uploader.optionsRules
        ];

        fluid.tests.uploader.testUploaderConfigs({
            rules: fluid.tests.uploader.rules1_2To1_4,
            tags: {"fluid.uploader.requiredApi": {
                value: "fluid_1_2"
            }},
            distributor: "fluid.uploader.compatibility.distributor.1_4",
            optionsTypes: [{
                label: "1.2-era options",
                options: {
                    uploadManager: {
                        options: {
                            fileTypes: fluid.tests.uploader.oldImageTypes
                        }
                    }
                }
            }],
            checkFn: fluid.tests.uploader.checkUploaderFileTypes,
            message: "Uploader 1.2->1.4 options backwards compatibility;"
        });
    });
})(jQuery);
