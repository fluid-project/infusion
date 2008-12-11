            $(function () {
                var initDialog = function () {
                    // center dialog
                    $('#dialog_container').css({
                        left: ($(window).width() / 2) - ($('#dialog_container').width() / 2),
                        top: ($(window).height() / 2) - ($('#dialog_container').height() / 2)
                    });
                    // bind close dialog button
                    $("#close_dialog").click(function () {
                        $("#dialog_container").css('display','none');
                    });
                
                    // instantiate component
                    fluid.uiOptions(".ui_options_container");
                };


                $('.skin').click(function () {
                    // ajax call to pull the UI Options dialog into a container
                    $('#dialog_content').load('../../../fluid-components/html/templates/UIOptions.html div.ui_options_container', initDialog);
                    // reveal dialog
                    $("#dialog_container").css('display','block');                    
                });
            });   