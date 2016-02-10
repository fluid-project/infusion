/*
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

(function (){
    "use strict";

    fluid.defaults("demo.gridReorderer", {
        gradeNames: ["fluid.reorderGrid"],
        styles: {
            dragging: "demo-gridReorderer-dragging",
            avatar: "demo-gridReorderer-avatar",
            selected: "demo-gridReorderer-selected",
            dropMarker: "demo-gridReorderer-dropMarker"
        },
        disableWrap: true
    });

})();
