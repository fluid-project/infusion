/*
Copyright 2009 University of Toronto

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
        var toc;
        var options = {
                listeners: {afterRender: function () {
                    start();
                }},
                templateUrl: "../../../../components/tableOfContents/html/TableOfContents.html"
            };
        
        var mySetup = function () {
            stop();
            toc = fluid.tableOfContents("#main", options);    
        };
        
        var tests = jqUnit.testCase("Table of Contents Tests", mySetup);
         
        var testTocItem = function (item, name) {
            var a = $("a", item);
            jqUnit.assertEquals(name + " has text", name, a.text());
            jqUnit.assertTrue(name + " has href", a.attr("href").indexOf("#" + name) > -1);            
        };
                    
        tests.test("TOC Creation", function () {
            expect(22);

            var tocEl = $("#main").children().eq(0);
            jqUnit.isVisible("Table of contents should be visible", tocEl);
            
            var items = $("li", tocEl);
            jqUnit.assertEquals("10 headings", 10, items.length);
            
            testTocItem(items[0], "Amphibians");
            testTocItem(items[1], "Toads");
            testTocItem(items[2], "Natterjack Toads");
            testTocItem(items[3], "Salamander");
            testTocItem(items[4], "Newt");
            testTocItem(items[5], "Birds");
            testTocItem(items[6], "Anseriformes");
            testTocItem(items[7], "Ducks");
            testTocItem(items[8], "Mammals");
            testTocItem(items[9], "CATT");
        });
               
        tests.test("Anchor insertion", function () {
            expect(5);

            var anchors = $("a", "#amphibians-div");
            jqUnit.assertEquals("5 headings in the amphibians section", 5, anchors.length);
            
            var anchor = anchors.eq(0);
            jqUnit.assertEquals("Name is Amphibians", "Amphibians", anchor.attr("name"));         
            jqUnit.assertEquals("No text", "", anchor.text());
            jqUnit.assertFalse("No href", !!anchor.attr("href"));
            jqUnit.assertEquals("The next element in the DOM is the heading", "amphibians", anchor.next().attr("id"));
        });
    });
})(jQuery);
