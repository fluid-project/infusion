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
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.tests");

(function ($) {
    fluid.setLogging(true);

    fluid.tests.testRendererUtilities = function () {
    
        var binderTests = jqUnit.testCase("Cutpoint utility tests");
        binderTests.test("Renderer Utilities Test: selectorsToCutpoints", function () {
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
        
        fluid.tests.rendererComponentTest = function (container, options) {
            var that = fluid.initRendererComponent("fluid.tests.rendererComponentTest", container, options);
            return that;
        };
        
        fluid.tests.censoringStrategy = function (listCensor) {
            return {
                init: function () {
                    var totalPath = "";
                    return function (root, segment, index) {
                        var orig = root[segment];
                        totalPath = fluid.model.composePath(totalPath, segment);
                        return totalPath === "recordlist.deffolt" ?
                            listCensor(orig) : orig;
                    };
                }
            };
        };
        
        fluid.defaults("fluid.tests.rendererComponentTest", {
            mergePolicy: {
                model: "preserve",
                protoTree: "noexpand, replace"
            },
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
                    decorators: {"addClass": "{styles}.applicableStyle"}
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
        
        function assertRenderedText(els, array) {
            fluid.each(els, function (el, index) {
                jqUnit.assertEquals("Element " + index + " text", array[index], $(el).text());
            });
        }
        
        fluid.defaults("fluid.tests.rendererParent", {
            components: {
                middle: {
                    type: "fluid.tests.rendererMiddle"
                }
            },
            selectors: {
                middle: ".middle-component"  
            }
        });
        
        fluid.tests.rendererParent = function (container, options) {
            var that = fluid.initView("fluid.tests.rendererParent", container, options);
            fluid.initDependents(that);
            return that;  
        };
        
        fluid.demands("fluid.tests.rendererMiddle", "fluid.tests.rendererParent",
            ["{rendererParent}.dom.middle", fluid.COMPONENT_OPTIONS]);
        
        fluid.defaults("fluid.tests.rendererMiddle", {
            mergePolicy: {
                "rendererOptions.instantiator": "nomerge",
                "rendererOptions.parentComponent": "nomerge"  
            },
            rendererOptions: {
                instantiator: "{instantiator}",
                parentComponent: "{rendererMiddle}"
            },
            selectors: {
                decorated: ".decorated-component"
            },
            protoTree: {
                decorated: {
                    decorators: {
                        type: "fluid",
                        func: "fluid.tests.rendererChild",
                        options: { decoratorValue: "{rendererParent}.options.parentValue"}
                    }
                }
            }
        });
        
        fluid.tests.rendererMiddle = function (container, options) {
            var that = fluid.initRendererComponent("fluid.tests.rendererMiddle", container, options);
            return that;
        };

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
        
        var IoCTests = jqUnit.testCase("IoC Renderer tests");
        
        fluid.defaults("fluid.tests.identicalComponentParent", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
            selectors: {
                identicalComponent1: ".identicalComponent1",
                identicalComponent2: ".identicalComponent2"
            },
            finalInitFunction: "fluid.tests.identicalComponentParent.finalInitFunction",
            produceTree: "fluid.tests.identicalComponentParent.produceTree"
        });
        fluid.tests.identicalComponentParent.produceTree = function (that) {
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
        IoCTests.test("Same level identical components with different options", function () {
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
        fluid.tests.mergeRenderParent.produceTree = function (that) {
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
            mergeAllOptions: [{
                model: "{mergeRenderParent}.model"
            }, "{arguments}.1"]
        });
        IoCTests.test("Merging args and options", function () {
            var that = fluid.tests.mergeRenderParent(".mergeRenderParent");
            jqUnit.assertEquals("Subcomponent arg option is", "OPTION1", that["**-renderer-mergeComponent-0"].options.option);
            jqUnit.assertEquals("Subcomponent option is", that.model, that["**-renderer-mergeComponent-0"].options.model);
        });
        
        IoCTests.test("initDependent upgrade test", function () {
            var parentValue = "parentValue";
            var component = fluid.tests.rendererParent(".renderer-ioc-test", {parentValue: parentValue});
            var middleNode = component.middle.container;
            jqUnit.assertValue("Middle component constructed", middleNode);
            component.middle.refreshView();
            var decorated = component.middle.locate("decorated");
            jqUnit.assertEquals("Decorated text resolved from top level", parentValue, decorated.text());
            var child = component.middle[fluid.renderer.IDtoComponentName("decorated", 0)];
            jqUnit.assertEquals("Located decorator with IoC-resolved value", parentValue, child.options.decoratorValue);
            component.middle.refreshView();
            var child2 = component.middle[fluid.renderer.IDtoComponentName("decorated", 0)];
            jqUnit.assertNotEquals("Rendering has produced new component", child, child2);
        });
        
        var compTests = jqUnit.testCase("Renderer component tests");
        
        compTests.test("Renderer component without resolver", function () {
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
        
        var testMessageRepeat = function (that) {
            that.refreshView();
            var tablinks = that.locate("tabLink");
            jqUnit.assertEquals("Existing string relative should be found", "Acquisition", tablinks.eq(0).text());
            jqUnit.assertEquals("Nonexisting string relative should be notified ", "[No messagecodes provided]", tablinks.eq(1).text());
            jqUnit.assertEquals("Nonexisting string relative should be notified ", "[No messagecodes provided]", that.locate("unmatchedMessage").text());
        };
        
        var testMultipleExpanders = function (that) {
            that.refreshView();
            var tabContent = that.locate("tabContent");
            var tabTwoContent = that.locate("tab2Content");
            jqUnit.assertEquals("Existing string relative should be found", "Acquisition", tabContent.eq(0).text());
            jqUnit.assertEquals("Existing string relative should be found", "Cataloging", tabContent.eq(1).text());
            jqUnit.assertEquals("Existing string relative should be found", "Acquisition", tabTwoContent.eq(0).text());
            jqUnit.assertEquals("Existing string relative should be found", "Cataloging", tabTwoContent.eq(1).text());
        };
        
        compTests.test("Multiple same level expanders", function () {
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
        
        compTests.test("FLUID-3819 test: messagekey with no value", function () {
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
        
        compTests.test("Renderer component with custom resolver", function () {
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
            produceTree: "fluid.tests.littleComponentWithInstantiator.produceTree",
            finalInitFunction: "fluid.tests.littleComponentWithInstantiator.finalInitFunction",
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
                feedback: "http://wiki.collectionspace.org/display/collectionspace/Release+1.6+Feedback",
                version: "1.6"
            },
            strings: {
                text1: "2009 - 2011",
                text2: "CollectionSpace",
                currentRelease: "Release %version",
                about: "About CollectionSpace",
                feedback: "Leave Feedback"
            }
        });
        
        fluid.tests.littleComponentWithInstantiator.finalInitFunction = function (that) {
            that.renderer.refreshView();
        };
        
        fluid.tests.littleComponentWithInstantiator.produceTree = function () {
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
                        args: {version: "${version}"}
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
        
        compTests.test("FLUID-4200 test: Renderer component with infinite expansion (if there's an instantiator in the tree)", function () {
            var that = fluid.tests.littleComponentWithInstantiator();
            jqUnit.assertTrue("That with subcomponents was created", true);
        });
        
        compTests.test("Renderer component with custom resolver and renderer fixup", function () {
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
        
        compTests.test("Graded renderer component test", function () {
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
        
        compTests.test("Decorator with sub model", function () {
            var that = fluid.tests.decoratorParent("#main");
            that.refreshView();
            var decorator = that["**-renderer-row::val-0"];
            jqUnit.assertEquals("Original value should be", "TEST", decorator.locate("val").val());
            jqUnit.assertEquals("Original value in the model should be", "TEST", decorator.model.val);
            decorator.locate("val").val("NEW VAL").change();
            jqUnit.assertEquals("Original value should be", "NEW VAL", decorator.locate("val").val());
            jqUnit.assertEquals("Original value in the model should be", "NEW VAL", decorator.model.val);
            jqUnit.assertEquals("Original value in the model should be", "NEW VAL", that.model.submodel[0].val);
        });
     
        compTests.test("FLUID-4165 - ensure automatic creation of applier if none supplied", function () {
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
            produceTree: "fluid.tests.FLUID4189Component.produceTree"
        });
        
        fluid.tests.FLUID4189Component.produceTree = function () {
            return {
                input: "${value}"
            };
        };
        
        compTests.test("FLUID-4189 - refined workflow for renderer component", function () {
            function adjustModel(model, applier, that) {
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
            jqUnit.expect(3);
            var input = that.locate("input");
            jqUnit.assertEquals("Field 1 rendered", model.value, input.val());
            var input2 = that.locate("input2");
            jqUnit.assertEquals("Field 2 rendered", "value2", input2.val());
        });
    
        var protoTests = new jqUnit.TestCase("Protocomponent Expander Tests");
  
        protoTests.test("makeProtoExpander Basic Tests", function () {
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
        
        protoTests.test("Bare array expansion", function () {
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
       
        protoTests.test("FLUID-3663 test: anomalous UISelect expansion", function () {
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
        
        protoTests.test("FLUID-3682 test: decorators attached to blank UIOutput", function () {
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
                children: [
                    {ID: ".csc-date-information-date-earliest-single-date-container",
                         componentType: "UIBound",
                         "decorators": [ 
                            { 
                                "func": "cspace.datePicker", 
                                "type": "fluid" 
                            } 
                        ] 
                        }
                ]
            };
            jqUnit.assertDeepEq("Decorator expansion", expected, expanded);
        });
        
      
        protoTests.test("FLUID-3659 test: decorators attached to elements with valuebinding", function () {
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
                children: [
                    {ID: "loanIn-lender",
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
                        }
                ]
            };
            jqUnit.assertDeepEq("Decorator expansion", expected, expanded);
        });
        
        fluid.defaults("fluid.tests.repeatDecorator", {
            gradeNames: ["fluid.viewComponent", "autoInit"]
        });
        
        fluid.defaults("fluid.tests.repeatHead", {
            gradeNames: ["fluid.rendererComponent", "autoInit"],
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
        
        protoTests.test("FLUID-4168 test: decorator expansion reference to repetition variables", function () {
            var model = {
                vector: [1, 2, 3]
            };
            var head = fluid.tests.repeatHead(".repeater-leaf-test", {model: model});
            head.refreshView();
            var decorators = fluid.renderer.getDecoratorComponents(head);
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
        
        protoTests.test("FLUID-3658 test: simple repetition expander", function () {
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
                fluid.testUtils.assertNode("Link rendered", {
                    nodeName: "a", 
                    href: fluid.stringTemplate(messageBundle.siteUrlTemplate, {element: model.vector[i]}),
                    nodeText: String(model.vector[i])
                }, links[i]);
            }
        });
        
        protoTests.test("FLUID-3658 test: recursive expansion with expanders", function () {
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
        
        protoTests.test("Non-expansion expander test", function () {
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
        
        protoTests.test("Condition Expander", function () {
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
        
        protoTests.test("Condition within repetition expander", function () {
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
        
        protoTests.test("FLUID-4128 test: Literal booleans within repetition/condition expander", function () {
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
            var protoTree2 = fluid.copy(protoTree);
            protoTree.expander.tree.expander.condition = "${{rowValue}}";
            expanded = expander(protoTree);
            jqUnit.assertEquals("Only three rows produced - alternative reference style", 3, expanded.children.length);
        });
        
        protoTests.test("FLUID-3658 test: selection to inputs expander", function () {
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
            
            var expint = protoTree["permissions-record-row"]["children"][0];
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
            fluid.testUtils.assertCanoniseEqual("Selection explosion", expected, expanded, fluid.testUtils.sortTree);
        });
        
        protoTests.test("FLUID-3844 test: messagekey resolved by expander", function () {
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
            fluid.testUtils.assertCanoniseEqual("Message key resolved", model.tabs.here.name, 
                expanded.children[0].children[0].linktext.messagekey.value, fluid.testUtils.sortTree);
        });
        
        protoTests.test("Can't have explicit valuebinding in the proto tree (no other way if there are decorators)", function () {
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
            fluid.testUtils.assertCanoniseEqual("Valuebinding should be resolved", "vector.0.index", 
                expanded.children[0].children[0].valuebinding, fluid.testUtils.sortTree);
             fluid.testUtils.assertCanoniseEqual("Valuebinding should be resolved", "one", 
                 expanded.children[0].children[0].value, fluid.testUtils.sortTree);
        });
    };  
})(jQuery); 