
/*global demo:true, fluid, jQuery*/

var demo = demo || {};

(function ($) {
    fluid.registerNamespace("demo.cssFixApplier");
    
    demo.cssFixApplier.preInit = function (that) {
        var opts = that.options;
        
        that.setFixDescription = function (fix) {
            that.locate("fixDescription").text(opts.strings[fix] || "");
        };
        
        that.addFixStyle = function (fix) {
            that.locate("fixContainer").addClass(opts.styles[fix])
        };
        
        that.removeOtherFixStyles = function (fix) {
            fluid.each(opts.styles, function (style, fixType) {
                if (fix !== fixType) {
                    that.locate("fixContainer").removeClass(style);
                }
            });
        };
        
        that.setFix = function (fix) {
            that.removeOtherFixStyles(fix);
            that.addFixStyle(fix);
            that.setFixDescription(fix);
        };
    };
    
    demo.cssFixApplier.finalInit = function (that) {
        // bind event listener for fix selectbox
        that.applier.modelChanged.addListener("selection", function (newModel, oldModel) {
            that.events.afterFixSelectionChanged.fire(newModel.selection, oldModel.selection);
        });
        
        that.refreshView();
        that.setFix(that.model.selection);
    };
    
    demo.cssFixApplier.produceTree = function (that) {
        var tree = {
            fixChoice: {
                "selection": "${selection}",
                "optionlist": "${choices}",
                "optionnames": "${names}"
            },
            fixLabel: {
                messagekey: "fixLabel"
            },
            sections: {
                decorators: {
                    type: "jQuery",
                    func: "tabs"
                }
            }
        };
        
        return tree;
    };
    
    fluid.defaults("demo.cssFixApplier", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "demo.cssFixApplier.preInit",
        finalInitFunction: "demo.cssFixApplier.finalInit",
        produceTree: "demo.cssFixApplier.produceTree",
        selectors: {
            fixLabel: ".democ-cssFix-fixLabel",
            fixChoice: ".democ-cssFix-fixChoice",
            fixContainer: ".democ-cssFix-fixContainer",
            fixDescription: ".democ-cssFix-fixDescription",
            sections: ".democ-cssFix-sections"
        },
        selectorsToIgnore: ["fixContainer", "fixDescription"],
        styles: {
            "fl-fix": "fl-fix",
            "fl-clearfix": "fl-clearfix"
        },
        strings: {
            fixLabel: "CSS Fixes:",
            "fl-fix": "FSS: .fl-fix",
            "fl-clearfix": "FSS: .fl-clearfix",
            "none": "No Fix Applied"
        },
        events: {
            afterFixSelectionChanged: null
        },
        listeners: {
            afterFixSelectionChanged: "{demo.cssFixApplier}.setFix"
        },
        model: {
            selection: "none",
            choices: ["none", "fl-fix", "fl-clearfix"],
            names: ["none", "fl-fix", "fl-clearfix"]
        }
    });
})(jQuery);