var sakai = sakai || {};

sakai.myprofile = function(tuid,placement,showSettings){

	if (showSettings){
		$("#mainProfileContainer", $("#" + tuid)).html("No settings available<br/><br/>");
	}

};

sdata.widgets.WidgetLoader.informOnLoad("myprofile");