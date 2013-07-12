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
        gradeNames: ["fluid.eventedComponent", "fluid.uiOptions.primaryBuilder", "fluid.uiOptions.auxBuilder", "autoInit"],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },
        members: {
            consolidatedGrade: {
                expander: {
                    func: "fluid.uiOptions.builder.defaults",
                    args: ["{that}.options.auxSchema.namespace", {
                        gradeNames: ["fluid.viewComponent", "autoInit", "{that}.consolidationGrades.uiOptions", "{that}.consolidationGrades.enhancer"]
                    }]
                }
            },
            consolidationGrades: {
                enhancer: {
                    expander: {
                        func: "fluid.uiOptions.builder.attach",
                        args: ["{that}.constructedGrades.enactors", "fluid.uiOptions.builder.uie"]
                    }
                },
                uiOptions: {
                    expander: {
                        func: "fluid.uiOptions.builder.attach",
                        args: ["{that}.constructedGrades.panels", "fluid.uiOptions.builder.uio"]
                    }
                }
            },
            constructedGrades: {
                enactors: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.enactors", "{that}.options.auxSchema.enactors"]
                    }
                },
                messages: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.messages", "{that}.options.auxSchema.messages"]
                    }
                },
                panels: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.panels", "{that}.options.auxSchema.panels"]
                    }
                },
                rootModel: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.rootModel", "{that}.options.auxSchema.rootModel"]
                    }
                },
                templateLoader: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.templateLoader", "{that}.options.auxSchema.templateLoader"]
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.uiOptions.builder.uie", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            enhancer: {
                type: "fluid.uiEnhancer",// <--- need to change the type  or add a gradeName
                container: "body",
                options: {
                    gradeNames: ["{fluid.uiOptions.builder.uie}.options.constructedGrades.enactors", "{fluid.uiOptions.builder.uie}.options.constructedGrades.rootModel"],
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

    fluid.defaults("fluid.uiOptions.builder.uio", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            uiOptions: {
                type: "fluid.uiOptions.fatPanel",
                container: "{fluid.uiOptions.builder.uio}.container",
                options: {
                    gradeNames: ["{fluid.uiOptions.builder.uio}.options.constructedGrades.messages"],
                    components: {
                        templateLoader: {
                            options: {
                                gradeNames: ["{fluid.uiOptions.builder.uio}.options.constructedGrades.templateLoader"]
                            }
                        },
                        uiOptions: {
                            options: {
                                gradeNames: ["{fluid.uiOptions.builder.uio}.options.constructedGrades.panels", "{fluid.uiOptions.builder.uio}.options.constructedGrades.rootModel"]
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.uiOptions.builder.defaults = function (name, options) {
        fluid.defaults(name, options);
        return name;
    };

    fluid.uiOptions.builder.generateGrade = function (namespace, gradeNameTemplate, gradeOptions) {
        if (gradeOptions) {
            var gradeName = fluid.stringTemplate(gradeNameTemplate, {namespace: namespace});
            var opts = fluid.copy(gradeOptions);

            return fluid.uiOptions.builder.defaults(gradeName, opts);
        }
    };

    fluid.uiOptions.builder.attach = function (constructedGrade, consolidatedGrade) {
        if (constructedGrade) {
            return consolidatedGrade;
        }
    };

})(jQuery, fluid_1_5);
