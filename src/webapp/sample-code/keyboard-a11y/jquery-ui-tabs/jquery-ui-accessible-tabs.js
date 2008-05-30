/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var fluid = fluid || {};

fluid.accessibleTabs =  function () {

    function activateTabHandler (tabsContainer, tabs) {
        return function (elementToActivate) {
            tabsContainer.tabs ('select', tabs.index (elementToActivate));
        };
    }

    return {
        setupTabs: function (tabsId) {
            jQuery("#" + tabsId).tabs ();
        },

        makeTabsKeyNavigable: function (tabsId) {
            var tabsContainer = jQuery("#" + tabsId);
            var tabs = tabsContainer.children("li");

            // Put the tabs container in the tab focus order. Take each tab *out* of the tab order
            // so that they can be navigated with the arrow keys instead of the tab key.
            tabsContainer.tabbable ();

            // Make the tabs selectable:
            //  * Pass in the container for the tabs (the <ul>)--the plugin binds keyboard handlers to this.
            //  * null because we don't want to have any special callbacks during selection
            //  * lastly, the options object allows to simply specify the direction (which defaults to vertical)
            tabs.selectable (tabsContainer, null, {direction: jQuery.a11y.orientation.HORIZONTAL});

            // Make the tabs activatable. Pass in a handler that just calls the standard tabs select function.
            tabs.activatable (activateTabHandler (tabsContainer, tabs));
        },

        addARIA: function (tabsId, panelsId) {
            var tabsContainer = jQuery ("#" + tabsId);
            var tabs = tabsContainer.children ("li");
            var panels = jQuery ("#" + "panels > div");

            tabsContainer.ariaRole ("tablist");
            tabs.ariaRole ("tab");
            panels.ariaRole ("tabpanel");

            // need to add labelledby properties
        },

        initializeTabs: function (tabsId, panelsId) {
            this.setupTabs (tabsId);
            this.makeTabsKeyNavigable (tabsId);
            this.addARIA (tabsId, panelsId);
        }
    };
} ();
