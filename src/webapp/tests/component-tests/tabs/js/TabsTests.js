/*
Copyright 2011 OCAD University

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
    $(document).ready(function () {
        
        var tests = new jqUnit.TestCase("Tabs Tests");
    
        tests.test("Initialisation", function () {
            expect(2);        
            var myTabs = fluid.tabs(".flc-tabs");
            jqUnit.assertTrue("The tabs are initialised", myTabs); 
            jqUnit.assertTrue("jQuery applied to tabs", myTabs.container.hasClass("ui-tabs"));            
        });
        
        tests.test("Aria added", function () {
            expect(3);        
            fluid.tabs(".flc-tabs");            
            jqUnit.assertEquals("Aria applied to list items", "presentation", $("ul li").attr("role"));                                                       
            jqUnit.assertEquals("Aria applied to tab links", "tab", $("li a").attr("role"));                                                           
            jqUnit.assertEquals("Aria applied to tab panels", "tabpanel", $("#one").attr("role"));                                                           

        });
       
    });
})(jQuery);
