/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */

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
        var mergedOptions = jQuery.extend(selectionOptions, additionalOptions, setupHandlers(), {selectableElements: menuItems});

        menuContainer.fluid("selectable", mergedOptions);

        return {
            container: menuContainer,
            items: menuItems
        };
    };

    var createAndFocusMenu = async function (selectionOptions) {
        var menu = makeMenuSelectable(selectionOptions);
        await fluid.focus(menu.container);

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

    var createActivatableMenu = async function () {
        var menu = await createAndFocusMenu();
        menu.items.fluid("activatable", function (evt) {
            menu.activatedItem = evt.target;
        });

        // Sanity check.
        jqUnit.assertUndefined("The menu wasActivated flag should be undefined to start.", menu.wasActivated);

        return menu;
    };

    // TODO: This is for mapping keyCodes for IE11
    //       After we drop support for IE11 we should remove this.
    var keyMap = {};
    keyMap[$.ui.keyCode.ENTER] = "Enter";
    keyMap[$.ui.keyCode.DOWN] = "Down";
    keyMap[$.ui.keyCode.UP] = "Up";
    keyMap[$.ui.keyCode.SPACE] = "Spacebar";

    function simulateKeyDown(onElement, keyboardEventInit) {
        var keyEvent;

        if (typeof(KeyboardEvent) === "function") {
            keyEvent = new KeyboardEvent("keydown", keyboardEventInit);
        } else {
            // TODO: This conditional is for handling IE11. After we drop support for IE11 we should remove this
            var modifiers = keyboardEventInit.ctrlKey ? "Control" : "";
            keyEvent = document.createEvent("KeyboardEvent");

            keyEvent.initKeyboardEvent("keydown", true, true, window, keyMap[keyboardEventInit.keyCode], 0, modifiers, !!keyboardEventInit.repeat, "");
        }

        onElement = onElement[0];

        onElement.dispatchEvent(keyEvent);
    }

    async function selectMiddleChildThenLeaveAndRefocus(menu) {
        // Select the middle child.
        await menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getSecondMenuItem());

        // Move focus to another element altogether.
        await fluid.blur(getSecondMenuItem());
        var link = jQuery(LINK_AFTER_SEL);
        await fluid.focus(link);
        jqUnit.assertNothingSelected();

        // Move focus back to the menu.
        await fluid.focus(menu.container);
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

        assertFirstMenuItemIsSelectedOnFocus: async function (menu) {
            // First, check that nothing is selected before we focus the menu.
            this.assertNothingSelected();

            // Then focus the menu container and check that the first item is actually selected.
            await fluid.focus(menu.container);
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

    jqUnit.asyncTest("Selects first item when container is focussed by default", async function () {
        // Don't specify any options, just use the default behaviour.
        var menu = makeMenuSelectable();
        await jqUnit.assertFirstMenuItemIsSelectedOnFocus(menu);

        jqUnit.start();
    });

    jqUnit.asyncTest("Selects first item when container is focussed--explicit argument", async function () {
        // Explicitly set the selectFirstItemOnFocus option.
        var options = {
            autoSelectFirstItem: true
        };
        var menu = makeMenuSelectable(options);
        await jqUnit.assertFirstMenuItemIsSelectedOnFocus(menu);

        jqUnit.start();
    });

    jqUnit.asyncTest("Doesn't select first item when container is focussed--boolean arg", async function () {
        var options = {
            autoSelectFirstItem: false
        };

        var menu = makeMenuSelectable(options);
        // First check that nothing is selected before we focus the menu.
        jqUnit.assertNothingSelected();

        // Then focus the container. Nothing should still be selected.
        menu.container.trigger("focus");
        jqUnit.assertNothingSelected();

        // Now call selectNext() and assert that the first item is focussed.
        await menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getFirstMenuItem());

        jqUnit.start();
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
        menu.container.trigger("focus");
        jqUnit.assertNothingSelected();
    });

    jqUnit.asyncTest("select()", async function () {
        var menu = await createAndFocusMenu();

        // Select the third item and ensure it was actually selected.
        await menu.items.fluid("selectable.select", getThirdMenuItem());
        jqUnit.assertSelected(getThirdMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getSecondMenuItem());

        // Now select the second.
        await menu.items.fluid("selectable.select", getSecondMenuItem());
        jqUnit.assertSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());

        jqUnit.start();
    });

    // Checks behaviour when a user attempts to select something that wasn't initially denoted as selectable.
    jqUnit.asyncTest("Doesn't select non-selectables", async function () {
        var menu = await createAndFocusMenu();

        // Try selecting something that isn't selectable. Assume things stay the same.
        var nonSelectable = jQuery(NON_ITEM_SEL);

        var selectionPromise = menu.items.fluid("selectable.select", nonSelectable);
        var timeoutID = setTimeout(function () {
            jqUnit.assertNotSelected(nonSelectable);
            jqUnit.assertSelected(getFirstMenuItem());
            jqUnit.start();
        }, 200);

        selectionPromise.then(function () {
            clearTimeout(timeoutID);
            jqUnit.fail("Focus should not have fired for a non selectable item.");
            jqUnit.start();
        });
    });

    jqUnit.asyncTest("Allows selection via programmatic focus() calls.", async function () {
        // Setup a menu, then programmatically throw focus onto the selectables. They should be correctly selected.
        var options = {
            autoSelectFirstItem: false
        };
        var menu = await createAndFocusMenu(options);

        // Programmatically throw focus onto the first menu item. It should be selected.
        await fluid.focus(getThirdMenuItem());
        jqUnit.assertSelected(getThirdMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getSecondMenuItem());

        // Now try another. It should still work.
        await fluid.focus(getFirstMenuItem());
        jqUnit.assertSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());

        // Now switch to selection via the plugin API. It should know the current state.
        await menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());

        // And finally, switch back to programmatically calling focus.
        await fluid.focus(getThirdMenuItem());
        jqUnit.assertSelected(getThirdMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getSecondMenuItem());

        jqUnit.start();
    });

    jqUnit.asyncTest("selectNext()", async function () {
        var menu = await createAndFocusMenu();

        // Select the next item.
        await menu.container.fluid("selectable.selectNext");

        // Check that the previous item is no longer selected and that the next one is.
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());

        jqUnit.start();
    });

    jqUnit.asyncTest("selectPrevious()", async function () {
        var menu = await createAndFocusMenu();

        // Select the next item.
        await menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getSecondMenuItem());
        await menu.container.fluid("selectable.selectPrevious");

        // Check that the second item is no longer selected and that the first one is.
        jqUnit.assertNotSelected(getSecondMenuItem());
        jqUnit.assertSelected(getFirstMenuItem());

        jqUnit.start();
    });

    jqUnit.asyncTest("selectNext() with wrapping", async function () {
        var menu = makeMenuSelectable();
        await fluid.focus(menu.container);

        // Invoke selectNext twice. We should be on the last item.
        for (var x = 0; x < 2; x += 1) {
            await menu.container.fluid("selectable.selectNext");
        }
        jqUnit.assertSelected(getLastMenuItem());

        // Now invoke it again. We should be back at the top.
        await menu.container.fluid("selectable.selectNext");
        jqUnit.assertSelected(getFirstMenuItem());

        jqUnit.start();
    });

    jqUnit.asyncTest("selectPrevious() with wrapping", async function () {
        var menu = await createAndFocusMenu();

        // Select the previous element.
        await menu.container.fluid("selectable.selectPrevious");

        // Since we're at the beginning, we should wrap to the last.
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertSelected(getLastMenuItem());

        jqUnit.start();
    });

    jqUnit.asyncTest("Focus persists after leaving container", async function () {
        var menu = await createAndFocusMenu();
        await selectMiddleChildThenLeaveAndRefocus(menu);

        // Ensure that the middle child still has focus.
        jqUnit.assertSelected(getSecondMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getThirdMenuItem());

        jqUnit.start();
    });

    jqUnit.asyncTest("Selection is cleaned up upon blur", async function () {
        var menu = await createAndFocusMenu();

        // Move focus to another element altogether.
        // Need to simulate browser behaviour by calling blur on the selected item, which is scary.
        var link = $(LINK_AFTER_SEL);
        await menu.container.fluid("selectable.currentSelection").trigger("blur");
        await fluid.focus(link);

        // Now check to see that the item isn't still selected once we've moved focus off the widget.
        jqUnit.assertNotSelected(getFirstMenuItem());

        // And just to be safe, check that nothing is selected.
        jqUnit.assertNothingSelected();

        jqUnit.start();
    });

    jqUnit.asyncTest("activate()", async function () {
        // Tests that we can programmatically activate elements with the default handler.
        var menu = await createActivatableMenu();
        getFirstMenuItem().fluid("activate");
        jqUnit.assertEquals("The menu.activatedItem should be set to the first item.", getFirstMenuItem()[0], menu.activatedItem);

        getThirdMenuItem().fluid("activate");
        jqUnit.assertEquals("The menu.activatedItem should be set to the third item.", getThirdMenuItem()[0], menu.activatedItem);

        jqUnit.start();
    });

    jqUnit.asyncTest("activate with Enter key", async function () {
        var menu = await createActivatableMenu();
        simulateKeyDown(getFirstMenuItem(), {keyCode: $.ui.keyCode.ENTER});
        jqUnit.assertEquals("The menu.activatedItem should be set to the first item.", getFirstMenuItem()[0], menu.activatedItem);

        jqUnit.start();
    });

    jqUnit.asyncTest("activate with Spacebar", async function () {
        var menu = await createActivatableMenu();
        simulateKeyDown(getFirstMenuItem(), {keyCode: $.ui.keyCode.SPACE});
        jqUnit.assertEquals("The menu.activatedItem should be set to the first item.", getFirstMenuItem()[0], menu.activatedItem);

        jqUnit.start();
    });

    jqUnit.asyncTest("One custom activate binding", async function () {
        var menu = await createAndFocusMenu();
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
        simulateKeyDown(item, {keyCode: $.ui.keyCode.DOWN});
        jqUnit.assertNotUndefined("The menu should have been activated by the down arrow key.", menu.wasActivated);
        jqUnit.assertTrue("The menu should have been activated by the down arrow key.", menu.wasActivated);
        jqUnit.assertEquals("The event target for activation should have been the item ", item[0], eventTarget);

        jqUnit.start();
    });

    function makeCustomActivateTest(enabled) {
        jqUnit.asyncTest("Multiple custom activate bindings" + (enabled ? "" : " - disabled"), async function () {
            var menu = await createAndFocusMenu();

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
            simulateKeyDown(getFirstMenuItem(), {keyCode: $.ui.keyCode.DOWN});
            jqUnit.assertEquals("The menu should " + (enabled ? "" : " not ") +
                " have been activated by the down arrow key.", enabled ? true : undefined, menu.wasActivated);

            // Reset and try the other key map.
            menu.wasActivated = false;
            simulateKeyDown(getFirstMenuItem(), {keyCode: $.ui.keyCode.UP, ctrlKey: true});

            jqUnit.assertEquals("The menu should " + (enabled ? "" : " not ") +
                " have been activated by the ctrl key.", enabled ? "foo" : false, menu.wasActivated);

            jqUnit.start();
        });
    }

    makeCustomActivateTest(true);
    makeCustomActivateTest(false);

    jqUnit.asyncTest("currentSelection", async function () {
        var menu = await createAndFocusMenu();
        await menu.container.fluid("selectable.selectNext");
        var secondMenuItem = getSecondMenuItem();
        jqUnit.assertSelected(secondMenuItem);
        var selectedItem = menu.container.fluid("selectable.currentSelection");
        jqUnit.assertTrue("The current selection should be a jQuery instance.", selectedItem.jquery);
        jqUnit.assertEquals("The current selection should be the second menu item.", secondMenuItem[0], selectedItem[0]);

        jqUnit.start();
    });

    jqUnit.asyncTest("destructibleList and refresh()", async function () {
        var menuContainer = $(MENU_SEL);
        var selThat = $(MENU_SEL).fluid("selectable", $.extend({selectableSelector: MENU_ITEM_SEL}, setupHandlers()));
        await fluid.focus(menuContainer);
        var firstMenuItem = getFirstMenuItem();
        jqUnit.assertSelected(firstMenuItem);
        firstMenuItem.remove();
        await selThat.refresh();
        var secondMenuItem = getSecondMenuItem();
        jqUnit.assertSelected(secondMenuItem);
        secondMenuItem.remove();
        await selThat.refresh();
        var thirdMenuItem = getThirdMenuItem();
        jqUnit.assertSelected(thirdMenuItem);

        jqUnit.start();
    });

    var quickMakeSelectable = function (containerSelector, options) {
        return $(containerSelector).fluid("selectable", options);
    };

    // Can not test the `onLeaveContainer` event because we are not able to synthesize the `Tab` key.
    jqUnit.test("Leaving container: onUnselect", function () {
        var wasCalled = false;
        quickMakeSelectable(MENU_SEL, {
            selectableSelector: MENU_ITEM_SEL,
            onUnselect: function () {
                wasCalled = true;
            }
        });
        getFirstMenuItem().trigger("focus");
        getFirstMenuItem().trigger("blur");

        jqUnit.assertTrue("When onLeaveContainer is not specified, onUnselect should be called instead when moving focus off of the selectables container.", wasCalled);
    });

    jqUnit.asyncTest("No-wrap options", async function () {
        var menu = makeMenuSelectable({
            noWrap: true
        });

        await menu.items.fluid("selectable.select", getFirstMenuItem());
        simulateKeyDown(getFirstMenuItem(), {keyCode: $.ui.keyCode.UP});
        jqUnit.assertSelected(getFirstMenuItem());
        jqUnit.assertNotSelected(getLastMenuItem());

        await menu.items.fluid("selectable.select", getLastMenuItem());
        simulateKeyDown(getLastMenuItem(), {keyCode: $.ui.keyCode.DOWN});
        jqUnit.assertSelected(getLastMenuItem());
        jqUnit.assertNotSelected(getFirstMenuItem());

        jqUnit.start();
    });

})(jQuery);
