/*
Copyright 2009 University of Cambridge
Copyright 2009 University of Toronto
Copyright 2010 Lucendo Development Ltd.
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global alert, demo:true, fluid */

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    /*
    var wineSelectorMap = [{selector: ".demo-wine-row", id: "wine-row:"},
                           {selector: ".demo-wine", id: "wine"},
                           {selector: ".demo-wine-label", id: "wine-label"}];
    */

    var listSelectorMap = [
        {selector: ".test-anch", id: "anch"},
        {selector: ".test-template2-subtemplate1", id: "template2:subtemplate1"},
        {selector: ".test-template2-subtemplate2", id: "template2:subtemplate2"}
    ];

    var listTree = {
        children: [{
            ID: "template2:subtemplate1",
            children: [{
                ID: "anch",
                linktext: "foo",
                target: "#foo"
            }]
        }, {
            ID: "template2:subtemplate2",
            children: [
                {
                    ID: "template2:subtemplate1",
                    children: [{
                        ID: "anch",
                        linktext: "bar",
                        target: "#bar"
                    }]
                }
            ]
        }, {
            ID: "template2:subtemplate1",
            children: [{
                ID: "anch",
                linktext: "foobar",
                target: "#foobar"
            }]
        }]
    };

    var imagesSelectorMap = [
        {selector: ".test-thumbs", id: "thumb:"},
        {selector: ".test-image-url", id: "image-url"},
        {selector: ".test-image-thumb-url", id: "image-thumb-url"},
        {selector: ".test-caption-url", id: "caption-url"}
    ];

    var imagesTree = {
        children: [{
            ID: "thumb:",
            children: [{
                ID: "image-url",
                target: "http://image.ca"
            }, {
                ID: "image-thumb-url",
                target: "../../../components/reorderer/images/Dragonfruit.jpg",
                linktext: "Image 1 alt"
            }, {
                ID: "caption-url",
                target: "http://image.thumb.ca",
                linktext: "Image 1 caption"
            }]
        }, {
            ID: "thumb:",
            children: [{
                ID: "image-url",
                target: "http://image2.ca"
            }, {
                ID: "image-thumb-url",
                target: "../../../components/reorderer/images/Kiwi.jpg",
                linktext: "Image 2 alt"
            }, {
                ID: "caption-url",
                target: "http://image2.ca",
                linktext: "Image 2 caption"
            }]
        }]
    };

    var scriptSelectorMap = [
        {selector: ".test-script-test", id: "script-test"}
    ];

    /*
     * This tree actually seems to cause the function to be executed, but does
     * NOT result in a <script> tag being rendered to the page. Is that the
     * correct behaviour??
     */
    var scriptTree = {
        children: [{
            ID: "script-test",
            functionname: "demo.testFunc",
            "arguments": ["Hello, I've been rendered!"]
        }]
    };

    var selection1SelectorMap = [
        {selector: ".test-select-test", id: "select-test"}
    ];

    var selectionTree1 = {
        // This first child is all that's needed to render the <select> element
        children: [{
            ID: "select-test",
            selection: {
                value: "bar"
            },
            optionlist: {
                value: ["foo", "bar", "foo-bar"]
            },
            optionnames: {
                value: ["Foo", "Bar", "Foo-Bar"]
            }
        }]
    };

    var selection2SelectorMap = [
        {selector: ".test-select-test-rows", id: "select-test-row:"},
        {selector: ".test-select-test-option", id: "select-test-option"},
        {selector: ".test-select-test-label", id: "select-test-label"}
    ];

    var selectionTree2 = {
        children: [{
            // This first child is all that's needed to render the <select> element
            ID: "select-test2",
            selection: {value: "bar"},
            optionlist: {value: ["foo", "bar", "foo-bar"]},
            optionnames: {value: ["Foo", "Bar", "Foo-Bar"]}
        }, { // the rest of these children are required for the checkboxes/radio buttons
            ID: "select-test-row:",
            children: [{
                ID: "select-test-option",
                choiceindex:0,
                parentRelativeID: "..::select-test2"
            }, {
                ID: "select-test-label",
                choiceindex:0,
                parentRelativeID: "..::select-test2"
            }]
        }, {
            ID: "select-test-row:",
            children: [{
                ID: "select-test-option",
                choiceindex:1,
                parentRelativeID: "..::select-test2"
            }, {
                ID: "select-test-label",
                choiceindex:1,
                parentRelativeID: "..::select-test2"
            }]
        }, {
            ID: "select-test-row:",
            children: [{
                ID: "select-test-option",
                choiceindex:2,
                parentRelativeID: "..::select-test2"
            }, {
                ID: "select-test-label",
                choiceindex:2,
                parentRelativeID: "..::select-test2"
            }]
        }]
    };

    var selectors3 = {
        root: ".my-root",
        row: ".my-row",
        choice: ".my-choice",
        label: ".my-label"
    };

    var selectorMap = [
        {selector: selectors3.root, id: "select-choice-root"},
        {selector: selectors3.row, id: "select-choice-row:"},
        {selector: selectors3.choice, id: "select-choice"},
        {selector: selectors3.label, id: "select-choice-label"}
    ];

    var buildSelectChoiceTree = function (model) {
        var tree = {};
        tree.children = [{
            ID: "select-choice-root",
            selection: model.selection,
            optionnames: model.optionnames,
            optionlist: model.optionlist
        }];
        var optionChildren = fluid.transform(model.optionlist, function(option, index) {
            return {
                ID: "select-choice-row:",
                children: [
                    {ID: "select-choice", parentRelativeID: "..::select-choice-root", choiceindex: index},
                    {ID: "select-choice-label", parentRelativeID: "..::select-choice-root", choiceindex: index}
                ]
            };
        });
        tree = tree.children.concat(optionChildren);
        return tree;
    };

    var selection3model = {
        optionnames: ["Hey", "you", "there!"],
        optionlist: ["foo", "bar", "foo-bar"],
        selection: ["bar"]
    };

    var jointSelectorMap = [
        {selector: ".test-joint1", id: "joint1"},
        {selector: ".test-joint2", id: "joint2"}
    ];

    var jointTree = {
        children: [
            {ID:"joint1", jointID: "joint2"}
        ]
    };

    demo.renderComponents = function () {
        var debugMode = false;
        fluid.selfRender($("#toc"), listTree, {debugMode: debugMode, cutpoints: listSelectorMap});
        fluid.selfRender($("#image-container"), imagesTree, {debugMode: debugMode, cutpoints: imagesSelectorMap});
        fluid.selfRender($("#selection-test1"), selectionTree1, {debugMode: debugMode, cutpoints: selection1SelectorMap});
        fluid.selfRender($("#selection-test2"), selectionTree2, {debugMode: debugMode, cutpoints: selection2SelectorMap});
        fluid.selfRender($("#selection-test3"),
                                                buildSelectChoiceTree(selection3model, selectors3),
                                                {model: selection3model, cutpoints: selectorMap, debugMode: debugMode});
        fluid.selfRender($("#joint-test"), jointTree, {debugMode: debugMode, cutpoints: jointSelectorMap});
        fluid.selfRender($("#script"), scriptTree, {debugMode: debugMode, cutpoints: scriptSelectorMap});
    };

    demo.testFunc = function () {
        alert(arguments[0]);
    };
})(jQuery, fluid);
