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
            expect(2);
            fluid.textboxSlider(".fl-textbox-slider");
            jqUnit.assertEquals("Slider value is set to input value", 15, $(".fl-slider").slider("value"));
            jqUnit.assertEquals("Textbox value is set", 15, $(".fl-textbox").val());
            
        });

        var testSetting = function (valToTest, expected) {
            var slider = $(".fl-slider");
            var textbox = $(".fl-textbox");
            
            slider.slider("value", valToTest);
            jqUnit.assertEquals("Slider value should be " + expected, expected, slider.slider("value"));
            textbox.val(valToTest);
            textbox.change();
            jqUnit.assertEquals("Textbox value should be the " +expected, expected, textbox.val());            
        };
        
        tests.test("Test Min/Max Size", function () {
            expect(12);
            var textboxSlider = fluid.textboxSlider(".fl-textbox-slider", {min: 5, max: 55});
            
            testSetting(56, 55);
            testSetting(55, 55);
            testSetting(4, 5);
            testSetting(25, 25);
            testSetting(-5, 5);
            testSetting(5, 5);
        });

        tests.test("Test Negative Scale", function () {
            expect(10);
            fluid.textboxSlider(".fl-textbox-slider", {min: -15, max: -5});
            
            testSetting(56, -5);
            testSetting(-10, -10);
            testSetting(-16, -15);
            testSetting(-15, -15);
            testSetting(-5, -5);
            
        });

    });
})(jQuery);
