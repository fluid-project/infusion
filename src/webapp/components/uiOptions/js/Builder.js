/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};


(function ($, fluid) {

    fluid.registerNamespace("fluid.uiOptions");

    fluid.defaults("fluid.uiOptions.builder", {
        gradeNames: ["fluid.uiOptions.primaryBuilder", "fluid.uiOptions.auxBuilder", "autoInit"],
        components: {
            assembler: {
                type: "fluid.uiOptions.builder.assembler"
            }
        }
    });

    fluid.defaults("fluid.uiOptions.builder.assembler", {
        gradeNames: ["autoInit", "fluid.eventedComponent", "{fluid.uiOptions.builder}.buildPrimary"],
        auxSchema: "{fluid.uiOptions.builder}.options.expandedAuxSchema",
        defaultName: "fluid.uiOptions.create",
        invokers: {
            attachUIOptions: {
                funcName: "fluid.uiOptions.builder.assembler.attach",
                args: ["{that}.options.auxSchema.panels", "fluid.uiOptions.builder.assembler.uiOptions"]
            },
            attachEnhancer: {
                funcName: "fluid.uiOptions.builder.assembler.attach",
                args: ["{that}.options.auxSchema.enactors", "fluid.uiOptions.builder.assembler.enhancer"]
            }
        },
        listeners: {
            onCreate: {
                listener: "fluid.defaults",
                args: [{
                    expander: {
                        func: "fluid.uiOptions.builder.assembler.provideName",
                        args: ["{that}.options.auxSchema.name", "{that}.options.defaultName"]
                    }
                }, {
                    auxSchema: "{that}.options.auxSchema",
                    schema: "{that}.options.schema",
                    gradeNames: ["autoInit", "fluid.viewComponent", "{that}.attachUIOptions", "{that}.attachEnhancer"]
                }]
            }
        }
    });

    fluid.defaults("fluid.uiOptions.builder.assembler.enhancer", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            enhancer: {
                type: "fluid.pageEnhancer",
                options: {
                    components: "{fluid.uiOptions.builder.assembler.enhancer}.options.auxSchema.enactors"
                }
            }
        }
    });

    fluid.defaults("fluid.uiOptions.builder.assembler.uiOptions", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            uiOptions: {
                type: "fluid.uiOptions.fatPanel",
                container: "{fluid.uiOptions.builder.assembler.uiOptions}.container",
                options: {
                    prefix: "{fluid.uiOptions.builder.assembler.uiOptions}.options.auxSchema.templatePrefix",
                    components: {
                        templateLoader: {
                            options: {
                                templates: "{fluid.uiOptions.builder.assembler.uiOptions}.options.auxSchema.templates"
                            }
                        },
                        uiOptions: {
                            options: {
                                components: "{fluid.uiOptions.builder.assembler.uiOptions}.options.auxSchema.panels"
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.uiOptions.builder.assembler.attach = function (components, gradeName) {
        if (!$.isEmptyObject(components)) {
            return gradeName;
        }
    };

    fluid.uiOptions.builder.assembler.provideName = function (suppliedName, defaultName) {
        return suppliedName || defaultName;
    };

})(jQuery, fluid_1_5);
