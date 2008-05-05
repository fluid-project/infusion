/* 
Copyright 2008 University of California, Berkeley
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

$(document).ready (function () {
    var progressTests = new jqUnit.TestCase ("Progress Tests");

    progressTests.test ("Update", function () {                
        var progressBar = new fluid.Progress();
        var text = "File 10%";
        jqUnit.assertFalse("Ensure update text doesn't exist", jQuery(":contains(" + text+")")[0]);

        progressBar.update('.fluid-progress', '.total-progress', 10, text);
        jqUnit.assertTrue("Look for the update text", jQuery(":contains(" + text+")"));
        
    });
     
    
});

