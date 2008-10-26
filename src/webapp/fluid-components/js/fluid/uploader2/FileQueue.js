/*global SWFUpload*/
/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    var byteSize = function (that) {
        var totalBytes = 0;
        for (var i = 0; i < that.files.length; i++) {
            var file = that.files[i];
            totalBytes += file.size;
        }  
        
        return totalBytes;
    };
    
    var removeFile = function (that, file) {
        // Remove the file from the collection and tell the world about it.
        var idx = $.inArray(file, that.files);
        that.files.splice(idx, 1);
    };
    
    fluid.fileQueue = function () {
        var that = {};
        that.files = [];
        
        that.addFile = function (file) {
            that.files.push(file);    
        };
        
        that.removeFile = function (file) {
            removeFile(that, file);
        };
        
        that.byteSize = function () {
            return byteSize(that); 
        };
        
        return that;
    };
    
})(jQuery, fluid_0_6);
