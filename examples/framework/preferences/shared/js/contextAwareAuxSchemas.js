/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    // Context-aware mixin for jQueryUI slider
    fluid.defaults("example.auxSchema.jQueryUI", {
        auxiliarySchema: {
            vol: {
                panel: {
                    template: "%templatePrefix/slider-template-jQueryUI.html"
                }
            },
            wpm: {
                panel: {
                    template: "%templatePrefix/slider-template-jQueryUI.html"
                }
            },
            cursor: {
                type: "example.cursorSize",
                panel: {
                    template: "%templatePrefix/slider-template-jQueryUI.html"
                }
            },
            magFactor: {
                type: "example.magnification",
                panel: {
                    template: "%templatePrefix/slider-template-jQueryUI.html"
                }
            }
        }
    });

    // Context-aware mixin for native slider
    fluid.defaults("example.auxSchema.nativeHTML", {
        auxiliarySchema: {
            vol: {
                panel: {
                    template: "%templatePrefix/slider-template-nativeHTML.html"
                }
            },
            wpm: {
                panel: {
                    template: "%templatePrefix/slider-template-nativeHTML.html"
                }
            },
            cursor: {
                type: "example.cursorSize",
                panel: {
                    template: "%templatePrefix/slider-template-nativeHTML.html"
                }
            },
            magFactor: {
                type: "example.magnification",
                panel: {
                    template: "%templatePrefix/slider-template-nativeHTML.html"
                }
            }
        }
    });


})(jQuery, fluid);
