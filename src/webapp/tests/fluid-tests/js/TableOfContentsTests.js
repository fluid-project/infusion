/* 
Copyright 2009 University of Toronto
Copyright 2009 University of Cambridge

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
        var tests = new jqUnit.TestCase("Table of Contents Tests");
        
        var testTocItem = function (item, name) {
            var a = $("a", item);
            jqUnit.assertEquals(name + " has text", name, a.text());
            jqUnit.assertEquals(name + " has href", "#" + name, a.attr("href"));            
        };
        
        tests.test("TOC Creation", function () {
            jqUnit.expect(5);
            fluid.tableOfContents("#main");
            
            var toc = $("#toc");
            var items = $("li", toc);
            jqUnit.assertEquals("10 headings", 10, items.length);
            
            testTocItem(items[0], "Amphibians");
            
            testTocItem(items[9], "Grouse");
        });
        
//        tests.test("Anchor insertion", function () {      
    });
})(jQuery);
