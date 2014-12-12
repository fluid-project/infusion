/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    /**
     * Transform a string to a number
     **/

    fluid.defaults("fluid.transforms.stringToNumber", {
        gradeNames: ["fluid.standardTransformFunction"]
    });

    fluid.transforms.stringToNumber = function (value) {
        var newValue = Number(value);
        return isNaN(newValue) ? undefined : newValue;
    };

})(jQuery, fluid_2_0);
