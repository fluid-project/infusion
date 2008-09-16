var sakai = sakai || {};
sakai.createsite = {};

(function(){

	var newsitejson = false;
	var newpageid = false;
	var newsitetitle = false;

	sakai.createsite.initialise = function(){
		$("#createsite_step1").show();
		$("#createsite_overlay-lightbox").show();
	}

	sakai.createsite.closeWindow = function(){	
		$("#createsite_step1").hide();
		$("#createsite_overlay-lightbox").hide();
	}

	sakai.createsite.doStep2 = function(){
		$("#createsite_step1").hide();
		$("#createsite_step2").show();
	}

	sakai.createsite.createSite = function(){
		// title is a required field
		var sitetitle = $("#createsite_newsitename").attr("value");
		if (sitetitle == undefined)
		{
			alert("Please specify site title. ");
		}
		var sitedescription = $("#createsite_newsitedescription").attr("value");
		if (sitedescription == undefined)
		{
			sitedescription ="";
		}
		
		if (sitetitle != undefined)
		{
			newsitetitle = sitetitle;
			
			var url = "/sdata/newsite";
			var parameters = {"sitename" : sitetitle, "sitedescription" : sitedescription };
	
			sdata.Ajax.request({
				url :url,
				httpMethod : "POST",
				onSuccess : function(data) {
					createPage1(data,true);
				},
				onFail : function(status) {
					createPage1(status,false);
				},
				postData : parameters,
				contentType : "application/x-www-form-urlencoded"
			});
		}
	}
	
	randomString = function(string_length) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	}

	createPage1 = function(response, exists){
		if (exists){
			newsitejson = eval('(' + response + ')');
			if (newsitejson.status == "success") {
				newpageid = randomString(8);
				newpageid = newpageid.replace(/\//g, "_");
				newpageid = newpageid.replace(/"/g, "_");
				newpageid = newpageid.replace(/'/g, "_");
				sdata.widgets.WidgetPreference.save("/sdata/f/" + newsitejson.id + "/pages/" + newpageid, "metadata", '{"type":"webpage"}', createPage2);	
			} else {
				alert("An error has occured");
			}
		} else {
			alert("An error has occured");
		}
	} 
	
	createPage2 = function(success){
		if (success){
			sdata.Ajax.request({
				url :"/sdata/f/" + newsitejson.id + "/pageconfiguration?sid=" + Math.random(),
				httpMethod : "GET",
				onSuccess : function(data) {
					createPage3(data,true);
				},
				onFail : function(status) {
					createPage3(status,false);
				}
			});
		} else {
			alert("An error has occured");
		}
	}
	
	createPage3 = function(response, exists){
		var pagetitle = "Welcome";
		var json = {};
		json.items = [];
		if (exists){
			json = eval('(' + response + ')');
		}
		var index = json.items.length;
		json.items[index] = {};
		json.items[index].id = newpageid;
		json.items[index].title = "Welcome";
		json.items[index].type = "webpage";
		json.items[index].top = true;
		var tostring = sdata.JSON.stringify(json);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + newsitejson.id + "", "pageconfiguration", tostring, createPage4);
	}
	
	createPage4 = function(success){
		sdata.widgets.WidgetPreference.save("/sdata/f/" + newsitejson.id + "/pages/" + newpageid, "content", "Welcome to " + newsitetitle + " !", doRedirect);
	}

	doRedirect = function(success){
		if (success){
			document.location = "/dev/site_home_page.html?siteid=" + newsitejson.id;
		} else {
			alert("An error occured");
		}
	}
		
})();