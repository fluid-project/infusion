/* 
Copyright 2008 University of California, Berkeley
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

(function ($) {
    $(document).ready (function () {
        var progressTests = new jqUnit.TestCase ("Progress Tests");

        progressTests.test ("Update", function () {      
            var progressSelector = ".fluid-progress";          
            var progressBar = new fluid.Progress(progressSelector);
	        var indicator = $('.progress-indicator');
            
            var label = "test label";
            var text = "test text";
            jqUnit.notVisible("Before update, ensure progress bar is not visible", progressSelector);
            jqUnit.notExists("Before update, ensure label doesn't exist", ":contains(" + label+")");
            jqUnit.notExists("Before update, ensure update text doesn't exist", ":contains(" + text+")");

            var updateValue = 0;
            progressBar.update('.total-progress', updateValue, label, text);
            jqUnit.isVisible("After update, make sure the progress bar is visible", progressSelector);
            jqUnit.exists("After update, look for the label", ":contains(" + label+")");
            jqUnit.exists("After update, look for the update text", ":contains(" + text+")");
            jqUnit.assertEquals("After update to "+updateValue+", lastPercent should be " + updateValue, updateValue, progressBar.lastPercent);
            jqUnit.assertEquals("After update to "+updateValue+", indicator width should be 1", 1, indicator.width());

            updateValue = 20;
            var styleString = "width: "+updateValue+"%;";
            progressBar.update('.total-progress', updateValue, label, text);
            jqUnit.assertEquals("After update to "+updateValue+", lastPercent should be " + updateValue, updateValue, progressBar.lastPercent);

            updateValue = 10;
            styleString = "width: "+updateValue+"%;";
            progressBar.update('.total-progress', updateValue, label, text);
            jqUnit.assertTrue("After an update to a smaller value ("+updateValue+"), style should include '" + styleString + "'",
                indicator.attr("style").indexOf(styleString) > -1);
        });
    });
}) (jQuery);
