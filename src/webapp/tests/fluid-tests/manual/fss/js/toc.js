$().ready(function(){
	var FSSTestTOC = {
		tests: [
			{title: "FSS.Layout.Containers", id:1},
			{title: "FSS.Layout.Containers", id:2},
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
		next = FSSTestTOC.tests[thisTest+1].title.toLowerCase() + '.' + (FSSTestTOC.tests[thisTest+1].id) + '.html';
	}
	if (currentTest > 1){
		prev = FSSTestTOC.tests[thisTest-1].title.toLowerCase() + '.' + (FSSTestTOC.tests[thisTest-1].id) + '.html';
	}
	
	// Set links
	$('.options a[href=#prev]').attr('href',prev);
	$('.options a[href=#next]').attr('href',next);
	
	// Set heading
	$('.options h1').text(FSSTestTOC.tests[thisTest].title);
	
	// Set test #
	$('.options strong').text('Test ' + (currentTest) + ' of ' + groupTotal);
});
