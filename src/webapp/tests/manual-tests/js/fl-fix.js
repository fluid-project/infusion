var demo = demo || {};

(function ($) {
    var updateTitle = function (that, title) {
        that.locate("styleTitle").text(title);
    };
    
    var changeStyle = function (that, eventObj) {
        var styledElm = that.locate("styledElement");
        var val = that.locate("stylePicker").children(":selected").attr("value");
        // var val = $("option:selected", that.locate()).attr("value");
        var styleModel = that.model[val];
        styledElm.attr("class", that.initialClass);
        styledElm.addClass(styleModel.className);
        updateTitle(that, styleModel.title);
    };
    
    var bindEvents = function (that) {
        that.locate("stylePicker").change(function (eventObj) {
            console.log(eventObj);
            changeStyle(that, eventObj);
        });
    };
    
    var saveInitialClasses = function (that) {
        that.initialClass = that.locate("styledElement").attr("class");
    };
    
    var setup = function (that) {
        saveInitialClasses(that);
        bindEvents(that);
    };
    
    demo.cssFixApplier = function (container, options) {
        var that = fluid.initView("demo.cssFixApplier", container, options);
        
        that.model = that.options.model;
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("demo.cssFixApplier", {
        selectors: {
            stylePicker: "#cssFixes",
            styledElement: "#styledElement",
            styleTitle: ".title"
        },
        
        model: {
            none: {
                title: "No Fix",
                className: ""
            },
            fss: {
                title: "FSS: .fl-fix",
                className: "fl-fix"
            },
            jquery: {
                title: "jQuery: .ui-helper-clearfix",
                className: "ui-helper-clearfix"
            },
            newClearfix: {
                title: "New Clearfix: http://perishablepress.com/press/2009/12/06/new-clearfix-hack/",
                className: "clearfix"
            }
        }
    });
})(jQuery);