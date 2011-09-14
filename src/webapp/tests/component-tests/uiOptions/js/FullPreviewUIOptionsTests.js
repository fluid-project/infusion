/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, start, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.setLogging(true);
        
        var tests = jqUnit.testCase("FullPreviewUIOptions Tests");
        
        /**************************************************
         * fluid.fullPreviewUIOptions Integration Tests *
         **************************************************/        
        fluid.tests.uiOptions.integrationTest(tests, "fluid.uiOptions.fullPreview", false);
        fluid.tests.uiOptions.mungingIntegrationTest(tests, "fluid.uiOptions.fullPreview", "#myUIOptions");    
    });

})(jQuery);        