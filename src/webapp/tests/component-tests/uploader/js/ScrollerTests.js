/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

(function ($) {
    $(document).ready (function () {
        var container = function () {
            return $("#scrollableWithWrapper");    
        };
        
        var outerWrapper = function () {
            return $("#outer");
        };
        
        var scrollerTests = new jqUnit.TestCase("Vertical Scroller Tests");
        
        scrollerTests.test("Setup", function () {
            var scroller = fluid.scroller("#scrollableWithWrapper");
            jqUnit.assertNotUndefined("A scroller instance should have been returned.", scroller);
            jqUnit.assertEquals("The scroller should have the correct container.", 
                                container()[0], scroller.container[0]);
            jqUnit.assertEquals("The scroller should have the correct outer wrapper.",
                                outerWrapper()[0], scroller.scrollingElm[0]);
            
        });
        
        scrollerTests.test("Error when necessary DOM structure is not found.", function () {
           // At the moment, Scroller expects there to be two wrapping elements around the scrollable container.
           // If these aren't specified we should get an error.
           try {
              var scroller = fluid.scroller("#scrollableNoWrapper");
              jqUnit.fail("An exception should be thrown when no scroller wrapper is present.");
           } catch (e) {
               jqUnit.assertNotUndefined("An exception should be thrown when no scroller wrapper is present.", e);
           }

           jqUnit.assertUndefined("If the container isn't wrapped in a scroller element, scroller creation should fail.",
                                  scroller);            
        });
    });
})(jQuery);
