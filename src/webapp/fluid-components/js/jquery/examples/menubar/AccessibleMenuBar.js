var fluid = fluid || {};

fluid.accessiblemenubar = function () {
    var wasSubMenuOpen = false;

	var getSubMenuForMenuItem = function (menuItem) {
		return jQuery ("ol", menuItem);
	};

	var isSubMenuOpen = function(menuItem) {
		var subMenu = getSubMenuForMenuItem (menuItem);
	    if (subMenu.hasClass ("closed")) {
	    	return false;
	    }

	    return true;
	};

    var activateSubMenu = function (activeMenuItem) {
        var subMenu = getSubMenuForMenuItem (activeMenuItem);
        subMenu.removeClass ("closed");
    };

	var toggleSubMenu = function (activeMenuItem) {
	    var subMenu = getSubMenuForMenuItem (activeMenuItem);

	    if (subMenu.hasClass ("closed")) {
	        wasSubMenuOpen = true;
	    } else {
	        wasSubMenuOpen = false;
	    }

	    subMenu.toggleClass ("closed");
	};

	var selectElement = function (elementToSelect) {
	    elementToSelect = jQuery (elementToSelect);
	    elementToSelect.addClass ("focussed");

	    if (elementToSelect.hasClass ("menu") && wasSubMenuOpen) {
	        activateSubMenu (elementToSelect);
	    }
	};

	var unselectElement = function (selectedElement) {
		jQuery (selectedElement).removeClass ("focussed");

		// Close the submenu before moving on.
		if (isSubMenuOpen (selectedElement)) {
		   toggleSubMenu (selectedElement);
		   wasSubMenuOpen = true;
		}
	};

	var activateMenuItemHandler = function (menuItem, event) {
		alert (jQuery (menuItem).text () + " was activated.");
	};

    var selectionHandlers = {
       willSelect: selectElement,
       willUnselect: unselectElement,
       // Dummy handler works around a problem where, when focus moves to a child menu,
       // the menu deactivates itself.
       willLeaveContainer: function (selectedElement) { }
    };

    var setupDownKeyMap = function () {
        return {
            key: jQuery.a11y.keys.DOWN,
            activateHandler: function (menuItem) {
                activateSubMenu (menuItem);
            }
        }
    };

	var initializeMenuBar = function (menuBarId) {
	   var menuBar = jQuery("#" + menuBarId);
       // Make sure the menu bar is in the tab order.
       menuBar.tabbable ();

       // Make the top-level menu items selectable. Upon activation, toggle their sub menu visibility.
       var topLevelOptions = {
           direction: jQuery.a11y.orientation.HORIZONTAL
       };

       var activationOptions = {
           additionalBindings: setupDownKeyMap ()
       };

       var topLevelMenuItems = jQuery("#menubar > li");
       topLevelMenuItems.selectable (menuBar, selectionHandlers, topLevelOptions);
       topLevelMenuItems.activatable (toggleSubMenu, activationOptions);
	};

    var initializeMenus = function () {
        // Make the sub menus selectable with up/down arrow keys and activatable with Enter & Space.
        var subMenuOptions = {
            direction: jQuery.a11y.orientation.VERTICAL,
            shouldSelectOnFocus: false,
            rememberSelectionState: false
        };

        var fileMenu = jQuery ("#fileMenu");
        var fileSubMenuItems = jQuery ("a", fileMenu);
        fileSubMenuItems.selectable (fileMenu, selectionHandlers, subMenuOptions);
        fileSubMenuItems.activatable (activateMenuItemHandler);

        var editMenu = jQuery("#editMenu");
        var editSubMenuItems = jQuery("a", editMenu);
        editSubMenuItems.selectable(editMenu, selectionHandlers, subMenuOptions);
        editSubMenuItems.activatable(activateMenuItemHandler);
    };

    return {
        initializeMenuBar: function (menuBarId) {
            initializeMenuBar (menuBarId);
            initializeMenus ();
        }
    }; // End public return.
}(); // End fluid.accessiblemenubar namespace.
