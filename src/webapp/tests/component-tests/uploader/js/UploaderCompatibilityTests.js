(function ($) {
    $(document).ready(function () {
        fluid.registerNamespace("fluid.tests.uploader");
        
        var compatTests = new jqUnit.TestCase("Uploader Compatibility Tests");
        
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

        fluid.tests.uploader.noIoC = function (options) {
            options.transformOptions = {
                transformer: "fluid.model.transformWithRules",
                config: fluid.compat.fluid_1_2.uploader.optionsRules
            };
            return fluid.uploader(".flc-uploader", options);
        };
        
        fluid.tests.uploader.ioc = function (options) {
            var parent = fluid.tests.uploader.parent({
                uploaderOptions: options
            });
            return parent.uploader;
        };
        
        var uploaderConfigs = [{label: "no IoC", uploader: fluid.tests.uploader.noIoC}, {label: "ioc", uploader: fluid.tests.uploader.ioc}];
        var optionsTypes = [{label: "old options", options: oldOptions}, {label: "modern options", options: modernOptions}];
        
        
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
        
        fluid.each(uploaderConfigs, function(uploaderConfig) {
            fluid.each(optionsTypes, function(optionsType) {
                compatTests.test("Uploader 1.2 full options backwards compatibility " + uploaderConfig.label + " - " + optionsType.label, function() {
                    var uploader = uploaderConfig.uploader.apply(null, [optionsType.options]);
                    checkUploaderOptions(uploader);
                });
            });
        });
    });
})(jQuery);