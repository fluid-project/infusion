$().ready(function(){
	var FSSTestTOC = {
		tests: [
			{title: "FSS.Layout.Containers", note: "A test for fixed width containers. Each container should be as wide as the text inside says"},
			{title: "FSS.Layout.Columns", note: "A test for flexible and fixed width columns. Each container should behave as the text inside says. May require adjusting the browser width."},
			{title: "FSS.Layout.Advanced", note: "Tests for different advanced layout modules. Each module should be inspected for inconsistencies and non-uniformity."},
			{title: "FSS.Text.Size", note: "A Test for text size."}
		]
	}

    // parse the # from the filename
    var uri = (""+window.location).split("fss/");
    var currentTest = parseInt(uri[1].substr(0,1));
	var next = '#', prev = '#', totalTests = FSSTestTOC.tests.length, thisTestIndex = currentTest-1, prevTestIndex = currentTest-2, nextTestIndex = currentTest;

	next = (currentTest < totalTests) ? (currentTest+1) + "." + FSSTestTOC.tests[nextTestIndex].title.toLowerCase() + '.html' : next;
	prev = (currentTest > 1) ? (currentTest-1) + "." + FSSTestTOC.tests[prevTestIndex].title.toLowerCase() + '.html' : prev;
	
    
	// LINKS
	$('.options a[href=#prev]').attr('href',prev);
	$('.options a[href=#next]').attr('href',next);	
    
	// HEADING
	$('.options h1').text(FSSTestTOC.tests[thisTestIndex].title);
    
    // NOTES
    $('#note').text(FSSTestTOC.tests[thisTestIndex].note);
    
	// TEST ID
    $('#page').text('Test ' + (currentTest) + ' of ' + totalTests);
    
});
