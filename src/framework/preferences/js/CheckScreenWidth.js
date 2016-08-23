/*
 Copyright 2013-2016 OCAD University

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 */

var fluid_2_0_0 = fluid_2_0_0 || {};

(function (fluid) {
    "use strict";

    /* A function that checks if the screen is small (width < 640px).
    If so it creates a context aware check. If it is large it removes the check
    and defines a non-responsive grades */
    function widthCheck() {
        var width = $(window).width();
        var isSmallScreen = (width < 640);
        if (isSmallScreen) {
            fluid.contextAware.makeChecks({
                "fluid.responsiveCheck": true
            });
        }
        else {
            fluid.contextAware.forgetChecks("fluid.responsiveCheck");
            fluid.defaults("fluid.prefs.auxSchema.starter.default", {
                gradeNames: ["fluid.contextAware"],
                contextAwareness: {
                    sliderVariety: {
                        checks: {
                            jQueryUI: {
                                contextValue: "{fluid.prefsWidgetType}",
                                equals: "jQueryUI",
                                gradeNames: ["fluid.prefs.auxSchema.starter.textSize.jQueryUI", "fluid.prefs.auxSchema.starter.lineSpace.jQueryUI", "fluid.prefs.auxSchema.starter.blueColorFilter.jQueryUI"]
                            }
                        },
                        defaultGradeNames: ["fluid.prefs.auxSchema.starter.textSize.nativeHTML", "fluid.prefs.auxSchema.starter.lineSpace.nativeHTML", "fluid.prefs.auxSchema.starter.blueColorFilter.nativeHTML"]
                    }
                }
            });
        }
    }
    widthCheck();
})(fluid_2_0_0);
