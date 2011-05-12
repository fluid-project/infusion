(function () {
    fluid.registerNamespace("fluid.tests.uploader");
    
    fluid.tests.uploader.mockFormData = function () {
        var that = {
            data: {}
        };
        
        that.resetMock = function () {
            that.data = {};
        };
        
        that.append = function (key, value) {
            that.data[key] = value;
        };
        
        return that;
    };
    
})();