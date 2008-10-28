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
        var checkboxTree = {
            children: [
                {ID: "check-select", optionlist: ["Enchiridion", "Apocatastasis", "Exomologesis"],
                               optionnames: ["Enchiridion", "ApoCATTastasis", "Exomologesis"],
                               selection: ["Enchiridion", "Apocatastasis"]},
                {ID: "checkbox-row:", children: [
                    {ID: "checkbox", choiceindex: 0, parentRelativeID: "..::check-select"},
                    {ID: "check-label", choiceindex: 0, parentRelativeID: "..::check-select"}
                ]},
                {ID: "checkbox-row:", children: [
                    {ID: "checkbox", choiceindex: 1, parentRelativeID: "..::check-select"},
                    {ID: "check-label", choiceindex: 1, parentRelativeID: "..::check-select"}
                ]},
                {ID: "checkbox-row:", children: [
                    {ID: "checkbox", choiceindex: 2, parentRelativeID: "..::check-select"},
                    {ID: "check-label", choiceindex: 2, parentRelativeID: "..::check-select"}
                ]}
            ]
        };
        
        fluid.selfRender(jQuery(".UISelect-test-check-1"), checkboxTree, {debugMode: true});
        
        var radioTree = {
            children: [
                {ID: "radio-select", optionlist: ["Enchiridion", "Apocatastasis", "Exomologesis"],
                               optionnames: ["Enchiridion", "ApoCATTastasis", "Exomologesis"],
                               selection: ["Apocatastasis"]},
                {ID: "radio-row:", children: [
                    {ID: "checkbox", choiceindex: 0, parentRelativeID: "..::radio-select"},
                    {ID: "radio-label", choiceindex: 0, parentRelativeID: "..::radio-select"}
                ]},
                {ID: "radio-row:", children: [
                    {ID: "checkbox", choiceindex: 1, parentRelativeID: "..::radio-select"},
                    {ID: "radio-label", choiceindex: 1, parentRelativeID: "..::radio-select"}
                ]},
                {ID: "radio-row:", children: [
                    {ID: "checkbox", choiceindex: 2, parentRelativeID: "..::radio-select"},
                    {ID: "radio-label", choiceindex: 2, parentRelativeID: "..::radio-select"}
                ]}
            ]
        };
        
        fluid.selfRender(jQuery(".UISelect-test-radio-1"), radioTree, {debugMode: true});
    };
    
    return {
        setup: function () {
            populateCheeses();
        }
    };
}();
