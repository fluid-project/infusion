/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
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
    
    var setupDialog = function() {
    
        // Create the dialog
        uiOptionsNode.dialog({
            bgiframe: true,
            width: '60em',
            modal: true,
            dialogClass: 'fl-widget fl-grabbable',
            closeOnEscape: false,
            autoOpen: false,
            draggable: true,
            title: "User Interface Options"
        });
        
        // Bind event handlers for it.
        $(".myButton").click(function() {
            uiOptionsNode.dialog("open");
        });
    };

    
    //initialize UI Options component
    var setupUIOptions = function () {
        var options = {
            listeners: {
                afterRender: function() {
                    $(".uiOptions .fl-col:eq(0)").accordion({
                        header: 'h2',
                        clearStyle: true,
                        autoHeight: false
                    });
                    $(".uiOptions .fl-col h2:eq(0)").focus();
                },
                onCancel: function() {
                    uiOptionsNode.dialog("close");
                },
                onSave: function() {
                    uiOptionsNode.dialog("close");
                }
            }
        };
        
        return fluid.uiOptions(".uiOptions", options);
    };
    
    //load the UI Options component
    var loadUIOptions = function () {
        var urlSelector = "../../../components/uiOptions/html/UIOptions.html .uiOptions";
        uiOptionsNode.load(urlSelector, setupUIOptions);
    };

    
    demo.initUIOptions = function () {
        uiOptionsNode = $("#myUIOptions");
        setupUIEnhancer();  
        loadUIOptions();
        setupDialog();
    };
})(jQuery, fluid);
