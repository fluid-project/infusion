/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {

    // $(document).ready(function () {
    //     var toc;
    //     var options = {
    //         components: {
    //             levels: {
    //                 options: {
    //                     resources: {
    //                         template: {
    //                             url: "../../../../components/tableOfContents/html/TableOfContents.html"
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     };
    // 
    //     var tests = jqUnit.testCase("Table of Contents Tests");
    //      
    //     var testAfterRender = function (testFn) {
    //         var toc;
    //         
    //         options.listeners = {
    //             afterRender: function () {
    //                 testFn(toc);
    //                 start();
    //             }
    //         };
    //         
    //         toc = fluid.tableOfContents("#main", options);
    //     };
    //     
    //     var testTocItem = function (item, name) {
    //         var a = $("a", item);
    //         jqUnit.assertEquals(name + " has text", name, a.text());
    //         jqUnit.assertTrue(name + " has href", a.attr("href").indexOf("#" + name) > -1);            
    //     };
    //     
    //     tests.asyncTest("TOC Creation", function () {
    //         testAfterRender(function (toc) {
    //             expect(22);
    // 
    //             var tocEl = $("#main").children().eq(0);
    //             jqUnit.isVisible("Table of contents should be visible", tocEl);
    //         
    //             var items = $("li", tocEl);
    //             jqUnit.assertEquals("10 headings", 10, items.length);
    //         
    //             testTocItem(items[0], "Amphibians");
    //             testTocItem(items[1], "Toads");
    //             testTocItem(items[2], "Natterjack Toads");
    //             testTocItem(items[3], "Salamander");
    //             testTocItem(items[4], "Newt");
    //             testTocItem(items[5], "Birds");
    //             testTocItem(items[6], "Anseriformes");
    //             testTocItem(items[7], "Ducks");
    //             testTocItem(items[8], "Mammals");
    //             testTocItem(items[9], "CATT");
    //         });            
    //     });
    //            
    //     tests.asyncTest("Anchor insertion", function () {
    //         testAfterRender(function (toc) {
    //             expect(5);
    // 
    //             var anchors = $("a", "#amphibians-div");
    //             jqUnit.assertEquals("5 headings in the amphibians section", 5, anchors.length);
    // 
    //             var anchor = anchors.eq(0);
    //             jqUnit.assertEquals("Name is Amphibians", "Amphibians", anchor.attr("name"));         
    //             jqUnit.assertEquals("No text", "", anchor.text());
    //             jqUnit.assertFalse("No href", !!anchor.attr("href"));
    //             jqUnit.assertEquals("The next element in the DOM is the heading", "amphibians", anchor.next().prop("id"));
    //         });
    //     });
    // });

    fluid.staticEnvironment.tocTests = fluid.typeTag("fluid.tableOfContents.unitTests");
    
    fluid.demands("fluid.tableOfContents.levels", "fluid.tableOfContents.unitTests", {
        options: {
            resources: {
                template: {
                    forceCache: true,
                    url: "../../../../components/tableOfContents/html/TableOfContents.html"
                }
            }
        }
    });
    
    var skippedHeadings = {
        headingTags: ["h1", "h6"],
        anchorInfo: [{url: "#h1"}, {url: "#h6"}],
        headingInfo: [
            {level: 1, text: "h1", url: "#h1"},
            {level: 6, text: "h6", url: "#h6"}
        ],
        model: [{
            level: 1, 
            text: "h1", 
            url: "#h1",
            headings: [{
                headings: [{
                    headings: [{
                        headings: [{
                            headings: [{
                                level: 6, 
                                text: "h6", 
                                url: "#h6"
                            }]
                        }]
                    }]
                }]
            }]
        }]
    };
    
    var linearHeadings = {
        headingTags: ["h1", "h2", "h3", "h4", "h5", "h6"],
        anchorInfo: [{url: "#h1"}, {url: "#h2"}, {url: "#h3"}, {url: "#h4"}, {url: "#h5"}, {url: "#h6"}],
        headingInfo: [
            {level: 1, text: "h1", url: "#h1"},
            {level: 2, text: "h2", url: "#h2"},
            {level: 3, text: "h3", url: "#h3"},
            {level: 4, text: "h4", url: "#h4"},
            {level: 5, text: "h5", url: "#h5"},
            {level: 6, text: "h6", url: "#h6"}
        ],
        model: [{
            level: 1, 
            text: "h1", 
            url: "#h1",
            headings: [{
                level: 2,
                text: "h2",
                url: "#h2",
                headings: [{
                    level: 3,
                    text: "h3",
                    url: "#h3",
                    headings: [{
                        level: 4,
                        text: "h4",
                        url: "#h4",
                        headings: [{
                            level: 5,
                            text: "h5",
                            url: "#h5",
                            headings: [{
                                level: 6, 
                                text: "h6", 
                                url: "#h6"
                            }]
                        }]
                    }]
                }]
            }]
        }]
    };
    
    var singleLevelTree = {
        level1: {
            children: [
                {
                    expander: {
                        type: "fluid.renderer.repeat",
                        repeatID: "items:",
                        controlledBy: "headings",
                        valueAs: "headingValue1",
                        pathAs: "headingPath1",
                        tree: {
                            expander: [
                                {
                                    type: "fluid.renderer.condition",
                                    condition: "{headingValue1}.text",
                                    trueTree: {
                                        link: {
                                            target: "${{headingPath1}.url}",
                                            linktext: "${{headingPath1}.text}"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        }
    };
    
    var multiLevelTree = {
        level1: {
            children: [
                {
                    expander: {
                        type: "fluid.renderer.repeat",
                        repeatID: "items:",
                        controlledBy: "headings",
                        valueAs: "headingValue1",
                        pathAs: "headingPath1",
                        tree: {
                            expander: [
                                {
                                    type: "fluid.renderer.condition",
                                    condition: "{headingValue1}.text",
                                    trueTree: {
                                        link: {
                                            target: "${{headingPath1}.url}",
                                            linktext: "${{headingPath1}.text}"
                                        }
                                    }
                                },
                                {
                                    type: "fluid.renderer.condition",
                                    condition: "{headingValue1}.headings",
                                    trueTree: {
                                        level2: {
                                            children: [
                                                {
                                                    expander: {
                                                        type: "fluid.renderer.repeat",
                                                        repeatID: "items:",
                                                        controlledBy: "{headingPath1}.headings",
                                                        valueAs: "headingValue2",
                                                        pathAs: "headingPath2",
                                                        tree: {
                                                            expander: [
                                                                {
                                                                    type: "fluid.renderer.condition",
                                                                    condition: "{headingValue2}.text",
                                                                    trueTree: {
                                                                        link: {
                                                                            target: "${{headingPath2}.url}",
                                                                            linktext: "${{headingPath2}.text}"
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        }
    };
    
    var createElm = function (tagName) {
        return fluid.unwrap($("<" + tagName + "/>", {text: tagName}));
    };
    
    var createElms = function (tagArray) {
        return fluid.transform(tagArray, createElm);
    };
    
    var toModelTests = function (headingInfo, expectedModel) {
        var model = fluid.tableOfContents.modelBuilder.toModel(headingInfo);
        jqUnit.assertDeepEq("headingInfo converted to model correctly", expectedModel, model);
    };
    
    var convertToHeadingObjectsTests = function (headings, anchorInfo, expectedHeadingInfo) {
        var modelBuilder = fluid.tableOfContents.modelBuilder();
        var headingInfo = modelBuilder.convertToHeadingObjects(headings, anchorInfo);
        jqUnit.assertDeepEq("Heading objects created correctly", expectedHeadingInfo, headingInfo);
    };
    
    var assembleModelTests = function (headings, anchorInfo, expectedModel) {
        var modelBuilder = fluid.tableOfContents.modelBuilder();
        var model = modelBuilder.assembleModel(headings, anchorInfo);
        jqUnit.assertDeepEq("model assembled correctly", expectedModel, model);
    };
    
    var generateTreeTests = function (startLevel, endLevel, expectedTree) {
        var tree = fluid.tableOfContents.levels.generateTree(startLevel, endLevel);
        jqUnit.assertDeepEq("tree generated correctly", expectedTree, tree);
    };
    
    var renderTOCTest = function (that, testHeadings) {
        var tocLinks = that.locate("link");
        jqUnit.assertEquals("The correct number of links are rendered", testHeadings.headingInfo.length, tocLinks.length);
        fluid.each(tocLinks, function (elm, idx) {
            var hInfo = testHeadings.headingInfo[idx];
            elm = $(elm);
            
            jqUnit.assertEquals("ToC text set correctly", fluid.get(hInfo, "text"), elm.text());
            jqUnit.assertEquals("ToC anchor set correctly", fluid.get(hInfo, "url"), elm.attr("href"));
        });
        start();
    };
    
    var renderTOCTests = function (testHeadings) {
        var container = $(".flc-toc-tocContainer");
        var renderedTOC = fluid.tableOfContents.levels(container, {
            model: {
                headings: testHeadings.model
            },
            listeners: {
                afterRender: function (that) {
                    renderTOCTest(that, testHeadings);
                }
            },
            resources: {
                template: {
                    forceCache: true,
                    url: "../../../../components/tableOfContents/html/TableOfContents.html"
                }
            }
        });
    };
    
    /**
     * Returns a ToC Component with the predefined demand block
     */
    var renderTOCComponent = function () {
        fluid.staticEnvironment.demo = fluid.typeTag("fluid.tableOfContentsTest");
        fluid.demands("fluid.tableOfContents.levels", ["fluid.tableOfContents", "fluid.tableOfContentsTest"], {
            options: {
                resources: {
                    template: {
                        forceCache: true,
                        url: "../../../../components/tableOfContents/html/TableOfContents.html"
                    }
                }
            }
        });
        return fluid.tableOfContents("#main");
    };

    $(document).ready(function () {

        var tocHeadingCalc = jqUnit.testCase("Table of Contents: Heading Calculator Tests");
        var tocMBTests = jqUnit.testCase("Table of Contents: Model Builder Tests");
        var tocLevelsTests = jqUnit.testCase("Table of Contents: Levels Tests");
        var tocTests = jqUnit.testCase("Table of Contents Tests");
    
        // "fluid.tableOfContents.modelBuilder.headingCalculator" tests
        
        tocHeadingCalc.test("getHeadingLevel", function () {
            var headingCalc = fluid.tableOfContents.modelBuilder.headingCalculator();
            
            for (var i = 1; i <= 6; i++) {
                var tagName = "h" + i;
                var heading = createElm(tagName);
                jqUnit.assertEquals(tagName + " level", i, headingCalc.getHeadingLevel(heading));
            }
        });
        
        // "fluid.tableOfContents.modelBuilder" tests
        
        tocMBTests.test("toModel: linear headings", function () {toModelTests(linearHeadings.headingInfo, linearHeadings.model);});
        tocMBTests.test("toModel: skipped headings", function () {toModelTests(skippedHeadings.headingInfo, skippedHeadings.model);});
        
        tocMBTests.test("convertToHeadingObjects: linear headings", function () {
            convertToHeadingObjectsTests(createElms(linearHeadings.headingTags), linearHeadings.anchorInfo, linearHeadings.headingInfo);
        });
        tocMBTests.test("convertToHeadingObjects: skipped headings", function () {
            convertToHeadingObjectsTests(createElms(skippedHeadings.headingTags), skippedHeadings.anchorInfo, skippedHeadings.headingInfo);
        });
        
        tocMBTests.test("assembleModel: linear headings", function () {
            assembleModelTests(createElms(linearHeadings.headingTags), linearHeadings.anchorInfo, linearHeadings.model);
        });
        tocMBTests.test("assembleModel: skipped headings", function () {
            assembleModelTests(createElms(skippedHeadings.headingTags), skippedHeadings.anchorInfo, skippedHeadings.model);
        });
        
        // "fluid.tableOfContents.levels" tests
        
        tocLevelsTests.test("generateTree: singleLevelTree", function () {
            generateTreeTests(1, 1, singleLevelTree);
        });
        tocLevelsTests.test("generateTree: multiLevelTree", function () {
            generateTreeTests(1, 2, multiLevelTree);
        });
        
        tocLevelsTests.asyncTest("Render toc: linear headings", function () {renderTOCTests(linearHeadings);});
        tocLevelsTests.asyncTest("Render toc: skipped headings", function () {renderTOCTests(skippedHeadings);});

        // fluid tableOfContents" tests

        tocTests.test("insertAnchor", function () {
            var tocTestAnchorName = 'tocTestAnchor';
            var tocInsertAnchorElement = $('#tocInsertAnchor');
            fluid.tableOfContents.insertAnchor(tocTestAnchorName, tocInsertAnchorElement);
            // check if the anchor is inserted before the element, in that case, index 0 should be the anchor
            // the first-child test below assumes that there is only 2 element in the wrapper, including the inserted anchor element.
            var tocInsertAnchorWrapperFirstChild = $('#tocInsertAnchorWrapper :first-child');
            jqUnit.assertEquals("ToC insert anchor correctly: id", tocTestAnchorName, tocInsertAnchorWrapperFirstChild.prop('id')); 
            jqUnit.assertEquals("ToC insert anchor correctly: name", tocTestAnchorName, tocInsertAnchorWrapperFirstChild.attr('name'));
        });
        
        tocTests.test("generateGUID", function() {
            var GUID = fluid.tableOfContents.generateGUID('randomBaseName');
            var GUID2 = fluid.tableOfContents.generateGUID('randomBaseName');
            
            jqUnit.assertNotEquals("GUID should not be the same with the same randomBaseName", GUID, GUID2);
            jqUnit.assertNotEquals("Basename should remain in the GUID after generated", -1, GUID.indexOf('randomBaseName'));
        });
        
        tocTests.test("sanitizeID", function() {
            var tocTest = function (custom_msg, expected, input) {
                var actual = fluid.tableOfContents.sanitizeID(input);
                jqUnit.assertEquals("Test non-word string: " + custom_msg, expected, actual);
            }
            tocTest('alphabetes', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
            tocTest('numbers', '1234567890', '1234567890');
            tocTest('dashes', '-', '-');
            tocTest('underline', '_', '_');
            tocTest('symbols', '------------------------', '`~|[];"\',.=+!@#$%^&*()\\/');
            tocTest('i18n', 'I-t-rn-ti-n-liz-ti-n', 'Iñtërnâtiônàlizætiøn');
        });
        
        tocTests.test("finalInit public function: headingTextToAnchor", function () {
            // setup and init the ToC component
            var tocBody = renderTOCComponent();
            var tocBodyHeading = $('#amphibians');
            var baseName = tocBodyHeading.text();
            var anchorInfo = tocBody.headingTextToAnchor(tocBodyHeading);
            
            // test goes here
            jqUnit.assertNotEquals("Basename should be reserved in the generated anchor", -1, anchorInfo.id.indexOf(baseName));
            jqUnit.assertEquals("anchor url is the same as id except url has a '#' in front", anchorInfo.url, '#' + anchorInfo.id);
        });
    });
})(jQuery);
