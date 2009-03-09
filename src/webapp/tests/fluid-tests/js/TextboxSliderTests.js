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
        var tests = new jqUnit.TestCase("TextboxSlider Tests");
        
        tests.test("Test Init", function () {
            expect(1);
            fluid.textboxSlider(".fl-textbox-slider");
            jqUnit.assertEquals("Slider value is set to input value", 15, $(".fl-slider").slider("value"));
            
        });

    });
})(jQuery);
