/*
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global jqUnit*/
/*global fluid*/

(function ($) {
    $(document).ready(function () {
        var lbPersistenceTests = new jqUnit.TestCase("Lightbox Persistence Tests", setUp, tearDown);
    
        /**
         * Test to see that callback function is called after a "move item" key press.
         * @author Fluid
         */
        lbPersistenceTests.test("IsOrderChangedCallbackCalled", function () {
            var lightboxContainer, testOrderChangedCallback, options, lightbox;
            lightboxContainer = fluid.utils.jById(lightboxRootId);
        
            // Define a "persistence" callback that simply creates a known
            // input element with id 'callbackCalled'.  Later, we can test
            // whether the callback was called by looking for the element.
            testOrderChangedCallback = function () {
                var newInputElement = document.createElement("input");
                newInputElement.id = "callbackCalled";
                jQuery("[id=para1]").after(newInputElement);
            };
            options = {
                layoutHandlerName: "fluid.gridLayoutHandler",
                orderChangedCallback: testOrderChangedCallback,
                selectors: {
                    movables: findOrderableByDivAndId
                }
            };

            lightbox = fluid.reorderer(lightboxContainer, options);
            focusLightbox();
            
            // Perform a move
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlRightArrow());
            jqUnit.assertNotNull("order changed callback is not called when a move is performed", 
                fluid.testUtils.byId("callbackCalled"));
        });
    
    });
})(jQuery);
