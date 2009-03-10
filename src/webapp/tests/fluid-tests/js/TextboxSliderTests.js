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

        tests.test("Test Min/Max Size", function () {
    //        expect(2);
            var textboxSlider = fluid.textboxSlider(".fl-textbox-slider", {min: 5, max: 55});
            
            $(".fl-slider").slider("value", 56);
            jqUnit.assertEquals("Slider value should be the max", 55, $(".fl-slider").slider("value"));
            $(".fl-textbox").val(56);
            jqUnit.assertEquals("Textbox value should be the max", 55, $(".fl-textbox").val());            

            $(".fl-slider").slider("value", 4);
            jqUnit.assertEquals("Slider value should be the min", 5, $(".fl-slider").slider("value"));            
        });

        tests.test("Test Negative Scale", function () {
            expect(3);
            fluid.textboxSlider(".fl-textbox-slider", {min: -15, max: -5});
            
            $(".fl-slider").slider("value", 56);
            jqUnit.assertEquals("Slider value should be the max", -5, $(".fl-slider").slider("value"));

            $(".fl-slider").slider("value", -10);
            jqUnit.assertEquals("Slider value should be the value", -10, $(".fl-slider").slider("value"));

            $(".fl-slider").slider("value", -16);
            jqUnit.assertEquals("Slider value should be the min", -15, $(".fl-slider").slider("value"));
            
        });

    });
})(jQuery);
