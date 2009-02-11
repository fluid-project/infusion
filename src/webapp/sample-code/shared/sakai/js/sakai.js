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
    var initDialog = function () {
        var options = {
            renderModel: {
                selectedOptions: {
                    contrast: "Mist"
                }
            }
        };
        
        // instantiate component
        uiOptions = fluid.uiOptions(".uiOptions", options);
		
        // only show content once ajax call is complete        
        $("#ui_dialog_container").dialog({
            width: 700,
    		modal: true,
            dialogClass: 'dialog'
    	});

        //ajax call is not bringing this in with the uioptions dialog
        $('.fl-components-ui-options .fl-col:eq(0)').accordion({ 
            header: 'h2'
        });
    };

    $('.skin').click(function () {
        if (!uiOptions) {
            // ajax call to pull the UI Options dialog into a container
            $('#ui_dialog_container').load('../../../fluid-components/html/templates/UIOptions.html .uiOptions', initDialog);
        } else {
            // else content is already loaded, just show it
            $(".dialog").css('display', 'block');
        }
    });
});