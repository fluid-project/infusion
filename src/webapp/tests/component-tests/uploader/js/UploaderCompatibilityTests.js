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

        var testComponents = function (uploader) {
            var flashMovieSettings = uploader.options.components.strategy.options.flashMovieSettings;
            jqUnit.assertEquals("The flashURL should have been correctly assigned to the strategy's options.",
                oldOptions.uploadManager.options.flashURL,
                flashMovieSettings.flashURL);
            jqUnit.assertEquals("The flashButtonImageURL should have been assigned to the strategy's options.",
                oldOptions.decorators[0].options.flashButtonImageURL,
                flashMovieSettings.flashButtonImageURL);
        };
        
        var testQueueSettings = function (uploader) {
            var queueSettings = uploader.options.queueSettings;
            jqUnit.assertEquals("The uploadURL should have been assigned to the queueSettings option.",
                oldOptions.uploadManager.options.uploadURL,
                queueSettings.uploadURL);
            jqUnit.assertEquals("flashURL should also have been assigned to the queueSettings option.",
                oldOptions.uploadManager.options.flashURL,
                queueSettings.flashURL);  
        };
        
        var testDefaults = function (uploader) {
            // Ensure that one of the options we don't override is still set correctly.
            jqUnit.assertEquals("The fileQueueView component option should still be set to the default.",
                fluid.defaults("fluid.uploader.multiFileUploader").components.fileQueueView.type,
                uploader.options.components.fileQueueView.type);
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
        
        var checkUploaderOptions = function (uploader) {
            testComponents(uploader);
            testQueueSettings(uploader);
            testDefaults(uploader);
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