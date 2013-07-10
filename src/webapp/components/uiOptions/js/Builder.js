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

    fluid.setLogging(fluid.logLevel.TRACE);
    fluid.registerNamespace("fluid.uiOptions");

    fluid.defaults("fluid.uiOptions.builder", {
        gradeNames: ["fluid.eventedComponent", "fluid.uiOptions.primaryBuilder", "fluid.uiOptions.auxBuilder", "autoInit"],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },
        defaultName: "fluid.uiOptions.create",
        UIOGrade: {
            expander: {
                func: "fluid.uiOptions.builder.attach",
                args: ["{that}.options.auxSchema.panels", "fluid.uiOptions.builder.uiOptions"]
            }
        },
        UIEGrade: {
            expander: {
                func: "fluid.uiOptions.builder.attach",
                args: ["{that}.options.auxSchema.enactors", "fluid.uiOptions.builder.enhancer"]
            }
        },
        listeners: {
            onCreate: {
                listener: "fluid.defaults",
                args: [{
                    expander: {
                        func: "fluid.uiOptions.builder.provideName",
                        args: ["{that}.options.auxSchema.name", "{that}.options.defaultName"]
                    }
                }, {
                    mergePolicy: {
                        auxSchema: "noexpand",
                        schema: "noexpand"
                    },
                    auxSchema: "{that}.options.auxSchema",
                    schema: "{that}.options.schema",
                    gradeNames: ["autoInit", "fluid.viewComponent", "{that}.options.UIOGrade", "{that}.options.UIEGrade"]
                }]
            }
        }
    });
    
    fluid.uiOptions.builder.finalInit = function (that) {
        console.log(that);
    };

    fluid.defaults("fluid.uiOptions.builder.enhancer", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            enhancer: {
                type: "fluid.uiEnhancer",
                container: "body",
                options: {
                    components: "{fluid.uiOptions.builder.enhancer}.options.auxSchema.enactors",
                    invokers: {
                        attachStaticEnv: {
                            funcName: "fluid.uiOptions.builder.attachStaticEnv",
                            args: ["{that}"]
                        }
                    },
                    listeners: {
                        onCreate: "{that}.attachStaticEnv"
                    }
                }
            }
        }
    });

    fluid.uiOptions.builder.attachStaticEnv = function (UIEnhancer) {
        fluid.staticEnvironment.uiEnhancer = UIEnhancer;
    };

    fluid.defaults("fluid.uiOptions.builder.uiOptions", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            uiOptions: {
                type: "fluid.uiOptions.fatPanel",
                container: "{fluid.uiOptions.builder.uiOptions}.container",
                options: {
                    prefix: "{fluid.uiOptions.builder.uiOptions}.options.auxSchema.templatePrefix",
                    components: {
                        templateLoader: {
                            options: {
                                templates: "{fluid.uiOptions.builder.uiOptions}.options.auxSchema.templates"
                            }
                        },
                        uiOptions: {
                            options: {
                                components: "{fluid.uiOptions.builder.uiOptions}.options.auxSchema.panels"
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.uiOptions.builder.attach = function (components, gradeName) {
        if (!$.isEmptyObject(components)) {
            return gradeName;
        }
    };

    fluid.uiOptions.builder.provideName = function (suppliedName, defaultName) {
        return suppliedName || defaultName;
    };

})(jQuery, fluid_1_5);
