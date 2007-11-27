var RSFStyleSchedulerTests = {
	// Unconference schedule constants
    unconferenceNamebase: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::",
    firstUnconferenceOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0:",
    secondUnconferenceOrderableId: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:1:",
    lightningTalkNamebase: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::lightingTalks::",
    sessionNamebase: "page-replace:uniquePortletId:component::tree::branches::rsfSortableSchedule::orderable:0::sessions::",
    numUnconferenceMoveables: 2,
    numLightningTalkMoveables: 3,
    numSessionMoveables: 4
}

function exposeTestFunctionNames () {
    return [
        "testRSFOrderableFinder",
    ];
}


function testRSFOrderableFinder () {
    var orderableFinder = fluid.Scheduler.createRSFOrderableFinder (RSFStyleSchedulerTests.unconferenceNamebase,
                                                                    "li",
                                                                    "orderable",
                                                                    2);
    var escapedContainerSelector = fluid.Utilities.escapeSelector ("#" + RSFStyleSchedulerTests.unconferenceNamebase);
    var containerElement = jQuery (escapedContainerSelector).get (0);                                                           
    assertEquals("The id of the unconference container should match.",
                  RSFStyleSchedulerTests.unconferenceNamebase,
                  containerElement.id);
                  
    var orderables = orderableFinder (containerElement);
    assertEquals ("There should be two unconference orderables.",
                  RSFStyleSchedulerTests.numUnconferenceMoveables,
                  orderables.length);
    assertEquals ("The first orderable should match the expected id.",
                  RSFStyleSchedulerTests.firstUnconferenceOrderableId,
                  jQuery (orderables[0]).attr("id"));
    assertEquals ("The second orderable should match the expected id.",
                  RSFStyleSchedulerTests.secondUnconferenceOrderableId,
                  jQuery (orderables[1]).attr("id"));     
}