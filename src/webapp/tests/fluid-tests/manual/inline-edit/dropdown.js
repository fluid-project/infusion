var fluid = fluid || {};

(function ($) {
    $(function () {
        
        fluid.selectbox = {};
      
        fluid.selectbox.editModeRenderer = function (that) {
            var id = fluid.allocateSimpleId(that.editField);
            that.editField.selectbox({finishHandler: function () {
                that.finish();
            }});
            return {
                container: that.editContainer,
                field: $("input.selectbox", that.editContainer) 
            };
        };
       
        fluid.selectbox.blurHandlerBinder = function (that) {
            fluid.deadMansBlur(that.editField, $("div.selectbox-wrapper li", that.editContainer),
                function () {
                    that.cancel();
                });
        };
      
        var selectoptions = {
            selectors: {
                edit: "#myselectbox"
            },
            applyEditPadding: false,
            blurHandlerBinder: fluid.selectbox.blurHandlerBinder,
            editModeRenderer: fluid.selectbox.editModeRenderer
        };

        function makeButtons(editor) {
            $(".save", editor.container).click(function () {
                editor.finish();
                return false;
            });
        
            $(".cancel", editor.container).click(function () {
                editor.cancel();
                return false;
            });
        }
        
        var comboeditor = fluid.inlineEdit("#combo-editable", selectoptions);
    });
})(jQuery);

