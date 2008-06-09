/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var fluid = fluid || {};

(function ($) {
    
    function edit(text, editContainer, editField, invitationStyle, paddings) {
		editField.val(text.text());
		editField.width(Math.max(text.width() + paddings.add, paddings.minimum));
        text.removeClass(invitationStyle);
        text.hide();
        editContainer.show();

        // Work around for FLUID-726
        // Without 'setTimeout' the finish handler gets called with the event and the edit field is inactivated.       
        setTimeout(function () {
          editField.focus();    
        }, 0);
        
    }
    
     function finish(editContainer, editField, text, finishedFn) {
        finishedFn(edit);
        text.text(editField.val());
        editContainer.hide();
        text.show();
        text.focus();
    }
    
    function editHandler(text, editContainer, editField, invitationStyle, paddings) {
        return function () {
            edit(text, editContainer, editField, invitationStyle, paddings);
            return false;
        }; 
    }
    
    function hoverHandlers(text, invitationStyle) {
        return {
            over: function (evt) {
                text.addClass(invitationStyle);
            },
            out: function (evt) {
                text.removeClass(invitationStyle);
            }
        };
    }
    
    function mouse(text, editContainer, editField, styles, paddings, finishFn) {
         // Hover over for an invitation to click.
        var textHover = hoverHandlers(text, styles.invitation);
        text.hover(textHover.over, textHover.out);
        
        // Handle a click.
        text.click(editHandler(text, editContainer, editField, styles.invitation, paddings));
        
        // Bind a global click listener that checks for the user click outside of the edit field.
        $("body").click(function (evt) {
            if (jQuery("*", editContainer).index(evt.target) === -1) {
                finish(editContainer, editField, text, finishFn);
                text.toggleClass(styles.focus);
            }   
        });
    }
    
    function bindKeyHighlight(text, focusStyle) {
        var toggleFocusStyle = function () {
            text.toggleClass(focusStyle);    
        };
        text.focus(toggleFocusStyle);
        text.blur(toggleFocusStyle);
    }
    
    function keyNav(text, editContainer, editField, styles, paddings) {
        text.tabbable();
        bindKeyHighlight(text, styles.focus);
        text.activatable(editHandler(text, editContainer, editField, styles.invitation, paddings));
    } 
    
    function bindEditFinish(editContainer, editField, text, finishedFn) {
        var finishHandler = function (evt) {
 
            if (evt.which && evt.which != jQuery.a11y.keys.ENTER) {
                return true;
            }
            
            finish(editContainer, editField, text, finishedFn);
            return false;
        };
        
        editContainer.blur(finishHandler);
        editContainer.keypress(finishHandler);
    }
    
    function aria(text, editContainer) {
        // Need to add ARIA roles and states.
    }
    
    fluid.InlineEdit = function (componentContainerId, selectors, styles, paddings) {
        // Mix in the user's configuration options.
        selectors = jQuery.extend({}, this.defaults.selectors, selectors);
        this.styles = jQuery.extend({}, this.defaults.styles, styles);
        this.paddings = jQuery.extend({}, this.defaults.paddings, paddings);
		
        // Bind to the DOM.
        this.container = jQuery("#" + componentContainerId);
        this.text = jQuery(selectors.text, this.container);
        this.editContainer = jQuery(selectors.editContainer, this.container);
        this.editField = jQuery(selectors.edit, this.editContainer);
        
        // Add event handlers.
        mouse(this.text, this.editContainer, this.editField, this.styles, this.paddings, this.finishedEditing);
        keyNav(this.text, this.editContainer, this.editField, this.styles, this.paddings);
        bindEditFinish(this.editContainer, this.editField, this.text, this.finishedEditing);
        
        // Add ARIA support.
        aria(this.text, this.editContainer);
        
        // Hide the edit container to start
        this.editContainer.hide();
    };
    
    fluid.InlineEdit.prototype.edit = function () {
        edit(this.text, this.editContainer, this.editField, this.styles.invitation, this.paddings);
    };
    
    fluid.InlineEdit.prototype.finish = function () {
        finish(this.editContainer, this.editField, this.text, this.finishedEditing);
    };
    
    fluid.InlineEdit.prototype.defaults = {
        selectors: {
            text: ".text",
            editContainer: ".editContainer",
            edit: ".edit"
        },
        
        styles: {
            invitation: "invitation",
            focus: "focus"
        },
		
		paddings: {
			add: 10,
			minimum: 80
		}
    };
    
    fluid.InlineEdit.prototype.finishedEditing = function (editField) {
        // Do nothing by default. Replace this function to add your own custom callback.
    };
    
}) (jQuery, fluid);
