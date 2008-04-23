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
