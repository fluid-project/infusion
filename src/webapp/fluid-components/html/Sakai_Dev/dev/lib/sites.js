var sakai = sakai || {};

sakai.sites = function(tuid,placement,showSettings){

	if (showSettings) {
	
		$("#mainSitesContainer", $("#" + tuid)).html("No settings available");
	
	}
	else {
	
		sdata.widgets.WidgetLoader.insertWidgets(tuid);
		$("#" + tuid + " #create_new_site_link").bind("click", function(ev){
			createNewSite();
		});
		
		var createNewSite = function(){
			$("#" + tuid + " #createsitecontainer").show();
			sakai.createsite.initialise();
		}
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/mcp?sid=" + Math.random(),
			onSuccess: function(data){
				loadSiteList(data, true);
			},
			onFail: function(status){
				loadSiteList("", false);
			}
		});
		
		var loadSiteList = function(response, exists){
			if (exists) {
				var json = eval('(' + response + ')');
				if (window.location.host.indexOf("mycamtools") != -1) {
					$("#" + tuid + " #sitelist").html(sdata.html.Template.render('sitelist_template2', json));
				}
				else {
					$("#" + tuid + " #sitelist").html(sdata.html.Template.render('sitelist_template', json));
				}
			}
		}
		
	}

};

sdata.widgets.WidgetLoader.informOnLoad("sites");