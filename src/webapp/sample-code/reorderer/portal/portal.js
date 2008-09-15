/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/   

var demo = demo || {};
    
(function (jQuery, fluid) {
    var layout = { 
        id: "portalPageBodyColumns",
        columns:[
            { id:"column_u15l1s9", children:["portlet_u15l1n10", "portlet_u15l1n11"]},
            { id:"column_u15l1s12", children:["portlet_u15l1n13","portlet_u15l1n14","portlet_u15l1n15"]}
        ]
    };

    var dropTargetPerms = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1]
    ];

    var grabHandle = function (item) {        
        // the handle is the toolbar. The toolbar id is the same as the portlet id, with the
        // "portlet_" prefix replaced by "toolbar_".
        return jQuery ("[id=toolbar_" + item.id.split ("_")[1] + "]");
    };

    demo.initPortletReorderer = function() {
        var options = { 
            styles:  {
                mouseDrag: "orderable-mouse-drag",
                dropMarker: "orderable-drop-marker-box",
                avatar: "orderable-avatar-clone"
            },
             selectors: {
                grabHandle: grabHandle,
                lockedModules: "#portlet_u15l1n10",
                dropWarning: jQuery("#drop-warning")
            }
        };

        return fluid.initLayoutCustomizer (layout, dropTargetPerms, null, options);
    };
    
    demo.initLightboxReorderer = function () {
        return fluid.lightbox("#gallery", {
            styles: {
                defaultStyle: "lb-orderable-default",
                selected: "lb-orderable-selected",
                dragging: "lb-orderable-dragging",
                mouseDrag: "lb-orderable-dragging",
                hover: "lb-orderable-hover",
                dropMarker: "lb-orderable-drop-marker",
                avatar: "lb-orderable-avatar"
            },
            selectors: {
                movables: "[id^=thumb-]"
            }
        });
    };
}) (jQuery, fluid);

function testSpeeds() {
    var reps = 200;
    var time = new Date();
    for (var i = 0; i < reps; ++ i) {
        var it = fluid.utils.jById("fluid.img.5");
    }
    var delay = (new Date() - time);
//  alert(delay);
    var usdelay = delay / (reps/1000);
    fluid.log("jById: " + reps + " reps in " + delay + "ms: " + usdelay + "us/rep");
}

function testSpeeds2() {
    var reps = 100000;
    var time = new Date();
    for (var i = 0; i < reps; ++ i) {
        var it = document.getElementById("fluid.img.5");
        if (it.getAttribute("id") !== "fluid.img.5") {
          it = fluid.utils.jById("fluid.img.2");
        }
    }
    var delay = (new Date() - time);
//  alert(delay);
    var usdelay = delay / (reps/1000);
    fluid.log("document.byId: " + reps + " reps in " + delay + "ms: " + usdelay + "us/rep");
}

function testSpeeds3() {
    var reps = 100000;
    var time = new Date();
    var el = document.getElementById("fluid.img.5");
    for (var i = 0; i < reps; ++ i) {
        var it = jQuery.data(el);
    }
    var delay = (new Date() - time);
//  alert(delay);
    var usdelay = delay / (reps/1000);
    fluid.log("document.byId: " + reps + " reps in " + delay + "ms: " + usdelay + "us/rep");
}