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

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.testComponent", {
        gradeNames: ["fluid.viewComponent"],
        default1: "testComponent value",
        components: {
            test2: {
                type: "fluid.tests.testComponent2",
                container:  "{testComponent}.container",
                options: {
                    value: "Original default value",
                    default1: "{testComponent}.options.default1"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.testComponent2", {
        gradeNames: ["fluid.viewComponent"],
        components: {
            sub1: {
                type: "fluid.tests.subComponent",
                container: "{testComponent2}.container",
                options: {
                    "crossDefault": "{testComponent2}.sub2.options.value"
                }
            },
            sub2: {
                type: "fluid.tests.subComponent",
                container: "{testComponent2}.container",
                options: {
                    value: "Subcomponent 2 default"
                }
            }
        }
    });

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
        gradeNames: ["fluid.viewComponent"],
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

    fluid.tests.dynamicCounter = function (parent) {
        parent.childCount++;
    };

    fluid.defaults("fluid.tests.dynamicContainer", {
        gradeNames: ["fluid.viewComponent"],
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
        gradeNames: ["fluid.viewComponent"],
        components: {
            defaultedChildView: {
                type: "fluid.tests.subComponent",
                container: "{parentView}.dom.defaultedChildContainer"
            }
        },
        selectors: {
            defaultedChildContainer: ".flc-tests-parentView-defaultedChildContainer",
            demandedChildContainer: ".flc-tests-parentView-demandedChildContainer"
        }
    });

    var checkChildContainer = function (parent, child, containerName, configName) {
        jqUnit.assertEquals("The child component should have the correct container sourced from the parent's DOM Binder when configured in " + configName,
            parent.locate(containerName)[0], child.container[0]);
    };

    jqUnit.test("Child view's container resolved by IoC from parent's DOM Binder", function () {
        var parent = fluid.tests.parentView(".flc-tests-parentView-container");
        checkChildContainer(parent, parent.defaultedChildView, "defaultedChildContainer", "defaults");
    });

    fluid.defaults("fluid.tests.FLUID6132root", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            links: ".page-link"
        },
        invokers: {
            fastLocateLinks: "{that}.dom.fastLocate(links)"
        }
    });

    jqUnit.test("FLUID-6132: Access DOM Binder's methods via IoC", function () {
        var that = fluid.tests.FLUID6132root("#pager-top");
        var links = that.fastLocateLinks();
        jqUnit.assertEquals("Resolve fastLocate method via API", 3, links.length);
    });

    /** FLUID-5908 - failure when adding this-ist record as event listener **/

    fluid.defaults("fluid.tests.FLUID5908root", {
        gradeNames: "fluid.viewComponent",
        listeners: {
            "onDestroy.emptyContainer": {
                "this": "{that}.container",
                method: "empty"
            }
        }
    });

    jqUnit.test("FLUID-5908: this-ist listener", function () {
        jqUnit.expect(1);
        var that = fluid.tests.FLUID5908root(".FLUID5908-container");
        jqUnit.assertValue("Successfully constructed component with this-ist listener", that);
    });

})();
