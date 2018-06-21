/*
Copyright 2011-2016 OCAD University
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2015-2016 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.setLogging(true);

    fluid.tests.testNewViewSupport = function () {

        fluid.defaults("fluid.tests.newViewComponent", {
            gradeNames: ["fluid.newViewComponent"],
            members: {
                container: "@expand:fluid.container({that}.options.container)"
            },
            selectors: {
                elm: ".flc-newViewSupport-elm"
            }
        });

        jqUnit.test("Init fluid.newViewComponent", function () {
            jqUnit.expect(3);
            var that = fluid.tests.newViewComponent({
                container: ".flc-newViewSupport-container"
            });

            jqUnit.assertValue("The component has been instantiated", that);
            jqUnit.assertDomEquals("The container should have the correct element", $(".flc-newViewSupport-container"), that.container);
            jqUnit.assertDomEquals("The dom binder should be able to locate the correct elements.", $(".flc-newViewSupport-elm"), that.locate("elm"));
        });
    };
})(jQuery);
