$().ready(function(){
    // parse the # from the filename
    var uri = (""+window.location).split(".");
    var currentTest = uri[uri.length-2];
    
	var FSSTestTOC = {
		tests: [
			{title: "FSS.Layout.Containers", id:1, note: "Each container should be as wide as the text inside says"},
			{title: "FSS.Layout.Containers", id:2, note: "Each container should behave as the text inside says. May require adjusting the browser width."},
			{title: "FSS.Layout.Advanced", id:1},
			{title: "FSS.Layout.Advanced", id:2},
			{title: "FSS.Layout.Advanced", id:3}
		]
	}

	var groupTotal = 0, next = '#', prev = '#', thisTest = currentTest-1;
	$.each(FSSTestTOC.tests, function(i){
		groupTotal = (FSSTestTOC.tests[i].title === FSSTestTOC.tests[thisTest].title) ? groupTotal + 1 : groupTotal;
	});
	if (currentTest < FSSTestTOC.tests.length){
		next = FSSTestTOC.tests[thisTest+1].title.toLowerCase() + '.' + (currentTest+1) + '.html';
	}
	if (currentTest > 1){
		prev = FSSTestTOC.tests[thisTest-1].title.toLowerCase() + '.' + (currentTest-1) + '.html';
	}
	
	// Set links
	$('.options a[href=#prev]').attr('href',prev);
	$('.options a[href=#next]').attr('href',next);
	
	// Set heading
	$('.options h1').text(FSSTestTOC.tests[thisTest].title);
    // Set Notes
    $('#note').text(FSSTestTOC.tests[thisTest].note);
	// Set test #
    $('#page').text('Test ' + (currentTest) + ' of ' + FSSTestTOC.tests.length);
    
});
