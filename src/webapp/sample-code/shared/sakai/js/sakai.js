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
            theme: "Mist"
        },
        tableOfContents: {
            options: {
                templateUrl: "../../../fluid-components/html/templates/TableOfContents.html"
            }

        }
    };
    
    var uiEnhancer = fluid.uiEnhancer(document, enhancerOpts);
    
    var initDialog = function () {
        // center dialog
        $('#dialog_container').css({
            left: ($(window).width() / 2) - ($('#dialog_container').width() / 2),
            top: ($(window).height() / 2) - ($('#dialog_container').height() / 2)
        }); 
        
        // bind close dialog button
        /*
        $("#close_dialog").click(function () {
            $('#dialog_container').css("display", "none"); 
            uiOptions.cancel();
        });
        */
       
        // TODO: This is not an ideal way to override the default theme.
        var options = {
            labelMap: {
                theme: {  
                    values: ["Low Contrast", "Mist"]
                }
            }, 
            listeners: {
                afterRender: function () {
                    $('.fl-components-ui-options .fl-col:eq(0)').accordion({header: 'h2', clearStyle: true, autoHeight: false});
                }
            }
        };
        
        // instantiate component
        uiOptions = fluid.uiOptions(".uiOptions", options);
        
        //$('#dialog_container').css("display", "block");
        //$('#dialog_container .fl-widget-content select:eq(0)').focus();
    };
    
    /*
    $('.lookNfeel a').click(function () {
        if (!uiOptions) {
            // ajax call to pull the UI Options dialog into a container
            $('#dialog_content').load('../../../fluid-components/html/templates/UIOptions.html .uiOptions', initDialog);
        } else {
            // else content is already loaded, just show it
            $('#dialog_container').css("display", "block"); 
            $('#dialog_container .fl-widget-content select:eq(0)').focus();
        }
    });
    */
   
   var dialog_container = $("#dialog_container");
   dialog_container.dialog({
    	bgiframe: true,
    	width: 800,
        height:500,
    	modal: true,
        dialogClass: 'fl-widget fl-grabbable',
        autoOpen: false,
        draggable: true,
        //title: "User Interface Options Dialog",
        close: function(){
            uiOptions.cancel();
        }
	});
    
    $("#dialog_container .fl-icon-close").click(function(){
        $("#dialog_container").dialog("close");        
    });
    
    $('.lookNfeel a').click(function () {
        $("#dialog_container").dialog("open");
        if (!uiOptions) {
            $('#dialog_content').load('../../../fluid-components/html/templates/UIOptions.html .uiOptions', initDialog);            
        }
    });  
   
});