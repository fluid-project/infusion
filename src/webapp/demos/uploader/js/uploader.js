(function () {
    
    var initUploader = function () {
        var myUploader = fluid.progressiveEnhanceableUploader(".flc-uploader", ".fl-progEnhance-basic", {
            demo: true,
            uploadManager: "fluid.swfUploadManager"
        });        
    }
    
    $(document).ready(function () {        
        $("button").bind("click", function () {

            var urlSelector = "../../../components/uploader/html/Uploader.html";
            $(".uploaderUI").load(urlSelector);
        });
    });


})();


  