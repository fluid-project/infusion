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
                templateUrl: "../../../components/tableOfContents/html/TableOfContents.html"
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
        
        var options = {
            listeners: {
                afterRender: function () {
                    $('.fl-uiOptions .fl-col:eq(0)').accordion({header: 'h2', clearStyle: true, autoHeight: false});
                    $('.fl-uiOptions .fl-col h2:eq(0)').focus();
                },
                onCancel: function () {
                    dialog_container.dialog("close");
                }, 
                onSave: function () {
                    dialog_container.dialog("close");
                }
            }
        };
        
        // instantiate component
        uiOptions = fluid.uiOptions("#dialog_container", options);
        
        // 1 time, reposition dialog 
        dialog_container.dialog('option', 'position', 'center');
        
    };

    dialog_container.dialog({
        bgiframe: true,
        title: 'User Interface Options',
        width: '69em',
        modal: true,
        autoOpen: false,
        draggable: true
    });
    
    $("#dialog_container .fl-icon-close").click(function () {
        dialog_container.dialog("close");        
    });
    
    $('.lookNfeel a').click(function () {
        dialog_container.dialog("open");
        if (!uiOptions) {
            $('#dialog_content').load('../../../components/uiOptions/html/UIOptions.html .uiOptions', initDialog);            
        }
    });  
   
});