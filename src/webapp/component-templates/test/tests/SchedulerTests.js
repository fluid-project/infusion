var SchedulerTests = {
	moveableClass: "movableTopic",
	numMoveables: 6,
	firstMoveableId: "orderable0",
	secondMoveableId: "orderable1",
	thirdMoveableId: "orderable2",
	
	numUnmoveables: 3,
	unmoveableClass: "fixed",
	
	reordererContainerId: "sortableSchedule"
};

function exposeTestFunctionNames () {
    return [
		"testCSSOrderableFinder",
		"testGenerateJSONStringForOrderables",
		"testInitScheduler"
    ];
}

function testCSSOrderableFinder () {
	// Create a cssOrderableFinder for the class "movableTopic."
	var orderableFinder = fluid.Scheduler.createCSSOrderableFinderForClass (SchedulerTests.moveableClass);
	var foundOrderables = orderableFinder ();
	assertEquals ("There should be six moveable topics.", 6, foundOrderables.length);
	
	// Check to make sure each returned element does indeed contain the correct class.
	for (var elementIdx = 0; elementIdx < foundOrderables.length; elementIdx++) {
		var element = foundOrderables[elementIdx];
		assertTrue ("The found element should contain the 'movableTopic' CSS class.",
					jQuery(element).hasClass(SchedulerTests.moveableClass));
	}
	
	// Create a cssOrderableFinder for a non-existant class "foo."
	orderableFinder = fluid.Scheduler.createCSSOrderableFinderForClass ("foo");
	foundOrderables = orderableFinder ();
	assertEquals ("There should be no elements matched for 'foo'.", 0, foundOrderables.length);
}

function testGenerateJSONStringForOrderables () {
	var orderables = [jQuery("#" + SchedulerTests.firstMoveableId).get()];
	var jsonString = fluid.Scheduler.generateJSONStringForOrderables(orderables);
	assertTrue("The JSON string should have content.", jsonString.length > 0);
	assertEquals("The JSON string does not contain the expected content.",
				 "{\"orderable0\":0}",
				 jsonString);
	
	// Test  larger array of elements.
	orderables = [
		jQuery("#" + SchedulerTests.firstMoveableId).get(),
		jQuery("#" + SchedulerTests.secondMoveableId).get(),
		jQuery("#" + SchedulerTests.thirdMoveableId).get()
	];
	
	jsonString = fluid.Scheduler.generateJSONStringForOrderables(orderables);
	assertTrue("The JSON String should have content.", jsonString.length > 0);
	assertEquals("The JSON string does not contain the expected content.",
				 "{\"orderable0\":0,\"orderable1\":1,\"orderable2\":2}",
				 jsonString);
}

function testInitScheduler () {
	var reorderer = fluid.Scheduler.initScheduler (SchedulerTests.reordererContainerId);
	
	assertEquals("The Reorderer's domNode should be the sortableSchedule element",
				 SchedulerTests.reordererContainerId,
				 jQuery (reorderer.domNode).attr("id"));

	// Ensure that the necessary parameters have been specified.
	fluid.testUtils.assertNotNullAndNotUndefined ("The Reorderer's order changed callback should be set.",
												  reorderer.orderChangedCallback);
	fluid.testUtils.assertNotNullAndNotUndefined ("The Reorderer's orderable finder should be set.", 
												  reorderer.orderableFinder);
	fluid.testUtils.assertNotNullAndNotUndefined ("The Reorderer's layout handler should be set.", 
												  reorderer.layoutHandler);
}