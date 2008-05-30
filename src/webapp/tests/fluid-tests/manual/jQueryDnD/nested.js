/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var demo = demo || {};

demo.initDnD = function(){
    jQuery(".inner-item").draggable({
        refreshPositions: true,
        scroll: true,
        helper: function(){
            var avatar = jQuery(this).clone();
            avatar.removeAttr("id");
            avatar.removeClass("ui-droppable");
            avatar.removeClass("inner-item");
            return avatar;
        }
    }).droppable({
        accept: ".inner-item",
        greedy: true,
        tolerance: "pointer",
        drop: function(e, ui){
            jQuery(this).after(ui.draggable);
        }
    });
    
    jQuery(".outer-item").draggable({
        refreshPositions: true,
        scroll: true,
        helper: function(){
            var avatar = jQuery(this).clone();
            avatar.removeAttr("id");
            avatar.removeClass("ui-droppable");
            avatar.removeClass("outer-item");
            return avatar;
        }
    }).droppable({
        accept: ".outer-item",
        greedy: true,
        tolerance: "pointer",
        drop: function(e, ui){
            jQuery(this).after(ui.draggable);
        }
    });
    
    jQuery("#outer-container").droppable({
        accept: ".outer-item",
        greedy: true,
        tolerance: "pointer",
        drop: function(e, ui){
            jQuery(this).append(ui.draggable);
        }
    });
};