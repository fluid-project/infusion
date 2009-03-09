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
    
    var showDialog = function () {
        // center dialog
        $('#dialog_container').css({
            left: ($(window).width() / 2) - ($('#dialog_container').width() / 2),
            top: ($(window).height() / 2) - ($('#dialog_container').height() / 2)
        });    
    };
    
    var hideDialog = function () {
        $('#dialog_container').css({
            left: -10000,
            top: -10000
        });    
    };
    
    var initDialog = function () {
        // bind close dialog button
        $("#close_dialog").click(function () {
            hideDialog();
            uiOptions.cancel();
        });
    
        var options = {
            savedSelections: {
                contrast: "Mist"
            },
            originalSettings: {
                contrast: "Mist"
            },
            labelMap: {
                contrast: {
                    names: ["Standard"],
                    values: ["Mist"]
                }
            }, 
            listeners: {
                afterRender: function () {
                    $('.fl-components-ui-options .fl-col:eq(0)').accordion({ header: 'h2'});
                }
            }
        };
        
        // instantiate component
        uiOptions = fluid.uiOptions(".uiOptions", options);
        showDialog();
    };

    $('.skin').click(function () {
        if (!uiOptions) {
            // ajax call to pull the UI Options dialog into a container
            $('#dialog_content').load('../../../fluid-components/html/templates/UIOptions.html .uiOptions', initDialog);
        } else {
            // else content is already loaded, just show it
            showDialog();
        }
    });
});