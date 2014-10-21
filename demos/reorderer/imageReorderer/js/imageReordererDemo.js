/*
Copyright 2007-2009 University of Cambridge
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var demo = demo || {};
(function ($, fluid) {
    "use strict";

    demo.formBasedImageReorderer = function () {
        fluid.reorderImages(".flc-imageReorderer", {
            selectors: {
                movables: ".flc-imageReorderer-item"
            },
            disableWrap: true,
            listeners: {
                "afterMove.postModel": "fluid.identity" // disable the default post action
            }
        });
    };
})(jQuery, fluid);
