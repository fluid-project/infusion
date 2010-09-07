/*
Copyright 2008-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global $, fluid*/

$(function () {
    
    var uiOptions;
    var uiOptionsNode;
    
     //initialize the UI Enhancer
    var setupUIEnhancer = function () {
        var enhancerOpts = {
            defaultSiteSettings: {
                theme: "mist"
            },
            tableOfContents: {
                options: {
                    templateUrl: "../../../components/tableOfContents/html/TableOfContents.html"
                }
    
            }
        };
        return fluid.uiEnhancer(document, enhancerOpts);
    };
    
    var setupUIOptions = function () {        
        var options = {
            listeners: {
                afterRender: function () {
                    $('.fl-uiOptions .fl-col:eq(0)').accordion({header: 'h2', clearStyle: true, autoHeight: false});
                    $('.fl-uiOptions .fl-col h2:eq(0)').focus();
                },
                onCancel: function () {
                    uiOptionsNode.slideUp();
                }, 
                onSave: function () {
                    uiOptionsNode.slideUp();
                }
            }
        };
        
        // instantiate component
        uiOptions = fluid.uiOptions(".ui_options", options);        
    };
    
    var setup = function () {
        $(".lookNfeel a").toggle(function () {
                uiOptionsNode.slideDown();
            }, function () {
                uiOptionsNode.slideUp();
                uiOptions.cancel();
            });
        uiOptionsNode.hide();
    };
    
    uiOptionsNode = $(".ui_options");
    setupUIEnhancer();  
    uiOptionsNode.load('../../../components/uiOptions/html/UIOptions.html .uiOptions', setupUIOptions);
    setup();
   
});