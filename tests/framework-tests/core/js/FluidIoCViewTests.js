/*
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.testComponent", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        default1: "testComponent value",
        components: {
            test2: {
                type: "fluid.tests.testComponent2",
                options: {
                    value: "Original default value"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.testComponent2", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            sub1: {
                type: "fluid.tests.subComponent"
            },
            sub2: {
                type: "fluid.tests.subComponent",
                options: {
                    value: "Subcomponent 2 default"
                }
            }
        }
    });

    fluid.demands("fluid.tests.testComponent2", "fluid.tests.testComponent",
        [
            "{testComponent}.container",
            {"default1": "{testComponent}.options.default1"}
        ]);


    fluid.demands("sub1", "fluid.tests.testComponent2", [
        "{testComponent2}.container",
        {"crossDefault": "{testComponent2}.sub2.options.value"}
    ]);

    fluid.demands("sub2", "fluid.tests.testComponent2",
        ["{testComponent2}.container", fluid.COMPONENT_OPTIONS]);


    fluid.makeComponents({
        "fluid.tests.subComponent":       "fluid.viewComponent",
        "fluid.tests.childView":          "fluid.viewComponent"
    });

    jqUnit.module("Fluid IoC View Tests");

    fluid.setLogging(true);


    jqUnit.test("construct", function () {
        jqUnit.expect(2);
        var that = fluid.tests.testComponent("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "testComponent value", that.test2.options.default1);
    });

    jqUnit.test("crossConstruct", function () {
        jqUnit.expect(2);
        var that = fluid.tests.testComponent2("#pager-top", {});
        jqUnit.assertValue("Constructed", that);
        jqUnit.assertEquals("Value transmitted", "Subcomponent 2 default", that.sub1.options.crossDefault);
    });


    fluid.defaults("fluid.tests.autoGradedComponent", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        events: {
            anEvent: null
        }
    });

    fluid.defaults("fluid.tests.gradedComponent", {
        gradeNames: "fluid.viewComponent",
        events: {
            anEvent: null
        }
    });

    fluid.defaults("fluid.tests.ungradedComponent", {
        events: {
            anEvent: null
        }
    });

    fluid.tests.gradedComponent = function (container, options) {
        var that = fluid.initView("fluid.tests.gradedComponent", container, options);
        return that;
    };

    fluid.tests.ungradedComponent = function (container, options) {
        var that = fluid.initView("fluid.tests.ungradedComponent", container, options);
        return that;
    };


    fluid.tests.gradeTestTypes = ["fluid.tests.gradedComponent", "fluid.tests.autoGradedComponent", "fluid.tests.ungradedComponent"];

    function testEvent(message, component) {
        jqUnit.expect(1);
        component.events.anEvent.addListener(function () {
            jqUnit.assert("Event fired");
        });
        component.events.anEvent.fire();
    }

    jqUnit.test("Grade resolution test", function () {
        fluid.each(fluid.tests.gradeTestTypes, function (typeName) {
            var that = fluid.invokeGlobalFunction(typeName, ["#pager-top"]);
            testEvent("Construction of " + typeName, that);
        });
    });

    fluid.defaults("fluid.tests.mergePaths", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        headOption: "headValue1",
        components: {
            child: {
                type: "fluid.tests.mergePathsChild",
                options: {
                    childOption1: "directValue1",
                    childOption2: "directValue2"
                }
            },
            viewChild: {
                type: "fluid.tests.mergePathsViewChild",
                options: {
                    childOption1: "directValue1",
                    childOption2: "{mergePaths}.options.headOption"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.mergePathsChild", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });

    fluid.defaults("fluid.tests.mergePathsViewChild", {
        gradeNames: ["fluid.viewComponent", "autoInit"]
    });

    fluid.demands("fluid.tests.mergePathsChild", "fluid.tests.mergePaths", {
        mergeOptions: [
            {childOption1: "demandValue1"}, {childOption3: "{mergePaths}.options.headOption"}
        ]
    });

    fluid.demands("fluid.tests.mergePathsViewChild", "fluid.tests.mergePaths", {
        container: "#pager-top",
        mergeOptions: {
            model:   "{mergePaths}.model",
            applier: "{mergePaths}.options.applier"
        }
    });

    jqUnit.test("FLUID-4130 mergeOptions for demanded component options", function () {
        var model = {key: "Head model"};
        var mergePaths = fluid.tests.mergePaths({model: model});
        var expected = {
            childOption1: "demandValue1",
            childOption2: "directValue2",
            childOption3: "headValue1"
        };
        jqUnit.assertDeepEq("Direct options overriden by demands",
            expected, fluid.filterKeys(mergePaths.child.options, ["childOption1", "childOption2", "childOption3"]));
        jqUnit.assertEquals("Model delivered directly through mergePaths in demands block for full args (FLUID-4142)",
            mergePaths.model, mergePaths.viewChild.model);
        var expected2 = {
            childOption1: "directValue1",
            childOption2: "headValue1"
        };
        jqUnit.assertDeepEq("Options delivered from subcomponent defaults through mergePaths",
            expected2, fluid.filterKeys(mergePaths.viewChild.options, ["childOption1", "childOption2"]));
    });

    fluid.tests.dynamicCounter = function (parent) {
        parent.childCount++;
    };

    fluid.defaults("fluid.tests.dynamicContainer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        members: {
            childCount: 0
        },
        selectors: {
            dynamicContainer: ".flc-tests-dynamic-component"
        },
        dynamicComponents: {
            dynamicDOM: {
                sources: "{that}.dom.dynamicContainer",
                container: "{source}",
                type: "fluid.viewComponent",
                options: {
                    listeners: {
                        onCreate: {
                            funcName: "fluid.tests.dynamicCounter",
                            args: "{dynamicContainer}"
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5022 dynamic container for view components", function () {
        var dynamic = fluid.tests.dynamicContainer(".flc-tests-dynamic-container");
        jqUnit.assertEquals("Three markup-driven child components created", 3, dynamic.childCount);
    });

    /************************************
     * DOM Binder IoC Resolution Tests. *
     ************************************/

    fluid.defaults("fluid.tests.parentView", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            defaultedChildView: {
                type: "fluid.tests.subComponent",
                container: "{parentView}.dom.defaultedChildContainer"
            },
            demandedChildView: {
                type: "fluid.tests.childView"
            }
        },
        selectors: {
            defaultedChildContainer: ".flc-tests-parentView-defaultedChildContainer",
            demandedChildContainer: ".flc-tests-parentView-demandedChildContainer"
        }
    });

    fluid.demands("fluid.tests.childView", "fluid.tests.parentView", {
        container: "{parentView}.dom.demandedChildContainer",
        options: {
            cat: "meow"
        }
    });

    var checkChildContainer = function (parent, child, containerName, configName) {
        jqUnit.assertEquals("The child component should have the correct container sourced from the parent's DOM Binder when configured in " + configName,
            parent.locate(containerName)[0], child.container[0]);
    };

    jqUnit.test("Child view's container resolved by IoC from parent's DOM Binder", function () {
        var parent = fluid.tests.parentView(".flc-tests-parentView-container");
        checkChildContainer(parent, parent.defaultedChildView, "defaultedChildContainer", "defaults");
        checkChildContainer(parent, parent.demandedChildView, "demandedChildContainer", "demands");
    });


})();
