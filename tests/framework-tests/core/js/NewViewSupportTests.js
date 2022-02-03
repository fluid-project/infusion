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

/* global jqUnit */

"use strict";

fluid.registerNamespace("fluid.tests");

fluid.setLogging(true);

fluid.defaults("fluid.tests.newViewComponent", {
    gradeNames: ["fluid.viewComponent"],
    container: ".flc-newViewSupport-container",
    selectors: {
        elm: ".flc-newViewSupport-elm"
    }
});

jqUnit.test("Init fluid.viewComponent", function () {
    jqUnit.expect(3);
    var that = fluid.tests.newViewComponent();

    jqUnit.assertValue("The component has been instantiated", that);
    jqUnit.assertDomEquals("The container should have the correct element", $(".flc-newViewSupport-container"), that.container);
    jqUnit.assertDomEquals("The dom binder should be able to locate the correct elements.", $(".flc-newViewSupport-elm"), that.locate("elm"));
});

fluid.registerNamespace("fluid.tests.containerRenderingView");

fluid.tests.containerRenderingView.addToParentCases = [{
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

    fluid.each(fluid.tests.containerRenderingView.addToParentCases, function (testCase) {
        fluid.containerRenderingView.addToParent(parent, testCase.elm, testCase.method);
    });

    var children = parent.children();
    jqUnit.assertEquals("The prepended node should be the first child", "first", children.eq(0).text());
    jqUnit.assertEquals("The appended node should be the third child", "third", children.eq(2).text());
    jqUnit.assertEquals("The element added without a method should be last", "last", children.eq(3).text());
});

jqUnit.test("fluid.containerRenderingView.addToParent replace content", function () {
    var parent = $(".flc-newViewSupport-addToParent-replace");

    fluid.containerRenderingView.addToParent(parent, "<li>new</li>", "html");

    var children = parent.children();
    jqUnit.assertEquals("There should only be one child element", 1, children.length);
    jqUnit.assertEquals("The new element should be the child", "new", children.eq(0).text());
});

/** Basic containerRenderingView test with built-in markup **/

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

/** Basic templateRenderingView test with markup fetched from a resource **/

fluid.defaults("fluid.tests.templateRenderingView", {
    gradeNames: ["fluid.templateRenderingView"],
    templateUrl: "../data/testTemplate1.html"
});

fluid.tests.templateRenderingView.verifyInit = function (that, parentContainer) {
    var parentNode = $(parentContainer);
    var children = parentNode.children();
    jqUnit.assertEquals("There should be two child elements in the container", 2, children.length);
    jqUnit.assertTrue("The first child should be the pre-existing element", children.eq(0).hasClass("flc-newViewSupport-templateContainer-existing"));
    jqUnit.assertTrue("The second child should be the injected template", "Test Template 1", children.eq(1).text());
    that.destroy();
    var newChildren = parentNode.children();
    jqUnit.assertEquals("There should be one child element in the container", 1, newChildren.length);
    jqUnit.assertTrue("The first child should be the pre-existing element", newChildren.eq(0).hasClass("flc-newViewSupport-templateContainer-existing"));
    jqUnit.start();
};

jqUnit.asyncTest("Init fluid.templateRenderingView", function () {
    jqUnit.expect(5);
    fluid.tests.templateRenderingView(".flc-newViewSupport-templateContainer", {
        listeners: {
            "onCreate.test": {
                listener: "fluid.tests.templateRenderingView.verifyInit",
                args: ["{that}", "{that}.options.parentContainer"],
                priority: "last:testing"
            }
        }
    });
});

/** Synchronously resolved template is corrupted **/

fluid.defaults("fluid.tests.FLUID6706test", {
    gradeNames: ["fluid.templateResourceFetcher"],
    resources: {
        template: {
            promiseFunc: "fluid.identity",
            promiseArgs: "<div></div>"
        }
    }
});

jqUnit.test("Synchronously resolved template is corrupted", function () {
    var that = fluid.tests.FLUID6706test();
    jqUnit.assertEquals("Resolved template synchronously", "<div></div>", that.resources.template.resourceText);
});

/** "CollectionSpace-style" rendering test with nested containers with their own template resources **/

fluid.defaults("fluid.tests.nestedTemplateRenderingView", {
    gradeNames: "fluid.templateRenderingView",
    container: ".flc-newViewSupport-nestedTemplateContainer",
    templateUrl: "../data/testTemplateContainer.html",
    injectionType: "replaceWith",
    selectors: {
        nested: ".flc-nested"
    },
    components: {
        nested: {
            type: "fluid.templateRenderingView",
            container: "{that}.dom.nested",
            options: {
                templateUrl: "../data/testTemplateNested.html",
                injectionType: "replaceWith"
            }
        }
    }
});

fluid.tests.templateRenderingView.verifyNested = function (jqNested) {
    jqUnit.assertEquals("Nested content replaced from template", "Content from the nested template", jqNested.text());
    jqUnit.start();
};

jqUnit.asyncTest("Nested fluid.templateRenderingView", function () {
    jqUnit.expect(1);
    fluid.tests.nestedTemplateRenderingView(".flc-newViewSupport-nestedTemplateContainer", {
        listeners: {
            "onCreate.test": {
                listener: "fluid.tests.templateRenderingView.verifyNested",
                args: "{that}.dom.nested"
            }
        }
    });
});
