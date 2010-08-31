/*
Copyright 2009 University of Cambridge
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

/*global demo*/
var demo = demo || {};

(function ($, fluid) {

    var listTree = {
        children: [{
            ID: "H1s:",
            children: [{
                ID: "H1item:toc",
                children: [{
                    ID: "toc_anchor",
                    linktext: "foo",
                    target: "#foo"
                }]
            }, {
                ID: "H1item:H2s",
                children: [{
                    ID: "H2item:toc",
                    children: [{
                        ID: "toc_anchor",
                        linktext: "bar",
                        target: "#bar"
                    }]
                }]
            }, {
                ID: "H1item:toc",
                children: [{
                    ID: "toc_anchor",
                    linktext: "foobar",
                    target: "#foobar"
                }]
            }]
        }]
    };
       
    var imagesTree = {
        children: [
            {ID: "thumb:",
             children: [
                 {ID: "image-url",
                  target: "http://image.ca"},
                 {ID: "image-thumb-url",
                  target: "../../../components/reorderer/images/Dragonfruit.jpg",
                  linktext: "Image 1 alt"},
                 {ID: "caption-url",
                  target: "http://image.thumb.ca",
                  linktext: "Image 1 caption"}
             ]},
            {ID: "thumb:",
             children: [
                 {ID: "image-url",
                  target: "http://image2.ca"},
                 {ID: "image-thumb-url",
                  target: "../../../components/reorderer/images/Kiwi.jpg",
                  linktext: "Image 2 alt"},
                 {ID: "caption-url",
                  target: "http://image2.ca",
                  linktext: "Image 2 caption"}
             ]}
        ]
    };
    
    /*
     * This tree actually seems to cause the function to be executed, but does
     * NOT result in a <script> tag being rendered to the page. Is that the
     * correct behaviour??
     */
    var scriptTree = {
        children: [
            {ID: "script-test",
             functionname: "demo.testFunc",
             "arguments": ["Hello, I've been rendered!"]
            }
        ]
    };
    
    var selectionTree1 = {
        children: [    // This first child is all that's needed to render the <select> element
        {
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

    var selectionTree2 = {
        children: [
            // This first child is all that's needed to render the <select> element
            {ID: "select-test2",
             selection: {value: "bar"},
             optionlist: {value: ["foo", "bar", "foo-bar"]},
             optionnames: {value: ["Foo", "Bar", "Foo-Bar"]}
            },
            // the rest of these children are required for the checkboxes/radio buttons
            {ID: "select-test-row:",
             children: [
                {ID: "select-test-option",
                 choiceindex:0,
                 parentRelativeID: "..::select-test2"
                },
                {ID: "select-test-label",
                 choiceindex:0,
                 parentRelativeID: "..::select-test2"
                }
             ]
            },
            {ID: "select-test-row:",
             children: [
                {ID: "select-test-option",
                 choiceindex:1,
                 parentRelativeID: "..::select-test2"
                },
                {ID: "select-test-label",
                 choiceindex:1,
                 parentRelativeID: "..::select-test2"
                }
             ]
            },
            {ID: "select-test-row:",
             children: [
                {ID: "select-test-option",
                 choiceindex:2,
                 parentRelativeID: "..::select-test2"
                },
                {ID: "select-test-label",
                 choiceindex:2,
                 parentRelativeID: "..::select-test2"
                }
             ]
            }
        ]
    };

    var selectors3 = {
        root: ".my-root",
        row: ".my-row",
        choice: ".my-choice",
        label: ".my-label"
    };
    
    var selectorMap = [{selector: selectors3.root, id: "select-choice-root"},
                       {selector: selectors3.row, id: "select-choice-row:"},
                       {selector: selectors3.choice, id: "select-choice"},
                       {selector: selectors3.label, id: "select-choice-label"}];

    var buildSelectChoiceTree = function (model, selectors) {
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
                    {ID: "select-choice-label", parentRelativeID: "..::select-choice-root", choiceindex: index}]
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
 
    var jointTree = {
        children: [
            {ID:"joint1", jointID: "joint2"}
        ]
    };
        
    demo.renderComponents = function () {
        var listTemplate = fluid.selfRender($("#toc"), listTree, {debugMode: true});
        var imagesTemplate = fluid.selfRender($("#image-container"), imagesTree, {debugMode: true});
        var selectTemplate1 = fluid.selfRender($("#selection-test1"), selectionTree1, {debugMode: true});
        var selectTemplate2 = fluid.selfRender($("#selection-test2"), selectionTree2, {debugMode: true});
        var selectTemplate3 = fluid.selfRender($("#selection-test3"),
                                                buildSelectChoiceTree(selection3model, selectors3),
                                                {model: selection3model, cutpoints: selectorMap, debugMode: true});
        var jointTemplate = fluid.selfRender($("#joint-test"), jointTree, {debugMode: true});
        var scriptTemplate = fluid.selfRender($("#script"), scriptTree, {debugMode: true});
    };    
    
    demo.testFunc = function () {
        alert(arguments[0]);
    };
})(jQuery, fluid);
