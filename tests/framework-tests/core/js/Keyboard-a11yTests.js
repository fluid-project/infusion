/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    jqUnit.module("keyboard-a11y");

    // Constants.
    var MENU_SEL = "#menuNoTabIndex";
    var MENU_ITEM_SEL = "#menuItem0,#menuItem1,#menuItem2";
    var FIRST_MENU_ITEM_SEL = "#menuItem0";
    var SECOND_MENU_ITEM_SEL = "#menuItem1";
    var LAST_MENU_ITEM_SEL = "#menuItem2";
    var NON_ITEM_SEL = "#notAMenuItem";
    var LINK_AFTER_SEL = "#linkAfter";

    // Helper functions.
    function getFirstMenuItem() {
        return jQuery(FIRST_MENU_ITEM_SEL);
    }

    function getSecondMenuItem() {
        return jQuery(SECOND_MENU_ITEM_SEL);
    }

    function getLastMenuItem() {
        return jQuery(LAST_MENU_ITEM_SEL);
    }

    function getThirdMenuItem() {
        return getLastMenuItem();
    }

    var setupHandlers = function () {
        var focusHandler = function (element) {
            jQuery(element).addClass("selected");
        };

        var blurHandler = function (element) {
            jQuery(element).removeClass("selected");
        };

        return {
            onSelect: focusHandler,
            onUnselect: blurHandler
        };
    };

    var makeMenuSelectable = function (additionalOptions) {
        var selectionOptions = {
            orientation: fluid.a11y.orientation.HORIZONTAL
        };

        var menuContainer = jQuery(MENU_SEL);
        var menuItems = menuContainer.children(MENU_ITEM_SEL);

        // Make the container tab focussable and the children selectable.
        menuContainer.fluid("tabbable");
        // Mix in any additional options.
        var mergedOptions = jQuery.extend(selectionOptions, additionalOptions, setupHandlers(),
                {selectableElements: menuItems});

        menuContainer.fluid("selectable", mergedOptions);

        return {
            container: menuContainer,
            items: menuItems
        };
    };

    var createAndFocusMenu = function (selectionOptions) {
        var menu = makeMenuSelectable(selectionOptions);
        fluid.focus(menu.container);

        // Sanity check.
        if (!selectionOptions || selectionOptions.autoSelectFirstItem) {
            jqUnit.assertSelected(getFirstMenuItem());
        } else {
            jqUnit.assertNotSelected(getFirstMenuItem());
        }
        jqUnit.assertNotSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());

        return menu;
    };

    var createActivatableMenu = function () {
        var menu = createAndFocusMenu();
        menu.items.fluid("activatable", function (evt) {
            menu.activatedItem = evt.target;
        });

        // Sanity check.
        jqUnit.assertUndefined("The menu wasActivated flag should be undefined to start.", menu.wasActivated);

        return menu;
    };

    function simulateKeyDown(onElement, withKeycode, modifier) {
        var modifiers = {
            ctrl: (modifier === $.ui.keyCode.CTRL) ? true : false,
            shift: (modifier === $.ui.keyCode.SHIFT) ? true : false,
            alt: (modifier === $.ui.keyCode.ALT) ? true : false
        };

        var keyEvent = document.createEvent("KeyEvents");
        keyEvent.initKeyEvent("keydown", true, true, window, modifiers.ctrl, modifiers.alt, modifiers.shift, false, withKeycode, 0);

        onElement = onElement[0];

        onElement.dispatchEvent(keyEvent);
    }

    function selectMiddleChildThenLeaveAndRefocus(menu) {
        // Select the middle child.
        menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getSecondMenuItem());

        // Move focus to another element altogether.
        fluid.blur(getSecondMenuItem());
        var link = jQuery(LINK_AFTER_SEL);
        fluid.focus(link);
        jqUnit.assertNothingSelected();

        // Move focus back to the menu.
        fluid.focus(menu.container);
    }

    // Mix in additional test-specific asserts.
    var extraAsserts = {
        assertNothingSelected: function () {
            this.assertNotSelected(getFirstMenuItem());
            this.assertNotSelected(getSecondMenuItem());
            this.assertNotSelected(getThirdMenuItem());
        },

        assertSelected: function (element) {
            jqUnit.assertTrue("A selected element should have the selected class.", jQuery(element).hasClass("selected"));
        },

        assertNotSelected: function (element) {
            jqUnit.assertFalse("An unselected element should not have the selected class.", jQuery(element).hasClass("selected"));
        },

        assertFirstMenuItemIsSelectedOnFocus: function (menu) {
            // First, check that nothing is selected before we focus the menu.
            this.assertNothingSelected();

            // Then focus the menu container and check that the first item is actually selected.
            fluid.focus(menu.container);
            this.assertSelected(getFirstMenuItem());
        }
    };
    jQuery.extend(jqUnit, extraAsserts);

    jqUnit.test("tabbable()", function () {
        jqUnit.expect(4);
        // Test an element that has no tabindex set.
        var element = jQuery(MENU_SEL);
        element.fluid("tabbable");
        jqUnit.assertEquals("A tabindex of 0 should have been added.", 0, element.fluid("tabindex"));

        // Test an element that already has a tabindex of 0. It should still be there.
        element = jQuery("#containerWithExisting0TabIndex");
        element.fluid("tabbable");
        jqUnit.assertEquals("Tabindex should still be 0.", 0, element.fluid("tabindex"));

        // Test an element that has a positive tabindex. It should remain as-is.
        element = jQuery("#containerWithExistingPositiveTabIndex");
        element.fluid("tabbable");
        jqUnit.assertEquals("Tabindex should remain 1.", 1, element.fluid("tabindex"));

        // Test an element that has a negative tabindex. It should be reset to 0.
        element = jQuery("#containerWithExistingNegativeTabIndex");
        element.fluid("tabbable");
        jqUnit.assertEquals("Tabindex should be reset to 0.", 0, element.fluid("tabindex"));
    });

    jqUnit.test("selectable() sets correct tabindexes", function () {
        var menuContainer = jQuery(MENU_SEL);
        var menuItems = menuContainer.children(MENU_ITEM_SEL);

        // Sanity check.
        jqUnit.assertEquals("There should be three selectable menu items", 3, menuItems.length);

        // Make them selectable; don't worry about direction or custom handlers for now.
        menuContainer.fluid("selectable", {selectableElements: menuItems});

        // Ensure their tabindexes are set to -1, regardless of previous values
        menuItems.each(function (index, item) {
            jqUnit.assertEquals("Each menu item should have a tabindex of -1", -1, $(item).fluid("tabindex"));
        });

        // Just in case, check that the non-selectable child does not have its tabindex set.
        var nonSelectableItem = jQuery(NON_ITEM_SEL);
        jqUnit.assertFalse(nonSelectableItem.fluid("tabindex.has"));
    });

    jqUnit.test("Selects first item when container is focussed by default", function () {
        // Don't specify any options, just use the default behaviour.
        var menu = makeMenuSelectable();
        jqUnit.assertFirstMenuItemIsSelectedOnFocus(menu);
    });

    jqUnit.test("Selects first item when container is focussed--explicit argument", function () {
        // Explicitly set the selectFirstItemOnFocus option.
        var options = {
            autoSelectFirstItem: true
        };
        var menu = makeMenuSelectable(options);
        jqUnit.assertFirstMenuItemIsSelectedOnFocus(menu);
    });

    jqUnit.test("Doesn't select first item when container is focussed--boolean arg", function () {
        var options = {
            autoSelectFirstItem: false
        };

        var menu = makeMenuSelectable(options);
        // First check that nothing is selected before we focus the menu.
        jqUnit.assertNothingSelected();

        // Then focus the container. Nothing should still be selected.
        menu.container.focus();
        jqUnit.assertNothingSelected();

        // Now call selectNext() and assert that the first item is focussed.
        menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getFirstMenuItem());
    });

    jqUnit.test("Doesn't select first item when container is focussed--function arg", function () {
        // Pass in a function that will be called to determine if the first item should be focussed.
        var autoSelectFirstItem = function () {
            return false;
        };

        var options = {
            autoSelectFirstItem: autoSelectFirstItem
        };

        var menu = makeMenuSelectable(options);

        // First check that nothing is selected before we focus the menu.
        jqUnit.assertNothingSelected();

        // Then focus the container.
        // Nothing should still be selected because our predicate function always returns false.
        menu.container.focus();
        jqUnit.assertNothingSelected();
    });

    jqUnit.test("select()", function () {
        var menu = createAndFocusMenu();

        // Select the third item and ensure it was actually selected.
        menu.items.fluid("selectable.select", getThirdMenuItem());
        jqUnit.assertSelected(getThirdMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getSecondMenuItem());

        // Now select the second.
        menu.items.fluid("selectable.select", getSecondMenuItem());
        jqUnit.assertSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());
    });

    // Checks behaviour when a user attempts to select something that wasn't initially denoted as selectable.
    jqUnit.test("Doesn't select non-selectables", function () {
        var menu = createAndFocusMenu();

        // Try selecting something that isn't selectable. Assume things stay the same.
        var nonSelectable = jQuery(NON_ITEM_SEL);
        menu.items.fluid("selectable.select", nonSelectable);
        jqUnit.assertNotSelected(nonSelectable);
        jqUnit.assertSelected(getFirstMenuItem());
    });

    jqUnit.test("Allows selection via programmatic focus() calls.", function () {
        // Setup a menu, then programmatically throw focus onto the selectables. They should be correctly selected.
        var options = {
            autoSelectFirstItem: false
        };
        var menu = createAndFocusMenu(options);

        // Programmatically throw focus onto the first menu item. It should be selected.
        fluid.focus(getThirdMenuItem());
        jqUnit.assertSelected(getThirdMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getSecondMenuItem());

        // Now try another. It should still work.
        fluid.focus(getFirstMenuItem());
        jqUnit.assertSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());

        // Now switch to selection via the plugin API. It should know the current state.
        menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());

        // And finally, switch back to programmatically calling focus.
        fluid.focus(getThirdMenuItem());
        jqUnit.assertSelected(getThirdMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getSecondMenuItem());
    });

    jqUnit.test("selectNext()", function () {
        var menu = createAndFocusMenu();

        // Select the next item.
        menu.container.fluid("selectable.selectNext");

        // Check that the previous item is no longer selected and that the next one is.
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());
    });

    jqUnit.test("selectPrevious()", function () {
        var menu = createAndFocusMenu();

        // Select the next item.
        menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getSecondMenuItem());
        menu.container.fluid("selectable.selectPrevious");

        // Check that the second item is no longer selected and that the first one is.
        jqUnit.assertNotSelected(getSecondMenuItem());
        jqUnit.assertSelected(getFirstMenuItem());
    });

    jqUnit.test("selectNext() with wrapping", function () {
        var menu = makeMenuSelectable();
        fluid.focus(menu.container);

        // Invoke selectNext twice. We should be on the last item.
        for (var x = 0; x < 2; x += 1) {
            menu.container.fluid("selectable.selectNext");
        }
        jqUnit.assertSelected(getLastMenuItem());

        // Now invoke it again. We should be back at the top.
        menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getFirstMenuItem());
    });

    jqUnit.test("selectPrevious() with wrapping", function () {
        var menu = createAndFocusMenu();

        // Select the previous element.
        menu.container.fluid("selectable.selectPrevious");

        // Since we're at the beginning, we should wrap to the last.
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertSelected(getLastMenuItem());
    });

    jqUnit.test("Focus persists after leaving container", function () {
        var menu = createAndFocusMenu();
        selectMiddleChildThenLeaveAndRefocus(menu);

        // Ensure that the middle child still has focus.
        jqUnit.assertSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());
    });

    jqUnit.test("Selection is cleaned up upon blur", function () {
        var menu = createAndFocusMenu();

        // Move focus to another element altogether.
        // Need to simulate browser behaviour by calling blur on the selected item, which is scary.
        var link = $(LINK_AFTER_SEL);
        menu.container.fluid("selectable.currentSelection").blur();
        fluid.focus(link);

        // Now check to see that the item isn't still selected once we've moved focus off the widget.
        jqUnit.assertNotSelected(getFirstMenuItem());

        // And just to be safe, check that nothing is selected.
        jqUnit.assertNothingSelected();
    });

    jqUnit.test("activate()", function () {
        // Tests that we can programmatically activate elements with the default handler.
        var menu = createActivatableMenu();
        getFirstMenuItem().fluid("activate");
        jqUnit.assertEquals("The menu.activatedItem should be set to the first item.", getFirstMenuItem()[0], menu.activatedItem);

        getThirdMenuItem().fluid("activate");
        jqUnit.assertEquals("The menu.activatedItem should be set to the third item.", getThirdMenuItem()[0], menu.activatedItem);
    });

    function guardMozilla() {
        // These tests can only be run on FF, due to reliance on DOM 2 for synthesizing events.
        if (!$.browser.mozilla) {
            jqUnit.expect(0);
            return true;
        }
    }

    jqUnit.test("activate with Enter key", function () {
        if (guardMozilla()) {return;}

        var menu = createActivatableMenu();
        simulateKeyDown(getFirstMenuItem(), $.ui.keyCode.ENTER);
        jqUnit.assertEquals("The menu.activatedItem should be set to the first item.", getFirstMenuItem()[0], menu.activatedItem);
    });

    jqUnit.test("activate with Spacebar", function () {
        if (guardMozilla()) {return;}

        var menu = createActivatableMenu();
        simulateKeyDown(getFirstMenuItem(), $.ui.keyCode.SPACE);
        jqUnit.assertEquals("The menu.activatedItem should be set to the first item.", getFirstMenuItem()[0], menu.activatedItem);
    });

    jqUnit.test("One custom activate binding", function () {
        if (guardMozilla()) {return;}

        var menu = createAndFocusMenu();
        var eventTarget = null;

        var defaultActivate = function () {
            menu.wasActivated = false;
        };

        var alternateActivate = function (evt) {
            menu.wasActivated = true;
            eventTarget = evt.target;
        };

        var downKeyBinding = {
            modifier: null,
            key: $.ui.keyCode.DOWN,
            activateHandler: alternateActivate
        };

        var options = {
            additionalBindings: downKeyBinding
        };

        menu.items.fluid("activatable", [defaultActivate, options]);

        var item = getFirstMenuItem();
        simulateKeyDown(item, $.ui.keyCode.DOWN);
        jqUnit.assertNotUndefined("The menu should have been activated by the down arrow key.", menu.wasActivated);
        jqUnit.assertTrue("The menu should have been activated by the down arrow key.", menu.wasActivated);
        jqUnit.assertEquals("The event target for activation should have been the item ", item[0], eventTarget);
    });

    function makeCustomActivateTest(enabled) {
        jqUnit.test("Multiple custom activate bindings" + (enabled ? "" : " - disabled"), function () {
            if (guardMozilla()) {return;}

            var menu = createAndFocusMenu();

            // Define additional key bindings.
            var downBinding = {
                key: $.ui.keyCode.DOWN,
                activateHandler:  function () {
                    menu.wasActivated = true;
                }
            };

            var upBinding = {
                modifier: $.ui.keyCode.CTRL,
                key: $.ui.keyCode.UP,
                activateHandler: function () {
                    menu.wasActivated = "foo";
                }
            };

            var defaultActivate = function () {
                menu.wasActivated = false;
            };

            var options = {
                additionalBindings: [downBinding, upBinding]
            };

            fluid.activatable(menu.items, defaultActivate, options);

            if (!enabled) {
                fluid.enabled(menu.container, false);
            }

            // Test that the down arrow works.
            simulateKeyDown(getFirstMenuItem(), $.ui.keyCode.DOWN);
            jqUnit.assertEquals("The menu should " + (enabled ? "" : " not ") +
                " have been activated by the down arrow key.", enabled ? true : undefined, menu.wasActivated);

            // Reset and try the other key map.
            menu.wasActivated = false;
            simulateKeyDown(getFirstMenuItem(), $.ui.keyCode.UP, $.ui.keyCode.CTRL);

            jqUnit.assertEquals("The menu should " + (enabled ? "" : " not ") +
                " have been activated by the ctrl key.", enabled ? "foo" : false, menu.wasActivated);
        });
    }

    makeCustomActivateTest(true);
    makeCustomActivateTest(false);

    jqUnit.test("currentSelection", function () {
        var menu = createAndFocusMenu();
        menu.container.fluid("selectable.selectNext");
        var secondMenuItem = getSecondMenuItem();
        jqUnit.assertSelected(secondMenuItem);
        var selectedItem = menu.container.fluid("selectable.currentSelection");
        jqUnit.assertTrue("The current selection should be a jQuery instance.", selectedItem.jquery);
        jqUnit.assertEquals("The current selection should be the second menu item.", secondMenuItem[0], selectedItem[0]);
    });

    jqUnit.test("destructibleList and refresh()", function () {
        var menuContainer = $(MENU_SEL);
        var selThat = $(MENU_SEL).fluid("selectable",
                $.extend({selectableSelector: MENU_ITEM_SEL}, setupHandlers())).that();
        fluid.focus(menuContainer);
        var firstMenuItem = getFirstMenuItem();
        jqUnit.assertSelected(firstMenuItem);
        firstMenuItem.remove();
        selThat.refresh();
        var secondMenuItem = getSecondMenuItem();
        jqUnit.assertSelected(secondMenuItem);
        secondMenuItem.remove();
        selThat.refresh();
        var thirdMenuItem = getThirdMenuItem();
        jqUnit.assertSelected(thirdMenuItem);
    });

    var quickMakeSelectable = function (containerSelector, options) {
        return $(containerSelector).fluid("selectable", options).that();
    };

    jqUnit.test("Leaving container: onLeaveContainer", function () {
        if (guardMozilla()) {return;}

        var wasCalled = false;
        quickMakeSelectable(MENU_SEL, {
            selectableSelector: MENU_ITEM_SEL,
            onLeaveContainer: function () {
                wasCalled = true;
            }
        });
        getFirstMenuItem().focus();

        // When onLeaveContainer is called, it should be invoked when tabbing out of the container.
        simulateKeyDown(getFirstMenuItem(), $.ui.keyCode.TAB);
        jqUnit.assertTrue("On leave is called when tabbing out of the selectables container.",
                          wasCalled);
    });

    jqUnit.test("Leaving container: onUnselect", function () {
        if (guardMozilla()) {return;}

        var wasCalled = false;
        quickMakeSelectable(MENU_SEL, {
            selectableSelector: MENU_ITEM_SEL,
            onUnselect: function () {
                wasCalled = true;
            }
        });
        getFirstMenuItem().focus();

        simulateKeyDown(getFirstMenuItem(), $.ui.keyCode.TAB);
        jqUnit.assertTrue("When onLeaveContainer is not specified, onUnselect should be called instead when tabbing out of the selectables container.",
                          wasCalled);
    });

    jqUnit.test("No-wrap options", function () {
        if (guardMozilla()) {return;}

        var menu = makeMenuSelectable({
            noWrap: true
        });

        menu.items.fluid("selectable.select", getFirstMenuItem());
        simulateKeyDown(getFirstMenuItem(), $.ui.keyCode.UP);
        jqUnit.assertSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getLastMenuItem());

        menu.items.fluid("selectable.select", getLastMenuItem());
        simulateKeyDown(getLastMenuItem(), $.ui.keyCode.DOWN);
        jqUnit.assertSelected(getLastMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());

    });

})(jQuery);
