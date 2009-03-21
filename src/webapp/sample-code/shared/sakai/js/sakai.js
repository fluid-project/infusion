/*
Copyright 2008-2009 University of Toronto

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
    var enhancerOpts = {
        defaultSiteSettings: {
            theme: "mist"
        },
        tableOfContents: {
            options: {
                templateUrl: "../../../fluid-components/html/templates/TableOfContents.html"
            }

        }
    };
    
    var uiEnhancer = fluid.uiEnhancer(document, enhancerOpts);
    var dialog_container = $("#dialog_container");

    
    var initDialog = function () {
        // center dialog
        $('#dialog_container').css({
            left: ($(window).width() / 2) - ($('#dialog_container').width() / 2),
            top: ($(window).height() / 2) - ($('#dialog_container').height() / 2)
        }); 
        
        // TODO: This is not an ideal way to override the default theme.
        var options = {
            controlValues: {
                theme: ["lowContrast", "mist"]
            }, 
            listeners: {
                afterRender: function () {
                    $('.fl-components-ui-options .fl-col:eq(0)').accordion({header: 'h2', clearStyle: true, autoHeight: false});
                    $('.fl-components-ui-options .fl-col h2:eq(0)').focus();
                }
            }
        };
        
        // instantiate component
        uiOptions = fluid.uiOptions(".uiOptions", options);
        
        // 1 time, reposition dialog 
        dialog_container.dialog('option', 'position', 'center');
        
    };

    dialog_container.dialog({
    	bgiframe: true,
    	width: '60em',
    	modal: true,
        dialogClass: 'fl-widget fl-grabbable',
        autoOpen: false,
        draggable: true,        
        close: function () {
            uiOptions.cancel();
        }
	});
    
    $("#dialog_container .fl-icon-close").click(function () {
        dialog_container.dialog("close");        
    });
    
    $('.lookNfeel a').click(function () {
        dialog_container.dialog("open");
        if (!uiOptions) {
            $('#dialog_content').load('../../../fluid-components/html/templates/UIOptions.html .uiOptions', initDialog);            
        }
    });  
   
});