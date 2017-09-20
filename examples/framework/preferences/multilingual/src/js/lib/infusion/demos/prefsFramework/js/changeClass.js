/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var demo = demo || {};

(function () {
    "use strict";

    demo.changeClass = function (id) {
        document.getElementById(id).style.display = "block";

    };
    demo.changeAgain = function (id) {
        document.getElementById(id).style.display = "none";
    };
})();
