/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

$(document).ready (function () {
    var rsfSchedulerTests = new jqUnit.TestCase ("RSF-style Scheduler Tests");

    var RSFStyleSchedulerTests = {
    	// Unconference schedule constants
        unconferenceNamebase: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::",
        firstUnconferenceOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0:",
        secondUnconferenceOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:1:",
      
        lightningTalkNamebase: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::lightningTalks::",
        firstLightningTalkOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::lightningTalks::orderable:0:",
        secondLightningTalkOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::lightningTalks::orderable:1:",
        thirdLightningTalkOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::lightningTalks::orderable:2:",
       
        sessionNamebase: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::sessions::",
        firstSessionOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::sessions::orderable:0:",
        secondSessionOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::sessions::orderable:1:",
        thirdSessionOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::sessions::orderable:2:",
        fourthSessionOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::sessions::orderable:3:",
        
        numUnconferenceMoveables: 2,
        numLightningTalkMoveables: 3,
        numSessionMoveables: 4
    };
    
    rsfSchedulerTests.test ("RSFOrderableFinderUnconferenceContainer", function () {
        var orderableFinder = fluid.Scheduler.createRSFOrderableFinder (RSFStyleSchedulerTests.unconferenceNamebase,
                                                                        "li",
                                                                        "orderable",
                                                                        2);
        var escapedContainerSelector = fluid.utils.escapeSelector ("#" + RSFStyleSchedulerTests.unconferenceNamebase);
        
        // Check our sanity first. 
        var containerElement = jQuery (escapedContainerSelector).get (0);                                                           
        jqUnit.assertEquals("The id of the unconference container should match.",
                      RSFStyleSchedulerTests.unconferenceNamebase,
                      containerElement.id);
                      
        // Now make sure we're getting exactly the orderables we expect.
        var orderables = orderableFinder ();
        jqUnit.assertEquals ("There should be two unconference orderables.",
                      RSFStyleSchedulerTests.numUnconferenceMoveables,
                      orderables.length);
        jqUnit.assertEquals ("The first orderable should match the expected id.",
                      RSFStyleSchedulerTests.firstUnconferenceOrderableId,
                      jQuery (orderables[0]).attr("id"));
        jqUnit.assertEquals ("The second orderable should match the expected id.",
                      RSFStyleSchedulerTests.secondUnconferenceOrderableId,
                      jQuery (orderables[1]).attr("id"));     
    });
    
    rsfSchedulerTests.test ("RSFOrderableFinderLightningTalkContainer", function () {
       // Now check the Lightning talk orderable finder.
       var orderableFinder = fluid.Scheduler.createRSFOrderableFinder (RSFStyleSchedulerTests.lightningTalkNamebase,
                                                                       "li",
                                                                       "orderable",
                                                                       3);
       var escapedContainerSelector = fluid.utils.escapeSelector ("#" + RSFStyleSchedulerTests.lightningTalkNamebase);
       
       // Check our sanity first.                                                     
       var containerElement = jQuery (escapedContainerSelector).get (0);                                                           
       jqUnit.assertEquals("The id of the lightning talk container should match.",
                    RSFStyleSchedulerTests.lightningTalkNamebase,
                    containerElement.id);
                  
       // Now make sure we're getting exactly the orderables we expect.  
       var orderables = orderableFinder ();
       jqUnit.assertEquals ("There should be three lightning talk orderables.",
                     RSFStyleSchedulerTests.numLightningTalkMoveables,
                     orderables.length);
       jqUnit.assertEquals ("The first orderable should match the expected id.",
                     RSFStyleSchedulerTests.firstLightningTalkOrderableId,
                     jQuery (orderables[0]).attr("id"));
       jqUnit.assertEquals ("The second orderable should match the expected id.",
                     RSFStyleSchedulerTests.secondLightningTalkOrderableId,
                     jQuery (orderables[1]).attr("id")); 
       jqUnit.assertEquals ("The third orderable should match the expected id.",
                     RSFStyleSchedulerTests.thirdLightningTalkOrderableId,
                     jQuery (orderables[2]).attr("id")); 
    });
    
    rsfSchedulerTests.test ("RSFOrderableFinderSessionContainer", function () {
       // Now check the sessions orderable finder.
       var orderableFinder = fluid.Scheduler.createRSFOrderableFinder (RSFStyleSchedulerTests.sessionNamebase,
                                                                       "li",
                                                                       "orderable",
                                                                       4);
       var escapedContainerSelector = fluid.utils.escapeSelector ("#" + RSFStyleSchedulerTests.sessionNamebase);
       var containerElement = jQuery (escapedContainerSelector).get (0);      
       
       // Check our sanity first.                                                     
       jqUnit.assertEquals("The id of the sessions container should match.",
                    RSFStyleSchedulerTests.sessionNamebase,
                    containerElement.id);
                    
       // Now make sure we're getting exactly the orderables we expect.
       var orderables = orderableFinder ();
       jqUnit.assertEquals ("There should be four session orderables.",
                     RSFStyleSchedulerTests.numSessionMoveables,
                     orderables.length);
       jqUnit.assertEquals ("The first orderable should match the expected id.",
                     RSFStyleSchedulerTests.firstSessionOrderableId,
                     jQuery (orderables[0]).attr("id"));
       jqUnit.assertEquals ("The second orderable should match the expected id.",
                     RSFStyleSchedulerTests.secondSessionOrderableId,
                     jQuery (orderables[1]).attr("id")); 
       jqUnit.assertEquals ("The third orderable should match the expected id.",
                     RSFStyleSchedulerTests.thirdSessionOrderableId,
                     jQuery (orderables[2]).attr("id"));
       jqUnit.assertEquals ("The fourth orderable should match the expected id.",
                     RSFStyleSchedulerTests.fourthSessionOrderableId,
                     jQuery (orderables[3]).attr("id")); 
    });

});