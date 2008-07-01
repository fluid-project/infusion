/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/

/*global fluid*/
fluid = fluid || {};

(function ($, fluid) {
    
    // Is paddings doing what we want? Should it be in the CSS file instead?
    function edit(text, editContainer, editField, invitationStyle, focusStyle, paddings) {
		editField.val(text.text());
		editField.width(Math.max(text.width() + paddings.add, paddings.minimum));
        text.removeClass(invitationStyle);
        text.removeClass(focusStyle);
        text.hide();
        editContainer.show();

        // Work around for FLUID-726
        // Without 'setTimeout' the finish handler gets called with the event and the edit field is inactivated.       
        setTimeout(function () {
            editField.focus();    
        }, 0);    
    }
    
    function view(editContainer, text) {
        editContainer.hide();
        text.show();
    }

    function finish(editContainer, editField, text, finishedFn) {
        finishedFn(editField, text);
        text.text(editField.val());
        view(editContainer, text);
        text.focus();
    }
        
    function editHandler(text, editContainer, editField, invitationStyle, focusStyle, paddings) {
        return function () {
            edit(text, editContainer, editField, invitationStyle, focusStyle, paddings);
            return false;
        }; 
    }
    
    function bindHoverHandlers(text, invitationStyle) {
        var over = function (evt) {
            text.addClass(invitationStyle);
        };     
        var out = function (evt) {
            text.removeClass(invitationStyle);
        };

        text.hover(over, out);
    }
    
    function mouse(text, editContainer, editField, styles, paddings, finishFn) {
        bindHoverHandlers(text, styles.invitation);
        text.click(editHandler(text, editContainer, editField, styles.invitation, styles.focus, paddings));
    }
    
    function bindKeyHighlight(text, focusStyle) {
        var focusOn = function () {
            text.addClass(focusStyle);    
        };
        var focusOff = function () {
            text.removeClass(focusStyle);    
        };
        
        text.focus(focusOn);
        text.blur(focusOff);
    }
    
    function keyNav(text, editContainer, editField, styles, paddings) {
        text.tabbable();
        bindKeyHighlight(text, styles.focus);
        text.activatable(editHandler(text, editContainer, editField, styles.invitation, styles.focus, paddings));
    } 
    
    function bindEditFinish(editContainer, editField, text, finishedFn) {
        var finishHandler = function (evt) {
            // Fix for handling arrow key presses see FLUID-760
            var code = (evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0));
            if (code !== $.a11y.keys.ENTER) {
                return true;
            }
            
            finish(editContainer, editField, text, finishedFn);
            return false;
        };

        editContainer.keypress(finishHandler);
    }
    
    function bindBlurHandler(editContainer, editField, text, finishedFn) {
        var blurHandler = function (evt) {
            finish(editContainer, editField, text, finishedFn);
            return false;
        };

        editField.blur(blurHandler);        
    }
    
    function aria(text, editContainer) {
        // Need to add ARIA roles and states.
    }
    
    var mixDefaults = function(instance, defaults, options) {
        instance.selectors = $.extend({}, defaults.selectors, options.selectors);
        instance.styles = $.extend({}, defaults.styles, options.styles);
        instance.paddings = $.extend({}, defaults.paddings, options.paddings);
        instance.finishedEditing = options.finishedEditing || function () {};
        instance.editModeInjector = options.editModeInjector || defaults.editModeInjector;
    };
    
    var bindToDom = function (instance, container) {
        // Bind to the DOM.
        instance.container = fluid.container(container);
        instance.text = $(instance.selectors.text, instance.container);
        
        // If an edit container is found in the markup, use it. Otherwise generate one based on the view text.
        instance.editContainer = $(instance.selectors.editContainer, instance.container);
        if (instance.editContainer.length >= 1) {
            var isEditSameAsContainer = instance.editContainer.is(instance.selectors.edit);
            var containerConstraint =  isEditSameAsContainer ? instance.container : instance.editContainer;
            instance.editField =  $(instance.selectors.edit, containerConstraint);
        } else {
            var editElms = instance.editModeInjector(instance.container.attr("id"), instance.text);
            instance.editContainer = editElms.container;
            instance.editField = editElms.field;
        }
    };
    
    var defaultEditModeInjector = function (componentContainerId, view) {
        // Template strings.
        var editModeTemplate = "<div><input type='text' /></div>";

        
        // Create the edit container and pull out the textfield.
        var editContainer = $(editModeTemplate);
        var editField = jQuery("input", editContainer);
        
        // Give the container and textfield a reasonable set of ids if necessary.
        if (componentContainerId) {
            var editContainerId = componentContainerId +"-edit-container";
            var editFieldId = componentContainerId + "-edit";   
            editContainer.attr("id", editContainerId);
            editField.attr("id", editFieldId); 
        }
        
        editField.attr("value", view.text());
        
        // Inject it into the DOM.
        editContainer.insertAfter(view);
        
        // Package up the container and field for the component.
        return {
            container: editContainer,
            field: editField
        };
    };
    
    /**
     * Instantiates a new Inline Edit component
     * 
     * @param {Object} componentContainer a unique id, jquery, or a dom element representing the component's container
     * @param {Object} options a collection of options settings
     */
    fluid.InlineEdit = function (componentContainer, options) {
        // Mix in the user's configuration options.
        options = options || {};
        mixDefaults(this, this.defaults, options);
        bindToDom(this, componentContainer);
        
        // Add event handlers.
        mouse(this.text, this.editContainer, this.editField, this.styles, this.paddings, this.finishedEditing);
        keyNav(this.text, this.editContainer, this.editField, this.styles, this.paddings);
        bindEditFinish(this.editContainer, this.editField, this.text, this.finishedEditing);
        bindBlurHandler(this.editContainer, this.editField, this.text, this.finishedEditing);
        
        // Add ARIA support.
        aria(this.text, this.editContainer);
        
        // Hide the edit container to start
        this.editContainer.hide();
    };
    
    fluid.InlineEdit.prototype.edit = function () {
        edit(this.text, this.editContainer, this.editField, this.styles.invitation, this.styles.focus, this.paddings);
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
		},
        
        editModeInjector: defaultEditModeInjector
    };
    
    /**
     * A set of inline edit fields.
     */
    var setupInlineEdits = function  (editables, options) {
        var editors = [];
        editables.each(function (idx, editable) {
            editors.push(new fluid.InlineEdit(jQuery(editable), options));
        });
        
        return editors;
    };

    fluid.inlineEdits = function (componentContainerId, options) {
        var that = {};
        options = options || {};
        that.selectors = $.extend({}, fluid.defaults("inlineEdits").selectors, options.selectors);
        
        // Bind to the DOM.
        var container = fluid.utils.jById(componentContainerId);
        var editables = $(that.selectors.editables, container);
        
        return setupInlineEdits(editables, options);
    };
    
    fluid.defaults("inlineEdits", {
        selectors: {
            editables: ".inlineEditable"
        }
    });
})(jQuery, fluid);
