/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */

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
                type: "fluid.viewComponent",
                container: "{testComponent2}.container",
                options: {
                    "crossDefault": "{testComponent2}.sub2.options.value"
                }
            },
            sub2: {
                type: "fluid.viewComponent",
                container: "{testComponent2}.container",
                options: {
                    value: "Subcomponent 2 default"
                }
            }
        }
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


    fluid.defaults("fluid.tests.gradedComponent", {
        gradeNames: "fluid.viewComponent",
        events: {
            anEvent: null
        }
    });

    function testEvent(message, component) {
        jqUnit.expect(1);
        component.events.anEvent.addListener(function () {
            jqUnit.assert("Event fired");
        });
        component.events.anEvent.fire();
    }

    jqUnit.test("Grade resolution test", function () {
        var typeName = "fluid.tests.gradedComponent";
        var that = fluid.invokeGlobalFunction(typeName, ["#pager-top"]);
        testEvent("Construction of " + typeName, that);
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
                type: "fluid.viewComponent",
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

    /** Shallow Self-rendering and unrendering using fluid.containerRenderingView **/

    fluid.defaults("fluid.tests.selfRenderLensed", {
        gradeNames: "fluid.viewComponent",
        model: {
            arena: ["a", "b", "c"]
        },
        selectors: {
            element: ".flc-tests-self-render-element"
        },
        dynamicComponents: {
            elements: {
                type: "fluid.tests.selfRenderElement",
                sources: "{that}.model.arena",
                options: {
                    parentContainer: "{selfRenderLensed}.container",
                    model: {
                        text: "{source}"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.selfRenderElement", {
        gradeNames: "fluid.containerRenderingView",
        markup: {
            container: "<div class=\"flc-tests-self-render-element\">%text</div>"
        },
        invokers: {
            renderMarkup: {
                funcName: "fluid.stringTemplate",
                args: ["{that}.options.markup.container", {
                    text: "{that}.model.text"
                }]
            }
        }
    });

    jqUnit.test("Self-rendering and unrendering of lensed components", function () {
        var that = fluid.tests.selfRenderLensed(".flc-tests-self-rendering");
        var elements = that.locate("element");
        jqUnit.assertEquals("Three elements should have been rendered", 3, elements.length);
        var texts = fluid.transform(elements, function (element) {
            return element.textContent;
        });
        jqUnit.assertDeepEq("The element texts should be those derived from the model", that.model.arena, texts);
        that.applier.change("arena", null, "DELETE");
        elements = that.locate("element");
        jqUnit.assertEquals("Elements should have been removed", 0, elements.length);
    });

    /** FLUID-6584 tests - markup-sourced dynamic components from templated content **/
    // This is what the Pager's "summary" component did/does
    fluid.defaults("fluid.tests.fluid6584test", {
        gradeNames: "fluid.templateRenderingView",
        templateUrl: "../data/testFluid6584Template.html",
        selectors: {
            sources: ".flc-nested-container"
        },
        dynamicComponents: {
            elements: {
                type: "fluid.tests.fluid6584child",
                sources: "{that}.dom.sources",
                container: "{source}"
            }
        }
    });

    fluid.defaults("fluid.tests.fluid6584child", {
        gradeNames: "fluid.viewComponent",
        components: {
            resourceLoader: {
                type: "fluid.resourceLoader",
                options: {
                    resources: {
                        messages: {
                            url: "../data/initModel.json",
                            dataType: "json"
                        }
                    },
                    model: "{that}.resources.messages.parsed"
                }
            }
        }
    });


    jqUnit.asyncTest("FLUID-6584: Markup-sourced dynamic components from templated content with nested resources", function () {
        var assertions = function (that) {
            var children = fluid.queryIoCSelector(that, "fluid.resourceLoader");
            jqUnit.assertEquals("Constructed two markup-driven components", 2, children.length);
            children.forEach(function (child) {
                jqUnit.assertDeepEq("Child's model initialised from resource", {
                    "initValue": 42
                }, child.model);
            });
            jqUnit.start();
        };
        fluid.tests.fluid6584test(".FLUID6584-container", {
            listeners: {
                onCreate: assertions
            }
        });
    });

    /** Integral binding **/

    // Simple integral binding relaying model out to field text
    fluid.defaults("fluid.tests.simpleIntegral", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            field: ".flc-tests-simple-field"
        },
        modelRelay: {
            source: "{that}.model.field",
            target: "{that}.model.dom.field.text"
        }
    });

    jqUnit.test("Simple integral binding", function () {
        var that = fluid.tests.simpleIntegral(".flc-tests-simple-integral", {
            model: {
                field: "Label"
            }
        });
        jqUnit.assertEquals("Label should have been rendered", "Label", that.locate("field").text());
    });

    // Toggle integral binding relaying click count onto model
    fluid.defaults("fluid.tests.toggleIntegral", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            button: ".flc-tests-toggle-button"
        },
        model: {
            enabled: false
        },
        modelRelay: {
            source: "{that}.model.dom.button.click",
            target: "{that}.model.enabled",
            singleTransform: "fluid.transforms.toggle"
        }
    });

    fluid.tests.toggleIntegral.test = function (initEnabled) {
        jqUnit.test("Toggle integral binding: initial value " + initEnabled, function () {
            var that = fluid.tests.toggleIntegral(".flc-tests-toggle-integral", {
                model: {
                    enabled: initEnabled
                }
            });
            jqUnit.assertEquals("Initial model enabled state should be uncorrupted", initEnabled, that.model.enabled);
            that.locate("button").click();
            jqUnit.assertEquals("Click should " + (initEnabled ? "disable" : "enable") + " model", !initEnabled, that.model.enabled);
            that.locate("button").click();
            jqUnit.assertEquals("Click should " + (initEnabled ? "enable" : "disable") + " model again", initEnabled, that.model.enabled);
        });
    };

    fluid.tests.toggleIntegral.test(false);
    fluid.tests.toggleIntegral.test(true);

    // Non-integral button via modelListeners
    fluid.defaults("fluid.tests.nonIntegralButton", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            button1: ".flc-tests-button-1",
            button2: ".flc-tests-button-2"
        },
        model: {
            lastButton: null
        },
        modelListeners: {
            button1Click: {
                path: "dom.button1.click",
                changePath: "lastButton",
                value: "button1"
            },
            button2Click: {
                path: "dom.button2.click",
                changePath: "lastButton",
                value: "button2"
            }
        }
    });

    jqUnit.test("Non-integral button click onto model", function () {
        var that = fluid.tests.nonIntegralButton(".flc-tests-nonintegral-button");
        jqUnit.assertEquals("No button initially pressed", null, that.model.lastButton);
        that.locate("button1").click();
        jqUnit.assertEquals("Button 1 is last button", "button1", that.model.lastButton);
        that.locate("button2").click();
        jqUnit.assertEquals("Button 2 is last button", "button2", that.model.lastButton);
    });

    // Non-integral button onto enabled via changePath - tests that a changePath is enough to materialise something

    fluid.defaults("fluid.tests.nonIntegralChange", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            button1: ".flc-tests-button-1",
            button2: ".flc-tests-button-2"
        },
        modelListeners: {
            button1Click: {
                path: "dom.button1.click",
                changePath: "dom.button2.enabled",
                value: false
            }
        }
    });

    jqUnit.test("Non-integral button click to changePath", function () {
        var that = fluid.tests.nonIntegralChange(".flc-tests-nonintegral-button");
        jqUnit.assertTrue("Button 2 is initially enabled", that.locate("button2").is(":enabled"));
        that.locate("button1").click();
        jqUnit.assertFalse("Button 2 has become disabled", that.locate("button2").is(":enabled"));
    });

    // Relay hover onto style
    fluid.defaults("fluid.tests.hoverStyle", {
        gradeNames: "fluid.viewComponent",
        styles: {
            hoverStyle: ".flc-tests-hover"
        },
        modelRelay: {
            source: "dom.container.hover",
            target: {
                segs: ["dom", "container", "class", "{that}.options.styles.hoverStyle"]
            }
        }
    });

    fluid.tests.triggerMouseEvent = function (element, eventName) {
        var event = new MouseEvent(eventName);
        element.dispatchEvent(event);
    };

    jqUnit.test("Relay hover onto style", function () {
        var that = fluid.tests.hoverStyle(".flc-tests-simple-integral");
        jqUnit.assertFalse("No initial hover style", that.container.hasClass(that.options.styles.hoverStyle));
        fluid.tests.triggerMouseEvent(that.container[0], "mouseover"); // Note that jQuery delegates mouseenter to mouseover - white box testing
        jqUnit.assertTrue("Hover style set by interaction", that.container.hasClass(that.options.styles.hoverStyle));
        fluid.tests.triggerMouseEvent(that.container[0], "mouseout"); // Similarly, jQuery delegates mouseleave to mouseout
        jqUnit.assertFalse("Final hover style unset", that.container.hasClass(that.options.styles.hoverStyle));
    });

    // focusin test
    fluid.defaults("fluid.tests.focusin", {
        gradeNames: "fluid.viewComponent",
        model: {
            focused: "{that}.model.dom.container.focusin"
        }
    });

    jqUnit.test("Materialise focus", async function () {
        var that = fluid.tests.focusin(".flc-tests-focus");
        jqUnit.assertFalse("No initial focus", that.model.focused);
        await fluid.focus(that.container);
        jqUnit.assertTrue("Received focus", that.model.focused);
        await fluid.blur(that.container);
        jqUnit.assertFalse("Lost focus", that.model.focused);
    });

    // Bidirectional integral binding relaying bound value to input field
    fluid.defaults("fluid.tests.bidiIntegral", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            field: ".flc-tests-bidi-field"
        },
        modelRelay: {
            source: "{that}.model.field",
            target: "{that}.model.dom.field.value"
        }
    });

    fluid.tests.bidiIntegral.test = function (container, onInput, values) {
        var fieldType = typeof(values[0]) === "boolean" ? "checkbox" : "text";
        jqUnit.test("Bidirectional integral binding for " + fieldType + " - changeEvent of " + (onInput ? "input" : "change"), function () {
            var that = fluid.tests.bidiIntegral(container, {
                model: {
                    field: values[0]
                },
                bindingOptions: onInput ? {
                    "dom.field.value": {
                        changeEvent: "input"
                    }
                } : null // Use this structure to test complete absence of bindingOptions
            });
            var field = that.locate("field");
            jqUnit.assertEquals("Field should have been rendered with model value", values[0], fluid.value(field));
            if (onInput) {
                field.val("Updated value").trigger("input");
            } else {
                fluid.changeElementValue(field, values[1]);
            }
            jqUnit.assertEquals("Changed value should have been propagated into model", values[1], that.model.field);
            that.applier.change("field", values[2]);
            jqUnit.assertEquals("Field should have been rendered with updated model value", values[2], fluid.value(field));
        });
    };

    fluid.tests.bidiIntegral.test(".flc-tests-bidi-integral-text", false, ["Model value", "Updated value", "Updated model value"]);
    fluid.tests.bidiIntegral.test(".flc-tests-bidi-integral-text", true, ["Model value", "Updated value", "Updated model value"]);

    fluid.tests.bidiIntegral.test(".flc-tests-bidi-integral-checkbox", false, [false, true, false]);
    fluid.tests.bidiIntegral.test(".flc-tests-bidi-integral-checkbox", false, [true, false, true]);

    // Binary relay out tests - visible and enabled
    fluid.defaults("fluid.tests.booleanOut", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            field: ".flc-tests-target-field"
        },
        model: {
            state: false
        },
        modelRelay: {
            source: "{that}.model.state",
            target: {
                segs: ["dom", "field", "{that}.options.materialiser"]
            }
        }
    });

    fluid.tests.booleanOut.materialisers = {
        visible: {
            selector: ":visible"
        },
        enabled: {
            selector: ":enabled"
        }
    };

    fluid.tests.booleanOut.test = function (materialiser, initState) {
        var record = fluid.tests.booleanOut.materialisers[materialiser];
        jqUnit.test("Toggle relay out boolean binding for materialiser " + materialiser + ": initial value " + initState, function () {
            var that = fluid.tests.booleanOut(".flc-tests-boolean-state", {
                model: {
                    state: initState
                },
                materialiser: materialiser
            });
            var checkDomState = function () {
                var element = that.locate("field");
                var selector = record.selector;
                jqUnit.assertEquals("Condition of selector " + selector + " matches model", that.model.state, element.is(selector));
            };
            jqUnit.assertEquals("Initial model enabled state should be uncorrupted", initState, that.model.state);
            checkDomState();
            that.applier.change("state", !initState);
            checkDomState();
            that.applier.change("state", initState);
            checkDomState();
        });
    };

    fluid.tests.booleanOut.test("visible", false);
    fluid.tests.booleanOut.test("visible", true);
    fluid.tests.booleanOut.test("enabled", false);
    fluid.tests.booleanOut.test("enabled", true);

    // Attribute relay tests
    fluid.defaults("fluid.tests.attributeRelay", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            button: ".fl-expand-button"
        },
        model: {
            expanded: false
        },
        modelRelay: {
            ariaExpanded: {
                source: "expanded",
                target: "dom.button.attr.aria-expanded"
            },
            ariaLabel: {
                source: "expanded",
                target: "dom.button.attr.aria-label",
                func: expanded => expanded ? "collapse" : "expand"
            }
        }
    });

    jqUnit.test("Attribute relay test ", function () {
        var that = fluid.tests.attributeRelay(".flc-tests-attr-relay");
        var checkState = function (expected) {
            var button = that.locate("button")[0];
            jqUnit.assertEquals("ARIA expanded attribute " + expected, String(expected), button.getAttribute("aria-expanded"));
            jqUnit.assertEquals("ARIA label attribute " + expected, expected ? "collapse" : "expand", button.getAttribute("aria-label"));
        };
        checkState(false);
        that.applier.change("expanded", true);
        checkState(true);
        that.applier.change("expanded", false);
        checkState(false);
    });

    // Class toggle tests
    fluid.defaults("fluid.tests.toggleClass", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            field: ".flc-tests-simple-field"
        },
        styles: {
            myClazz: ".flc-tests-clazz"
        },
        model: {
            state: false
        },
        modelRelay: {
            source: "{that}.model.state",
            target: {
                segs: ["dom", "field", "class", "{that}.options.styles.myClazz"]
            }
        }
    });

    fluid.tests.toggleClass.test = function (initState) {
        jqUnit.test("Toggle integral binding: initial state " + initState, function () {
            var that = fluid.tests.toggleClass(".flc-tests-simple-integral", {
                model: {
                    state: initState
                }
            });

            var checkState = function (expected) {
                jqUnit.assertEquals("Model state expected as " + expected, expected, that.model.state);
                jqUnit.assertEquals("Markup state expected as " + expected, expected, that.locate("field").hasClass(that.options.styles.myClazz));
            };
            checkState(initState);
            that.applier.change("state", !that.model.state);
            checkState(!initState);
            that.applier.change("state", !that.model.state);
            checkState(initState);
        });
    };

    fluid.tests.toggleClass.test(false);
    fluid.tests.toggleClass.test(true);

    // Style materialisation test
    fluid.defaults("fluid.tests.materialStyle", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            field: ".flc-tests-simple-field"
        },
        model: {
            backgroundColour: "#ae5"
        },
        modelRelay: {
            source: "{that}.model.backgroundColour",
            target: {
                segs: ["dom", "field", "style", "backgroundColor"]
            }
        }
    });

    jqUnit.test("Style materialisation test ", function () {
        var that = fluid.tests.materialStyle(".flc-tests-simple-integral");
        var checkState = function (expected) {
            var colour = that.locate("field").css("backgroundColor");
            jqUnit.assertEquals("Markup state expected as " + expected, expected, colour);
        };
        checkState("rgb(170, 238, 85)");
    });

    // id materialisation and allocation test
    fluid.defaults("fluid.tests.materialId", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            field: ".flc-tests-simple-field"
        },
        model: {
            fieldId: "{that}.model.dom.field.id"
        }
    });

    jqUnit.test("ID materialisation test", function () {
        var oneTest = function (selector) {
            var that = fluid.tests.materialId(selector);
            var domId = that.locate("field")[0].id;
            jqUnit.assertValue("Id allocated to field ", domId);
            jqUnit.assertEquals("Dom id and model id agree", domId, that.model.fieldId);
            return that;
        };
        oneTest(".flc-tests-simple-integral");
        var that = oneTest(".flc-tests-with-id");
        jqUnit.assertEquals("Original id was undisturbed", "original-id", that.model.fieldId);

    });

    // Bad materialisation test
    fluid.defaults("fluid.tests.badMaterial", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            field: ".flc-tests-simple-field"
        },
        model: {
            value: "thing"
        },
        modelRelay: {
            source: "{that}.model.value",
            target: {
                segs: ["dom", "field", "bad"]
            }
        }
    });

    jqUnit.test("Bad materialisation test", function () {
        jqUnit.expectFrameworkDiagnostic("Got exception", function () {
            fluid.tests.badMaterial(".flc-tests-simple-integral");
        }, "click");
    });

    // Bulk initialisation test

    fluid.defaults("fluid.tests.bulkInit", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            first: ".flc-first-thing",
            second: ".flc-second-thing",
            third: ".flc-third-thing",
            fourth: ".flc-fourth-thing"
        },
        model: {
            secondValue: "Purim",
            thirdValue: "Diwali",
            dom: {
                first: {
                    text: "Night Fusht"
                },
                second: {
                    text: "{that}.model.secondValue"
                },
                fourth: {
                    attr: {
                        role: "Eid"
                    }
                }
            }
        },
        modelRelay: {
            source: "thirdValue",
            target: "dom.third.text"
        }
    });

    jqUnit.test("Bulk materialisation test", function () {
        var that = fluid.tests.bulkInit(".flc-tests-bulk-init");
        jqUnit.assertEquals("Text initialised from bulk", "Night Fusht", that.locate("first").text());
        jqUnit.assertEquals("Text initialised from implicit relay", "Purim", that.locate("second").text());
        jqUnit.assertEquals("Text initialised from explicit relay", "Diwali", that.locate("third").text());
        jqUnit.assertEquals("Attr initialised from bulk", "Eid", that.locate("fourth").attr("role"));
        that.applier.change("secondValue", "Holi");
        jqUnit.assertEquals("Text updated from implicit relay", "Holi", that.locate("second").text());
    });

    // Attr non-dropping

    fluid.defaults("fluid.tests.noAttr", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            noAttr: ".flc-no-attr",
            attr: ".flc-attr"
        },
        modelRelay: {
            noAttr: {
                target: "dom.noAttr.attr.aria-label",
                source: "{that}.options.undefined"
            },
            attr: {
                target: "dom.attr.attr.aria-label",
                value: "Aria Label"
            }
        }
    });

    jqUnit.test("Attr dropping test", function () {
        var that = fluid.tests.noAttr(".flc-tests-no-attr");
        var element = that.locate("noAttr");
        jqUnit.assertEquals("Found one element", 1, element.length);
        jqUnit.assertUndefined("No attribute value relayed", element.attr("aria-label"));
        jqUnit.assertEquals("No attribute value relayed", "Aria Label", that.locate("attr").attr("aria-label"));
    });

    // Multi-class

    fluid.defaults("fluid.tests.multiClass", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            multiClass: ".flc-multi-class"
        },
        styles: {
            container: "fl-textfieldSlider fl-focus"
        },
        modelRelay: {
            multiClass: {
                target: "dom.multiClass.class",
                source: "{that}.options.styles.container",
                func: "fluid.transforms.parseClasses"
            }
        }
    });

    jqUnit.test("Multiple class application test", function () {
        var that = fluid.tests.multiClass(".flc-tests-multi-class");
        var element = that.locate("multiClass");
        jqUnit.assertTrue("Has first class", element.hasClass("fl-textfieldSlider"));
        jqUnit.assertTrue("Has second class", element.hasClass("fl-focus"));
    });

})();
