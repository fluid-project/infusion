fluid.initPortalReorderer = function (layout, perms) {
    var portletReordererRoot = fluid.utils.jById (fluid.portletLayout.containerId (layout));

    var items = fluid.portletLayout.createFindItems (layout, perms);
    
    var layoutHandler = new fluid.PortletLayoutHandler (layout, perms);
    
    return new fluid.Reorderer (portletReordererRoot, items, layoutHandler);
};