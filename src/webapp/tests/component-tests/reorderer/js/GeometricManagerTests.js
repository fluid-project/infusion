/*
Copyright 2008-2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/


(function ($) {
    $(document).ready(function () {
    	     
        var GeometricManagerTests = new jqUnit.TestCase("GeometricManagerTests");
    	
        function assertOrder(message, parentId, required) {
            var all = $("#" + parentId + " div");
            var str = "";
            for (var i = 0; i < all.length; ++ i) {
                var id = all[i].getAttribute("id");
                var c = id.charAt(id.length - 1);
                str += c;
            }
            jqUnit.assertEquals(message, required, str);
        }

        GeometricManagerTests.test("Original order", function() {
            var orders = $("#permuteTest .orderable");
          
            expect(2);
            assertOrder("Original order", "permuteTest",  "0123A4567B8");
            assertOrder("Original order", "permuteTest2", "abCc");
        });

        function selfPermuteTest(name, source, target, position, expected) {
            GeometricManagerTests.test(name, function () {
                var orders = $("#permuteTest .orderable");
          
                fluid.permuteDom(orders[source], orders[target], position, orders, orders);
                expect(1);
                assertOrder(name, "permuteTest", expected);
            });            
        }
        
        function crossPermuteTest(name, source, target, position, expected1, expected2) {
            GeometricManagerTests.test(name, function () {
                var sourceElements = $("#permuteTest .orderable");
                var targetElements = $("#permuteTest2 .orderable");
          
                fluid.permuteDom(sourceElements[source], targetElements[target], 
                       position, sourceElements, targetElements);
                expect(2);
                assertOrder(name, "permuteTest", expected1);
                assertOrder(name, "permuteTest2", expected2);
            });            
        }
        

        // Original order:                                                   "0123A4567B8"
        selfPermuteTest("REPLACE right rend",  2, 8, fluid.position.REPLACE, "0134A5678B2");
        selfPermuteTest("REPLACE right",       2, 6, fluid.position.REPLACE, "0134A5627B8");
        selfPermuteTest("AFTER right",         2, 6, fluid.position.AFTER,   "0134A5627B8");
        selfPermuteTest("REPLACE left",        7, 2, fluid.position.REPLACE, "0172A3456B8");
        selfPermuteTest("BEFORE left",         7, 2, fluid.position.BEFORE,  "0172A3456B8");
        selfPermuteTest("REPLACE right rend",  2, 8, fluid.position.REPLACE, "0134A5678B2");
        selfPermuteTest("AFTER right rend",    2, 8, fluid.position.AFTER,   "0134A5678B2");
        selfPermuteTest("BEFORE right",        2, 6, fluid.position.BEFORE,  "0134A5267B8");
        selfPermuteTest("AFTER left",          7, 2, fluid.position.AFTER,   "0127A3456B8");
        selfPermuteTest("AFTER left shift",    7, 3, fluid.position.AFTER,   "01237A456B8"); // skip failure
        selfPermuteTest("BEFORE right shift",  2, 8, fluid.position.BEFORE,  "0134A567B28"); // skip failure
        selfPermuteTest("REPLACE right lend",  0, 6, fluid.position.REPLACE, "1234A5607B8");
        selfPermuteTest("REPLACE left lend",   6, 0, fluid.position.REPLACE, "6012A3457B8");
        selfPermuteTest("REPLACE right hop",   8, 7, fluid.position.REPLACE, "0123A4568B7");
        selfPermuteTest("REPLACE left hop",    7, 8, fluid.position.REPLACE, "0123A4568B7");
        selfPermuteTest("REPLACE left two",    0, 1, fluid.position.REPLACE, "1023A4567B8");
        selfPermuteTest("REPLACE right two",   1, 0, fluid.position.REPLACE, "1023A4567B8");
        selfPermuteTest("REPLACE left four",   4, 5, fluid.position.REPLACE, "0123A5467B8");

        // Original order:                                            "0123A4567B8", "abCc"
        crossPermuteTest("1->2 BEFORE", 1, 2, fluid.position.BEFORE,  "0234A5678B",  "abC1c");
        crossPermuteTest("1->1 BEFORE", 1, 1, fluid.position.BEFORE,  "0234A5678B",  "a1Cbc");
        crossPermuteTest("1->1 AFTER",  1, 1, fluid.position.AFTER,   "0234A5678B",  "ab1Cc");
        crossPermuteTest("0->0 BEFORE", 0, 0, fluid.position.BEFORE,  "1234A5678B",  "0aCbc");
        crossPermuteTest("0->2 AFTER",  0, 2, fluid.position.AFTER,   "1234A5678B",  "abCc0");             
        
 
        GeometricManagerTests.test("minPointRectangle", function() {
          
          expect(6);
          
          var rect = {left: -1, right: 5, top: -1, bottom : 1};
          
          jqUnit.assertEquals("Inside", 0, 
             fluid.geom.minPointRectangle(0, 0, rect));
             
          jqUnit.assertEquals("Inside", 0, 
             fluid.geom.minPointRectangle(0.5, 0.5, rect));
             
          jqUnit.assertEquals("InsideEdge", 0, 
             fluid.geom.minPointRectangle(0, -1, rect));
             
          jqUnit.assertEquals("LTDist", 2, 
             fluid.geom.minPointRectangle(-2, -2, rect));
             
          jqUnit.assertEquals("TDist", 4, 
             fluid.geom.minPointRectangle(0, -3, rect));
             
          jqUnit.assertEquals("RDist", 25, 
             fluid.geom.minPointRectangle(10, 0, rect));
          
        });
        
      GeometricManagerTests.test("minRectRect", function() {
          
          expect(6);
          
          var rect1 = {left: -1, top: -1, right: 5, bottom: 1};
          var rect2 = {left: 3, top: 2, right: 10, bottom: 3};
          var rect3 = {left: 7, top: 2, right: 10, bottom: 5};
          
          jqUnit.assertEquals("Dist12", 1, fluid.geom.minRectRect(rect1, rect2));
          jqUnit.assertEquals("Dist12R", 1, fluid.geom.minRectRect(rect2, rect1));
          
          jqUnit.assertEquals("Dist13", 5, fluid.geom.minRectRect(rect1, rect3));
          jqUnit.assertEquals("Dist13R", 5, fluid.geom.minRectRect(rect3, rect1));
          
          jqUnit.assertEquals("Dist23", 0, fluid.geom.minRectRect(rect2, rect3));
          jqUnit.assertEquals("Dist23R", 0, fluid.geom.minRectRect(rect3, rect2));
          
        });
        
      GeometricManagerTests.test("projectFrom", function() {
          // column 1, 3x3 squares spaced by 1, middle skew 1 to the right
          var rects = [
              {left: 1, top: 1, right: 4, bottom: 4},
              {left: 2, top: 5, right: 5, bottom: 8},
              {left: 1, top: 9, right: 4, bottom: 12},
          // column 2, same dimensions but offset down by 1
              {left: 6, top: 2, right: 9, bottom: 5},
              {left: 6, top: 6, right: 9, bottom: 9}];
          
          var elems = fluid.transform(rects, function(rect, i) {
             return {rect: rect, index: i}
          });
          
          function assertProject(name, fromIndex, direction, toIndex, wrapped) {
              var proj = fluid.geom.projectFrom(rects[fromIndex], fluid.direction[direction], elems);
              jqUnit.assertEquals(name + " index", toIndex, proj.cacheelem.index);
              jqUnit.assertEquals(name + " wrapped", wrapped, proj.wrapped);
          }
          expect(24);  
          assertProject("Right0", 0, "RIGHT", 3, false);
          assertProject("Left3",  3, "LEFT",  0, false);
          assertProject("Right3", 3, "RIGHT", 0, true);
          assertProject("Left0",  0, "LEFT",  3, true);
          assertProject("Down0",  0, "DOWN",  1, false);
          assertProject("Up1",    1, "UP",    0, false);
          
          assertProject("Up0",    0, "UP",    2, true);
          assertProject("Down2",  2, "DOWN",  0, true);
          assertProject("Right2", 2, "RIGHT", 4, false);
          assertProject("Left4",  4, "LEFT",  1, false);
          assertProject("Left1",  1, "LEFT",  4, true);
          assertProject("Right4", 4, "RIGHT", 1, true);
          
      });
    });
})(jQuery);
