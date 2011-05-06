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
        
        fluid.defaults("fluid.tests.uploader.parent", {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            components: {
                uploaderContext: {
                    type: "fluid.progressiveCheckerForComponent",
                    options: {
                        componentName: "fluid.uploader"
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
        
        var uploaderConfigs = [fluid.tests.uploader.noIoC, fluid.tests.uploader.ioc];
        var optionsTypes = [oldOptions, modernOptions];
        
        
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
        
        compatTests.test("Uploader 1.2 full options backwards compatibility", function () {
            for (var i = 0; i < uploaderConfigs.length; i++) {
                for (var j = 0; j < optionsTypes.length; j++) {
                    var uploader = uploaderConfigs[i].apply(null, [optionsTypes[j]]);
                    checkUploaderOptions(uploader);
                }
            }
        });
    });
})(jQuery);