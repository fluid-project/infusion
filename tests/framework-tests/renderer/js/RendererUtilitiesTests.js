/*
Copyright 2011 OCAD University
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");
    fluid.setLogging(true);

    fluid.tests.testRendererUtilities = function () {

        jqUnit.module("Cutpoint utility tests");
        jqUnit.test("Renderer Utilities Test: selectorsToCutpoints", function () {
            // Single class name, simple cutpoints generation.
            var selectors = {selector1: ".class1"};
            var expected = [{id: "selector1", selector: ".class1"}];
            jqUnit.assertDeepEq("Selector Map generation", expected, fluid.renderer.selectorsToCutpoints(selectors));

            selectors.selector2 = ".class2";

            // Multiple selectors with one repeating.
            expected = [{id: "selector1", selector: ".class1"}, {id: "selector2:", selector: ".class2"}];
            var actual = fluid.renderer.selectorsToCutpoints(selectors, {repeatingSelectors: ["selector2"]});
            jqUnit.assertDeepEq("Selector Map generation, with repeating items", expected, actual);

            // Ignoring selectors.
            expected = [{id: "selector1", selector: ".class1"}];
            actual = fluid.renderer.selectorsToCutpoints(selectors, {
                selectorsToIgnore: ["selector2"]
            });
            jqUnit.assertDeepEq("Selector Map generation, with ignored selectors", expected, actual);
            jqUnit.assertNotUndefined("selectorsToCutpoints should not eat other people's selectors", selectors.selector2);

            // Repeating and ignored selectors.
            expected = [{id: "selector1:", selector: ".class1"}];
            actual = fluid.renderer.selectorsToCutpoints(selectors, {
                repeatingSelectors: ["selector1"],
                selectorsToIgnore: ["selector2"]
            });
            jqUnit.assertDeepEq("Selector Map generation, with repeating items and ignored selectors", expected, actual);
            jqUnit.assertNotUndefined("selectorsToCutpoints should not eat other people's selectors", selectors.selector2);
        });

        jqUnit.module("IoC Renderer tests");

        fluid.defaults("fluid.tests.identicalComponentParent", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            selectors: {
                identicalComponent1: ".identicalComponent1",
                identicalComponent2: ".identicalComponent2"
            },
            finalInitFunction: "fluid.tests.identicalComponentParent.finalInitFunction",
            produceTree: "fluid.tests.identicalComponentParent.produceTree"
        });

        fluid.tests.identicalComponentParent.produceTree = function () {
            return {
                identicalComponent1: {
                    decorators: {
                        type: "fluid",
                        func: "fluid.tests.identicalComponent",
                        options: {
                            option: "OPTION1"
                        }
                    }
                },
                identicalComponent2: {
                    decorators: {
                        type: "fluid",
                        func: "fluid.tests.identicalComponent",
                        options: {
                            option: "OPTION2"
                        }
                    }
                }
            };
        };
        fluid.tests.identicalComponentParent.finalInitFunction = function (that) {
            that.renderer.refreshView();
        };

        fluid.defaults("fluid.tests.identicalComponent", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            components: {
                subcomponent: {
                    type: "fluid.tests.identicalSubComponent"
                }
            }
        });

        fluid.defaults("fluid.tests.identicalSubComponent", {
            gradeNames: ["fluid.littleComponent", "autoInit"]
        });

        fluid.demands("fluid.tests.identicalSubComponent", "fluid.tests.identicalComponent", {
            args: {
                option: "{identicalComponent}.options.option"
            }
        });
        fluid.demands("fluid.tests.identicalComponent", "fluid.tests.identicalComponentParent", {
            container: "{arguments}.0"
        });
        jqUnit.test("Same level identical components with different options", function () {
            var that = fluid.tests.identicalComponentParent(".identicalComponentParent");
            jqUnit.assertEquals("First component's subcomponent option is", "OPTION1", that["**-renderer-identicalComponent1-0"].subcomponent.options.option);
            jqUnit.assertEquals("Second component's subcomponent option is", "OPTION2", that["**-renderer-identicalComponent2-1"].subcomponent.options.option);
        });

        fluid.defaults("fluid.tests.mergeRenderParent", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            selectors: {
                mergeComponent: ".mergeComponent"
            },
            model: {
                test: "TEST"
            },
            finalInitFunction: "fluid.tests.mergeRenderParent.finalInitFunction",
            produceTree: "fluid.tests.mergeRenderParent.produceTree"
        });
        fluid.tests.mergeRenderParent.produceTree = function () {
            return {
                mergeComponent: {
                    decorators: {
                        type: "fluid",
                        func: "fluid.tests.mergeComponent",
                        options: {
                            option: "OPTION1"
                        }
                    }
                }
            };
        };
        fluid.tests.mergeRenderParent.finalInitFunction = function (that) {
            that.renderer.refreshView();
        };
        fluid.defaults("fluid.tests.mergeComponent", {
            gradeNames: ["fluid.rendererComponent", "autoInit"]
        });
        fluid.demands("fluid.tests.mergeComponent", "fluid.tests.mergeRenderParent", {
            container: "{arguments}.0",
            mergeOptions: {
                model: "{mergeRenderParent}.model"
            }
        });

        jqUnit.test("Merging args and options", function () {
            var that = fluid.tests.mergeRenderParent(".mergeRenderParent");
            jqUnit.assertEquals("Subcomponent arg option is", "OPTION1", that["**-renderer-mergeComponent-0"].options.option);
            jqUnit.assertEquals("Subcomponent option is", that.model, that["**-renderer-mergeComponent-0"].options.model);
        });



        function assertRenderedText(els, array) {
            fluid.each(els, function (el, index) {
                jqUnit.assertEquals("Element " + index + " text", array[index], $(el).text());
            });
        }

        fluid.defaults("fluid.tests.rendererParent", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            components: {
                middle: {
                    type: "fluid.tests.rendererMiddle"
                }
            },
            selectors: {
                middle: ".middle-component"
            }
        });

        fluid.demands("fluid.tests.rendererMiddle", "fluid.tests.rendererParent",
            ["{rendererParent}.dom.middle", fluid.COMPONENT_OPTIONS]);

        fluid.defaults("fluid.tests.rendererMiddle", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            selectors: {
                decorated: ".decorated-component"
            },
            protoTree: {
                decorated: {
                    decorators: {
                        type: "fluid",
                        func: "fluid.tests.rendererChild",
                        options: { decoratorValue: "{rendererParent}.options.parentValue" // with FLUID-4986 we can support this reference properly
                        }
                    }
                }
            }
        });

        fluid.defaults("fluid.tests.rendererChild", {
            value: "{rendererParent}.options.parentValue"
        });

        fluid.demands("fluid.tests.rendererChild", "fluid.tests.rendererMiddle",
            ["@0", fluid.COMPONENT_OPTIONS]);

        fluid.tests.rendererChild = function (container, options) {
            var that = fluid.initView("fluid.tests.rendererChild", container, options);
            $(container).text(that.options.value);
            return that;
        };


        jqUnit.test("initDependent upgrade test", function () {
            var parentValue = "parentValue";
            var component = fluid.tests.rendererParent(".renderer-ioc-test", {parentValue: parentValue});
            var middleNode = component.middle.container;
            jqUnit.assertValue("Middle component constructed", middleNode);
            component.middle.refreshView();
            var decorated = component.middle.locate("decorated");
            jqUnit.assertEquals("Decorated text resolved from top level", parentValue, decorated.text());
            var child = component.middle[fluid.renderer.IDtoComponentName("decorated", 0)];
            jqUnit.assertEquals("Located decorator with IoC-resolved value", "parentValue", child.options.decoratorValue);
            component.middle.refreshView();
            var child2 = component.middle[fluid.renderer.IDtoComponentName("decorated", 0)];
            jqUnit.assertNotEquals("Rendering has produced new component", child, child2);
        });


        jqUnit.module("Renderer component tests");

        fluid.tests.censoringStrategy = function (listCensor) {
            var matchPath = ["recordlist", "deffolt"];
            return function (root, segment, index, segs) {
                var orig = root[segment];
                return fluid.pathUtil.matchSegments(matchPath, segs, 0, index) ? listCensor(orig) : orig;
            };
        };

        fluid.defaults("fluid.tests.rendererComponentTest", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            model: {
                recordlist: {
                    deffolt: ["person", "intake", "loanin", "loanout", "acquisition", "organization", "objects", "movement"]
                }
            },
            protoTree: {
                expander: {
                    type: "fluid.renderer.repeat",
                    controlledBy: "recordlist.deffolt",
                    pathAs: "elementPath",
                    repeatID: "recordType",
                    tree: { value: "${{elementPath}}" }
                },
                message: {
                    messagekey: "message",
                    decorators: {"addClass": "{that}.options.styles.applicableStyle"} // new-style FLUID-4986 reference - formerly "{styles}"
                },
                deffoltmessage: {
                    messagekey: "deffolt"
                }
            },
            selectors: {
                recordType: ".csc-searchBox-recordType",
                message: ".csc-searchBox-message",
                deffoltmessage: ".csc-searchBox-deffoltmessage",
                toIgnore: ".csc-searchBox-ignore"
            },
            repeatingSelectors: ["recordType"],
            selectorsToIgnore: ["toIgnore"],
            parentBundle: "{globalBundle}",
            strings: {
                message: "A mess of messuage"
            },
            styles: {
                applicableStyle: ".fl-applicable-style"
            }
        });


        jqUnit.test("Renderer component without resolver", function () {
            var globalMessages = {deffolt: "A globbal messuage"};
            var globalBundle = fluid.messageResolver({messageBase: globalMessages});
            var that = fluid.withEnvironment({globalBundle: globalBundle}, function () {
                return fluid.tests.rendererComponentTest(".renderer-component-test");
            });
            that.refreshView();
            var renderMess = that.locate("message").text();
            jqUnit.assertEquals("Rendered message from bundle", that.options.strings.message, renderMess);
            jqUnit.assertTrue("Applied style using addClass decorator reference to styles block",
                that.locate("message").hasClass(that.options.styles.applicableStyle));
            var renderDeffoltMess = that.locate("deffoltmessage").text();
            jqUnit.assertEquals("Rendered message from global bundle", globalMessages.deffolt, renderDeffoltMess);
            jqUnit.assertEquals("Resolver global message using local resolver", globalMessages.deffolt, that.messageResolver.resolve("deffolt"));
            var renderRecs = that.locate("recordType");
            var array = that.model.recordlist.deffolt;
            jqUnit.assertEquals("Rendered elements", array.length, renderRecs.length);
            fluid.each(renderRecs, function (rec, index) {
                var key = that.renderer.boundPathForNode(rec);
                jqUnit.assertEquals("Bound path at " + index, "recordlist.deffolt." + index, key);
            });
            assertRenderedText(renderRecs, array);
        });


        var testMultipleExpanders = function (that) {
            that.refreshView();
            var tabContent = that.locate("tabContent");
            var tabTwoContent = that.locate("tab2Content");
            jqUnit.assertEquals("Existing string relative should be found", "Acquisition", tabContent.eq(0).text());
            jqUnit.assertEquals("Existing string relative should be found", "Cataloging", tabContent.eq(1).text());
            jqUnit.assertEquals("Existing string relative should be found", "Acquisition", tabTwoContent.eq(0).text());
            jqUnit.assertEquals("Existing string relative should be found", "Cataloging", tabTwoContent.eq(1).text());
        };

        jqUnit.test("Multiple same level expanders", function () {
            var that = fluid.tests.rendererComponentTest(".renderer-component-test-multiple-repeat", {
                model: {
                    firstCategory: {
                        acquisition: {
                            "name": "acq"
                        },
                        objects: {
                            "name": "acq2"
                        }
                    },
                    secondCategory: {
                        acquisition: {
                            "name": "acq"
                        },
                        objects: {
                            "name": "acq2"
                        }
                    }
                },
                selectors: {
                    "tab:": ".csc-tabs-tab",
                    "tab2:": ".csc-tabs-tab-two",
                    "tabContent": ".csc-tabs-tab-content",
                    "tab2Content": ".csc-tabs-tab-two-content"
                },
                strings: {
                    "acq": "Acquisition",
                    "acq2": "Cataloging"
                },
                protoTree: {
                    expander: [{
                        repeatID: "tab2:",
                        tree: {
                            "tab2Content": {
                                messagekey: "${{tabInfo}.name}"
                            }
                        },
                        type: "fluid.renderer.repeat",
                        pathAs: "tabInfo",
                        controlledBy: "secondCategory"
                    }, {
                        repeatID: "tab:",
                        tree: {
                            tabContent: {
                                messagekey: "${{tabInfo}.name}"
                            }
                        },
                        type: "fluid.renderer.repeat",
                        pathAs: "tabInfo",
                        controlledBy: "firstCategory"
                    }]
                }
            });
            testMultipleExpanders(that);
        });


        var testMessageRepeat = function (that) {
            that.refreshView();
            var tablinks = that.locate("tabLink");
            jqUnit.assertEquals("Existing string relative should be found", "Acquisition", tablinks.eq(0).text());
            jqUnit.assertEquals("Nonexisting string relative should be notified ", "[No messagecodes provided]", tablinks.eq(1).text());
            jqUnit.assertEquals("Nonexisting string relative should be notified ", "[No messagecodes provided]", that.locate("unmatchedMessage").text());
        };

        jqUnit.test("FLUID-3819 test: messagekey with no value", function () {
            var that = fluid.tests.rendererComponentTest(".renderer-component-test-repeat", {
                resolverGetConfig: {strategies: [fluid.tests.censoringStrategy(censorFunc)]},
                model: {
                    recordlist: {
                        test: {
                            acquisition: {
                                "name": "acq",
                                href: "#HREF1"
                            },
                            objects: {
                                href: "#HREF1"
                            }
                        }
                    }
                },
                selectors: {
                    "tab:": ".csc-tabs-tab",
                    tabLink: ".csc-tabs-tab-link",
                    unmatchedMessage: ".csc-unmatchedMessage"
                },
                strings: {
                    "acq": "Acquisition",
                    "cat": "Cataloging"
                },
                protoTree: {
                    expander: {
                        repeatID: "tab:",
                        tree: {
                            tabLink: {
                                target: "${{tabInfo}.href}",
                                linktext: {
                                    messagekey: "${{tabInfo}.name}"
                                }
                            }
                        },
                        type: "fluid.renderer.repeat",
                        pathAs: "tabInfo",
                        controlledBy: "recordlist.test"
                    },
                    unmatchedMessage: {
                        messagekey: "${notThere}"
                    }
                }
            });
            testMessageRepeat(that);
        });

        var censorFunc = function (types) {
            var togo = [];
            fluid.each(types, function (type) {
                if (type.charAt(0) === "o") {
                    togo.push(type);
                }
            });
            return togo;
        };

        var testFilteredRecords = function (that) {
            that.refreshView();
            var renderRecs = that.locate("recordType");
            var censored = censorFunc(that.model.recordlist.deffolt);
            jqUnit.assertEquals("Rendered elements", censored.length, renderRecs.length);
            assertRenderedText(renderRecs, censored);
        };

        jqUnit.test("Renderer component with custom resolver", function () {
            var that = fluid.tests.rendererComponentTest(".renderer-component-test", {
                resolverGetConfig: {strategies: [fluid.tests.censoringStrategy(censorFunc)]}
            });
            testFilteredRecords(that);
        });

        fluid.defaults("fluid.tests.littleComponentWithInstantiator", {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            components: {
                instantiator: "{instantiator}",
                rendererComponent: {
                    type: "fluid.tests.rendererComponentWithNoInstantiator",
                    container: ".renderer-component-infRec"
                }
            }
        });

        fluid.defaults("fluid.tests.rendererComponentWithNoInstantiator", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            produceTree: "fluid.tests.rendererComponentWithNoInstantiator.produceTree",
            selectors: {
                text1: ".csc-footer-text1",
                text2: ".csc-footer-text2",
                currentRelease: ".csc-footer-currentRelease",
                about: ".csc-footer-about",
                feedback: ".csc-footer-feedback"
            },
            model: {
                about: "http://www.collectionspace.org",
                currentRelease: "http://www.collectionspace.org/current_release",
                feedback: "http://wiki.collectionspace.org/display/collectionspace/Release+1.6+Feedback"
            },
            version: "1.6", // moved this out to top level to test FLUID-4986
            strings: {
                text1: "2009 - 2011",
                text2: "CollectionSpace",
                currentRelease: "Release %version",
                about: "About CollectionSpace",
                feedback: "Leave Feedback"
            }
        });

        fluid.tests.rendererComponentWithNoInstantiator.finalInit = function (that) {
            that.renderer.refreshView();
        };

        fluid.tests.rendererComponentWithNoInstantiator.produceTree = function () {
            return {
                text1: {
                    messagekey: "text1"
                },
                text2: {
                    messagekey: "text2"
                },
                currentRelease: {
                    target: "${currentRelease}",
                    linktext: {
                        messagekey: "currentRelease",
                        args: {version: "${{that}.options.version}"}
                    }
                },
                about: {
                    target: "${about}",
                    linktext: {
                        messagekey: "about"
                    }
                },
                feedback: {
                    target: "${feedback}",
                    linktext: {
                        messagekey: "feedback"
                    }
                }
            };
        };

        jqUnit.test("FLUID-4200 test: Renderer component with infinite expansion (if there's an instantiator in the tree)", function () {
            var that = fluid.tests.littleComponentWithInstantiator();
            var releaseText = that.rendererComponent.locate("currentRelease").text();
            jqUnit.assertEquals("Rendered release text", "Release 1.6", releaseText);
        });

        jqUnit.test("Renderer component with custom resolver and renderer fixup", function () {
            var tree = {
                children: [
                    {ID: "recordType:",
                        valuebinding: "recordlist.deffolt.0"},
                    {ID: "recordType:",
                        valuebinding: "recordlist.deffolt.1"}
                ]
            };
            var that = fluid.tests.rendererComponentTest(".renderer-component-test", {
                resolverGetConfig: {strategies: [fluid.tests.censoringStrategy(censorFunc)]},
                protoTree: tree,
                rendererFnOptions: {
                    noexpand: true
                }
            });
            testFilteredRecords(that);
        });

        fluid.defaults("fluid.tests.paychequeComponent", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            selectors: {
                child: ".flc-renderUtils-test"
            },
            components: {
                renderChild: {
                    type: "fluid.tests.paychequeRenderer",
                    container: "{paychequeComponent}.dom.child"
                }
            }
        });

        // For AC
        fluid.defaults("fluid.tests.paychequeRenderer", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            selectors: {
                message: ".flc-renderUtils-message"
            },
            protoTree: {
                message: "What, every Friday?"
            },
            renderOnInit: true
        });

        jqUnit.test("Graded renderer component test", function () {
            var that = fluid.tests.paychequeComponent(".flc-renderUtils-container");
            var message = that.renderChild.locate("message");
            jqUnit.assertEquals("Message rendered", fluid.defaults("fluid.tests.paychequeRenderer").protoTree.message,
                message.text());
        });

        fluid.defaults("fluid.tests.FLUID4165Component", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            selectors: {
                input: ".flc-renderUtils-test"
            },
            protoTree: {
                input: "${value}"
            }
        });

        fluid.defaults("fluid.tests.decoratorParent", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            model: {
                submodel: [{
                    val: "TEST"
                }]
            },
            selectors: {
                row: ".flc-row",
                val: ".flc-val"
            },
            repeatingSelectors: ["row"],
            protoTree: {
                expander: {
                    repeatID: "row",
                    type: "fluid.renderer.repeat",
                    pathAs: "row",
                    valueAs: "rowVal",
                    controlledBy: "submodel",
                    tree: {
                        val: {
                            decorators: {
                                func: "fluid.tests.decoratorWithSubModel",
                                type: "fluid",
                                options: {
                                    model: "{rowVal}"
                                }
                            }
                        }
                    }
                }
            }
        });

        fluid.defaults("fluid.tests.decoratorWithSubModel", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            protoTree: {
                val: "${val}"
            },
            selectors: {
                val: ".flc-val-val"
            },
            finalInitFunction: "fluid.tests.decoratorWithSubModel.finalInitFunction"
        });

        fluid.tests.decoratorWithSubModel.finalInitFunction = function (that) {
            that.refreshView();
        };

        fluid.demands("fluid.tests.decoratorWithSubModel", "fluid.tests.decoratorParent", {
            container: "{arguments}.0"
        });

        jqUnit.test("Decorator with sub model", function () {
            var that = fluid.tests.decoratorParent("#decorator-container");
            that.refreshView();
            var decorator = that["**-renderer-row::val-0"];
            jqUnit.assertEquals("Original value should be", "TEST", decorator.locate("val").val());
            jqUnit.assertEquals("Original value in the model should be", "TEST", decorator.model.val);
            decorator.locate("val").val("NEW VAL").change();
            jqUnit.assertEquals("Original value should be", "NEW VAL", decorator.locate("val").val());
            jqUnit.assertEquals("Original value in the model should be", "NEW VAL", decorator.model.val);
            jqUnit.assertEquals("Original value in the model should be", "NEW VAL", that.model.submodel[0].val);
        });

        jqUnit.test("FLUID-4165 - ensure automatic creation of applier if none supplied", function () {
            var model = {value: "Initial Value"};
            var that = fluid.tests.FLUID4165Component(".FLUID-4165-test", {model: model});
            that.refreshView();
            var input = that.locate("input");
            jqUnit.assertEquals("Initial value rendered", model.value, input.val());
            input.val("New Value");
            input.change();
            jqUnit.assertEquals("Updated value read", "New Value", model.value);
        });

        fluid.defaults("fluid.tests.FLUID4189Component", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            selectors: {
                input: ".flc-renderUtils-test",
                input2: ".flc-renderUtils-test2"
            },
            produceTree: "fluid.tests.FLUID4189Component.produceTree",
            members: {
                clicked: []
            },
            invokers: {
                clickField: {
                    funcName: "fluid.tests.FLUID4189Click",
                    args: ["{that}", "{arguments}.0"]
                }
            },
            listeners: { // Test binding of FLUID-4878 style "this-ist" jQuery listeners
                afterRender: [ {
                    "this": "{that}.dom.input",
                    method: "click",
                    args: "{that}.clickField"
                },
                {
                    "this": "{that}.dom.input2",
                    method: "click",
                    args: "{that}.clickField"
                }
                ]
            }
        });

        fluid.tests.FLUID4189Component.produceTree = function () {
            return {
                input: "${value}"
            };
        };

        fluid.tests.FLUID4189Click = function (that, event) {
            that.clicked.push(event.target);
        };

        jqUnit.test("FLUID-4189 - refined workflow for renderer component", function () {
            function adjustModel(model) {
                model.path2 = "value2";
            }
            function adjustTree(that, tree) {
                tree.children.push({
                    ID: "input2",
                    valuebinding: "path2"
                });
            }
            function afterRender() {
                jqUnit.assert("afterRender function called");
            }
            var model = {value: "Initial Value"};
            var that = fluid.tests.FLUID4189Component(".FLUID-4189-test", {
                model: model,
                listeners: {
                    prepareModelForRender: adjustModel,
                    onRenderTree: adjustTree,
                    afterRender: afterRender
                }
            });
            that.refreshView();
            jqUnit.expect(4);
            var input = that.locate("input");
            jqUnit.assertEquals("Field 1 rendered", model.value, input.val());
            var input2 = that.locate("input2");
            jqUnit.assertEquals("Field 2 rendered", "value2", input2.val());
            var inputs = [input, input2];
            fluid.each(inputs, function (element) {element.click();});
            jqUnit.assertDomEquals("Click handlers registered by afterRender", inputs, that.clicked);
        });

        // FLUID-5279: "that.produceTree is not a function" when refreshView() is called as a
        // model (relayed) listener on a renderer relay component
        fluid.defaults("fluid.tests.fluid5279", {
            gradeNames: ["fluid.rendererRelayComponent", "autoInit"],
            components: {
                attributes: {
                    type: "fluid.rendererRelayComponent",
                    createOnEvent: "afterRender",
                    container: ".flc-sub",
                    options: {
                        model: "{fluid5279}.model",
                        modelListeners: {
                            "audio": "{that}.refreshView"
                        },
                        events: {
                            afterRender: "{fluid5279}.events.afterAttributesRendered"
                        },
                        resources: {
                            template: {
                                resourceText: "<div></div>"
                            }
                        }
                    }
                }
            },
            model: {
                audio: "available"
            },
            resources: {
                template: {
                    resourceText: "<div></div>"
                }
            },
            events: {
                afterAttributesRendered: null,
                onReady: {
                    events: {
                        onCreate: "onCreate",
                        afterAttributesRendered: "afterAttributesRendered"
                    },
                    args: "{that}"
                }
            },
            listeners: {
                "onCreate.init": "{that}.refreshView"
            }
        });

        jqUnit.asyncTest("FLUID-5279: Direct model sharing for renderer relay components", function () {
            fluid.tests.fluid5279(".flc-main", {
                listeners: {
                    onReady: function (that) {
                        jqUnit.assertNotUndefined("The component has been instantiated", that);
                        jqUnit.start();
                    }
                }
            });
        });

        // FLUID-5280: During initial transaction, give priority to recently modified values
        fluid.defaults("fluid.tests.fluid5280", {
            gradeNames: ["fluid.rendererRelayComponent", "autoInit"],
            components: {
                attributes: {
                    type: "fluid.tests.fluid5280sub",
                    createOnEvent: "afterRender",
                    container: ".flc-fluid5280-sub",
                    options: {
                        model: "{fluid5280}.model",
                        modelListeners: {
                            "audio": "{that}.refreshView"
                        },
                        resources: {
                            template: {
                                resourceText: "<div></div>"
                            }
                        }
                    }
                }
            },
            model: {
                audio: "available"
            },
            resources: {
                template: {
                    resourceText: "<div></div>"
                }
            }
        });

        fluid.defaults("fluid.tests.fluid5280sub", {
            gradeNames: ["fluid.rendererRelayComponent", "autoInit"],
            protoTree: {
                expander: {
                    "type": "fluid.renderer.condition",
                    "condition": {
                        "funcName": "fluid.tests.fluid5280.checkAudio",
                        "args": "${audio}"
                    }
                }
            },
            model: {
                audio: "available"
            }
        });

        fluid.tests.fluid5280.newValue = "unavailable";

        fluid.tests.fluid5280.checkAudio = function (audioValue) {
            jqUnit.assertEquals("The relayed new value takes precedence over the default model value", fluid.tests.fluid5280.newValue, audioValue);
        };

        jqUnit.test("FLUID-5280: The relayed new value takes precedence over the default model value", function () {
            var that = fluid.tests.fluid5280(".flc-fluid5280-main");
            that.applier.requestChange("audio", fluid.tests.fluid5280.newValue);
            that.refreshView();
        });

        // FLUID-5281: protoComponent expansion should respect new ChangeApplier idiom of "floating base model reference"

        fluid.defaults("fluid.tests.fluid5282root", {
            gradeNames: ["fluid.rendererRelayComponent", "autoInit"],
            protoTree: {
                expander: {
                    "type": "fluid.renderer.condition",
                    "condition": {
                        "funcName": "fluid.tests.fluid5282check",
                        "args": ["{that}", "${audio}"]
                    }
                }
            },
            model: {
                audio: "available"
            },
            renderOnInit: true
        });

        fluid.tests.fluid5282check = function (that, audioValue) {
            that.lastAudioValue = audioValue;
        };

        jqUnit.test("FLUID-5282: protoComponent expansion should respect floating model reference", function () {
            var that = fluid.tests.fluid5282root("#FLUID-5282");
            jqUnit.assertEquals("Initial model value evaluated", "available", that.lastAudioValue);
            that.applier.change("audio", "unavailable");
            that.refreshView();
            jqUnit.assertEquals("Updated model value evaluated", "unavailable", that.lastAudioValue);
        });


        jqUnit.module("Protocomponent Expander Tests");

        jqUnit.test("makeProtoExpander Basic Tests", function () {
            var model = {
                path1: "value1",
                path2: "value2"
            };
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "%", model: model});
            var protoTree = {
                thingery: {messagekey: "myKey", args: ["thing", 3, false, "%path1"]},
                boundValue: "%path2"
            };
            var expanded = expander(protoTree);
            var expected = {
                children: [{
                    ID: "thingery",
                    componentType: "UIMessage",
                    messagekey: {value: "myKey"},
                    args: ["thing", 3, false, "value1"]
                }, {
                    ID: "boundValue",
                    componentType: "UIBound",
                    value: "value2",
                    valuebinding: "path2"
                }]
            };
            jqUnit.assertDeepEq("Simple expansion", expected, expanded);
        });

        jqUnit.test("Bare array expansion", function () {
            var protoTree = {
                matches: {
                    children: ["Fred Allen", "Phyllis Allen", "Karen Allen", "Rex Allen"]
                }
            };
            var expander = fluid.renderer.makeProtoExpander();
            var expanded = expander(protoTree);
            var expected = {
                children: [
                    {ID: "matches:",
                         componentType: "UIBound",
                         value: "Fred Allen"},
                    {ID: "matches:",
                         componentType: "UIBound",
                         value: "Phyllis Allen"},
                    {ID: "matches:",
                         componentType: "UIBound",
                         value: "Karen Allen"},
                    {ID: "matches:",
                         componentType: "UIBound",
                         value: "Rex Allen"}
                ]
            };
            jqUnit.assertDeepEq("Simple expansion", expected, expanded);
        });

        jqUnit.test("FLUID-3663 test: anomalous UISelect expansion", function () {
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
            var protoTree = {
                "authority-history": "${fields.history}",
                "contact-addressType1": {
                    "selection": "${fields.addressType1}",
                    "optionlist": ["Home", "Work"],
                    "optionnames": ["home", "work"]
                }
            };
            var expanded = expander(protoTree);
            var expected = {
                children: [
                    {ID: "authority-history",
                         componentType: "UIBound",
                         valuebinding: "fields.history"},
                    {ID: "contact-addressType1",
                         componentType: "UISelect",
                         selection: { valuebinding: "fields.addressType1"},
                         optionlist: { value: ["Home", "Work"]},
                         optionnames: { value: ["home", "work"]}
                    }
                ]
            };
            jqUnit.assertDeepEq("UISelect expansion", expected, expanded);
        });

        jqUnit.test("FLUID-3682 test: decorators attached to blank UIOutput", function () {
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
            var protoTree = {
                ".csc-date-information-date-earliest-single-date-container": {
                    "decorators": [
                        {
                            "func": "cspace.datePicker",
                            "type": "fluid"
                        }
                    ]
                }
            };
            var expanded = expander(protoTree);
            var expected = {
                children: [{
                    ID: ".csc-date-information-date-earliest-single-date-container",
                    componentType: "UIBound",
                    "decorators": [{
                        "func": "cspace.datePicker",
                        "type": "fluid"
                    }]
                }]
            };
            jqUnit.assertDeepEq("Decorator expansion", expected, expanded);
        });


        jqUnit.test("FLUID-3659 test: decorators attached to elements with valuebinding", function () {
            var model = {
                queryUrl: "../../chain/loanin/autocomplete/lender",
                vocabUrl: "../../chain/loanin/source-vocab/lender"
            };
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}", model: model});
            var protoTree = {
                "loanIn-lender": {
                    value: "${fields.lenders.0.lender}",
                    decorators: [{
                        type: "fluid",
                        func: "cspace.autocomplete",
                        options: {
                            queryUrl: "${queryUrl}",
                            vocabUrl: "${vocabUrl}"
                        }
                    }]
                }
            };
            var expanded = expander(protoTree);
            var expected = {
                children: [{
                    ID: "loanIn-lender",
                    componentType: "UIBound",
                    valuebinding: "fields.lenders.0.lender",
                    value: undefined,
                    decorators: [{
                        type: "fluid",
                        func: "cspace.autocomplete",
                        options: {
                            queryUrl: "../../chain/loanin/autocomplete/lender",
                            vocabUrl: "../../chain/loanin/source-vocab/lender"
                        }
                    }]
                }]
            };
            jqUnit.assertDeepEq("Decorator expansion", expected, expanded);
        });

        fluid.defaults("fluid.tests.repeatDecorator", {
            gradeNames: ["fluid.viewComponent", "autoInit"]
        });

        fluid.defaults("fluid.tests.repeatHead", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            components: {
                instantiator: "{instantiator}"
            },
            protoTree: {
                expander: {
                    type: "fluid.renderer.repeat",
                    controlledBy: "vector",
                    pathAs: "elementPath",
                    valueAs: "element",
                    repeatID: "link",
                    tree: {
                        decorators: {
                            type: "fluid",
                            func: "fluid.tests.repeatDecorator",
                            options: {
                                model: {
                                    value: "${{element}}"
                                }
                            }

                        }
                    }
                }
            }
        });

        jqUnit.test("FLUID-4168 test: decorator expansion reference to repetition variables", function () {
            var model = {
                vector: [1, 2, 3]
            };
            var head = fluid.tests.repeatHead(".repeater-leaf-test", {model: model});
            head.refreshView();
            var decorators = fluid.renderer.getDecoratorComponents(head, head.instantiator);
            var declist = [];
            fluid.each(decorators, function (decorator, key) {
                declist.push({key: key, decorator: decorator});
            });
            declist.sort(function (ea, eb) {return ea.key < eb.key ? -1 : 1;});
            var decvals = fluid.transform(declist, function (dec) {
                return dec.decorator.model.value;
            });
            jqUnit.assertDeepEq("Model values recovered from decorators", model.vector, decvals);
        });

        jqUnit.test("FLUID-3658 test: simple repetition expander", function () {
            var model = {
                vector: [1, 2, 3]
            };
            var messageBundle = {
                siteUrlTemplate: "http://site/path/%element/text.html"
            };
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}", model: model});
            var protoTree = {
                expander: {
                    type: "fluid.renderer.repeat",
                    controlledBy: "vector",
                    pathAs: "elementPath",
                    valueAs: "element",
                    repeatID: "link",
                    tree: {
                        linktext: "${{elementPath}}",
                        target: {
                            messagekey: "siteUrlTemplate",
                            args: {
                                element: "${{element}}"
                            }
                        }
                    }
                }
            };
            var expanded = expander(protoTree);
            var node = $(".repeater-leaf-test");
            fluid.selfRender(node, expanded, {
                model: model,
                messageSource: {type: "data", messages: messageBundle}
            });
            var links = $("a", node);
            jqUnit.assertEquals("Link count", 3, links.length);
            for (var i = 0; i < links.length; ++i) {
                jqUnit.assertNode("Link rendered", {
                    nodeName: "a",
                    href: fluid.stringTemplate(messageBundle.siteUrlTemplate, {element: model.vector[i]}),
                    nodeText: String(model.vector[i])
                }, links[i]);
            }
        });

        jqUnit.test("FLUID-3658 test: recursive expansion with expanders", function () {
            var choices = ["none", "read", "write", "delete"];
            var rows = ["Acquisition", "Cataloguing", "Intake", "Loan In", "Loan Out"];
            var model = {
                choices: choices
            };
            model.permissions = fluid.transform(rows, function (row, rowIndex) {
                return {
                    recordType: row,
                    permissions: fluid.transform(fluid.iota(3), function (col) {
                        var value = (rowIndex * 7 + col) % 4;
                        return choices[value];
                    })
                };
            });

            var expopts = {ELstyle: "${}", model: model};
            var expander = fluid.renderer.makeProtoExpander(expopts);

            var protoTree = {
                expander: {
                    type: "fluid.renderer.repeat",
                    controlledBy: "permissions",
                    pathAs: "row",
                    repeatID: "permissions-record-row",
                    tree: {
                        expander: {
                            type: "fluid.renderer.repeat",
                            controlledBy: "{row}.permissions",
                            pathAs: "permission",
                            repeatID: "permissions-record-column",
                            tree: {
                                expander: {
                                    type: "fluid.renderer.selection.inputs",
                                    rowID: "permissions-record-role-row",
                                    labelID: "permissions-record-role-label",
                                    inputID: "permissions-record-role-input",
                                    selectID: "permissions-record-permissions",
                                    tree: {
                                        "selection": "${{permission}}",
                                        "optionlist": "${choices}",
                                        "optionnames": "${choices}"//,
                                        //"default": "write"
                                    }
                                }
                            }
                        },
                        "permissions-record-type": "${{row}.recordType}"
                    }
                }
            };

            var expanded = expander(protoTree);
            var node = $(".recursive-expansion-test");
            fluid.selfRender(node, expanded, {
                model: model
            });
            var radios = $("input", node);
            jqUnit.assertEquals("Radio button count", model.permissions.length * model.permissions[0].permissions.length * choices.length,
                radios.length);

            var spans = $("span", node);
            jqUnit.assertEquals("Span count", model.permissions.length, spans.length);

        });

        function deleteComponentTypes(tree) {
            return fluid.transform(tree, function (el) {
                if (fluid.isPrimitive(el)) {
                    return el;
                } else if (el.componentType) {
                    delete el.componentType;
                }
                return deleteComponentTypes(el);
            });
        }

        jqUnit.test("Non-expansion expander test", function () {
            var model = {
                queryUrl: "../../chain/loanin/autocomplete/lender",
                vocabUrl: "../../chain/loanin/source-vocab/lender"
            };
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}", model: model});
            var protoTree = {
                component1: "${path1}",
                component2: {
                    valuebinding: "path2",
                    decorators: {
                        type: "fluid",
                        func: "cspace.autocomplete",
                        options: {
                            queryUrl: "${queryUrl}",
                            vocabUrl: "${vocabUrl}",
                            componentTree: {
                                expander: {
                                    type: "fluid.expander.noexpand",
                                    tree: {
                                        component1: "${path1}"
                                    }
                                }
                            }
                        }
                    }
                }
            };
            var expanded = expander(protoTree);
            var expected = {
                children: [{
                    ID: "component1",
                    componentType: "UIBound",
                    valuebinding: "path1",
                    value: undefined
                }, {
                    ID: "component2",
                    componentType: "UIBound",
                    valuebinding: "path2",
                    value: undefined,
                    decorators: {
                        type: "fluid",
                        func: "cspace.autocomplete",
                        options: {
                            queryUrl: "../../chain/loanin/autocomplete/lender",
                            vocabUrl: "../../chain/loanin/source-vocab/lender",
                            componentTree: {
                                component1: "${path1}"
                            }
                        }
                    }
                }]
            };
            jqUnit.assertDeepEq("Decorator non-expansion", expected, expanded);
        });

        fluid.tests.returnArg = function (arg) {
            return arg;
        };

        jqUnit.test("Condition Expander", function () {
            var tree = {
                expander: {
                    type: "fluid.renderer.condition",
                    condition: true,
                    trueTree: {
                        thisIsTrueTree: {
                            messagekey: "test"
                        }
                    },
                    falseTree: {
                        thisIsFalseTree: {
                            messagekey: "test"
                        }
                    }
                }
            };
            var expectedTrue = {
                children: [{
                    ID: "thisIsTrueTree",
                    componentType: "UIMessage",
                    messagekey: {
                        value: "test"
                    }
                }]
            };
            var expectedFalse = {
                children: [{
                    ID: "thisIsFalseTree",
                    componentType: "UIMessage",
                    messagekey: {
                        value: "test"
                    }
                }]
            };
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
            var expanded = expander(tree);
            jqUnit.assertDeepEq("Expanded tree should be", expectedTrue, expanded);
            tree.expander.condition = false;
            expanded = expander(tree);
            jqUnit.assertDeepEq("Expanded tree should be", expectedFalse, expanded);
            /*
            tree.expander.condition = {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "fluid.tests.returnArg",
                    args: true
                }
            };
            expanded = expander(tree);
            jqUnit.assertDeepEq("Expanded tree should be", expectedTrue, expanded);
            */
            tree.expander.condition = {
                funcName: "fluid.tests.returnArg",
                args: true
            };
            expanded = expander(tree);
            jqUnit.assertDeepEq("Expanded tree should be", expectedTrue, expanded);
            tree.expander.condition = {
                funcName: "fluid.tests.returnArg",
                args: true
            };
            expanded = expander(tree);
            jqUnit.assertDeepEq("Expanded tree should be", expectedTrue, expanded);
            var model = {
                vector: ["one", "two"]
            };
            expander = fluid.renderer.makeProtoExpander({ELstyle: "${}", model: model});
            tree.expander.trueTree = {
                expander: {
                    type: "fluid.renderer.repeat",
                    controlledBy: "vector",
                    pathAs: "element",
                    repeatID: "vectorElement",
                    tree: { value: "${{element}}" }
                }
            };
            expanded = expander(tree);
            expectedTrue.children = fluid.transform(model.vector, function (element, i) {
                return {
                    ID: "vectorElement:",
                    componentType: "UIBound",
                    value: element,
                    valuebinding: "vector." + i
                };
            });
            jqUnit.assertDeepEq("Expanded tree should be", expectedTrue, expanded);
        });

        fluid.tests.assertDisplay = function (displayString) {
            return displayString === "show";
        };

        jqUnit.test("Condition within repetition expander", function () {
            var model = {
                "fields": {
                    "permissions": [
                        {
                            "display": "show",
                            "resourceName": "idgenerators",
                            "permission": "delete"
                        },
                        {
                            "display": "none",
                            "resourceName": "id",
                            "permission": "delete"
                        }
                    ]
                }
            };
            var expopts = {ELstyle: "${}", model: model};
            var expander = fluid.renderer.makeProtoExpander(expopts);
            var protoTree = {
                "expander": {
                    "repeatID": ".csc-permissions-record-row:",
                    "type": "fluid.renderer.repeat",
                    "pathAs": "row",
                    "valueAs": "rowValue",
                    "controlledBy": "fields.permissions",
                    "tree": {
                        "expander": {
                            "type": "fluid.renderer.condition",
                            "condition": {
                                "funcName": "fluid.tests.assertDisplay",
                                "args": "{rowValue}.display"
                            },
                            "trueTree": {
                                ".csc-role-resourceName": "${{row}.resourceName}",
                                "expander": {
                                    "inputID": ".csc-role-permission-input",
                                    "tree": {
                                        "optionnames": ["none", "read", "write", "delete"],
                                        "optionlist": ["none", "read", "write", "delete"],
                                        "selection": "${{row}.permission}"
                                    },
                                    "rowID": ".csc-role-permission-row:",
                                    "selectID": "permission",
                                    "labelID": ".csc-role-permission-label",
                                    "type": "fluid.renderer.selection.inputs"
                                }
                            }
                        }
                    }
                }
            };
            var expanded = expander(protoTree);
            jqUnit.assertEquals("Only one row produced", 1, expanded.children.length);
            // one for UISelect, one for resourceName bound, one each for optionlist
            jqUnit.assertEquals("Inner expander expanded", 2 + protoTree.expander.tree.expander.trueTree.expander.tree.optionnames.length,
                expanded.children[0].children.length);
            return;
        });

        jqUnit.test("FLUID-4128 test: Literal booleans within repetition/condition expander", function () {
            var model = {conditions: [true, false, true, true, false]};
            var expander = fluid.renderer.makeProtoExpander({model: model});
            var protoTree = {
                expander: {
                    type: "fluid.renderer.repeat",
                    repeatID: "repeat-row:",
                    pathAs: "row",
                    valueAs: "rowValue",
                    controlledBy: "conditions",
                    tree: {
                        expander: {
                            type: "fluid.renderer.condition",
                            condition: "{rowValue}",
                            trueTree: {
                                leafValue: "{rowValue}"
                            }
                        }
                    }
                }
            };
            var expanded = expander(protoTree);
            jqUnit.assertEquals("Only three rows produced", 3, expanded.children.length);
            fluid.copy(protoTree);
            protoTree.expander.tree.expander.condition = "${{rowValue}}";
            expanded = expander(protoTree);
            jqUnit.assertEquals("Only three rows produced - alternative reference style", 3, expanded.children.length);
        });

        jqUnit.test("FLUID-3658 test: selection to inputs expander", function () {
            var model = { };
            var expopts = {ELstyle: "${}", model: model};
            var expander = fluid.renderer.makeProtoExpander(expopts);
            var protoTree = {
                "permissions-record-row": {
                    "children": [{
                        expander: {
                            type: "fluid.renderer.selection.inputs",
                            rowID: "permissions-record-role-row",
                            labelID: "permissions-record-role-label",
                            inputID: "permissions-record-role-input",
                            selectID: "permissions-record-permissions",
                            tree: {
                                "selection": "${fields.permissions.0.permission}",
                                "optionlist": ["none", "read", "write", "delete"],
                                "optionnames": ["none", "read", "write", "delete"]
                                //"default": "write" // this non-specified field might be expanded to a UIBound by the protoExpander
                            }
                        },
                        "permissions-record-type": "${fields.permissions.0.recordType}"
                    }]
                }
            };
            var expanded = expander(protoTree);
            expanded = deleteComponentTypes(expanded);

            var expint = protoTree["permissions-record-row"].children[0];
            var expopt = expint.expander;
            expopt.rowID = expopt.rowID + ":"; // the expander automatically aligns colons for repetition
            var selection = expopt.tree;
            var manualExpand = fluid.explodeSelectionToInputs(selection.optionlist, expopt);
            selection.ID = "permissions-record-permissions";
            selection.selection = {
                valuebinding: fluid.extractEL(selection.selection, expopts)
            };
            selection.optionlist = selection.optionnames = {value: selection.optionlist};
            var expected = {
                children: [
                    {
                        ID: "permissions-record-row:",
                        children: [selection].concat(manualExpand).concat({
                            ID: "permissions-record-type",
                            valuebinding: "fields.permissions.0.recordType"
                        })
                    }
                ]
            };
            jqUnit.assertCanoniseEqual("Selection explosion", expected, expanded, jqUnit.sortTree);
        });

        jqUnit.test("FLUID-3844 test: messagekey resolved by expander", function () {
            var model = {
                tabs: {
                    here: {
                        href: "#here",
                        name: "messagekey"
                    },
                    "FLUID-4301": [
                        { id: 1 },
                        { id: 1 }
                    ]
                }
            };
            var applier = fluid.makeChangeApplier(model);
            var expopts = {ELstyle: "${}", model: model, applier: applier};
            var expander = fluid.renderer.makeProtoExpander(expopts);
            var protoTree = {
                expander: {
                    repeatID: "tab",
                    tree: {
                        tabLink: {
                            target: "${{tabInfo}.href}",
                            linktext: {
                                messagekey: "${{tabInfo}.name}"
                            }
                        }
                    },
                    type: "fluid.renderer.repeat",
                    pathAs: "tabInfo",
                    controlledBy: "tabs"
                }
            };
            var expanded = expander(protoTree);
            jqUnit.assertCanoniseEqual("Message key resolved", model.tabs.here.name,
                expanded.children[0].children[0].linktext.messagekey.value, jqUnit.sortTree);
        });

        fluid.registerNamespace("fluid.tests.FLUID4737");

        fluid.tests.FLUID4737.produceTree = function () {
            return {
                expander: {
                    type: "fluid.renderer.repeat",
                    repeatID: "messages:",
                    controlledBy: "vals",
                    pathAs: "valPath",
                    valueAs: "valValue",
                    tree: {
                        message: {
                            messagekey: "message",
                            args: "{valValue}"
                        }
                    }
                }
            };
        };

        fluid.defaults("fluid.tests.FLUID4737", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            produceTree: "fluid.tests.FLUID4737.produceTree",
            selectors: {
                messages: ".messages",
                message: ".message"
            },
            repeatingSelectors: ["messages"],
            strings: {
                message: "model value: %mVal"
            },
            model: {vals: [{mVal: 1}, {mVal: 2}]}
        });

        jqUnit.test("FLUID-4737: Messagekey with arguments from the model", function () {
            var origModel, that;
            jqUnit.expect(1);
            var testModel = function (that) {
                jqUnit.assertDeepEq("The model shouldn't have changed", origModel, that.model);
            };

            that = fluid.tests.FLUID4737(".FLUID-4737", {
                listeners: {
                    afterRender: testModel
                }
            });
            origModel = fluid.copy(that.model);
            that.refreshView();
        });

        jqUnit.test("Can't have explicit valuebinding in the proto tree (no other way if there are decorators)", function () {
            var model = {
                vector: [{
                    index: "one"
                }, {
                    index: "two"
                }]
            };
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}", model: model});
            var protoTree = {
                expander: {
                    repeatID: "tab",
                    tree: {
                        node: {
                            value: "${{vec}.index}",
                            decorators: {
                                type: "addClass",
                                classes: "someClass"
                            }
                        }
                    },
                    type: "fluid.renderer.repeat",
                    pathAs: "vec",
                    controlledBy: "vector"
                }
            };
            var expanded = expander(protoTree);
            jqUnit.assertCanoniseEqual("Valuebinding should be resolved", "vector.0.index",
                expanded.children[0].children[0].valuebinding, jqUnit.sortTree);
            jqUnit.assertCanoniseEqual("Valuebinding should be resolved", "one",
                 expanded.children[0].children[0].value, jqUnit.sortTree);
        });

        fluid.defaults("fluid.tests.FLUID4537", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            renderOnInit: true,
            model: {
                feeds: [
                    { title: "Title 1", description: "Description 1", link: "http://fake.com" }
                ]
            },
            selectors: {
                item: ".news-item",
                title: ".title",
                link: ".link",
                description: ".description"
            },
            repeatingSelectors: [ "item" ],
            protoTree: {
                expander: {
                    type: "fluid.renderer.repeat",
                    repeatID: "item",
                    controlledBy: "feeds",
                    pathAs: "item",
                    tree: {
                        title: "${{item}.title}",
                        link: { target: "${{item}.link}", decorators: { attrs: { title: "${{item}.description}" } } },
                        description: "${{item}.description}"
                    }
                }
            }
        });

        jqUnit.test("FLUID-4537: Attribute decorator expansion test", function () {
            var that = fluid.tests.FLUID4537(".news-items", {});
            var links = that.locate("link");
            jqUnit.assertEquals("One link rendered", 1, links.length);
            var attr = links.attr("title");
            jqUnit.assertEquals("Description title rendered", that.model.feeds[0].description, attr);
        });

        fluid.defaults("fluid.tests.FLUID4536", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            components: {
                iframeHead: {
                    createOnEvent: "iframeLoad",
                    type: "fluid.tests.FLUID4536IframeHead",
                    container: "{FLUID4536}.iframeContainer"
                }
            },
            selectors: {
                iframe: "iframe"
            },
            events: {
                iframeLoad: null
            },
            finalInitFunction: "fluid.tests.FLUID4536.finalInit"
        });

        fluid.tests.FLUID4536.finalInit = function(that) {
            that.iframe = that.dom.locate("iframe");
            function tryLoad() {
                var iframeWindow = that.iframe[0].contentWindow;
                that.iframeDocument = iframeWindow.document;

                that.jQuery = iframeWindow.jQuery;
                if (that.jQuery) {
                    that.iframeContainer = that.jQuery("body");
                    that.events.iframeLoad.fire(that);
                }
            }
            tryLoad();
            if (!that.jQuery) {
                that.iframe.load(tryLoad);
            }
        };

        fluid.defaults("fluid.tests.FLUID4536IframeHead", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            components: {
                iframeChild: {
                    type: "fluid.tests.FLUID4536IframeChild",
                    container: "{FLUID4536IframeHead}.dom.component"
                }
            },
            selectors: {
                component: "#iframe-root"
            }
        });

        fluid.defaults("fluid.tests.FLUID4536IframeChild", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            model: {
                checked: true
            },
            protoTree: {
                checkbox: "${checked}"
            },
            selectors: {
                checkbox: ".flc-checkbox"
            },
            renderOnInit: true
        });

        jqUnit.asyncTest("FLUID-4536 iframe propagation test", function() {
            jqUnit.expect(4);
            fluid.tests.FLUID4536("#qunit-fixture", {
                listeners: {
                    iframeLoad: {
                        priority: "last",
                        listener:
                        function(that) {
                            jqUnit.assertValue("Inner component constructed", that.iframeHead.iframeChild);
                            var outerExpando = $.expando;
                            var innerExpando = that.iframeContainer.constructor.expando;
                            jqUnit.assertNotEquals("Inner container uses different jQuery", outerExpando, innerExpando);
                            var child = that.iframeHead.iframeChild;
                            var furtherExpando = child.container.constructor.expando;
                            jqUnit.assertEquals("jQuery propagated through DOM binder", innerExpando, furtherExpando);
                            child.locate("checkbox").prop("checked", false).change();
                            jqUnit.assertEquals("Operable renderer component in child", false, child.model.checked);
                            jqUnit.start();
                        }
                    }
                }
            });
        });

        fluid.defaults("fluid.tests.pathExpander", {
            gradeNames: ["autoInit", "fluid.viewComponent"]
        });
        fluid.defaults("fluid.tests.pathExpanderParent", {
            gradeNames: ["autoInit", "fluid.rendererComponent"],
            components: {
                instantiator: "{instantiator}"
            },
            model: {
                rows: ["0", "1", "2"]
            },
            selectors: {
                row: ".pathexp-row",
                decorated: ".pathexp-row-decorated"
            },
            repeatingSelectors: ["row"],
            protoTree: {
                expander: {
                    repeatID: "row",
                    type: "fluid.renderer.repeat",
                    pathAs: "path",
                    valueAs: "value",
                    controlledBy: "rows",
                    tree: {
                        decorated: {
                            decorators: {
                                type: "fluid",
                                func: "fluid.tests.pathExpander",
                                options: {
                                    path: "{path}",
                                    val: "{value}"
                                }
                            }
                        }
                    }
                }
            },
            renderOnInit: true
        });
        jqUnit.test("FLUID-4537 further: pathAs propagation", function () {
            var that = fluid.tests.pathExpanderParent(".pathAsProp");
            var decorators = fluid.renderer.getDecoratorComponents(that, that.instantiator);
            fluid.each(decorators, function (comp) {
                jqUnit.assertEquals("Path should not be expanded into value", "rows." + comp.options.val, comp.options.path);
            });
        });

        fluid.defaults("fluid.tests.customSetConfigRendererComponent", {
            gradeNames: ["autoInit", "fluid.rendererComponent"],
            model: {
                "a.b.c": {
                    val: "OLD"
                }
            },
            selectors: {
                escaped: ".escaped"
            },
            protoTree: {
                escaped: "${a\\.b\\.c.val}"
            },
            renderOnInit: true,
            resolverGetConfig: fluid.model.escapedGetConfig,
            resolverSetConfig: fluid.model.escapedSetConfig
        });
        jqUnit.test("FLUID-4935: resolverSetConfig propagation to changeApplierOptions.resolverSetConfig option", function () {
            var customSetConfigRendererComponent = fluid.tests.customSetConfigRendererComponent(".FLUID-4935");
            var escaped = customSetConfigRendererComponent.locate("escaped");
            function checkDataBind(expected) {
                jqUnit.assertEquals("Selector is rendered correctly", expected, escaped.val());
                jqUnit.assertEquals("Model is up to date", expected,
                    customSetConfigRendererComponent.model["a.b.c"].val);
            }
            checkDataBind("OLD");
            escaped.val("NEW").change();
            checkDataBind("NEW");
        });


        /**
         * Test setup for FLUID-5048
         */
        fluid.defaults("fluid.tests.fluid5048.mediaSettings", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            model: {
                show: false
            },
            selectors: {
                show: ".flc-videoPlayer-media-show"
            },
            resources: {
                template: {
                    url: "../data/MediaPanelTemplate.html"
                }
            },
            protoTree: {
                show: "${show}"
            }
        });

        fluid.tests.fluid5048.mediaSettings.finalInit = function (that) {
            fluid.fetchResources(that.options.resources, function () {
                that.refreshView();
            });
        };
        fluid.defaults("fluid.tests.fluid5048.captionsSettings", {
            gradeNames: ["fluid.tests.fluid5048.mediaSettings", "autoInit"]
        });
        fluid.defaults("fluid.tests.fluid5048.transcriptsSettings", {
            gradeNames: ["fluid.tests.fluid5048.mediaSettings", "autoInit"]
        });

        fluid.defaults("fluid.tests.fluid5048.parent", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            selectors: {
                captionsSettings: ".flc-prefsEditor-captions-settings",
                transcriptsSettings: ".flc-prefsEditor-transcripts-settings"
            },
            components: {
                captions: {
                    type: "fluid.tests.fluid5048.captionsSettings",
                    container: "{parent}.dom.captionsSettings"
                },
                transcripts: {
                    type: "fluid.tests.fluid5048.transcriptsSettings",
                    container: "{parent}.dom.transcriptsSettings"
                }
            },
            events: {
                onReady: {
                    events: {
                        capsReady: "{captions}.events.afterRender",
                        transReady: "{transcripts}.events.afterRender"
                    },
                    args: ["{parent}"]
                }
            }
        });

        jqUnit.asyncTest("FLUID-5048: Label 'for' attributes", function () {
            var onReady = function (that) {
                var label1for = $("label", that.captions.container).attr("for");
                var label2for = $("label", that.transcripts.container).attr("for");
                var labels = {};
                labels[label1for] = true;
                labels[label2for] = true;
                jqUnit.assertDeepEq("Labels should separately be \"show\" and \"show-1\"", {"show": true, "show-1": true}, labels);
                jqUnit.start();
            };
            fluid.tests.fluid5048.parent("#FLUID-5048-test", {
                listeners: {
                    onReady: onReady
                }
            });
        });

        fluid.defaults("fluid.tests.fluid5099", {
            gradeNames: ["autoInit", "fluid.rendererComponent"],
            model: {
                test: "TEST"
            },
            selectors: {
                test: ".flc-fluid5099-test"
            },
            protoTree: {
                test: "${test}"
            },
            renderOnInit: true
        });

        jqUnit.test("FLUID-5099: source name collision", function () {
            jqUnit.expect(3);
            var that = fluid.tests.fluid5099("#FLUID-5099");
            var test = that.locate("test");
            jqUnit.assertEquals("Original value is correct", "TEST", test.val());
            fluid.addSourceGuardedListener(that.applier, "test", "test", function (model, oldModel, changeRequest) {
                jqUnit.assert("Listener is applied correctly.");
                jqUnit.assertEquals("Source is set correctly", "DOM:test", changeRequest[0].source);
            });
            test.val("NEW VALUE").change();
        });

        fluid.defaults("fluid.tests.fluid4986", {
            gradeNames: ["autoInit", "fluid.rendererComponent"],
            selectors: {
                select: ".flc-fluid4986-select",
                simpleBound1: ".flc-fluid4986-simpleBound1",
                simpleBound2: ".flc-fluid4986-simpleBound2",
                simpleBound3: ".flc-fluid4986-simpleBound3",
                simpleBound4: ".flc-fluid4986-simpleBound4",
                simpleBound5: ".flc-fluid4986-simpleBound5",
                simpleBound6: ".flc-fluid4986-simpleBound6"
            },
            optionnames: ["One", "Two", "Three"],
            optionlist: ["one", "two", "three"],
            model: {
                select: "two"
            },
            protoTree: {
                select: {
                    optionnames: "${{that}.options.optionnames}",
                    optionlist: "${{that}.options.optionlist}",
                    selection: "${select}"
                },
                simpleBound1: "{test}.string",
                simpleBound2: "{test.string .....",
                simpleBound3: "test}.string .....",
                simpleBound4: "${{test.string}",
                simpleBound5: "${test.string}}",
                simpleBound6: "${{test}.string}"
            },
            renderOnInit: true
        });

        jqUnit.test("FLUID-4986: Select", function () {
            var that = fluid.tests.fluid4986("#FLUID-4986");
            jqUnit.assertEquals("Select should be rendered properly", that.model.select, that.locate("select").val());
            jqUnit.assertEquals("Simple bound with that includes {} should be rendered correctly",
                "{test}.string", that.locate("simpleBound1").text());
            jqUnit.assertEquals("Simple bound with that includes just { should be rendered correctly",
                "{test.string .....", that.locate("simpleBound2").text());
            jqUnit.assertEquals("Simple bound with that includes just } should be rendered correctly",
                "test}.string .....", that.locate("simpleBound3").text());
            jqUnit.assertEquals("A bound with incorrect { nested resolvable context should be rendered correctly",
                "", that.locate("simpleBound4").text());
            jqUnit.assertEquals("A bound with incorrect } nested resolvable context should be rendered correctly",
                "", that.locate("simpleBound5").text());
            jqUnit.assertEquals("A bound with incorrect {} nested resolvable context should be rendered correctly",
                "${{test}.string}", that.locate("simpleBound6").text());
        });
    };

})(jQuery);
