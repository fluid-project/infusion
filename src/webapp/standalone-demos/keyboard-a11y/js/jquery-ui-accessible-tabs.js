/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/

var fluid = fluid || {};

(function ($) {
    
    var selectOnFocus = false;
    
    // Private functions.
    var makeTabsSelectable = function (tablist) {
        var tabs = tablist.children("li");

        // Put the tablist in the tab focus order. Take each tab *out* of the tab order
        // so that they can be navigated with the arrow keys instead of the tab key.
        fluid.tabbable(tablist);

        // When we're using the Windows style interaction, select the tab as soon as it's focused.
        var selectTab = function (tabToSelect) {
            if (selectOnFocus) {
                tablist.tabs('select', tabs.index(tabToSelect));
            }
        };
        
        // Make the tab list selectable with the arrow keys:
        //  * Pass in the items you want to make selectable.
        //  * Register your onSelect callback to make the tab actually selected.
        //  * Specify the orientation of the tabs (the default is vertical)
        fluid.selectable(tablist, { 
            selectableElements: tabs,
        	onSelect: selectTab,
        	direction: fluid.a11y.orientation.HORIZONTAL
        });
        
        // Use an activation handler if we are using the "Mac OS" style tab interaction.
        // In this case, we shouldn't actually select the tab until the Enter or Space key is pressed.
        fluid.activatable(tablist, function (tabToSelect) {
            if (!selectOnFocus) {
                tablist.tabs('select', tabs.index(tabToSelect));
            }
        });
    };

    var addARIA = function (tablist, panelsId) {
		var tabs = tablist.children("li");
        var panels = $("#" + "panels" + " > div");

        // Give the container a role of tablist
        tablist.attr("role", "tablist");
        
        // Each tab should have a role of Tab, 
        // and a "position in set" property describing its order within the tab list.
        tabs.each (function(i, tab) {
        	$(tab).attr("role", "tab");
        });

        // Give each panel a role of tabpanel
        panels.attr("role", "tabpanel");
        
        // And associate each panel with its tab using the labelledby relation.
        panels.each (function (i, panel) {
            $(panel).attr("aria-labelledby", panel.id.split("Panel")[0] + "Tab");
        });
    };
    
    // Public API.
    fluid.accessibletabs = function (tabsId, panelsId) {
        var tablist = $("#" + tabsId);
        
        // Remove the anchors in the list from the tab order.
        fluid.tabindex(tablist.find("a"), -1);

        // Turn the list into a jQuery UI tabs widget.
        tablist.tabs();
        
        // Make them accessible.
        makeTabsSelectable(tablist);
        addARIA(tablist, panelsId);
    };

    // When the document is loaded, initialize our tabs.
    $(function () {
        selectOnFocus = false;
        
        // Instantiate the tabs widget.
        fluid.accessibletabs("tabs", "panels");
        
        // Bind the select on focus link.
        $("#selectOnFocusLink").click(function (evt) {
            selectOnFocus = !selectOnFocus;
            if (selectOnFocus) {
                $(evt.target).text("Enabled");
            } else {
                $(evt.target).text("Disabled");
            }
            
            return false;
        });
    });
    
}) (jQuery);
