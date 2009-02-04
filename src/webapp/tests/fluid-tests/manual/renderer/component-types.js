/*
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
                  target: "../../../../fluid-components/images/Dragonfruit.jpg",
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
                  target: "../../../../fluid-components/images/Kiwi.jpg",
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
             "arguments": "Hello, I've been rendered!"
            }
        ]
    };
    
    var selectionTree = {
        children: [
            // This first child is all that's needed to render the <select> element
            {ID: "select-test",
             selection: {value: "bar"},
             optionlist: {value: ["foo", "bar", "foo-bar"]},
             optionnames: {value: ["Foo", "Bar", "Foo-Bar"]}
            },
            // the rest of these children are required for the checkboxes/radio buttons
            {ID: "select-test-row:",
             children: [
                {ID: "select-test-option",
                 choiceindex:0,
                 parentRelativeID: "..::select-test"
                },
                {ID: "select-test-label",
                 choiceindex:0,
                 parentRelativeID: "..::select-test"
                }
             ]
            },
            {ID: "select-test-row:",
             children: [
                {ID: "select-test-option",
                 choiceindex:1,
                 parentRelativeID: "..::select-test"
                },
                {ID: "select-test-label",
                 choiceindex:1,
                 parentRelativeID: "..::select-test"
                }
             ]
            },
            {ID: "select-test-row:",
             children: [
                {ID: "select-test-option",
                 choiceindex:2,
                 parentRelativeID: "..::select-test"
                },
                {ID: "select-test-label",
                 choiceindex:2,
                 parentRelativeID: "..::select-test"
                }
             ]
            }
        ]
    };

    demo.renderComponents = function () {
        var listTemplate = fluid.selfRender($("#toc"), listTree);
        var imagesTemplate = fluid.selfRender($("#image-container"), imagesTree);
        var selectTemplate = fluid.selfRender($("#selection-test"), selectionTree);
        var scriptTemplate = fluid.selfRender($("#script"), scriptTree);
    };    
    
    demo.testFunc = function () {
        alert(arguments[0]);
    };
})(jQuery, fluid);
