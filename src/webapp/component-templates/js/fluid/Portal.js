fluid.initPortalReorderer = function (layout, perms) {
    var portletReordererRoot = fluid.utils.jById (fluid.portletLayout.containerId (layout));

    // This will be replaced with: 
    // var items = fluid.portletLayout.createFindItems (layout, perms);
    var portletFinder = function () {
        return jQuery ("[id^=portlet]", portletReordererRoot);
    };

    var items = {
        selectables: portletFinder, 
        movables: demo.portal.findMovables,
        dropTargets: portletFinder
    };    
    // end section that will be replaced
    
    var layoutHandler = new fluid.PortletLayoutHandler (layout, perms);
    
    return new fluid.Reorderer (portletReordererRoot, items, layoutHandler);
};