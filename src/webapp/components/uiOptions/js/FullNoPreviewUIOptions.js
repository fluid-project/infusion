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
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    /******************************
     * Full No Preview UI Options *
     ******************************/

    fluid.defaults("fluid.uiOptions.fullNoPreview", {
        gradeNames: ["fluid.uiOptions.inline"],
        container: "{fullNoPreview}.container",
        derivedDefaults: {
            templateLoader: {
                options: {
                    templates: {
                        uiOptions: "%prefix/FullNoPreviewUIOptions.html"
                    }
                }
            },
            uiOptions: {
                options: {
                    components: {
                        preview: {
                            type: "fluid.emptySubcomponent"
                        }
                    },
                    listeners: {
                        onReset: function (uiOptions) {
                            uiOptions.save();
                        }
                    }
                }
            }
        }
    });
    
    fluid.uiOptions.inline.makeCreator("fluid.uiOptions.fullNoPreview", fluid.identity); 
    
})(jQuery, fluid_1_4);