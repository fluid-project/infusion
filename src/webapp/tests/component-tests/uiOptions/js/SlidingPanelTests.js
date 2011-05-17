/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        var tests = new jqUnit.TestCase("SlidingPanel Tests");
        
        tests.test("Test Init", function () {
            expect(1);
            var slidingPanel = fluid.SlidingPanel(".flc-slidingPanel", {selectors: {panel: "myPanel"}});                    
            jqUnit.assertEquals("The area to hide/show is", "myPanel", fluid.options.selectors.panel);                      
        });
    });
})(jQuery);


