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

/*global fluid*/
fluid = fluid || {};

(function ($, fluid) {
    
    // Is paddings doing what we want? Should it be in the CSS file instead?
    function edit(that) {
        var viewEl = that.viewEl;
        var editField = that.editField;
        var displayText = viewEl.text();
		editField.val(displayText === that.options.defaultViewText ? "" : displayText);
		editField.width(Math.max(viewEl.width() + that.options.paddings.edit, that.options.paddings.minimumEdit));

        viewEl.removeClass(that.options.styles.invitation);
        viewEl.removeClass(that.options.styles.focus);
        viewEl.hide();
        that.editContainer.show();
        if (that.tooltipEnabled()) {
            $("#"+that.options.tooltipId).hide();
        }

        // Work around for FLUID-726
        // Without 'setTimeout' the finish handler gets called with the event and the edit field is inactivated.       
        setTimeout(function () {
            that.editField.focus();
            if (that.options.selectOnEdit) {
                that.editField[0].select();
            }
        }, 0);
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

    function finish(that) {
        if (that.options.finishedEditing) {
          that.options.finishedEditing(that.editField[0], that.viewEl[0]);
        }
        var editVal = that.editField.val();
        if (editVal) {
            showEditedText(editVal, that.viewEl, that.options.defaultViewStyle, that.existingPadding);
        } else if (that.options.defaultViewText) {
            showDefaultViewText(that.options.defaultViewText, that.viewEl, that.options.styles.defaultViewText);
        } else {
            showNothing(that.viewEl, that.options.paddings, that.existingPadding);
        }
        
        that.editContainer.hide();
        that.viewEl.show();
    }
        
    function makeEditHandler(that) {
        return function () {
            edit(that);
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
    
    function mouse(that) {
        bindHoverHandlers(that.viewEl, that.options.styles.invitation);
        that.viewEl.click(makeEditHandler(that));
    }
    
    function bindKeyHighlight(viewEl, focusStyle, invitationStyle) {
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
    }
    
    function keyNav(that) {
        that.viewEl.tabbable();
        bindKeyHighlight(that.viewEl, that.options.styles.focus, that.options.styles.invitation);
        that.viewEl.activatable(makeEditHandler(that));
    } 
    
    function bindEditFinish(that) {
        var finishHandler = function (evt) {
            // Fix for handling arrow key presses see FLUID-760
            var code = (evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0));
            if (code !== $.a11y.keys.ENTER) {
                return true;
            }
            
            finish(that);
            that.viewEl.focus();  // Moved here from inside "finish" to fix FLUID-857
            return false;
        };
        that.editContainer.keypress(finishHandler);
    }
    
    function bindBlurHandler(that) {
        var blurHandler = function (evt) {
            finish(that);
            return false;
        };
      that.editField.blur(blurHandler);
    }
    
    function aria(viewEl, editContainer) {
        viewEl.ariaRole("button");
    }
    
    var mixDefaults = function(that, defaults, options) {
        that.options = {};
        $.extend(that.options, defaults);
        $.extend(that.options, options);
    };
    
    var bindToDom = function (that, container) {
        // Bind to the DOM.
        that.container = fluid.container(container);
        that.viewEl = $(that.options.selectors.text, that.container);

        // If an edit container is found in the markup, use it. Otherwise generate one based on the view text.
        that.editContainer = $(that.options.selectors.editContainer, that.container);
        if (that.editContainer.length >= 1) {
            var isEditSameAsContainer = that.editContainer.is(that.options.selectors.edit);
            var containerConstraint =  isEditSameAsContainer ? that.container : that.editContainer;
            that.editField =  $(that.options.selectors.edit, containerConstraint);
        } else {
            var editElms = that.options.editModeInjector(that.container.attr("id"), that.viewEl);
            that.editContainer = editElms.container;
            that.editField = editElms.field;
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
    
    var setupViewMode = function (that) {
        var displayText = that.viewEl.text();
        that.existingPadding = parseFloat(that.viewEl.css("padding-right"));
        if (!displayText) {
            if (that.options.defaultViewText) {
                showDefaultViewText(that.options.defaultViewText, that.viewEl, 
                    that.options.styles.defaultViewText);
            } else {
                showNothing(that.viewEl, that.options.paddings, that.existingPadding);
            }
        }
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
        
        paddings: {
            edit: 10,
            minimumEdit: 80,
            minimumView: 60
        },
        
        editModeInjector: defaultEditModeInjector,
        
        defaultViewText: "Click here to edit",
        
        tooltipText: "Click item to edit",
        
        tooltipId: "tooltip",
        
        useTooltip: false,
        
        tooltipDelay: 2000,
        
        selectOnEdit: false
    });
    
    var setupInlineEdit = function (componentContainer, that) {
        bindToDom(that, componentContainer);
        setupViewMode(that);
        
        // Add event handlers.
        mouse(that);
        keyNav(that);
        bindEditFinish(that);
        bindBlurHandler(that);
        
        // Add ARIA support.
        aria(that.viewEl, that.editContainer);
                
        // Hide the edit container to start
        that.editContainer.hide();
        
        var initTooltip = function() {
            // Add tooltip handler if required and available
            if (that.tooltipEnabled()) {
              $(componentContainer).tooltip({
                  delay: that.options.tooltipDelay,
                  extraClass: that.options.styles.tooltip,
                  bodyHandler: function () { return that.options.tooltipText; },
                  id: that.options.tooltipId
              });
            }
        };

        // when the document is ready, initialize the tooltip
        // see http://issues.fluidproject.org/browse/FLUID-1030
        jQuery(initTooltip);
    };
    
    
    /**
     * Instantiates a new Inline Edit component
     * 
     * @param {Object} componentContainer a selector, jquery, or a dom element representing the component's container
     * @param {Object} options a collection of options settings
     */
    fluid.inlineEdit = function (componentContainer, userOptions) {
        var that = {};
        // Mix in the user's configuration options.
        that.options = {};
        $.extend(true, that.options, fluid.defaults("inlineEdit"));
        if (userOptions) {
          $.extend(true, that.options, userOptions);
        }
       
        that.edit = function () {
            edit(that);
        };
        
        that.finish = function () {
            finish(that);
        };
            
        that.tooltipEnabled = function() {
            return that.options.useTooltip && $.fn.tooltip;
        };

        setupInlineEdit(componentContainer, that);
        
        return that;
    };
    
    /**
     * A set of inline edit fields.
     */
    var setupInlineEdits = function (editables, options) {
        var editors = [];
        editables.each(function (idx, editable) {
            editors.push(fluid.inlineEdit(jQuery(editable), options));
        });
        
        return editors;
    };

    fluid.inlineEdits = function (componentContainer, options) {
        options = options || {};
        var selectors = $.extend({}, fluid.defaults("inlineEdits").selectors, options.selectors);
        
        // Bind to the DOM.
        var container = fluid.container(componentContainer);
        var editables = $(selectors.editables, container);
        
        return setupInlineEdits(editables, options);
    };
    
    fluid.defaults("inlineEdits", {
        selectors: {
            editables: ".inlineEditable"
        }
    });
})(jQuery, fluid);
