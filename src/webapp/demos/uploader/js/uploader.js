var demo = demo || {};

(function () {
    demo.initUploader = function () {
        fluid.progressiveEnhanceableUploader(".flc-uploader", ".fl-progEnhance-basic", {
            demo: true,                
            uploadManager: {
                type: "fluid.swfUploadManager",        
                options: {
                   // Set the uploadURL to the URL for posting files to your server.
                   uploadURL: "http://myserver.com/uploadFiles",
    
                   // This option points to the location of the SWFUpload Flash object that ships with Fluid Infusion.
                   flashURL: "../../../lib/swfupload/flash/swfupload.swf"
                }
            },
            decorators: [{
                type: "fluid.swfUploadSetupDecorator",
                options: {
                    // This option points to the location of the Browse Files button used with Flash 10 clients.
                    flashButtonImageURL: "../../../components/uploader/images/browse.png"
                }
            }]
        });    
    }
})();


  