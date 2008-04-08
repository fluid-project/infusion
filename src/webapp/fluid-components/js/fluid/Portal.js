fluid.initPortalReorderer = function (layout, perms, grabHandle, orderChangedCallbackUrl) {
    var portletReordererRoot = fluid.utils.jById (fluid.portletLayout.containerId (layout));

    var items = fluid.portletLayout.createFindItems (layout, perms, grabHandle);

    var lhOptions;
    if (orderChangedCallbackUrl) {
        lhOptions = {
            orderChangedCallbackUrl: orderChangedCallbackUrl
        };
    }

    var layoutHandler = new fluid.PortletLayoutHandler (layout, perms, lhOptions);
    var rOptions = {
        role : fluid.roles.GRID,
        avatarCreator : function (item) {
            return document.createElement ("div");
        }
    };
    
    return new fluid.Reorderer (portletReordererRoot, items, layoutHandler, rOptions);
};