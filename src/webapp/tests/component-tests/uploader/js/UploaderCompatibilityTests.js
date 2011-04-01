(function ($) {
    $(document).ready(function () {
        var compatTests = new jqUnit.TestCase("Uploader Compatibility Tests");
        
        var oldStyleImageTypes = "*.jpg;*.png";
        var newStyleImageTypes =  ["image/jpeg", "image/png"];
        
        var makeUploader = function (options) {
            var container = $(".flc-uploader");
            return fluid.uploader(container, options);
        };
        
        // Test old-style fileTypes in 1.3-compatible options.
        compatTests.test("", function () {
            var uploader = makeUploader({
                queueSettings: {
                    fileTypes: oldStyleImageTypes
                }
            });
            jqUnit.assertEquals("Old-style string fileTypes should be converted to an array of MIME types.", 
                    uploader.options.queueSettings.fileTypes, newStyleImageTypes);
            
            // Test 1.4-level options--fileTypes is already an array.
            uploader = makeUploader({
                queueSettings: {
                    fileTypes: newStyleImageTypes
                }
            });
            jqUnit.assertEquals("1.4-compatible fileTypes should not be transformed.", 
                    uploader.options.queueSettings.fileTypes, newStyleImageTypes);

            // Test 1.2-level options, where the user doesn't nest fileTypes inside queueSettings.
            uploader = makeUploader({
                uploadManager: {
                    options: {
                        fileTypes: oldStyleImageTypes
                    }
                }
            });
            jqUnit.assertEquals("1.2-compatible fileTypes should be transformed.", 
                    uploader.options.queueSettings.fileTypes, 
                    newStyleImageTypes);        
        });
    });
})(jQuery);