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

    var myOriginalTree = {
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
       

    demo.renderComponents = function () {
        var parsedTemplate = fluid.selfRender($("[id=toc]"), myOriginalTree);
    };    
})(jQuery, fluid);
