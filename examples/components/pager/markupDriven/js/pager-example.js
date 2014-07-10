/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var example = example || {};

(function ($, fluid) {
    "use strict";

    example.initPager = function () {
        var selectorPrefix = "#students-page";

        var options = {
            pageList: {
                type: "fluid.pager.directPageList"
            },
            listeners: {
                onModelChange: function (newModel, oldModel) {
                    if (oldModel) {
                        $(selectorPrefix + (oldModel.pageIndex + 1)).addClass("hidden");
                    }
                    $(selectorPrefix + (newModel.pageIndex + 1)).removeClass("hidden");
                }
            }
        };

        fluid.pager("#gradebook", options);
    };
})(jQuery, fluid);
