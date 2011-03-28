
/*global demo:true, fluid, jQuery*/

var demo = demo || {};

(function ($) {
    var updateDescription = function (that, description) {
        that.locate("styleDescription").text(description);
    };
    
    var changeClass = function (that, className) {
        var styledElm = that.locate("styledElement");
        //styledElm.attr("class", that.initialClass);
        styledElm.attr("class", "styledElement");
        styledElm.addClass(className);
    };
    
    var getSelectedValue = function (that) {
        return that.locate("stylePicker").children(":selected").attr("value");
    };
    
    var changeCSSFix = function (that, eventObj) {
        var styleModel = that.model[getSelectedValue(that)];
        changeClass(that, styleModel.className);
        updateDescription(that, styleModel.description);
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
            styleDescription: ".demo-description"
        },
        
        model: {
            "none": {
                description: "No Fix",
                className: ""
            },
            "fss": {
                description: "FSS: .fl-fix",
                className: "fl-fix"
            },
            "jquery": {
                description: "jQuery: .ui-helper-clearfix",
                className: "ui-helper-clearfix"
            },
            "oldClearfix": {
                description: "Old Clearfix: http://perishablepress.com/press/2009/12/06/new-clearfix-hack/",
                className: "clearfix"
            },
            "newClearfix": {
                description: "New Clearfix: http://perishablepress.com/press/2009/12/06/new-clearfix-hack/",
                className: "newClearfix"
            },
            "inline-block": {
                description: "inline-block: suggested by heidi around 11:45 http://wiki.fluidproject.org/display/fluid/fluid-work+IRC+Logs-2011-03-14",
                className: "inline-block-clearfix"
            }
        }
    });
})(jQuery);