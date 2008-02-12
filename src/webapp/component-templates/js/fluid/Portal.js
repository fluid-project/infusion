fluid.initPortalReorderer = function (layout, perms, grabHandle, orderChangedCallbackUrl) {
    var portletReordererRoot = fluid.utils.jById (fluid.portletLayout.containerId (layout));

    var items = fluid.portletLayout.createFindItems (layout, perms, grabHandle);

    var options;
    if (orderChangedCallbackUrl) {
        options = {
            orderChangedCallbackUrl: orderChangedCallbackUrl
        };
    }

    var layoutHandler = new fluid.PortletLayoutHandler (layout, perms, options);
    
    return new fluid.Reorderer (portletReordererRoot, items, layoutHandler);
};