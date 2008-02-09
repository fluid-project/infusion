fluid.initPortalReorderer = function (layout, perms, grabHandle) {
    var portletReordererRoot = fluid.utils.jById (fluid.portletLayout.containerId (layout));

    var items = fluid.portletLayout.createFindItems (layout, perms, grabHandle);
    
    var layoutHandler = new fluid.PortletLayoutHandler (layout, perms);
    
    return new fluid.Reorderer (portletReordererRoot, items, layoutHandler);
};