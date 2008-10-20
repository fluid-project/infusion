/*
Copyright 2008 University of Cambridge
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    var setCaretToStart = function (control) {
        if (control.createTextRange) {
            var range = control.createTextRange();
            range.collapse(true);
            range.select();
        } else if (control.setSelectionRange) {
            control.focus();
            control.setSelectionRange(0, 0);
        }
    };
    
    var setCaretToEnd = function (control) {
        var pos = control.value.length;
        if (control.createTextRange) {
            var range = control.createTextRange();
            range.move("character", pos);
            range.select();
        } else if (control.setSelectionRange) {
            control.focus();
            control.setSelectionRange(pos, pos);
        }
    };
    
    var edit = function (that) {
        var viewEl = that.viewEl;
        var displayText = viewEl.text();
        that.updateModel(displayText === that.options.defaultViewText? "" : displayText);
        that.editField.width(Math.max(viewEl.width() + that.options.paddings.edit, that.options.paddings.minimumEdit));

        viewEl.removeClass(that.options.styles.invitation);
        viewEl.removeClass(that.options.styles.focus);
        viewEl.hide();
        that.editContainer.show();
        if (that.tooltipEnabled()) {
            $("#" + that.options.tooltipId).hide();
        }

        // Work around for FLUID-726
        // Without 'setTimeout' the finish handler gets called with the event and the edit field is inactivated.       
        setTimeout(function () {
            that.editField.focus();
            if (that.options.selectOnEdit) {
                that.editField[0].select();
            }
            else {
                setCaretToEnd(that.editField[0]);
            }
        }, 0);
        that.events.afterBeginEdit.fire();
    };
    
    var finish = function (that) {
        if (that.options.finishedEditing) {
            that.options.finishedEditing(that.editField[0], that.viewEl[0]);
        }
        that.updateModel(that.editField.val());
        that.events.afterFinish.fire();
        
        that.editContainer.hide();
        that.viewEl.show();
    };

    var clearEmptyViewStyles = function (textEl, defaultViewStyle, originalViewPadding) {
        textEl.removeClass(defaultViewStyle);
        textEl.css('padding-right', originalViewPadding);
    };
    
    var showDefaultViewText = function (that) {
        that.viewEl.text(that.options.defaultViewText);
        that.viewEl.addClass(that.options.styles.defaultViewText);
    };

    var showNothing = function (that) {
        that.viewEl.text("");
        
        // workaround for FLUID-938:
        // IE can not style an empty inline element, so force element to be display: inline-block
        if ($.browser.msie) {
            if (that.viewEl.css('display') === 'inline') {
                that.viewEl.css('display', "inline-block");
            }
        }
        
        // If necessary, pad the view element enough that it will be evident to the user.
        if (that.existingPadding < that.options.paddings.minimumView) {
            that.viewEl.css('padding-right',  that.options.paddings.minimumView);
        }
    };

    var showEditedText = function (that) {
        that.viewEl.text(that.model.value);
        clearEmptyViewStyles(that.viewEl, that.options.defaultViewStyle, that.existingPadding);
    };
        
    var refreshView = function (that, source) {
        if (that.model.value) {
            showEditedText(that);
        } else if (that.options.defaultViewText) {
            showDefaultViewText(that);
        } else {
            showNothing(that);
        }
      
        if (that.editField && that.editField.index(source) === -1) {
            that.editField.val(that.model.value);
        }
    };
    
    var updateModel = function (that, newValue, source) {
        var change = that.model.value !== newValue;
        if (change) {
            that.model.value = newValue;
            that.events.modelChanged.fire(newValue);
        }
        that.refreshView(source); // Always render, because of possibility of initial event
    };
    
    var bindHoverHandlers = function (viewEl, invitationStyle) {
        var over = function (evt) {
            viewEl.addClass(invitationStyle);
        };     
        var out = function (evt) {
            viewEl.removeClass(invitationStyle);
        };

        viewEl.hover(over, out);
    };
    
    var makeEditHandler = function (that) {
        return function () {
            var prevent = that.events.onBeginEdit.fire();
            if (prevent) {
                return true;
            }
            edit(that);
            
            return false;
        }; 
    };
    
    var bindMouseHandlers = function (that) {
        bindHoverHandlers(that.viewEl, that.options.styles.invitation);
        that.viewEl.click(makeEditHandler(that));
    };
    
    var bindKeyHighlight = function (viewEl, focusStyle, invitationStyle) {
        var focusOn = function () {
            viewEl.addClass(focusStyle);
            viewEl.addClass(invitationStyle); 
        };
        var focusOff = function () {
            viewEl.removeClass(focusStyle);
            viewEl.removeClass(invitationStyle);
        };
        viewEl.focus(focusOn);
        viewEl.blur(focusOff);
    };
    
    var bindKeyboardHandlers = function (that) {
        that.viewEl.tabbable();
        bindKeyHighlight(that.viewEl, that.options.styles.focus, that.options.styles.invitation);
        that.viewEl.activatable(makeEditHandler(that));
    };
    
    var bindEditFinish = function (that) {
        var finishHandler = function (evt) {
            // Fix for handling arrow key presses. See FLUID-760.
            var code = (evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0));
            if (code !== $.a11y.keys.ENTER) {
                return true;
            }
            
            finish(that);
            that.viewEl.focus();  // Moved here from inside "finish" to fix FLUID-857
            return false;
        };
        that.editContainer.keypress(finishHandler);
    };
    
    var bindBlurHandler = function (that) {
        var blurHandler = function (evt) {
            finish(that);
            return false;
        };
        that.editField.blur(blurHandler);
    };
    
    var aria = function (viewEl, editContainer) {
        viewEl.ariaRole("button");
    };
    
    var setupEditContainer = function (that) {
        // If an edit container is found in the markup, use it. Otherwise generate one based on the view text.
        that.editContainer = that.locate("editContainer");
        if (that.editContainer.length >= 1) {
            var isEditSameAsContainer = that.editContainer.is(that.options.selectors.edit);
            var containerConstraint = isEditSameAsContainer ? that.container : that.editContainer;
            that.editField =  that.locate("edit", containerConstraint);
        } else {
            var editElms = that.options.editModeRenderer(that);
            that.editContainer = editElms.container;
            that.editField = editElms.field;
        }
    };
    
    var defaultEditModeRenderer = function (that) {
        // Template strings.
        var editModeTemplate = "<span><input type='text' class='edit'/></span>";

        // Create the edit container and pull out the textfield.
        var editContainer = $(editModeTemplate);
        var editField = jQuery("input", editContainer);
        
        var componentContainerId = that.container.attr("id");
        // Give the container and textfield a reasonable set of ids if necessary.
        if (componentContainerId) {
            var editContainerId = componentContainerId + "-edit-container";
            var editFieldId = componentContainerId + "-edit";   
            editContainer.attr("id", editContainerId);
            editField.attr("id", editFieldId);
        }
        
        editField.val(that.model.value);
        
        // Inject it into the DOM.
        that.viewEl.after(editContainer);
        
        // Package up the container and field for the component.
        return {
            container: editContainer,
            field: editField
        };
    };
    
    var setupInlineEdit = function (componentContainer, that) {
        that.viewEl = that.locate("text");
        setupEditContainer(that);
        var padding = that.viewEl.css("padding-right");
        that.existingPadding = padding? parseFloat(padding) : 0;
        that.updateModel(that.viewEl.text());
        
        // Add event handlers.
        bindMouseHandlers(that);
        bindKeyboardHandlers(that);
        bindEditFinish(that);
        bindBlurHandler(that);
        
        // Add ARIA support.
        aria(that.viewEl, that.editContainer);
                
        // Hide the edit container to start
        that.editContainer.hide();
        
        // Initialize the tooltip once the document is ready.
        // For more details, see http://issues.fluidproject.org/browse/FLUID-1030
        var initTooltip = function () {
            // Add tooltip handler if required and available
            if (that.tooltipEnabled()) {
                $(componentContainer).tooltip({
                    delay: that.options.tooltipDelay,
                    extraClass: that.options.styles.tooltip,
                    bodyHandler: function () { 
                        return that.options.tooltipText; 
                    },
                    id: that.options.tooltipId
                });
            }
        };
        jQuery(initTooltip);
        
        // Setup any registered decorators for the component.
        that.decorators = fluid.initSubcomponents(that, "componentDecorators", 
            [that, fluid.COMPONENT_OPTIONS]);
    };
    
    /**
     * Creates a whole list of inline editors.
     */
    var setupInlineEdits = function (editables, options) {
        var editors = [];
        editables.each(function (idx, editable) {
            editors.push(fluid.inlineEdit(jQuery(editable), options));
        });
        
        return editors;
    };
    
    /**
     * Instantiates a new Inline Edit component
     * 
     * @param {Object} componentContainer a selector, jquery, or a dom element representing the component's container
     * @param {Object} options a collection of options settings
     */
    fluid.inlineEdit = function (componentContainer, userOptions) {   
        var that = fluid.initView("inlineEdit", componentContainer, userOptions);
       
        /**
         * The current value of the inline editable text. The "model" in MVC terms.
         */
        that.model = {value: ""};
       
        /**
         * Switches to edit mode.
         */
        that.edit = function () {
            edit(that);
        };
        
        /**
         * Finishes editing, switching back to view mode.
         */
        that.finish = function () {
            finish(that);
        };
            
        /**
         * Determines if the tooltip feature is enabled.
         * 
         * @return true if the tooltip feature is turned on, false if not
         */
        that.tooltipEnabled = function () {
            return that.options.useTooltip && $.fn.tooltip;
        };
        
        /**
         * Updates the state of the inline editor in the DOM, based on changes that may have
         * happened to the model.
         * 
         * @param {Object} source
         */
        that.refreshView = function (source) {
            refreshView(that, source);
        };
        
        /**
         * Pushes external changes to the model into the inline editor, refreshing its
         * rendering in the DOM.
         * 
         * @param {Object} newValue
         * @param {Object} source
         */
        that.updateModel = function (newValue, source) {
            updateModel(that, newValue, source);
        };

        setupInlineEdit(componentContainer, that);
        return that;
    };
    
    /**
     * Instantiates a list of InlineEdit components.
     * 
     * @param {Object} componentContainer the element containing the inline editors
     * @param {Object} options configuration options for the components
     */
    fluid.inlineEdits = function (componentContainer, options) {
        options = options || {};
        var selectors = $.extend({}, fluid.defaults("inlineEdits").selectors, options.selectors);
        
        // Bind to the DOM.
        var container = fluid.container(componentContainer);
        var editables = $(selectors.editables, container);
        
        return setupInlineEdits(editables, options);
    };
    
    fluid.defaults("inlineEdit", {  
        selectors: {
            text: ".text",
            editContainer: ".editContainer",
            edit: ".edit"
        },
        
        styles: {
            invitation: "inlineEdit-invitation",
            defaultViewText: "inlineEdit-invitation-text",
            tooltip: "inlineEdit-tooltip",
            focus: "inlineEdit-focus"
        },
        
        events: {
            modelChanged: null,
            onBeginEdit: "preventable",
            afterBeginEdit: null,
            afterFinish: null
        },
        
        paddings: {
            edit: 10,
            minimumEdit: 80,
            minimumView: 60
        },
        
        editModeRenderer: defaultEditModeRenderer,
        
        defaultViewText: "Click here to edit",
        
        tooltipText: "Click item to edit",
        
        tooltipId: "tooltip",
        
        useTooltip: false,
        
        tooltipDelay: 2000,
        
        selectOnEdit: false
    });
    
    
    fluid.defaults("inlineEdits", {
        selectors: {
            editables: ".inlineEditable"
        }
    });
    
})(jQuery, fluid_0_6);
