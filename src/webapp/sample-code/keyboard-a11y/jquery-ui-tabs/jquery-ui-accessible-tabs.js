/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var fluid = fluid || {};

(function ($) {

    // Private functions.
    var createActiveDescendentHandler = function (tablist) {
        return function (event, ui) {
            tablist.ariaState ("activedescendant", $(ui.tab).parent().attr("id"));
        };
    };
    
    var setupTabs = function (tabsId) {
        $("#" + tabsId).tabs();
    };
    
    // Public API.
    fluid.accessibletabs =  {
        makeTabsKeyNavigable: function (tabsId) {
            var tablist = $("#" + tabsId);
            var tabs = tablist.children("li");

            // Put the tablist in the tab focus order. Take each tab *out* of the tab order
            // so that they can be navigated with the arrow keys instead of the tab key.
            tablist.tabbable ();

            var keyboardSelect = function (tabToSelect) {
                tablist.tabs ('select', tabs.index(tabToSelect));
            };
            
            // Make the tabs selectable:
            //  * Pass in the container for the tabs (the <ul>)--the plugin binds keyboard handlers to this.
            //  * utilize option willSelect: to make the tab actually selected.
            //  * lastly, the options object allows to simply specify the direction (which defaults to vertical)
            tabs.selectable (tablist, {willSelect: keyboardSelect}, {direction: $.a11y.orientation.HORIZONTAL});
        },

        addARIA: function (tabsId, panelsId) {
			var tablist = $("#" + tabsId).tabs();
			var tabs = tablist.children("li");
            var panels = $("#" + "panels > div");

            // Give the container a role of tablist
            tablist.ariaRole("tablist");
            
            // Each tab should have a role of Tab, 
            // and a "position in set" property describing its order within the tab list.
            tabs.each (function(i, tab) {
            	$(tab).ariaRole("tab").ariaState("posinset", i);
            });

            // Give each panel a role of tabpanel
            panels.ariaRole("tabpanel");
            
            // And associate each panel with its tab using the labelledby relation.
			panels.each (function (i, panel) {
				$(panel).ariaState("posinset", i).ariaState("labelledby", panel.id.split("Panel")[0] + "Tab");
			});
			
            // Listen for tab selection and set the tab list's active descendent property.
            tablist.bind("tabsselect", createActiveDescendentHandler(tablist));
        },

        initializeTabs: function (tabsId, panelsId) {
            setupTabs(tabsId);
            this.makeTabsKeyNavigable(tabsId);
            this.addARIA(tabsId, panelsId);
        }
    };
    
    // When the document is loaded, initialize our tabs.
    $(function(){
        fluid.accessibletabs.initializeTabs("tabs", "panels");
    });
}) (jQuery);
