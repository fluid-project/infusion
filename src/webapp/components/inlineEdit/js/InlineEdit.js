/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2010 University of Toronto
Copyright 2008-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid_1_2, document, setTimeout*/

fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
    
    function sendKey(control, event, virtualCode, charCode) {
        var kE = document.createEvent("KeyEvents");
        kE.initKeyEvent(event, 1, 1, null, 0, 0, 0, 0, virtualCode, charCode);
        control.dispatchEvent(kE);
    }
    
    /** Set the caret position to the end of a text field's value, also taking care
     * to scroll the field so that this position is visible.
     * @param {DOM node} control The control to be scrolled (input, or possibly textarea)
     * @param value The current value of the control
     */
    fluid.setCaretToEnd = function (control, value) {
        var pos = value? value.length : 0;

        try {
            control.focus();
        // see http://www.quirksmode.org/dom/range_intro.html - in Opera, must detect setSelectionRange first, 
        // since its support for Microsoft TextRange is buggy
            if (control.setSelectionRange) {

                control.setSelectionRange(pos, pos);
                if ($.browser.mozilla && pos > 0) {
                  // ludicrous fix for Firefox failure to scroll to selection position, inspired by
                  // http://bytes.com/forum/thread496726.html
                    sendKey(control, "keypress", 92, 92); // type in a junk character
                    sendKey(control, "keydown", 8, 0); // delete key must be dispatched exactly like this
                    sendKey(control, "keypress", 8, 0);
                }
            }

            else if (control.createTextRange) {
                var range = control.createTextRange();
                range.move("character", pos);
                range.select();
            }
        }
        catch (e) {} 
    };
    
    fluid.deadMansBlur = function (control, exclusions, handler) {
        var blurPending = false;
        $(control).blur(function () {
            blurPending = true;
            setTimeout(function () {
                if (blurPending) {
                    handler(control);
                }
            }, 150);
        });
        var canceller = function () {
            blurPending = false; 
        };
        exclusions.focus(canceller);
        exclusions.click(canceller);
    };
    
    var renderEditContainer = function (that, really) {
        // If an edit container is found in the markup, use it. Otherwise generate one based on the view text.
        that.editContainer = that.locate("editContainer");
        that.editField = that.locate("edit");
        if (that.editContainer.length !== 1) {
            if (that.editField.length === 1) {
                // if all the same we found a unique edit field, use it as both container and field (FLUID-844) 
                that.editContainer = that.editField;
            }
            else if (that.editContainer.length > 1) {
                fluid.fail("InlineEdit did not find a unique container for selector " + that.options.selectors.editContainer +
                   ": " + fluid.dumpEl(that.editContainer));
            }
        }
        if (that.editContainer.length === 1 && !that.editField) {
            that.editField = that.locate("edit", that.editContainer);
        }
        if (!really) {return; } // do not invoke the renderer, unless this is the "final" effective time
        var editElms = that.options.editModeRenderer(that);
        if (editElms) {
            that.editContainer = editElms.container;
            that.editField = editElms.field;
        }
        
        if (that.editField.length === 0) {
            fluid.fail("InlineEdit improperly initialised - editField could not be located (selector " + that.options.selectors.edit + ")");
        }
    };
    
    var switchToViewMode = function (that) {    
        that.editContainer.hide();
        that.viewEl.show();
    };
    
    var cancel = function (that) {
        if (that.isEditing()) {
            // Roll the edit field back to its old value and close it up.
            // This setTimeout is necessary on Firefox, since any attempt to modify the 
            // input control value during the stack processing the ESCAPE key will be ignored.
            setTimeout(function () {
               that.editView.value(that.model.value);}, 1);
            switchToViewMode(that);
            that.events.afterFinishEdit.fire(that.model.value, that.model.value, 
                that.editField[0], that.viewEl[0]);
        }
    };
    
    var finish = function (that) {
        var newValue = that.editView.value();
        var oldValue = that.model.value;

        var viewNode = that.viewEl[0];
        var editNode = that.editField[0];
        var ret = that.events.onFinishEdit.fire(newValue, oldValue, editNode, viewNode);
        if (ret === false) {
            return;
        }
        
        that.updateModelValue(newValue);
        that.events.afterFinishEdit.fire(newValue, oldValue, editNode, viewNode);
        
        switchToViewMode(that);
    };
    
    var bindEditFinish = function (that) {
        if (that.options.submitOnEnter === undefined) {
            that.options.submitOnEnter = "textarea" !== fluid.unwrap(that.editField).nodeName.toLowerCase();
        }
        function keyCode(evt) {
            // Fix for handling arrow key presses. See FLUID-760.
            return evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0);          
        }
        var escHandler = function (evt) {
            var code = keyCode(evt);
            if (code === $.ui.keyCode.ESCAPE) {
                cancel(that);
                return false;
            }
        };
        var finishHandler = function (evt) {
            var code = keyCode(evt);
            if (code !== $.ui.keyCode.ENTER) {
                return true;
            }
            
            finish(that);
            that.viewEl.focus();  // Moved here from inside "finish" to fix FLUID-857
            return false;
        };
        if (that.options.submitOnEnter) {
            that.editContainer.keypress(finishHandler);
        }
        that.editContainer.keydown(escHandler);
    };

    var bindBlurHandler = function (that) {
        if (that.options.blurHandlerBinder) {
            that.options.blurHandlerBinder(that);
        }
        else {
            var blurHandler = function (evt) {
                if (that.isEditing()) {
                    finish(that);
                }
                return false;
            };
            that.editField.blur(blurHandler);
        }
    };

    // setup tooltip with aria for edit mode
    var setupKeyboardTooltip = function (that) {
        var editModeDescribedBy = $("<p></p>");
        var id = fluid.allocateSimpleId(editModeDescribedBy);
        
        editModeDescribedBy.addClass(that.options.styles.keyboardTooltip);
        editModeDescribedBy.text(that.options.strings.editModeTooltip);
        that.editContainer.append(editModeDescribedBy);
        that.editField.attr("aria-describedby", id);            

        that.editField.focusin(function () {
            editModeDescribedBy.show();    
        });
        that.editField.focusout(function () {
            editModeDescribedBy.hide();
        });

        editModeDescribedBy.position({
            my: "left",
            at: "left bottom",
            collision: "fit",
            offset: "0 15",
            of: that.editField
        });
    };
    
    var initializeEditView = function (that, initial) {
        if (!that.editInitialized) { 
            renderEditContainer(that, !that.options.lazyEditView || !initial);
            
            if (that.options.renderKeyboardTooltip) {
                setupKeyboardTooltip(that);
            }
            
            if (!that.options.lazyEditView || !initial) {
                that.editView = fluid.initSubcomponent(that, "editView", that.editField);
                
                $.extend(true, that.editView, fluid.initSubcomponent(that, "editAccessor", that.editField));
        
                bindEditFinish(that);
                bindBlurHandler(that);
                that.editView.refreshView(that);
                that.editInitialized = true;
            }
        }
    };
    
    var edit = function (that) {
        initializeEditView(that, false);
      
        var viewEl = that.viewEl;
        var displayText = that.displayView.value();
        that.updateModelValue(that.model.value === "" ? "" : displayText);
        if (that.options.applyEditPadding) {
            that.editField.width(Math.max(viewEl.width() + that.options.paddings.edit, that.options.paddings.minimumEdit));
        }

        viewEl.removeClass(that.options.styles.invitation);
        viewEl.removeClass(that.options.styles.focus);
        viewEl.hide();
        
        that.editContainer.show();                  

        // Work around for FLUID-726
        // Without 'setTimeout' the finish handler gets called with the event and the edit field is inactivated.       
        setTimeout(function () {
            that.editField.focus();
            fluid.setCaretToEnd(that.editField[0], that.editView.value());
            if (that.options.selectOnEdit) {
                that.editField[0].select();
            }
        }, 0);
        that.events.afterBeginEdit.fire();
    };

    var clearEmptyViewStyles = function (textEl, defaultViewStyle, originalViewPadding) {
        textEl.removeClass(defaultViewStyle);
        textEl.css('padding-right', originalViewPadding);
    };
    
    var showDefaultViewText = function (that) {
        that.displayView.value(that.options.defaultViewText);
        that.viewEl.css('padding-right', that.existingPadding);
        that.viewEl.addClass(that.options.styles.defaultViewStyle);
    };

    var showNothing = function (that) {
        that.displayView.value("");
        
        // workaround for FLUID-938:
        // IE can not style an empty inline element, so force element to be display: inline-block
        if ($.browser.msie) {
            if (that.viewEl.css('display') === 'inline') {
                that.viewEl.css('display', "inline-block");
            }
        }
    };

    var showEditedText = function (that) {
        that.displayView.value(that.model.value);
        clearEmptyViewStyles(that.viewEl, that.options.styles.defaultViewStyle, that.existingPadding);
    };
    
    var refreshView = function (that, source) {
        that.displayView.refreshView(that, source);
        if (that.editView) {
            that.editView.refreshView(that, source);
        }
    };
    
    var initModel = function (that, value) {
        that.model.value = value;
        that.refreshView();
    };
    
    var updateModelValue = function (that, newValue, source) {
        var comparator = that.options.modelComparator;
        var unchanged = comparator ? comparator(that.model.value, newValue) : 
            that.model.value === newValue;
        if (!unchanged) {
            var oldModel = $.extend(true, {}, that.model);
            that.model.value = newValue;
            that.events.modelChanged.fire(that.model, oldModel, source);
            that.refreshView(source);
        }
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
            if (prevent === false) {
                return false;
            }
            edit(that);
            
            return true;
        }; 
    };
    
    function makeEditTriggerGuard(that) {
        var viewEl = fluid.unwrap(that.viewEl);
		var button = fluid.unwrap(that.textEditButton);

		return function (event) {
                  // FLUID-2017 - avoid triggering edit mode when operating standard HTML controls. Ultimately this
                  // might need to be extensible, in more complex authouring scenarios.
            var outer = fluid.findAncestor(event.target, function (elem) {
                if (/input|select|textarea|button|a/i.test(elem.nodeName) || elem === viewEl) {return true; }
            });
            if (outer === viewEl || outer === button) {
                that.edit();
                return false;
            }
        };
    }
    
    var bindMouseHandlers = function (that) {
        var triggerGuard = makeEditTriggerGuard(that);
        bindHoverHandlers(that.viewEl, that.options.styles.invitation);
        that.viewEl.click(makeEditTriggerGuard(that));
        that.textEditButton.click(function (e) {
            triggerGuard(e);
            return false;   
        });    
    };    
    
    var bindKeyboardHandlers = function (that) {
        var guard = makeEditTriggerGuard(that);
        fluid.activatable(that.textEditButton, function (event) {
            return guard(event);
        });
    };
    
    var bindHighlightHandler = function (viewEl, textEditButton, focusStyle, invitationStyle) {
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
        textEditButton.focus(focusOn);
        textEditButton.blur(focusOff);
    };    
    
	var aria = function (textEditButton) {
	    textEditButton.attr("role", "button");
	};
    
    var defaultEditModeRenderer = function (that) {
        if (that.editContainer.length > 0 && that.editField.length > 0) {
            return {
                container: that.editContainer,
                field: that.editField
            };
        }
        // Template strings.
        var editModeTemplate = "<span><input type='text' class='flc-inlineEdit-edit'/></span>";
        
        // Create the edit container and pull out the textfield.
        var editContainer = $(editModeTemplate);
        var editField = $("input", editContainer);
        editField.addClass(that.options.styles.edit);
        
        var componentContainerId = that.container.attr("id");
        // Give the container and textfield a reasonable set of ids if necessary.
        if (componentContainerId) {
            var editContainerId = componentContainerId + "-edit-container";
            var editFieldId = componentContainerId + "-edit";   
            editContainer.attr("id", editContainerId);
            editField.attr("id", editFieldId);
        }
        
        // Inject it into the DOM.
        that.viewEl.after(editContainer);
        
        // Package up the container and field for the component.
        return {
            container: editContainer,
            field: editField
        };
    };
    
    var updateEditButtonAltText = function (editButtonImage, model, strings) {
        var buttonAlt = fluid.stringTemplate(strings.textEditButton, {
            text: model.value
        });
        editButtonImage.attr("alt", buttonAlt);
    };
    
    var defaultTextEditButtonRenderer = function (that) {
        var opts = that.options;
        var textEditButton = that.locate("textEditButton");
        
        if  (textEditButton.length === 0) {
            var markup = $("<a href='#_' class='flc-inlineEdit-textEditButton'><img src'' /></a>");
            var img = $("img", markup);

            img.attr("src", opts.urls.textEditButtonImage);
            
            // Set the alt text for the button and
            // listen for modelChanged to keep it updated
            updateEditButtonAltText(img, that.model, opts.strings);
            that.events.modelChanged.addListener(function () {
                updateEditButtonAltText(img, that.model, that.options.strings);
            });
            
            that.locate("text").after(markup);
            
            // Refresh the textEditButton with the newly appended options
            textEditButton = that.locate("textEditButton");
        } 
        textEditButton.addClass(opts.styles.textEditButton);
        
        return textEditButton;
    };
    
    var makeIsEditing = function (that) {
        var isEditing = false;
        that.textEditButton = that.locate("textEditButton");
        
        that.events.onBeginEdit.addListener(function () {
            isEditing = true;
            that.textEditButton.hide();
        });
        that.events.afterFinishEdit.addListener(function () {
            isEditing = false; 
            that.textEditButton.show();
            
            // Allow textEditButton to regain focus upon completion. 
            that.textEditButton.focus(0);
        });
        return function () {return isEditing;};
    };
    
    var setTooltipTitle = function (element, title) {
        fluid.wrap(element).attr("title", title);
    };
    
    // Initialize the tooltip once the document is ready.
    // For more details, see http://issues.fluidproject.org/browse/FLUID-1030
    var initTooltips = function (that) {
        var tooltipOptions = {
            delay: that.options.tooltipDelay,
            extraClass: that.options.styles.tooltip,
            bodyHandler: function () { 
                return that.options.tooltipText; 
            },
            id: that.options.tooltipId,
            showURL: false                        
        };
        
        that.viewEl.tooltip(tooltipOptions);
        that.textEditButton.tooltip(tooltipOptions);
    };
    
    var setupInlineEdit = function (componentContainer, that) {
        var padding = that.viewEl.css("padding-right");
        that.existingPadding = padding? parseFloat(padding) : 0;
        that.viewEl.addClass(that.options.styles.text);

        /*
         *  Remove the display from the tab order to prevent users to think they
         *  are able to access the inline edit field, but they cannot since the 
         *  keyboard event binding is only on the button.
         */
        that.viewEl.attr("tabindex", "-1");
        setTooltipTitle(that.viewEl, that.options.tooltipText);

        initModel(that, that.displayView.value());

        that.textEditButton = that.options.textEditButtonRenderer(that); 
        setTooltipTitle(that.textEditButton, that.options.tooltipText);
        
        // Add event handlers.
        bindMouseHandlers(that);
        bindKeyboardHandlers(that);
        
        bindHighlightHandler(that.viewEl, that.textEditButton, that.options.styles.focus, that.options.styles.invitation);
                        
        // Hide the edit container to start
        if (that.editContainer) {
            that.editContainer.hide();
        }
        
        // Add tooltip handler if required and available
        if (that.tooltipEnabled()) {
            initTooltips(that);
        }
        
        // Setup any registered decorators for the component.
        that.decorators = fluid.initSubcomponents(that, "componentDecorators", 
            [that, fluid.COMPONENT_OPTIONS]);
        
        aria(that.textEditButton);
    };
    
    /**
     * Creates a whole list of inline editors.
     */
    var setupInlineEdits = function (editables, options) {
        var editors = [];
        editables.each(function (idx, editable) {
            editors.push(fluid.inlineEdit($(editable), options));
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
       
        that.viewEl = that.locate("text");
        that.displayView = fluid.initSubcomponent(that, "displayView", that.viewEl);
        $.extend(true, that.displayView, fluid.initSubcomponent(that, "displayAccessor", that.viewEl));

        /**
         * The current value of the inline editable text. The "model" in MVC terms.
         */
        that.model = {value: ""};
       
        /**
         * Switches to edit mode.
         */
        that.edit = makeEditHandler(that);
        
        /**
         * Determines if the component is currently in edit mode.
         * 
         * @return true if edit mode shown, false if view mode is shown
         */
        that.isEditing = makeIsEditing(that);
        
        /**
         * Finishes editing, switching back to view mode.
         */
        that.finish = function () {
            finish(that);
        };

        /**
         * Cancels the in-progress edit and switches back to view mode.
         */
        that.cancel = function () {
            cancel(that);
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
         * rendering in the DOM. The modelChanged event will fire.
         * 
         * @param {String} newValue The bare value of the model, that is, the string being edited
         * @param {Object} source An optional "source" (perhaps a DOM element) which triggered this event
         */
        that.updateModelValue = function (newValue, source) {
            updateModelValue(that, newValue, source);
        };
        
        /**
         * Pushes external changes to the model into the inline editor, refreshing its
         * rendering in the DOM. The modelChanged event will fire.
         * 
         * @param {Object} newValue The full value of the new model, that is, a model object which contains the editable value as the element named "value"
         * @param {Object} source An optional "source" (perhaps a DOM element) which triggered this event
         */
        that.updateModel = function (newModel, source) {
            updateModelValue(that, newModel.value, source);
        };
        
        initializeEditView(that, true);
        setupInlineEdit(componentContainer, that);
        
        return that;
    };
    
    
    fluid.inlineEdit.standardAccessor = function (element) {
        var nodeName = element.nodeName.toLowerCase();
        var func = "input" === nodeName || "textarea" === nodeName? "val" : "text";
        return {
            value: function (newValue) {
                return $(element)[func](newValue);
            }
        };
    };
    
    fluid.inlineEdit.richTextViewAccessor = function (element) {
        return {
            value: function (newValue) {
                return $(element).html(newValue);
            }
        };
    };
    
    fluid.inlineEdit.standardDisplayView = function (viewEl) {
        var that = {
            refreshView: function (componentThat, source) {
                if (componentThat.model.value) {
                    showEditedText(componentThat);
                } else if (componentThat.options.defaultViewText) {
                    showDefaultViewText(componentThat);
                } else {
                    showNothing(componentThat);
                }
                // If necessary, pad the view element enough that it will be evident to the user.
                if (($.trim(componentThat.viewEl.text()).length === 0) &&
                    (componentThat.existingPadding < componentThat.options.paddings.minimumView)) {
                    componentThat.viewEl.css('padding-right', componentThat.options.paddings.minimumView);
                }
            }
        };
        return that;
    };
    
    fluid.inlineEdit.standardEditView = function (editField) {
        var that = {
            refreshView: function (componentThat, source) {
                if (!source || componentThat.editField && componentThat.editField.index(source) === -1) {
                    componentThat.editView.value(componentThat.model.value);
                }
            }
        };
        $.extend(true, that, fluid.inlineEdit.standardAccessor(editField));
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
            text: ".flc-inlineEdit-text",
            editContainer: ".flc-inlineEdit-editContainer",
            edit: ".flc-inlineEdit-edit",
            textEditButton: ".flc-inlineEdit-textEditButton"
        },
        
        styles: {
            text: "fl-inlineEdit-text",
            edit: "fl-inlineEdit-edit",
            invitation: "fl-inlineEdit-invitation",
            defaultViewStyle: "fl-inlineEdit-invitation-text",
            tooltip: "fl-inlineEdit-tooltip",
            keyboardTooltip: "fl-inlineEdit-keyboardTooltip",
            focus: "fl-inlineEdit-focus",
            textEditButton: "fl-inlineEdit-text"
        },
        
        events: {
            modelChanged: null,
            onBeginEdit: "preventable",
            afterBeginEdit: null,
            onFinishEdit: "preventable",
            afterFinishEdit: null,
            afterInitEdit: null
        },

        strings: {
            textEditButton: "Edit text %text",
            editModeTooltip: "Escape to cancel, Enter or Tab when finished"
        },
        
        paddings: {
            edit: 10,
            minimumEdit: 80,
            minimumView: 60
        },
        
        applyEditPadding: true,
        
        blurHandlerBinder: null,
        
        // set this to true or false to cause unconditional submission, otherwise it will
        // be inferred from the edit element tag type.
        submitOnEnter: undefined,
        
        modelComparator: null,
        
        displayAccessor: {
            type: "fluid.inlineEdit.standardAccessor"
        },
        
        displayView: {
            type: "fluid.inlineEdit.standardDisplayView"
        },
        
        editAccessor: {
            type: "fluid.inlineEdit.standardAccessor"
        },
        
        editView: {
            type: "fluid.inlineEdit.standardEditView"
        },
        
        textEditButtonRenderer: defaultTextEditButtonRenderer,
        
        editModeRenderer: defaultEditModeRenderer,
        
        lazyEditView: false,
        
        defaultViewText: "Click here to edit",
        
        tooltipText: "Select or press Enter to edit",
        
        tooltipId: "tooltip",
        
        useTooltip: true,
        
        tooltipDelay: 1000,
        
        selectOnEdit: false,
        
        renderKeyboardTooltip: true,
        
        urls: {
            textEditButtonImage: "../images/edit_icon-01.png"
        }
    });
    
    
    fluid.defaults("inlineEdits", {
        selectors: {
            editables: ".flc-inlineEditable"
        }
    });
    
})(jQuery, fluid_1_2);
