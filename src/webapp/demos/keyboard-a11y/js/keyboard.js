/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

/*global demo*/
var demo = demo || {};

(function ($, fluid) {
    
    demo.initKeyboardNav = function () {
        
        /************************ Menu ****************************/
        var level1tabs = $(".level_1");
        
        level1tabs.fluid("selectable", {
            selectableSelector : "> li",
            autoSelectFirstItem : true,
            direction: fluid.a11y.orientation.HORIZONTAL,
            onUnselect: function(el){
                $(el).removeClass("active revealSubMenu");
            },
            onSelect : function(el){
                $(el).addClass("active");
            }        
        });

        var level1Activation = function (e) {
            $(e.target).addClass("revealSubMenu");
            $(".level_2 li:eq(0)", e.target).focus(); // hilight the first child;
        };

        fluid.activatable(level1tabs, level1Activation, {
            additionalBindings: [{
                modifier: null,
                key: $.ui.keyCode.DOWN,
                activateHandler: level1Activation
            }]
        });
        
        
        /************************ Sub Menu ****************************/
        var level2tabs = $(".level_2");
        
        
        $.each(level2tabs, function (i, submenu) {
            submenu = $(submenu);
            submenu.fluid("selectable", {
                selectableSelector : "> li",
                direction: fluid.a11y.orientation.VERTICAL,
                onUnselect: function(el){
                    $(el).removeClass("subActive");
                },
                onSelect : function(el){                    
                    $(el).addClass("subActive");                    
                }        
            });            
        });

        var level2Activation = function (e) {            
        };

        fluid.activatable(level2tabs, level2Activation);        
        
    };
    
})(jQuery, fluid);