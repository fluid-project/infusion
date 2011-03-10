
/*global demo:true, fluid, jQuery*/

var demo = demo || {};

(function ($) {
    var updateTitle = function (that, title) {
        that.locate("styleTitle").text(title);
    };
    
    var changeClass = function (that, className) {
        var styledElm = that.locate("styledElement");
        styledElm.attr("class", that.initialClass);
        styledElm.addClass(className);
    };
    
    var getSelectedValue = function (that) {
        return that.locate("stylePicker").children(":selected").attr("value");
    };
    
    var changeCSSFix = function (that, eventObj) {
        var styleModel = that.model[getSelectedValue(that)];
        changeClass(that, styleModel.className);
        updateTitle(that, styleModel.title);
    };
    
    var bindEvents = function (that) {
        that.locate("stylePicker").change(function (eventObj) {
            changeCSSFix(that, eventObj);
        });
    };
    
    var saveInitialClasses = function (that) {
        that.initialClass = that.locate("styledElement").attr("class");
    };
    
    var setup = function (that) {
        saveInitialClasses(that);
        bindEvents(that);
        that.locate("stylePicker").change();
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
            styledElement: ".styledElement",
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