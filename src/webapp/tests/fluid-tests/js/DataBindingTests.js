/* 
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of Cambridge

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
        fluid.logEnabled = true;
        
        var DataBindingTests = new jqUnit.TestCase("Data Binding Tests");
        
        DataBindingTests.test("PathUtil", function() {
            var path = "path1.path2.path3";
            jqUnit.assertEquals("getHeadPath", "path1", fluid.pathUtil.getHeadPath(path));
            jqUnit.assertEquals("getTailPath", "path3", fluid.pathUtil.getTailPath(path));
            jqUnit.assertEquals("getToTailPath", "path1.path2", fluid.pathUtil.getToTailPath(path));
            jqUnit.assertEquals("getFromHeadPath", "path2.path3", fluid.pathUtil.getFromHeadPath(path));
        });

        
    });
})(jQuery);
