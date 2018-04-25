/*
Copyright 2016 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*
    The contents of this file were adapted from the ViewComponentSupport.js file in fluid-authoring
    See: https://github.com/fluid-project/fluid-authoring/blob/FLUID-4884/src/js/ViewComponentSupport.js
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /** A variant of fluid.viewComponent that bypasses the wacky "initView" and variant signature
     * workflow, sourcing instead its "container" from an option of that name, so that this argument
     * can participate in standard ginger resolution. This enables useful results such as a component
     * which can render its own container into the DOM on startup, whilst the container remains immutable.
     */
    fluid.defaults("fluid.newViewComponent", {
        gradeNames: ["fluid.modelComponent"],
        members: {
            // 3rd argument is throwaway to force evaluation of container
            dom: "@expand:fluid.initDomBinder({that}, {that}.options.selectors, {that}.container)"
            // The container must be supplied by a concrete implementation, however the below example using
            // fluid.container can be used in most cases.
            // container: "@expand:fluid.container({that}.options.container)"
        }
    });

})(jQuery, fluid_3_0_0);
