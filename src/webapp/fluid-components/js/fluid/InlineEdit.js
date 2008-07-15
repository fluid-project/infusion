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
    function edit(viewEl, editContainer, editField, invitationStyle, focusStyle, paddings, defaultViewText, selectOnEdit) {
        var displayText = viewEl.text();
		editField.val(displayText === defaultViewText ? "" : displayText);
		editField.width(Math.max(viewEl.width() + paddings.edit, paddings.minimumEdit));
        viewEl.removeClass(invitationStyle);
        viewEl.removeClass(focusStyle);
        viewEl.hide();
        editContainer.show();

        // Work around for FLUID-726
        // Without 'setTimeout' the finish handler gets called with the event and the edit field is inactivated.       
        setTimeout(function () {
            editField.focus();  
            if (selectOnEdit) {
                editField[0].select();
            }
        }, 0);    
    }
    
    function view(editContainer, viewEl) {
        editContainer.hide();
        viewEl.show();
    }

    function clearEmptyViewStyles(textEl, defaultViewStyle, originalViewPadding) {
        textEl.removeClass(defaultViewStyle);
        textEl.css('padding-right', originalViewPadding);
    }
    
    function showEditedText(editedVal, textEl, defaultViewStyle, originalViewPadding) {
        // The user entered something into the text field, so we want to reflect that in the view mode.
        textEl.text(editedVal);
        clearEmptyViewStyles(textEl, defaultViewStyle, originalViewPadding);
    }
    
    function showDefaultViewText(defaultViewText, textEl, defaultViewStyle) {
        textEl.text(defaultViewText);
        textEl.addClass(defaultViewStyle);
    }
    
    function showNothing(textEl, paddings, originalViewPadding) {
        textEl.text("");
        
        // If necessary, pad the view element enough that it will be evident to the user.
        if (originalViewPadding < paddings.minimumView) {
            textEl.css('padding-right', paddings.minimumView);
        }
    }
    
    function finish(editContainer, editField, viewEl, finishedFn, defaultViewText, defaultViewStyle, paddings, originalViewPadding) {
        finishedFn(editField[0], viewEl[0]);
        var editVal = editField.val();
        if (editVal) {
            showEditedText(editVal, viewEl, defaultViewStyle, originalViewPadding);
        } else if (defaultViewText){
            showDefaultViewText(defaultViewText, viewEl, defaultViewStyle);
        } else {
            showNothing(viewEl, paddings, originalViewPadding);
        }

        view(editContainer, viewEl);
        viewEl.focus();
    }
        
    function editHandler(viewEl, editContainer, editField, invitationStyle, focusStyle, paddings, defaultViewText, selectOnEdit) {
        return function () {
            edit(viewEl, editContainer, editField, invitationStyle, focusStyle, paddings, defaultViewText, selectOnEdit);
            return false;
        }; 
    }
    
    function bindHoverHandlers(viewEl, invitationStyle) {
        var over = function (evt) {
            viewEl.addClass(invitationStyle);
        };     
        var out = function (evt) {
            viewEl.removeClass(invitationStyle);
        };

        viewEl.hover(over, out);
    }
    
    function mouse(viewEl, editContainer, editField, styles, paddings, finishFn, defaultViewText, selectOnEdit) {
        bindHoverHandlers(viewEl, styles.invitation);
        viewEl.click(editHandler(viewEl, editContainer, editField, styles.invitation, styles.focus, paddings, defaultViewText, selectOnEdit));
    }
    
    function bindKeyHighlight(viewEl, focusStyle) {
        var focusOn = function () {
            viewEl.addClass(focusStyle);    
        };
        var focusOff = function () {
            viewEl.removeClass(focusStyle);
        };
        
        viewEl.focus(focusOn);
        viewEl.blur(focusOff);
    }
    
    function keyNav(viewEl, editContainer, editField, styles, paddings, defaultViewText, selectOnEdit) {
        viewEl.tabbable();
        bindKeyHighlight(viewEl, styles.focus);
        viewEl.activatable(editHandler(viewEl, editContainer, editField, styles.invitation, styles.focus, paddings, defaultViewText, selectOnEdit));
    } 
    
    function bindEditFinish(editContainer, editField, viewEl, finishedFn, defaultViewText, defaultViewTextStyle, paddings, existingPadding) {
        var finishHandler = function (evt) {
            // Fix for handling arrow key presses see FLUID-760
            var code = (evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0));
            if (code !== $.a11y.keys.ENTER) {
                return true;
            }
            
            finish(editContainer, editField, viewEl, finishedFn, defaultViewText, defaultViewTextStyle, paddings, existingPadding);
            return false;
        };

        editContainer.keypress(finishHandler);
    }
    
    function bindBlurHandler(editContainer, editField, viewEl, finishedFn, defaultViewText, defaultViewTextStyle, paddings, existingPadding) {
        var blurHandler = function (evt) {
            finish(editContainer, editField, viewEl, finishedFn, defaultViewText, defaultViewTextStyle, paddings, existingPadding);
            return false;
        };

        editField.blur(blurHandler);        
    }
    
    function aria(viewEl, editContainer) {
        // Need to add ARIA roles and states.
    }
    
    var mixDefaults = function(instance, defaults, options) {
        instance.selectors = $.extend({}, defaults.selectors, options.selectors);
        instance.styles = $.extend({}, defaults.styles, options.styles);
        instance.paddings = $.extend({}, defaults.paddings, options.paddings);
        instance.finishedEditing = options.finishedEditing || function () {};
        instance.editModeInjector = options.editModeInjector || defaults.editModeInjector;
        
        var useDefaultViewText = (options.useDefaultViewText !== undefined ? options.useDefaultViewText : defaults.useDefaultViewText);
        instance.defaultViewText = useDefaultViewText ? (options.defaultViewText || defaults.defaultViewText) : null;
    };
    
    var bindToDom = function (instance, container) {
        // Bind to the DOM.
        instance.container = fluid.container(container);
        instance.viewEl = $(instance.selectors.text, instance.container);

        // If an edit container is found in the markup, use it. Otherwise generate one based on the view text.
        instance.editContainer = $(instance.selectors.editContainer, instance.container);
        if (instance.editContainer.length >= 1) {
            var isEditSameAsContainer = instance.editContainer.is(instance.selectors.edit);
            var containerConstraint =  isEditSameAsContainer ? instance.container : instance.editContainer;
            instance.editField =  $(instance.selectors.edit, containerConstraint);
        } else {
            var editElms = instance.editModeInjector(instance.container.attr("id"), instance.viewEl);
            instance.editContainer = editElms.container;
            instance.editField = editElms.field;
        }
    };
    
    var defaultEditModeInjector = function (componentContainerId, view) {
        // Template strings.
        var editModeTemplate = "<span><input type='text' /></span>";

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
    
    var setupViewMode = function (instance) {
        var displayText = instance.viewEl.text();
        instance.existingPadding = parseFloat(instance.viewEl.css("padding-right"));
        if (!displayText) {
            if (instance.defaultViewText) {
                showDefaultViewText(instance.defaultViewText, instance.viewEl, instance.styles.defaultViewText);
            } else {
                showNothing(instance.viewEl, instance.paddings, instance.existingPadding);
            }
        }
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
        setupViewMode(this);
        
        // Add event handlers.
        mouse(this.viewEl, this.editContainer, this.editField, this.styles, this.paddings, this.finishedEditing, this.defaultViewText, 
              options.selectOnEdit);
        keyNav(this.viewEl, this.editContainer, this.editField, this.styles, this.paddings, this.defaultViewText, 
               options.selectOnEdit);
        bindEditFinish(this.editContainer, this.editField, this.viewEl, this.finishedEditing, this.defaultViewText, 
                       this.styles.defaultViewText, this.paddings, this.existingPadding);
        bindBlurHandler(this.editContainer, this.editField, this.viewEl, this.finishedEditing, this.defaultViewText, 
                        this.styles.defaultViewText, this.paddings, this.existingPadding);
        
        // Add ARIA support.
        aria(this.viewEl, this.editContainer);
        
        // Hide the edit container to start
        this.editContainer.hide();
    };
    
    fluid.InlineEdit.prototype.edit = function () {
        edit(this.viewEl, this.editContainer, this.editField, this.styles.invitation, this.styles.focus, this.paddings, this.defaultViewText);
    };
    
    fluid.InlineEdit.prototype.finish = function () {
        finish(this.editContainer, this.editField, this.viewEl, this.finishedEditing, this.defaultViewText,
               this.styles.defaultViewText, this.paddings, this.existingPadding);
    };
    
    fluid.InlineEdit.prototype.defaults = {
        selectors: {
            text: ".text",
            editContainer: ".editContainer",
            edit: ".edit"
        },
        
        styles: {
            invitation: "invitation",
            defaultViewText: "invitation-text",
            focus: "focus"
        },
		
        paddings: {
            edit: 10,
            minimumEdit: 80,
            minimumView: 60
        },
        
        editModeInjector: defaultEditModeInjector,
        
        defaultViewText: "Click here to edit",
        
        useDefaultViewText: true,
        
        selectOnEdit: false
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
