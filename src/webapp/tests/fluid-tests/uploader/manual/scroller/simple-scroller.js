(function ($, fluid) {
    var myScroller;
    
    var scrollBottomHandler = function () {
        return function () {
            myScroller.scrollBottom();
        };
    };
    
    var scrollToHandler = function (textField, list) {
        var elementIdx = textField.val();
        var elementTarget = list.find("li").eq(Number(elementIdx));
        
        myScroller.scrollTo(elementTarget);
        textField.focus(); // restore the focus just to make testing easier
    };
    
    var bindEventHandlers = function () {
        var scrollableList = $("#scrollableList");
        var textField = $("#toElementField");
        var scrollButton = $("#toElementButton");
        var scrollBottomButton = $("#bottomButton");
        
        scrollButton.click(function () {
            scrollToHandler(textField, scrollableList);
        });
        textField.keydown(function (key) {
            if (key.which === 13) {
                scrollToHandler(textField, scrollableList);
            }
        });
        scrollBottomButton.click(scrollBottomHandler());
    };
    
    $(function () {
        myScroller = fluid.scroller("#scrollableList", {
            selectors: {
                wrapper: ".fluid-scroller-outer"
            }
        });
        bindEventHandlers();    
    });
})(jQuery, fluid);
