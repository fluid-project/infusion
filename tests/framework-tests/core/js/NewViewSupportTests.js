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
            container: ".flc-newViewSupport-container",
            selectors: {
                elm: ".flc-newViewSupport-elm"
            }
        });

        jqUnit.test("Init fluid.newViewComponent", function () {
            jqUnit.expect(3);
            var that = fluid.tests.newViewComponent();

            jqUnit.assertValue("The component has been instantiated", that);
            jqUnit.assertDomEquals("The container should have the correct element", $(".flc-newViewSupport-container"), that.container);
            jqUnit.assertDomEquals("The dom binder should be able to locate the correct elements.", $(".flc-newViewSupport-elm"), that.locate("elm"));
        });

        fluid.tests.newViewComponent.addToParentCases = [{
            elm: $("<li>first</li>"),
            method: "prepend"
        }, {
            elm: $("<li>third</li>"),
            method: "append"
        }, {
            elm: $("<li>last</li>")
        }];

        jqUnit.test("fluid.containerRenderingView.addToParent", function () {
            var parent = $(".flc-newViewSupport-addToParent");

            fluid.each(fluid.tests.newViewComponent.addToParentCases, function (testCase) {
                fluid.containerRenderingView.addToParent(parent, testCase.elm, testCase.method);
            });

            var children = parent.children();
            jqUnit.assertEquals("The prepended node should be the first child", "first", children.eq(0).text());
            jqUnit.assertEquals("The appended node should be the third child", "third", children.eq(2).text());
            jqUnit.assertEquals("The element added without a method should be last", "last", children.eq(3).text());
        });

        fluid.defaults("fluid.tests.containerRenderingView", {
            gradeNames: ["fluid.containerRenderingView"],
            parentContainer: ".flc-newViewSupport-parentContainer",
            markup: {
                container: "<span class=\"flc-tests-container\">Test</span>"
            }
        });

        jqUnit.test("Init fluid.containerRenderingView", function () {
            var that = fluid.tests.containerRenderingView();
            var containerElm = $(".flc-tests-container", ".flc-newViewSupport-parentContainer");

            jqUnit.assertValue("The component has been instantiated", that);
            jqUnit.assertNodeExists("The container should have been rendered", containerElm);
            jqUnit.assertDomEquals("The container should have the correct element", containerElm, that.container);
        });
    };
})(jQuery);
