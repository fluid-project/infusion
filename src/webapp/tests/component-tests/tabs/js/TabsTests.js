/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        
        var tests = new jqUnit.TestCase("Tabs Tests");
    
        tests.test("Initialisation", function () {
            expect(2);        
            var myTabs = fluid.tabs("#main");
            jqUnit.assertTrue("The tabs are initialised", myTabs); 
            jqUnit.assertTrue("jQuery applied to tabs", myTabs.locate("tabList").hasClass("ui-tabs"));            
        });
        
        tests.test("Aria added", function () {
            expect(1);        
            var myTabs = fluid.tabs("#main");            
            jqUnit.assertEquals("Aria styles applied to list items", "presentation", $("li").attr("role"));                                                       

        });
       
    });
})(jQuery);
