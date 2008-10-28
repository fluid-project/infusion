/*
 Copyright 2008 University of Cambridge
 Copyright 2008 University of Toronto
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 */
// Declare dependencies.
/*global jQuery*/
/*global fluid*/

var fluid = fluid || {};

fluid.dataBindingExample = function () {

    var populateCheeses = function () {
        var tree = {
            children: [
                {ID: "select", optionlist: ["Enchiridion", "Apocatastasis", "Exomologesis"],
                               optionnames: ["Enchiridion", "ApoCATTastasis", "Exomologesis"],
                               selection: ["Enchiridion", "Apocatastasis"]},
                {ID: "checkbox-row:", children: [
                    {ID: "checkbox", choiceindex: 0, parentRelativeID: "..::select"},
                    {ID: "label", choiceindex: 0, parentRelativeID: "..::select"}
                ]},
                {ID: "checkbox-row:", children: [
                    {ID: "checkbox", choiceindex: 1, parentRelativeID: "..::select"},
                    {ID: "label", choiceindex: 1, parentRelativeID: "..::select"}
                ]},
                {ID: "checkbox-row:", children: [
                    {ID: "checkbox", choiceindex: 2, parentRelativeID: "..::select"},
                    {ID: "label", choiceindex: 2, parentRelativeID: "..::select"}
                ]}
            ]
        };
        
        fluid.selfRender(jQuery(".UISelect-test-check-1"), tree, {debugMode: true});
    };
    
    return {
        setup: function () {
            populateCheeses();
        }
    };
}();
