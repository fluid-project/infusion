/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/

(function ($) {
    $(document).ready(function () {
        var container = function () {
            return $("#scrollableWithWrapper");    
        };
        
        var outerWrapper = function () {
            return $("#outer");
        };

        /**
         * Check if the page scroll to the desire item.  In our test setup, the scroller
         * shows only "Item Zero" to "Item Seven".
         *
         * @param   Object  scroller object
         * @param   int     The index of the <li> element within the <ul>.  Starts from 0.
         */
        var scrollCheck = function (scroller, elementNumber) {
            var scrollableList = $("#scrollable");
            var elementTarget = scrollableList.find("li").eq(elementNumber);
            var containerHeight = scroller.scrollingElm.height();
            var elePosTop = elementTarget[0].offsetTop;
            var elePosBottom = elePosTop - containerHeight;

            scroller.scrollTo(elementTarget);
            jqUnit.assertTrue("The item #" + elementNumber + " offset " + scroller.scrollingElm[0].scrollTop + " should be less than or equal to the top boundary of the outer wrapper " + elePosTop,
                                scroller.scrollingElm[0].scrollTop <= elePosTop);
            jqUnit.assertTrue("The item #" + elementNumber + " offset " + scroller.scrollingElm[0].scrollTop + " should be greater than the bottom boundary of the outer wrapper  " + elePosBottom,
                                scroller.scrollingElm[0].scrollTop > elePosBottom);
        };

        /**
         * Check if the scroll is triggered.
         *
         * @param   Object  scroller object
         * @param   int     The index of the <li> element within the <ul>.  Starts from 0.
         */
        var noScrollCheck = function (scroller, elementNumber) {
            var scrollableList = $("#scrollable");
            var elementTarget = scrollableList.find("li").eq(elementNumber); 
            var beforeScroll = scroller.scrollingElm[0].scrollTop;
            scroller.scrollTo(elementTarget);
            jqUnit.assertTrue("The item #" + elementNumber + " is already shown in the outer wrapper and should not be scrolled.",
                                scroller.scrollingElm[0].scrollTop === beforeScroll);
        };

        var scroller = fluid.scroller("#scrollable", {
            selectors: {
                wrapper: ".flc-scroller-outer"
            }
        });
        var numberOfItemsInScrollable = $("li", "ul#scrollable").length;

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
            var scroller;
            try {
                scroller = fluid.scroller("#scrollableNoWrapper");
                jqUnit.fail("An exception should be thrown when no scroller wrapper is present.");
            } catch (e) {
                jqUnit.assertNotUndefined("An exception should be thrown when no scroller wrapper is present.", e);
            }

            jqUnit.assertUndefined("If the container isn't wrapped in a scroller element, scroller creation should fail.",
                                  scroller);
        });

        scrollerTests.test("Scroll down the list one item at a time.", function () {
            //the first 7 is already on the list, shouldn't require scrolling
            for (var i = 0; i < 7; i++) {
                noScrollCheck(scroller, i);
            }
            //the rest of the items are off the list, each item need to be scrolled up
            for (i = 8; i < numberOfItemsInScrollable; i++) {
                scrollCheck(scroller, i);
            }
        });

        scrollerTests.test("Test scrollBottom() from each item.", function () {
            //test scrollBottom() from each element in the list.
            for (var i = 0; i < numberOfItemsInScrollable; i++) {
                scroller.scrollBottom();
                //if this is one of the last 7 items, no scrolling is required 
                //since they are all showing with the last item in the outer wrapper.
                if (i > (numberOfItemsInScrollable - 8) && i < numberOfItemsInScrollable) {
                    noScrollCheck(scroller, i);
                } else {
                    scrollCheck(scroller, i);
                }
            }
        });

        scrollerTests.test("Test scroll up for each element starting from the bottom of the page.", function () {
            scroller.scrollBottom();
            for (var i = (numberOfItemsInScrollable - 1); i >= 0; i--) {
                //if this is one of the last 7 items, no scrolling is required 
                //since they are all showing with the last item in the outer wrapper.
                if (i > (numberOfItemsInScrollable - 8) && i < numberOfItemsInScrollable) {
                    noScrollCheck(scroller, i);
                } else {
                    scrollCheck(scroller, i);
                }
            }
        });

        scrollerTests.test("Scroll the page randomly and check if item shows in the wrapper.", function () {
            for (var i = 0; i < 20; i++) {
                scrollCheck(scroller, Math.floor(Math.random() * 31));
            }
        });

        scrollerTests.test("Mimic the behavior of manual test by scrolling up and down with scrollTo() ", function () {
            scrollCheck(scroller, 1);
            scrollCheck(scroller, 12);
            scrollCheck(scroller, 13);
            scrollCheck(scroller, 25);
            scrollCheck(scroller, 30);
            scrollCheck(scroller, 1);
            noScrollCheck(scroller, 5);
            noScrollCheck(scroller, 6);
            scrollCheck(scroller, 15);
            noScrollCheck(scroller, 13);
            noScrollCheck(scroller, 14);
            scrollCheck(scroller, 16);
            scrollCheck(scroller, 17);
            scrollCheck(scroller, 18);
            noScrollCheck(scroller, 13);
            scrollCheck(scroller, 30);
        });
    });
})(jQuery);
