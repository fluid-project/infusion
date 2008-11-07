(function ($, fluid) {
    var myScroller;
    
    var scrollBottomHandler = function () {
        return function () {
            myScroller.scrollBottom();
        };
    };
    
    var scrollToHandler = function (textField, list) {
        return function () {
            var elementIdx = textField.val();
            var elementTarget = list.find("li").eq(Number(elementIdx));
            
            myScroller.scrollTo(elementTarget);
        };
    };
    
    var bindButtonHandlers = function () {
        var scrollableList = $("#scrollableList");
        var textField = $("#toElementField");
        var scrollButton = $("#toElementButton");
        var scrollBottomButton = $("#bottomButton");
        
        scrollButton.click(scrollToHandler(textField, scrollableList));
        scrollBottomButton.click(scrollBottomHandler());
    };
    
    $(function () {
        myScroller = fluid.scroller("#scrollableList", {
            selectors: {
                wrapper: ".fluid-scroller-outer"
            }
        });
        bindButtonHandlers();    
    });
})(jQuery, fluid);
