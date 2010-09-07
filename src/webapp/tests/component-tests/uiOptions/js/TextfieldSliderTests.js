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
        var tests = new jqUnit.TestCase("TextfieldSlider Tests");
        
        tests.test("Test Init", function () {
            expect(8);
            var textfieldSlider = fluid.textfieldSlider(".fl-textfield-slider");
            jqUnit.assertEquals("Slider value is set to input value", 15, $(".flc-textfieldSlider-slider").slider("value"));
            jqUnit.assertEquals("Textfield value is set", 15, $(".flc-textfieldSlider-field").val());
            jqUnit.assertEquals("The model should be set", 15, textfieldSlider.model);
            jqUnit.assertEquals("Min should be the default", 0, textfieldSlider.min);
            jqUnit.assertEquals("Max should be the default", 100, textfieldSlider.max);
            
            // Check ARIA defaults
            var thumb = $(".ui-slider-handle");
            jqUnit.assertEquals("The ARIA value now should be 15", 15, thumb.attr("aria-valuenow"));          
            jqUnit.assertEquals("The ARIA max should be 100", 100, thumb.attr("aria-valuemax"));          
            jqUnit.assertEquals("The ARIA min should be 0", 0, thumb.attr("aria-valuemin"));          
            
        });

        var testSetting = function (valToTest, expected) {
            var slider = $(".flc-textfieldSlider-slider");
            var textfield = $(".flc-textfieldSlider-field");
            var thumb = $(".ui-slider-handle");
            
            slider.slider("value", valToTest);
            jqUnit.assertEquals("Slider value should be " + expected, expected, slider.slider("value"));
            textfield.val(valToTest);
            textfield.change();
            jqUnit.assertEquals("Textfield value should be the " + expected, expected, textfield.val());
            jqUnit.assertEquals("The ARIA value now should be " + expected, expected, thumb.attr("aria-valuenow"));          
        };
        
        tests.test("Test Min/Max Size", function () {
            expect(18);
            var textfieldSlider = fluid.textfieldSlider(".fl-textfield-slider", {min: 5, max: 55});
            
            testSetting(56, 55);
            testSetting(55, 55);
            testSetting(4, 5);
            testSetting(25, 25);
            testSetting(-5, 5);
            testSetting(5, 5);
        });

        tests.test("Test Negative Scale", function () {
            expect(15);
            fluid.textfieldSlider(".fl-textfield-slider", {min: -15, max: -5});
            
            testSetting(56, -5);
            testSetting(-10, -10);
            testSetting(-16, -15);
            testSetting(-15, -15);
            testSetting(-5, -5);
            
        });

    });
})(jQuery);
