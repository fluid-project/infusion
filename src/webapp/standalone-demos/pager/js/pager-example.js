/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

/*global demo*/
var demo = demo || {};

(function ($, fluid) {
    demo.initPager = function () {
        var selectorPrefix = "#students-page";
        
        var options = {
            listeners: {
                onModelChange: function (newModel, oldModel) {
                    $(selectorPrefix + (oldModel.pageIndex + 1)).addClass("hidden");
                    $(selectorPrefix + (newModel.pageIndex + 1)).removeClass("hidden");
                }
            }
        };
        
        fluid.pager("#gradebook", options);
    };    
})(jQuery, fluid);
