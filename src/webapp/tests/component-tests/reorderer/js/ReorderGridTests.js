/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, lightboxRootId, orderableIds, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        var tests = new jqUnit.TestCase("Reorder Grid Tests");
        
        var k = fluid.testUtils.reorderer.bindReorderer(orderableIds);
        
        var assembleOptions = function (isDisableWrap) {
            var obj = {
                selectors: {
                    movables: ".float"
                },
                disableWrap: isDisableWrap,
                reordererFn: "fluid.reorderGrid",
                expectOrderFn: fluid.testUtils.reorderer.assertItemsInOrder,
                key: fluid.testUtils.reorderer.bindReorderer(orderableIds).compositeKey,
                thumbArray: "img",
                prefix: "fluid.img."
            };            
            return obj;
        };    
        
        tests.test("reorderGrid API", function () {            
            var options = assembleOptions(false);
            var containerSelector = "[id='" + lightboxRootId + "']";
            var gridReorderer = fluid.reorderGrid(containerSelector, options);
            var item2 = fluid.jById(orderableIds[1]).focus();
            var item3 = fluid.jById(orderableIds[2]);
            var item5 = fluid.jById(orderableIds[4]);
            
            // Sniff test the reorderer that was created - keyboard selection and movement
    
            jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("focus on item2 - item5 should be default", item5.hasClass("fl-reorderer-movable-default"));
    
            k.keyDown(gridReorderer, fluid.testUtils.keyEvent("DOWN"), 1);
            jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - grid is 3 wide - item5 should be selected", item5.hasClass("fl-reorderer-movable-selected"));
    
            k.compositeKey(gridReorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), 4);
            
            fluid.testUtils.reorderer.assertItemsInOrder("after ctrl-down", [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11, 12, 13], $("img", $(containerSelector)), "fluid.img.");
        });    
        
        tests.test("reorderGrid with optional styles", function () {
            var options = {
                selectors: {
                    movables: ".float"
                },
                styles: {
                    defaultStyle: "myDefault",
                    selected: "mySelected"
                }
            };
            
            var containerSelector = "[id='" + lightboxRootId + "']";
            var gridReorderer = fluid.reorderGrid(containerSelector, options);
            
            jqUnit.assertEquals("default class is myDefault", "myDefault", gridReorderer.options.styles.defaultStyle);
            jqUnit.assertEquals("selected class is mySelected", "mySelected", gridReorderer.options.styles.selected);
            jqUnit.assertEquals("dragging class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", gridReorderer.options.styles.dragging);
            jqUnit.assertEquals("mouseDrag class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", gridReorderer.options.styles.mouseDrag);
            
        });  
        
        tests.test("reorderGrid, option set disabled wrap, user action ctrl+down", function () {        
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "DOWN",
                expectedOrderArrays: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 9, 13], 
                                      [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 9, 13]], 
                itemSelector: fluid.jById(orderableIds[9]),      
                itemIndex: 9
            };
          
            fluid.testUtils.reorderer.stepReorderer("[id='" + lightboxRootId + "']", options);
        });
        
        tests.test("reorderGrid, option set enabled wrap, user action ctrl+down", function () {   
            var options = {
                reordererOptions: assembleOptions(false),
                direction: "DOWN",
                expectedOrderArrays: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 9, 13],
                                      [9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13]], 
                itemSelector: fluid.jById(orderableIds[9]),
                itemIndex: 9
            };
             
            fluid.testUtils.reorderer.stepReorderer("[id='" + lightboxRootId + "']", options);
        });
      
        tests.test("reorderGrid, option set disabled wrap, user action ctrl+up", function () {   
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "UP",
                expectedOrderArrays: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]], 
                itemSelector: fluid.jById(orderableIds[1]),
                itemIndex: 1
            };
            
            fluid.testUtils.reorderer.stepReorderer("[id='" + lightboxRootId + "']", options);
        });
        
        tests.test("reorderGrid, option set enabled wrap, user action ctrl+up", function () {   
            var options = {
                reordererOptions: assembleOptions(false),
                direction: "UP",
                expectedOrderArrays: [[0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1],
                                      [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 11, 12, 13],
                                      [0, 2, 3, 4, 5, 6, 7, 1, 8, 9, 10, 11, 12, 13]], 
                itemSelector: fluid.jById(orderableIds[1]),
                itemIndex: 1
            };
             
            fluid.testUtils.reorderer.stepReorderer("[id='" + lightboxRootId + "']", options);
        });
           
        tests.test("reorderGrid, option set disabled wrap, user action ctrl+right", function () {    
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "RIGHT",
                expectedOrderArrays: [[0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]], 
                itemSelector: fluid.jById(orderableIds[1]),
                itemIndex: 1
            };
            
            fluid.testUtils.reorderer.stepReorderer("[id='" + lightboxRootId + "']", options);
        });
        
        tests.test("reorderGrid, option set enabled wrap, user action ctrl+right", function () { 
            var options = {
                reordererOptions: assembleOptions(false),
                direction: "RIGHT",
                expectedOrderArrays: [[0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [0, 2, 3, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]], 
                itemSelector: fluid.jById(orderableIds[1]),
                itemIndex: 1
            };
         
            fluid.testUtils.reorderer.stepReorderer("[id='" + lightboxRootId + "']", options);
        });        
        
        tests.test("reorderGrid, option set disabled wrap, user action ctrl+left", function () { 
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "LEFT",
                expectedOrderArrays: [[1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]], 
                itemSelector: fluid.jById(orderableIds[1]),
                itemIndex: 1       
            };
           
            fluid.testUtils.reorderer.stepReorderer("[id='" + lightboxRootId + "']", options);
        });        
      
        tests.test("reorderGrid, option set enabled wrap, user action ctrl+left", function () {
            var options = {
                reordererOptions: assembleOptions(false),
                direction: "LEFT",
                expectedOrderArrays: [[1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1]], 
                itemSelector: fluid.jById(orderableIds[1]),
                itemIndex: 1
            };
             
            fluid.testUtils.reorderer.stepReorderer("[id='" + lightboxRootId + "']", options);
        });
        
    });
})(jQuery);
