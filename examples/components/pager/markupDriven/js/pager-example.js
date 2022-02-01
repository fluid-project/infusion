/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

var example = example || {};

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
