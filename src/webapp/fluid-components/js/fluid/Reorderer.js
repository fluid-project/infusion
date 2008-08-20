/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 - 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function (jQuery, fluid) {
    
    var defaultAvatarCreator = function(item, cssClass, dropWarning) {
        var avatar = jQuery(item).clone();
        fluid.iterateDom(avatar.get(0), function(node) {
            node.removeAttribute("id");
            if (node.tagName === "input") {
                node.setAttribute("disabled", "disabled");
                }
            }
          );
        avatar.removeAttr("id");
        //jQuery("[id]", avatar).removeAttr("id");
        //jQuery(":hidden", avatar).remove();
        //jQuery("input", avatar).attr("disabled", "true");
        // dropping in the same column fails if the avatar is considered a droppable.
        // droppable ("destroy") should take care of this, but it doesn't seem to remove
        // the class, which is what is checked, so we remove it manually
        // (see http://dev.jquery.com/ticket/2599)
        // 2008-05-12: 2599 has been fixed now in trunk
        //                    avatar.droppable ("destroy");
        avatar.removeClass("ui-droppable");
        avatar.addClass(cssClass);
        
        if (dropWarning) {
            // Will a 'div' always be valid in this position?
            var avatarContainer = jQuery(document.createElement("div"));
            avatarContainer.append(avatar);
            avatarContainer.append(dropWarning);
            return avatarContainer;
        } else {
            return avatar;
        }
    };   
    
    fluid.defaults("fluid.reorderer", {
        containerRole: fluid.roles.LIST,
        instructionMessageId: "message-bundle:",
        styles: {
            defaultStyle: "orderable-default",
            selected: "orderable-selected",
            dragging: "orderable-dragging",
            mouseDrag: "orderable-dragging",
            hover: "orderable-hover",
            dropMarker: "orderable-drop-marker",
            avatar: "orderable-avatar"
            },
        selectors: {
          movables: ".movables",
          grabHandle: ""
        },
        avatarCreator: defaultAvatarCreator,
        keysets: fluid.defaultKeysets,
        layoutHandlerName: "fluid.listLayoutHandler",
        
        mergePolicy: {
          keysets: "replace",
          "selectors.selectables": "selectors.movables",
          "selectors.dropTargets": "selectors.movables"
        }
    });
    
    function firstSelectable (that) {
        var selectables = that.locate("selectables");
        if (selectables.length <= 0) {
            return null;
        }
        return selectables[0];
    }
    
    function bindHandlersToContainer (container, focusHandler, keyDownHandler, keyUpHandler, mouseMoveHandler) {
        container.focus(focusHandler);
        container.keydown(keyDownHandler);
        container.keyup(keyUpHandler);
        container.mousemove(mouseMoveHandler);
        // FLUID-143. Disable text selection for the reorderer.
        // ondrag() and onselectstart() are Internet Explorer specific functions.
        // Override them so that drag+drop actions don't also select text in IE.
        if (jQuery.browser.msie) {
            container[0].ondrag = function () { return false; }; 
            container[0].onselectstart = function () { return false; };
        } 
    }
    
    function addRolesToContainer(that) {
        var first = (that.locate("selectables")[0]);
        if (first) {
            that.container.ariaState("activedescendent", first.id);
        }
        that.container.ariaRole(that.options.containerRole.container);
        that.container.ariaState("multiselectable", "false");
        that.container.ariaState("readonly", "false");
        that.container.ariaState("disabled", "false");
    }
    
    function changeSelectedToDefault(jItem, styles) {
        jItem.removeClass(styles.selected);
        jItem.addClass(styles.defaultStyle);
        jItem.ariaState("selected", "false");
    }
    

    function createAvatarId (parentId) {
        // Generating the avatar's id to be containerId_avatar
        // This is safe since there is only a single avatar at a time
        return parentId + "_avatar";
    }
    
    var adaptKeysets = function (options) {
        if (options.keysets && !(options.keysets instanceof Array)) {
            options.keysets = [options.keysets];    
        }
    };
    
    /**
     * Creates a reorderer
     * 
     * @param {Object} container a selector, jquery, or a dom element representing the component's container
     * @param {Object} options a collection of options settings. See http://wiki.fluidproject.org/x/Woo7 
     */
    fluid.reorderer = function (container, options) {
        var thatReorderer = fluid.initView("fluid.reorderer", container, options);
        
        thatReorderer.layoutHandler = fluid.utils.invokeGlobalFunction(
           thatReorderer.options.layoutHandlerName, [container, thatReorderer.options]);
        
        thatReorderer.activeItem = undefined;

        adaptKeysets(thatReorderer.options);
 
        var kbDropWarning = fluid.utils.jById(thatReorderer.options.dropWarningId);
        var mouseDropWarning;
        if (kbDropWarning) {
            mouseDropWarning = kbDropWarning.clone();
        }
        
        thatReorderer.focusActiveItem = function (evt) {
            // If the active item has not been set yet, set it to the first selectable.
            if (!thatReorderer.activeItem) {
                var first = firstSelectable(thatReorderer);
                if (!first) {  
                    return evt.stopPropagation();
                }
                jQuery(first).focus();
            } else {
                jQuery(thatReorderer.activeItem).focus();
            }
            return evt.stopPropagation();
        };

        var isMove = function (evt) {
            var keysets = thatReorderer.options.keysets;
            for (var i = 0; i < keysets.length; i++) {
                if (keysets[i].modifier(evt)) {
                    return true;
                }
            }
            return false;
        };
        
        var isActiveItemMovable = function () {
            return (jQuery.inArray(thatReorderer.activeItem, thatReorderer.locate("movables")) >= 0);
        };
        
        var setDropEffects = function (value) {
            thatReorderer.dom.fastLocate("dropTargets").ariaState("dropeffect", value);
        };
        
        var styles = thatReorderer.options.styles;
        
        thatReorderer.handleKeyDown = function (evt) {
            if (!thatReorderer.activeItem || (thatReorderer.activeItem !== evt.target)) {
                return true;
            }
            // If the key pressed is ctrl, and the active item is movable we want to restyle the active item.
            var jActiveItem = jQuery(thatReorderer.activeItem);
            if (!jActiveItem.hasClass(styles.dragging) && isMove(evt)) {
               // Don't treat the active item as dragging unless it is a movable.
                if (isActiveItemMovable()) {
                    jActiveItem.removeClass(styles.selected);
                    jActiveItem.addClass(styles.dragging);
                    jActiveItem.ariaState("grab", "true");
                    setDropEffects("move");
                }
                return false;
            }
            // The only other keys we listen for are the arrows.
            return thatReorderer.handleDirectionKeyDown(evt);
        };

        thatReorderer.handleKeyUp = function (evt) {
          
            if (!thatReorderer.activeItem || (thatReorderer.activeItem !== evt.target)) {
                return true;
            }
            var jActiveItem = jQuery(thatReorderer.activeItem);
            
            // Handle a key up event for the modifier
            if (jActiveItem.hasClass(styles.dragging) && !isMove(evt)) {
                if (kbDropWarning) {
                    kbDropWarning.hide();
                }
                jActiveItem.removeClass(styles.dragging);
                jActiveItem.addClass(styles.selected);
                jActiveItem.ariaState("grab", "supported");
                setDropEffects("none");
                return false;
            }
            
            return false;
        };

        var moveItem = function(moveFunc) {
            if (isActiveItemMovable()) {
                moveFunc(thatReorderer.activeItem);
                // refocus on the active item because moving places focus on the body
                thatReorderer.activeItem.focus();
                jQuery(thatReorderer.activeItem).removeClass(thatReorderer.options.styles.selected);
            }
        };
        
        var noModifier = function (evt) {
            return (!evt.ctrlKey && !evt.altKey && !evt.shiftKey && !evt.metaKey);
        };
        
        var moveItemForKeyCode = function (keyCode, keyset, layoutHandler) {
            var didMove = false;
            switch (keyCode) {
                case keyset.up:
                    moveItem(layoutHandler.moveItemUp);
                    didMove = true;
                    break;
                case keyset.down:
                    moveItem(layoutHandler.moveItemDown);
                    didMove = true;
                    break;
                case keyset.left:
                    moveItem(layoutHandler.moveItemLeft);
                    didMove = true;
                    break;
                case keyset.right:
                    moveItem(layoutHandler.moveItemRight);
                    didMove = true;
                    break;
            }
            
            return didMove;
        };
        
        var focusItemForKeyCode = function(keyCode, keyset, layoutHandler, activeItem){
            var didFocus = false;
            var item;
            switch (keyCode) {
                case keyset.up:
                    item = layoutHandler.getItemAbove(activeItem);
                    didFocus = true;
                    break;
                case keyset.down:
                    item = layoutHandler.getItemBelow(activeItem);
                    didFocus = true;
                    break;
                case keyset.left:
                    item = layoutHandler.getLeftSibling(activeItem);
                    didFocus = true;
                    break;
                case keyset.right:
                    item = layoutHandler.getRightSibling(activeItem);
                    didFocus = true;
                    break;
            }
            jQuery(item).focus();
            
            return didFocus;
        };
        
        thatReorderer.handleDirectionKeyDown = function (evt) {
            if (!thatReorderer.activeItem) {
                return true;
            }
            var keysets = thatReorderer.options.keysets;
            for (var i = 0; i < keysets.length; i++) {
                var keyset = keysets[i];
                var didProcessKey = false;
                if (keyset.modifier(evt)) {
                    if (kbDropWarning) {
                        kbDropWarning.hide();
                    }
                    didProcessKey = moveItemForKeyCode(evt.keyCode, keyset, thatReorderer.layoutHandler);
            
                } else if (noModifier(evt)) {
                    didProcessKey = focusItemForKeyCode(evt.keyCode, keyset, thatReorderer.layoutHandler, thatReorderer.activeItem);
                }
                
                // We got the right key press. Bail right away by swallowing the event.
                if (didProcessKey) {
                    return false;
                }
            }
            
            return true;
        };

        // Drag and drop setup code starts here. This needs to be refactored to be better contained.
        var dropMarker;

        var createDropMarker = function (tagName) {
            var dropMarker = jQuery(document.createElement(tagName));
            dropMarker.addClass(thatReorderer.options.styles.dropMarker);
            dropMarker.hide();
            return dropMarker;
        };

        var dragManager = fluid.dragManager();
        // Storing the most recent valid target and drop position to implement correct behaviour for locked modules
        var validTargetAndPos;
        
        fluid.utils.setLogging(true);
        
        /**
         * Creates an event handler for mouse move events that moves, shows and hides the drop marker accordingly
         * @param {Object} dropTargets    a list of valid drop targets
         */
        var createTrackMouse = function(dropTargets) {
            dropTargets = fluid.wrap(dropTargets);
            var avatarId = createAvatarId(thatReorderer.container.id);
           
            return function(evt) {
//                fluid.utils.debug("target " + fluid.dumpEl(evt.target) + " targetOver " + fluid.dumpEl(targetOver) + " X " + evt.clientX + " Y " + evt.pageY);
                
                var target = dragManager.computeTopTarget();
                
                if (target) {
                    //fluid.utils.debug("Computed target: " + fluid.dumpEl(target));
                
                    var position = thatReorderer.layoutHandler.dropPosition(target, thatReorderer.activeItem, evt.clientX, evt.pageY);
                    if (position === fluid.position.DISALLOWED) {
                        if (mouseDropWarning) {
                            mouseDropWarning.show();
                        }
                    } 
                    else {
                        if (mouseDropWarning) {
                            mouseDropWarning.hide();
                        }

                        validTargetAndPos = {
                            target: target,
                            position: position
                        };
                        if (validTargetAndPos.position === fluid.position.BEFORE) {
                            jQuery(target).before(dropMarker);
                        }
                        else if (validTargetAndPos.position === fluid.position.AFTER) {
                            jQuery(target).after(dropMarker);
                        }
                        else if (validTargetAndPos.position === fluid.position.INSIDE) {
                            jQuery(target).append(dropMarker);
                        }
                        dropMarker.show();
                    }
                }
                else {
                    dropMarker.hide();
                    if (mouseDropWarning) {
                        mouseDropWarning.hide();
                    }
                    validTargetAndPos = null;
                }
            };
        };

        /**
         * Takes a jQuery object and adds 'movable' functionality to it
         */
        function initMovable(item) {
            var styles = thatReorderer.options.styles;
            item.addClass(styles.defaultStyle);
            item.ariaState("grab", "supported");

            item.mouseover( 
                function () {
                    thatReorderer.dom.fastLocate("grabHandle", jQuery(item[0])).addClass(styles.hover);
                }
            );
        
            item.mouseout(  
                function () {
                    thatReorderer.dom.fastLocate("grabHandle", jQuery(item[0])).removeClass(styles.hover);
                }
            );
        
            item.draggable ({
                refreshPositions: false,
                scroll: true,
                helper: function () {
                    var dropWarningEl;
                    if (mouseDropWarning) {
                        dropWarningEl = mouseDropWarning[0];
                    }
                    var avatar = jQuery(thatReorderer.options.avatarCreator(item[0], styles.avatar, dropWarningEl));
                    avatar.attr("id", createAvatarId(thatReorderer.container.id));
                    return avatar;
                },
                start: function (e, ui) {
                    item.focus();
                    item.removeClass(thatReorderer.options.styles.selected);
                    item.addClass(thatReorderer.options.styles.mouseDrag);
                    item.ariaState("grab", "true");
                    setDropEffects("move");
                    dragManager.startDrag();
                },
                stop: function(e, ui) {
                    if (validTargetAndPos) {
                        thatReorderer.layoutHandler.mouseMoveItem(this, validTargetAndPos.target, e.clientX, e.pageY, validTargetAndPos.position);
                    }
                    fluid.utils.debug("Drag stopped");
                    item.removeClass(thatReorderer.options.styles.mouseDrag);
                    item.addClass(thatReorderer.options.styles.selected);
                    jQuery(thatReorderer.activeItem).ariaState("grab", "supported");
                    dropMarker.hide();
                    ui.helper = null;
                    validTargetAndPos = null;
                    setDropEffects("none");
                    dragManager.clear();
                    
                    // refocus on the active item because moving places focus on the body
                    thatReorderer.activeItem.focus();
                },
                handle: thatReorderer.dom.fastLocate("grabHandle", item[0])
            });
        }

        /**
         * Takes a jQuery object and a selector that matches movable items
         */
        function initDropTarget (item, selector) {
            
            item.ariaState("dropeffect", "none");

            item.droppable({
                accept: selector,
                greedy: true,
                tolerance: "pointer",
                over: function (e, ui) {
                    dragManager.recordOver(ui.element[0]);
                },
                out: function (e, ui) {
                    dragManager.recordOut(ui.element[0]);
                }
            });
        }
   
        var initSelectables = function () {
            var handleBlur = function (evt) {
                changeSelectedToDefault (jQuery(this), thatReorderer.options.styles);
                return evt.stopPropagation();
            };
        
            var handleFocus = function (evt) {
                thatReorderer.selectItem (this);
                return evt.stopPropagation();
            };
            
            var selectables = thatReorderer.locate("selectables");
            // set up selectables 
            // Remove the selectables from the taborder
            for (var i = 0; i < selectables.length; i++) {
                var item = jQuery(selectables[i]);
                item.tabindex("-1");
                item.blur(handleBlur);
                item.focus(handleFocus);
            
                item.ariaRole(thatReorderer.options.containerRole.item);
                item.ariaState("selected", "false");
                item.ariaState("disabled", "false");
            }
        };
    
        var initItems = function () {
            var movables = thatReorderer.locate("movables");
            var dropTargets = thatReorderer.locate("dropTargets");
            initSelectables();
        
            // Setup movables
            for (var i = 0; i < movables.length; i++) {
                var item = movables[i];
                initMovable(jQuery(item));
            }

            // In order to create valid html, the drop marker is the same type as the node being dragged.
            // This creates a confusing UI in cases such as an ordered list. 
            // drop marker functionality should be made pluggable. 
            if (movables.length > 0) {
                dropMarker = createDropMarker(movables[0].tagName);
            }

            // Create a simple predicate function that will identify items that can be dropped.
            var droppablePredicate = function (potentialDroppable) {
                return (movables.index(potentialDroppable) > -1);    
            };
        
            // Setup dropTargets
            for (i = 0; i < dropTargets.length; i++) {
                initDropTarget(jQuery (dropTargets[i]), droppablePredicate);
            }         
        };

        // Final initialization of the Reorderer at the end of the construction process 
        if (thatReorderer.container) {
            bindHandlersToContainer (thatReorderer.container, 
                thatReorderer.focusActiveItem,
                thatReorderer.handleKeyDown,
                thatReorderer.handleKeyUp,
                createTrackMouse(thatReorderer.locate("dropTargets")));
            addRolesToContainer(thatReorderer);
            // ensure that the Reorderer container is in the tab order
            if (!thatReorderer.container.hasTabindex() || (thatReorderer.container.tabindex() < 0)) {
                thatReorderer.container.tabindex("0");
            }
            initItems();
        }
        
       thatReorderer.selectItem = function (anItem) {
           var styles = thatReorderer.options.styles;
           // Set the previous active item back to its default state.
           if (thatReorderer.activeItem && thatReorderer.activeItem !== anItem) {
               changeSelectedToDefault(jQuery(thatReorderer.activeItem), styles);
           }
           // Then select the new item.
           thatReorderer.activeItem = anItem;
           var jItem = jQuery(anItem);
           jItem.removeClass(styles.defaultStyle);
           jItem.addClass(styles.selected);
           jItem.ariaState("selected", "true");
           thatReorderer.container.ariaState("activedescendent", anItem.id);
           };
           
       thatReorderer.refresh = function() {
           thatReorderer.dom.refresh("grabHandle", thatReorderer.locate("movables"));
           thatReorderer.dom.refresh("dropTargets");
       };
       
       thatReorderer.refresh();
           
       return thatReorderer;
       };
    
    
    var defaultInitOptions = {
        selectors: {}
    };
    
    // Simplified API for reordering lists and grids.
    var simpleInit = function (container, layoutHandlerName, options) {
        options = fluid.utils.merge({}, {}, defaultInitOptions, options);  
        options.layoutHandlerName = layoutHandlerName;
        return fluid.reorderer(container, options);
    };
    
    fluid.reorderList = function (container, options) {
        return simpleInit(container, "fluid.listLayoutHandler", options);
    };
    
    fluid.reorderGrid = function (container, options) {
        return simpleInit(container, "fluid.gridLayoutHandler", options); 
    };
}) (jQuery, fluid);

/*******************
 * Layout Handlers *
 *******************/
(function (jQuery, fluid) {
    // Shared private functions.
    var moveItem = function (item, relatedItemInfo, position, wrappedPosition) {
        var itemPlacement = position;
        if (relatedItemInfo.hasWrapped) {
            itemPlacement = wrappedPosition;
        }
        
        if (itemPlacement === fluid.position.AFTER) {
            jQuery(relatedItemInfo.item).after(item);
        } else {
            jQuery(relatedItemInfo.item).before(item);
        } 
    };
    
    var itemInfoFinders = {
        /*
         * A general get{Left|Right}SiblingInfo() given an item, a list of orderables and a direction.
         * The direction is encoded by either a +1 to move right, or a -1 to
         * move left, and that value is used internally as an increment or
         * decrement, respectively, of the index of the given item.
         */
        getSiblingInfo: function (item, orderables, /* NEXT, PREVIOUS */ direction) {
            var index = jQuery(orderables).index (item) + direction;
            var hasWrapped = false;
                
            // Handle wrapping to 'before' the beginning. 
            if (index === -1) {
                index = orderables.length - 1;
                hasWrapped = true;
            }
            // Handle wrapping to 'after' the end.
            else if (index === orderables.length) {
                index = 0;
                hasWrapped = true;
            } 
            // Handle case where the passed-in item is *not* an "orderable"
            // (or other undefined error).
            //
            else if (index < -1 || index > orderables.length) {
                index = 0;
            }
            
            return {item: orderables[index], hasWrapped: hasWrapped};
        },

        /*
         * Returns an object containing the item that is to the right of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        getRightSiblingInfo: function (item, orderables) {
            return itemInfoFinders.getSiblingInfo(item, orderables, fluid.direction.NEXT);
        },
        
        /*
         * Returns an object containing the item that is to the left of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        getLeftSiblingInfo: function (item, orderables) {
            return itemInfoFinders.getSiblingInfo(item, orderables, fluid.direction.PREVIOUS);
        },
        
        /*
         * Returns an object containing the item that is below the given item in the current grid
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the column that the given item is in. The flag is necessary because when an image is being
         * moved to the resulting item location, the decision of whether or not to insert before or
         * after the item changes if the process wrapped around the column.
         */
        getItemInfoBelow: function (inItem, orderables) {
            var curCoords = jQuery(inItem).offset();
            var i, iCoords;
            var firstItemInColumn, currentItem;
            
            for (i = 0; i < orderables.length; i++) {
                currentItem = orderables [i];
                iCoords = jQuery(orderables[i]).offset();
                if (iCoords.left === curCoords.left) {
                    firstItemInColumn = firstItemInColumn || currentItem;
                    if (iCoords.top > curCoords.top) {
                        return {item: currentItem, hasWrapped: false};
                    }
                }
            }
    
            firstItemInColumn = firstItemInColumn || orderables [0];
            return {item: firstItemInColumn, hasWrapped: true};
        },
        
        /*
         * Returns an object containing the item that is above the given item in the current grid
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the column that the given item is in. The flag is necessary because when an image is being
         * moved to the resulting item location, the decision of whether or not to insert before or
         * after the item changes if the process wrapped around the column.
         */
         getItemInfoAbove: function (inItem, orderables) {
            var curCoords = jQuery(inItem).offset();
            var i, iCoords;
            var lastItemInColumn, currentItem;
            
            for (i = orderables.length - 1; i > -1; i--) {
                currentItem = orderables [i];
                iCoords = jQuery(orderables[i]).offset();
                if (iCoords.left === curCoords.left) {
                    lastItemInColumn = lastItemInColumn || currentItem;
                    if (curCoords.top > iCoords.top) {
                        return {item: currentItem, hasWrapped: false};
                    }
                }
            }
    
            lastItemInColumn = lastItemInColumn || orderables [0];
            return {item: lastItemInColumn, hasWrapped: true};
        }
    
    };
    
    // Public layout handlers.
    fluid.listLayoutHandler = function (container, options) {
        var that = fluid.initView("fluid.listLayoutHandler", container, options);
      
        var orderChangedCallback = function () {};
        var orientation = fluid.orientation.VERTICAL;
        if (options) {
            orderChangedCallback = options.orderChangedCallback || orderChangedCallback;
            orientation = options.orientation || orientation;
        }
        
        that.getGeometricInfo = function () {
          var geometry = {};
        };
        
        that.getRightSibling = function (item) {
            return itemInfoFinders.getRightSiblingInfo(item, that.locate("selectables")).item;
            };
        
        that.moveItemRight = function (item) {
            var rightSiblingInfo = itemInfoFinders.getRightSiblingInfo (item, that.locate("movables"));
            moveItem(item, rightSiblingInfo, fluid.position.AFTER, fluid.position.BEFORE);
            orderChangedCallback(item);
            };
    
        that.getLeftSibling = function (item) {
            return itemInfoFinders.getLeftSiblingInfo(item, that.locate("selectables")).item;
            };
    
        that.moveItemLeft = function (item) {
            var leftSiblingInfo = itemInfoFinders.getLeftSiblingInfo(item, that.locate("movables"));
            moveItem(item, leftSiblingInfo, fluid.position.BEFORE, fluid.position.AFTER);
            orderChangedCallback(item);
            };
    
        that.getItemBelow = that.getRightSibling;
    
        that.getItemAbove = that.getLeftSibling;
        
        that.moveItemUp = that.moveItemLeft;
        
        that.moveItemDown = that.moveItemRight;
    
        that.dropPosition = function (target, moving, x, y) {
            return fluid.utils.mousePosition(target, orientation, x, y);
        };
        
        that.mouseMoveItem = function (moving, target, x, y) {
            var whereTo = this.dropPosition(target, moving, x, y);
            if (whereTo === fluid.position.BEFORE) {
                jQuery(target).before(moving);
            } else if (whereTo === fluid.position.AFTER) {
                jQuery(target).after(moving);
            }
            orderChangedCallback(moving);
        };
        
        return that;
    }; // End ListLayoutHandler
    
    /*
     * Items in the Lightbox are stored in a list, but they are visually presented as a grid that
     * changes dimensions when the window changes size. As a result, when the user presses the up or
     * down arrow key, what lies above or below depends on the current window size.
     * 
     * The GridLayoutHandler is responsible for handling changes to this virtual 'grid' of items
     * in the window, and of informing the Lightbox of which items surround a given item.
     */
    fluid.gridLayoutHandler = function (container, options) {
        var that = fluid.listLayoutHandler(container, options);

        var orderChangedCallback = function () {};
        if (options) {
            orderChangedCallback = options.orderChangedCallback || orderChangedCallback;
        }
        
        var orientation = fluid.orientation.HORIZONTAL;
        
        that.getItemBelow = function(item) {
            return itemInfoFinders.getItemInfoBelow(item, that.locate("selectables")).item;
        };
    
        that.moveItemDown = function (item) {
            var itemBelow = itemInfoFinders.getItemInfoBelow(item, that.locate("movables"));
            moveItem(item, itemBelow, fluid.position.AFTER, fluid.position.BEFORE);
            orderChangedCallback(item);
        };
                
        that.getItemAbove = function (item) {
            return itemInfoFinders.getItemInfoAbove(item, that.locate("selectables")).item;   
        }; 
        
        that.moveItemUp = function (item) {
            var itemAbove = itemInfoFinders.getItemInfoAbove(item, that.locate("movables"));
            moveItem(item, itemAbove, fluid.position.BEFORE, fluid.position.AFTER);
            orderChangedCallback(item);
        };
                    
        // We need to override ListLayoutHandler.dropPosition to ensure that the local private
        // orientation is used.
        that.dropPosition = function (target, moving, x, y) {
            return fluid.utils.mousePosition (target, orientation, x, y);
        };
        return that;
        
    }; // End of GridLayoutHandler

}) (jQuery, fluid);
