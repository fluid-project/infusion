/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        jqUnit.module("Geometric Manager Tests");

        function assertOrder(message, parentId, required) {
            var all = $("#" + parentId + " div");
            var str = "";
            for (var i = 0; i < all.length; ++i) {
                var id = all[i].id;
                var c = id.charAt(id.length - 1);
                str += c;
            }
            jqUnit.assertEquals(message, required, str);
        }

        jqUnit.test("Original order", function () {
            jqUnit.expect(2);
            assertOrder("Original order", "permuteTest",  "0123A4567B8");
            assertOrder("Original order", "permuteTest2", "abCc");
        });

        function selfPermuteTest(name, source, target, position, expected) {
            jqUnit.test(name, function () {
                var orders = $("#permuteTest .orderable");

                fluid.dom.permuteDom(orders[source], orders[target], position, orders, orders);
                jqUnit.expect(1);
                assertOrder(name, "permuteTest", expected);
            });
        }

        function crossPermuteTest(name, source, target, position, expected1, expected2) {
            jqUnit.test(name, function () {
                var sourceElements = $("#permuteTest .orderable");
                var targetElements = $("#permuteTest2 .orderable");

                fluid.dom.permuteDom(sourceElements[source], targetElements[target],
                    position, sourceElements, targetElements);
                jqUnit.expect(2);
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


        jqUnit.test("minPointRectangle", function () {

            jqUnit.expect(6);

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

        jqUnit.test("minRectRect", function () {

            jqUnit.expect(6);

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

        fluid.registerNamespace("fluid.testUtils.reorderer");

        fluid.testUtils.reorderer.offsetGridTestRects = [
            // column 1, 3x3 squares spaced by 1, middle skew 1 to the right
            {left: 1, top: 1, right: 4, bottom: 4},
            {left: 2, top: 5, right: 5, bottom: 8},
            {left: 1, top: 9, right: 4, bottom: 12},
            // column 2, same dimensions but offset down by 1
            {left: 6, top: 2, right: 9, bottom: 5},
            {left: 6, top: 6, right: 9, bottom: 9}
        ];

        fluid.testUtils.reorderer.offsetGridTestAssertions = [
            ["Right0", 0, "RIGHT", 3, false],
            ["Left3",  3, "LEFT",  0, false],
            ["Right3", 3, "RIGHT", 0, true],
            ["Left0",  0, "LEFT",  3, true],
            ["Down0",  0, "DOWN",  1, false],
            ["Up1",    1, "UP",    0, false],

            ["Up0",    0, "UP",    2, true],
            ["Down2",  2, "DOWN",  0, true],
            ["Right2", 2, "RIGHT", 4, false],
            ["Left4",  4, "LEFT",  1, false],
            ["Left1",  1, "LEFT",  4, true],
            ["Right4", 4, "RIGHT", 1, true]
        ];

        // GeometricManagerTest
        fluid.testUtils.reorderer.stepProjectFrom = function (rects, disabledWrap, assertions) {

            var elems = fluid.transform(rects, function (rect, i) {
                return {rect: rect, index: i};
            });

            function assertProject(name, fromIndex, direction, toIndex, couldWrap) {
                var proj = fluid.geom.projectFrom(rects[fromIndex], fluid.direction[direction], elems, false, disabledWrap);
                if (couldWrap && disabledWrap) {
                    jqUnit.assertUndefined(name + " index " + toIndex, proj.cacheelem);
                    jqUnit.assertFalse("no wrapping from index:" + fromIndex + " to index:" + toIndex + " wrapped set to " + couldWrap, proj.wrapped);
                } else {
                    jqUnit.assertEquals(name + " index", toIndex, proj.cacheelem.index);
                    jqUnit.assertEquals(name + " wrapped", couldWrap, proj.wrapped);
                }
            }

            for (var i = 0; i < assertions.length; ++i) {
                assertProject.apply(null, assertions[i]);
            }

        };

        jqUnit.test("projectFrom", function () {
            var r = fluid.testUtils.reorderer;
            jqUnit.expect(r.offsetGridTestAssertions.length * 2);
            fluid.testUtils.reorderer.stepProjectFrom(r.offsetGridTestRects, false, r.offsetGridTestAssertions);
        });

        jqUnit.test("projectFrom with disabled wrap", function () {
            var r = fluid.testUtils.reorderer;
            jqUnit.expect(r.offsetGridTestAssertions.length * 2);
            fluid.testUtils.reorderer.stepProjectFrom(r.offsetGridTestRects, true, r.offsetGridTestAssertions);
        });


        // To test FLUID-4692
        fluid.testUtils.reorderer.NickMayneTestRects = [
        // Two full rows, a row of three squares, and then another full row
            {left: 0, top: 0, right: 5, bottom: 1},
            {left: 0, top: 2, right: 5, bottom: 3},
            {left: 0, top: 4, right: 1, bottom: 5},
            {left: 2, top: 4, right: 3, bottom: 5},
            {left: 4, top: 4, right: 5, bottom: 5},
            {left: 0, top: 6, right: 5, bottom: 7}
        ];

        fluid.testUtils.reorderer.NickMayneKeyTestAssertions = [
            ["Down0", 0, "DOWN", 1, false],
            ["Up1",   1, "UP",   0, false],
            ["Down1", 1, "DOWN", 2, false],
            ["Up2",   2, "UP",   1, false],
            ["Up3",   3, "UP",   1, false],
            ["Up4",   4, "UP",   1, false],
            ["Down2", 2, "DOWN", 5, false],
            ["Down3", 3, "DOWN", 5, false],
            ["Down4", 4, "DOWN", 5, false],
            ["Up5",   5, "UP",   2, false]
        ];

        fluid.testUtils.reorderer.NickMayneMouseTestAssertions = [
            [0.5, 0.5, 0],
            [0.5, 2.5, 1],
            [0.5, 4.5, 2],
            [2.5, 4.5, 3],
            [4.5, 4.5, 4],
            [0.5, 6.5, 5],
            [0.5, -10, 0],
            [0.5, 10, 5]
        ];

        var elementToIndex = function (element) {
            return +element.id.substring(3); // remove "el-" prefix
        };

        var testGeometryComputor = function (rects) {
            return function (element, orientation, disposition) {
                var elem = {};
                elem.element = element;
                elem.orientation = orientation;
                if (disposition === fluid.position.INSIDE) {
                    elem.position = disposition;
                }
                var ind = elementToIndex(element);
                elem.rect = rects[ind];
                return elem;
            };
        };

        jqUnit.test("sentinelization test FLUID-4692", function () {
            var dropManager = fluid.dropManager();

            var zones = $(".zone", "#FLUID-4692-test");
            var extents = fluid.transform(zones, function (zone) {
                return {
                    orientation: fluid.orientation.VERTICAL,
                    elements: [],
                    parentElement: zone
                };
            });
            var geometricInfo = {
                extents: extents,
                geometryComputor: testGeometryComputor(fluid.testUtils.reorderer.NickMayneTestRects),
                sentinelize: true,
                elementMapper: null
            };
            dropManager.updateGeometry(geometricInfo);

            var as = fluid.testUtils.reorderer.NickMayneKeyTestAssertions;
            jqUnit.expect(as.length);

            var i;
            for (i = 0; i < as.length; ++i) {
                var a = as[i];
                var res = dropManager.projectFrom(zones[a[1]], fluid.direction[a[2]], false, a[4]);
                jqUnit.assertEquals(a[0], a[3], elementToIndex(res.element));
            }

            var ms = fluid.testUtils.reorderer.NickMayneMouseTestAssertions;
            jqUnit.expect(ms.length);

            for (i = 0; i < ms.length; ++i) {
                var m = ms[i];
                var closest = dropManager.closestTarget(m[0], m[1]);
                jqUnit.assertEquals("Mouse test " + i, m[2], elementToIndex(closest.element));
            }
        });
    });
})(jQuery);
