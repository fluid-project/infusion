var SchedulerTests = {
	// Conference schedule constants
	conferenceContainerId: "sortableSchedule",
	moveableClass: "movableTopic",
	numMoveables: 6,
	orderableName: "orderable",
	firstMoveableId: "sortableSchedule\\.orderable0",
	secondMoveableId: "sortableSchedule\\.orderable1",
	thirdMoveableId: "sortableSchedule\\.orderable2",
	numUnmoveables: 3,
	unmoveableClass: "fixed",
};

function exposeTestFunctionNames () {
    return [
		"testCSSOrderableFinder",
		"testPortalSafeFinder",
		"testGenerateJSONStringForOrderables",
		"testInitScheduler"
    ];
}

function testCSSOrderableFinder () {
	// Create a cssOrderableFinder for the class "movableTopic."
	var orderableFinder = fluid.Scheduler.createCSSOrderableFinderForClass (SchedulerTests.moveableClass);
	var containerElement = jQuery ("#" + SchedulerTests.conferenceContainerId).get(0);
	var foundOrderables = orderableFinder (containerElement);
	assertEquals ("There should be six moveable topics.", 6, foundOrderables.length);
	
	// Check to make sure each returned element does indeed contain the correct class.
	for (var elementIdx = 0; elementIdx < foundOrderables.length; elementIdx++) {
		var element = foundOrderables[elementIdx];
		assertTrue ("The found element should contain the 'movableTopic' CSS class.",
					jQuery (element).hasClass (SchedulerTests.moveableClass));
	}
	
	// Create a cssOrderableFinder for a non-existant class "foo."
	orderableFinder = fluid.Scheduler.createCSSOrderableFinderForClass ("foo");
	foundOrderables = orderableFinder (containerElement);
	assertEquals ("There should be no elements matched for 'foo'.", 0, foundOrderables.length);
}

function testPortalSafeFinder () {
	// Create an orderable finder for the core case: orderables with an id of sortableSchedule.orderable[num].
    var orderableFinder = fluid.Scheduler.createPortalSafeFinder (SchedulerTests.conferenceContainerId,
																  "orderable",
																  SchedulerTests.numMoveables,
																  ".");
    var containerElement = jQuery ("#" + SchedulerTests.conferenceContainerId).get(0);												  
	var foundOrderables = orderableFinder (containerElement);
	assertEquals ("There should be six moveable topics.", SchedulerTests.numMoveables, foundOrderables.length);
	
	// Make sure they're all good and correct orderables.
	for (var i = 0; i < SchedulerTests.numMoveables; i++) {
		var element = foundOrderables[i];
		fluid.testUtils.assertNotNullAndNotUndefined ("Orderable should be a valid element.", 
		                                             foundOrderables[i]);
		assertTrue(jQuery (element).hasClass(SchedulerTests.moveableClass));
	}
	
	// Now create a orderable finder for a id pattern that doesn't exist.
	var finder = fluid.Scheduler.createPortalSafeFinder ("bar",
                                                         "foo",
                                                         SchedulerTests.numMoveables,
                                                         ".");
    var orderables = finder (containerElement);
    assertEquals ("There should be no elements matched for 'nonExistentContainerId'.", 0, orderables.length);   
}

function testGenerateJSONStringForOrderables () {
	var orderables = [jQuery ("#" + SchedulerTests.firstMoveableId).get (0)];
	var jsonString = fluid.Scheduler.generateJSONStringForOrderables (orderables);
	assertTrue ("The JSON string should have content.", jsonString.length > 0);
	assertEquals ("The JSON string does not contain the expected content.",
				 "{\"sortableSchedule.orderable0\":0}",
				 jsonString);
	
	// Test a larger array of elements.
	orderables = [
		jQuery ("#" + SchedulerTests.firstMoveableId).get (0),
		jQuery ("#" + SchedulerTests.secondMoveableId).get (0),
		jQuery ("#" + SchedulerTests.thirdMoveableId).get (0)
	];
	
	jsonString = fluid.Scheduler.generateJSONStringForOrderables (orderables);
	assertTrue ("The JSON String should have content.", jsonString.length > 0);
	assertEquals ("The JSON string does not contain the expected content.",
				  "{\"sortableSchedule.orderable0\":0,\"sortableSchedule.orderable1\":1,\"sortableSchedule.orderable2\":2}",
				  jsonString);
}

function testInitScheduler () {
	var reorderer = fluid.Scheduler.initScheduler (SchedulerTests.reordererContainerId);
	
	assertEquals("The Reorderer's domNode should be the sortableSchedule element",
				 SchedulerTests.reordererContainerId,
				 jQuery (reorderer.domNode).attr ("id"));

	// Ensure that the necessary parameters have been specified.
	fluid.testUtils.assertNotNullAndNotUndefined ("The Reorderer's order changed callback should be set.",
												  reorderer.orderChangedCallback);
	fluid.testUtils.assertNotNullAndNotUndefined ("The Reorderer's orderable finder should be set.", 
												  reorderer.orderableFinder);
	fluid.testUtils.assertNotNullAndNotUndefined ("The Reorderer's layout handler should be set.", 
												  reorderer.layoutHandler);
}