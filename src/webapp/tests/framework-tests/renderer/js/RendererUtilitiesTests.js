/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global fluid, jQuery, jqUnit*/

fluid.registerNamespace("fluid.tests");

(function ($) {

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
                    messagekey: "message"
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
            }
        });
        
        function assertRenderedText(els, array) {
            fluid.each(els, function (el, index) {
                jqUnit.assertEquals("Element " + index + " text", array[index], $(el).text());
            });
        }
        
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
                resolverGetConfig: [fluid.tests.censoringStrategy(censorFunc)],
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
                resolverGetConfig: [fluid.tests.censoringStrategy(censorFunc)]
            });
            testFilteredRecords(that);
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
                resolverGetConfig: [fluid.tests.censoringStrategy(censorFunc)],
                protoTree: tree,
                rendererFnOptions: {
                    noexpand: true
                }
            });
            testFilteredRecords(that);
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
                children: [
                    {ID: "thingery",
                     componentType: "UIMessage",
                     messagekey: {value: "myKey"},
                     args: ["thing", 3, false, "value1"]
                    },
                    {ID: "boundValue", 
                     componentType: "UIBound",
                     value: "value2",
                     valuebinding: "path2"
                    }
                ]
            };
            jqUnit.assertDeepEq("Simple expansion", expected, expanded);
        });
        
        protoTests.test("Bare array expansion", function () {
            var protoTree = {matches: {
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
                    tree: 
                      { linktext: "${{elementPath}}",
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
            for (var i = 0; i < links.length; ++ i) {
                fluid.testUtils.assertNode("Link rendered", 
                    {nodeName: "a", 
                     href: fluid.stringTemplate(messageBundle.siteUrlTemplate, {element: model.vector[i]}),
                     nodeText: String(model.vector[i])},
                links[i]);
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
                }
                else if (el.componentType) {
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
                children: [
                    {ID: "component1",
                     componentType: "UIBound",
                     valuebinding: "path1"},
                    {ID: "component2",
                     componentType: "UIBound",
                     valuebinding: "path2",
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
                  }
                ]
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
       
        fluid.tests.assertDisplay = function(displayString) {
            return displayString === "show";
        };
        
        protoTests.test("Condition within repetition expander", function() {
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
                        }]
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
        
        protoTests.test("FLUID-3658 test: selection to inputs expander", function () {
            var model = { };
            var expopts = {ELstyle: "${}", model: model};
            var expander = fluid.renderer.makeProtoExpander(expopts);
            var protoTree = {
                "permissions-record-row": {
                    "children": [ 
                        {expander: {                  
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
                     }
                    ]
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
            fluid.testUtils.assertTree("Selection explosion", expected, expanded);
        });
        
        protoTests.test("FLUID-3844 test: messagekey resolved by expander", function () {
            var model = {
                tabs: {
                    here: {
                        href: "#here",
                        name: "messagekey"
                    }
                }
            };
            var expopts = {ELstyle: "${}", model: model};
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
            fluid.testUtils.assertTree("Message key resolved", model.tabs.here.name, expanded.children[0].children[0].linktext.messagekey.value);
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
            fluid.testUtils.assertTree("Valuebinding should be resolved", "vector.0.index", expanded.children[0].children[0].valuebinding);
            fluid.testUtils.assertTree("Valuebinding should be resolved", "one", expanded.children[0].children[0].value);
        });
    };  
})(jQuery); 