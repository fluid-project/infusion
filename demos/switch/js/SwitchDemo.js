/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var demo = demo || {};

(function ($) {
    "use strict";

    demo.faces = {
        primary: "😃",
        random: ["😆", "😋", "😝", "😲"]
    };

    demo.switchPoint = 0.5;

    demo.getFace = function () {
        var rand = Math.random();

        if (rand >= demo.switchPoint) {
            demo.switchPoint += 0.05;
            var faceIdx = Math.floor(Math.random() * (demo.faces.random.length));
            return demo.faces.random[faceIdx];
        } else {
            return demo.faces.primary;
        }
    };

    demo.toggleLight = function (state) {
        var panel = $(".demo-panel");
        var panelText = $(".demo-panel-text");
        var panelFace = $(".demo-panel-face");
        panelText.text(state ? "on" : "off");
        panelFace.text(state ? demo.getFace() : "");
        panel.toggleClass("demo-light", state);
    };

})(jQuery);
