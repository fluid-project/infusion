/* 
Copyright 2008 University of California, Berkeley
Copyright 2008 University of Toronto

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
        var DropManagerTests = new jqUnit.TestCase("DropManagerTests");

        DropManagerTests.test("geometry", function() {
          
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

    });
})(jQuery);
