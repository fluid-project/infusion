/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2010 University of Toronto
Copyright 2008-2009 University of California, Berkeley

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
    
    var uiOptionsNode;
    var uiOptionsComponent;
    
    //initialize the UI Enhancer
    var setupUIEnhancer = function () {
        var enhancerOpts = {
            defaultSiteSettings: {
                theme: "mist",
                linksBold: true,
                linksUnderline: true
            },
            tableOfContents: {
                options: {
                    templateUrl: "../../../components/tableOfContents/html/TableOfContents.html"
                }
            
            }
        };
        
        return fluid.uiEnhancer(document, enhancerOpts);
    };
    
    //initialize UI Options component
    var setupUIOptions = function () {
        var options = {
            listeners: {
                afterRender: function () {
                    $(".uiOptions .fl-col:eq(0)").accordion({
                        header: 'h2',
                        clearStyle: true,
                        autoHeight: false
                    });
                    $(".uiOptions .fl-col h2:eq(0)").focus();
                },
                onCancel: function () {
                    uiOptionsNode.slideUp();
                },
                onSave: function () {
                    uiOptionsNode.slideUp();
                }
            }
        };
        
        uiOptionsComponent = fluid.uiOptions(".uiOptions", options);
    };
    
    //load the UI Options component
    var loadUIOptions = function () {
        var urlSelector = "../../../components/uiOptions/html/UIOptions.html .uiOptions";
        uiOptionsNode.load(urlSelector, setupUIOptions);
    };
    
    var setupPage = function () {
        $(".myButton").toggle(function () {
                uiOptionsNode.slideDown();
            }, function () {
                uiOptionsNode.slideUp();
                uiOptionsComponent.cancel();
            });
        uiOptionsNode.hide();
    };
    
    demo.initUIOptions = function () {
        uiOptionsNode = $("#myUIOptions");
        setupUIEnhancer();  
        loadUIOptions();
        setupPage();
    };
})(jQuery, fluid);
