/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
 */

 $(document).ready (function () {
    
    var tests = new jqUnit.TestCase ("Pager Tests");

    tests.test("All pages showing", function () {
        var pager = new fluid.Pager("gradebook", 10);

        var container = jQuery("#gradebook");
        var pagerTop = jQuery("#pager-top", container);
        var topLis = jQuery("li", pagerTop);        

        jqUnit.assertEquals("10 pages + next + previous", 12, topLis.length);        
        jqUnit.assertEquals("Both top and bottom pagers are on the page", 2, jQuery("ul", container).length);
    });
    
});
