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

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.uiOptions", {
        gradeNames: ["fluid.prefs.builder", "fluid.viewComponent"],
        preferences: [
            "fluid.prefs.textSize",
            "fluid.prefs.lineSpace",
            "fluid.prefs.textFont",
            "fluid.prefs.contrast",
            "fluid.prefs.tableOfContents",
            "fluid.prefs.enhanceInputs"
        ]
    });

})(jQuery, fluid_3_0_0);
