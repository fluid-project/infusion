var sakai = sakai || {};

sakai.tools = function(tuid,placement,showSettings){
	
	if (showSettings) {
	
		$("#mainToolsContainer", $("#" + tuid)).html("No settings available<br/><br/>");
		
	}
	else {
	
		var siteId = null;
		var sitejson = null;
		
		var enhanceA11y = function(){
		
			// Keyboard support start here
			var tools = jQuery('#' + tuid);
			
			// Pull all the anchors out of the tab order
			jQuery("a", tools).tabindex(-1);
			
			// Make the sub header contents tabbable
			jQuery(".widget1-subhead li", tools).tabbable();
			
			// Make the tools pane tabbable
			var menu = jQuery(".tool-menu", tools);
			menu.tabbable();
			
			// Make the rows selectable and activatable
			var rows = jQuery(".tool-menu-tr", menu);
			rows.selectable(menu);
			var handler = function(el){
				jQuery("a", el).click();
			};
			rows.activatable(handler);
			
			// Make the delete tool tabbable and activatable
			var del = jQuery(".tool-menu1-del", menu);
			del.tabbable();
			del.activatable(handler);
		}
		
		/**
	 * Check existence of toolId in arr1.  If found, remove.  If not found, add to arr2.
	 *
	 * @param {string} toolId
	 * @param {array} arr1 The array to use as a check point.
	 * @param {array} arr2 The array to add to if toolId not found in check array.
	 */
		var modTool = function(toolId, arr1, arr2){
			var found = false;
			// check for existence in arr1
			for (var i = 0; i < arr1.length; i++) {
				if (arr1[i] == toolId) {
					arr1.splice(i, 1);
					break;
				}
			}
			// if not found in arr1, add to arr2
			if (!found) 
				arr2.push(toolId);
		}
		
		var sid = function(){
			return new Date().getTime();
		}
		
		var init = function(){
		
			$("#" + tuid + " #add_tools_link").bind("click", function(ev, ui){
				showAddTool();
				return false;
			});
			$("#" + tuid + " #close_window_and_cancel").bind("click", function(ev, ui){
				hideAddTool();
				return false;
			});
			$("#" + tuid + " #tools_finished").bind("click", function(ev, ui){
				hideAddTool();
				return false;
			});
			$("#" + tuid + " #tools_close_and_cancel_2").bind("click", function(ev, ui){
				hideAddTool();
				return false;
			});
			
			var qs = new Querystring();
			var currentsite = qs.get('siteid');
			if (!currentsite) {
				sdata.Ajax.request({
					url: '/sdata/me',
					responseType: 'json',
					onSuccess: function(data){
						var json = eval('(' + data + ')');
						siteId = '~' + json.items.userid;
						showPages();
					}
				});
			}
			else {
				siteId = currentsite;
				showPages();
			}
		}
		
		var showPages = function(){
			sdata.Ajax.request({
				url: '/sdata/site/' + siteId + '?sid=' + Math.random(),
				responseType: 'json',
				useCache: false,
				onSuccess: function(json){
					sitejson = json;
					var html = sdata.html.Template.render('tool-list', json, $("#" + tuid + ' #output'));
					$("#" + tuid + " .tools_removepage_helpclass").bind("click", function(ev, ui){
						var id = ev.currentTarget.id;
						removePage(id.split("_")[id.split("_").length - 1]);
						return false
					});
					jQuery('#' + tuid + ' li.widget1-grid a').toggle(function(){
						jQuery('#' + tuid + ' .tool-listview').addClass('tool-gridview').removeClass('tool-listview');
					}, function(){
						jQuery('#' + tuid + ' .tool-gridview').addClass('tool-listview').removeClass('tool-gridview');
					});
					
					enhanceA11y();
				}
			});
		}
		
		var removePage = function(pageId){
			sdata.Ajax.request({
				url: '/sdata/site/' + siteId + '?f=rp&pageId=' + pageId,
				httpMethod: 'POST',
				onSuccess: showPages
			});
		}
		
		var addTools = [];
		var removeTools = [];
		
		var addTool = function(toolId){
			modTool(toolId, removeTools, addTools);
		}
		
		var removeTool = function(toolId){
			modTool(toolId, addTools, removeTools);
		}
		
		var commitTools = function(){
			var data1 = {
				tools: addTools.join(',')
			};
			var data2 = {
				pageId: removeTools.join(',')
			};
			if ((addTools && addTools.length > 0) || (removeTools && removeTools.length > 0)) {
				sdata.Ajax.request({
					url: '/sdata/site/' + siteId + '?f=at',
					httpMethod: 'POST',
					postData: data1,
					onComplete: function(){
						sdata.Ajax.request({
							url: '/sdata/site/' + siteId + '?f=rp',
							httpMethod: 'POST',
							postData: data2,
							onComplete: showPages,
							contentType: "application/x-www-form-urlencoded"
						});
					},
					contentType: "application/x-www-form-urlencoded"
				});
			}
		//hideAddTool();
		}
		
		/**
	 * Show the 'Add Tool' dialog
	 */
		var showAddTool = function(){
			//sdata.Ajax.request(
			//{
			//	url: '/sdata/tools?siteid=' + siteId,
			//	responseType: 'json',
			//	onSuccess: function(json)
			//	{
			// Add the isHad property to tools we already have
			jQuery("#" + tuid + " #addToolLB").show();
			for (var i = 0; i < sitejson.pages.length; i++) {
				var page = sitejson.pages[i];
				for (var ii = 0; ii < page.tools.length; ii++) {
					var tool = page.tools[ii];
					if (tool.allowMultipleInstances != "true") {
						for (var iii = 0; iii < sitejson.allTools.length; iii++) {
							if (tool.id == sitejson.allTools[iii].id) {
								sitejson.allTools[iii].isHad = true;
							}
						}
					}
				}
			}
			sdata.html.Template.render('add-tool', sitejson, $("#" + tuid + ' #add-tool-output'));
			
			$("#" + tuid + " .add-tool-help").bind("click", function(ev){
				var toolid = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
				addTool(toolid);
				swapById("rmToolButton_visible_" + toolid, "addToolButton_visible_" + toolid);
				commitTools();
				addTools = [];
				removeTools = [];
			});
			$("#" + tuid + ".remove-tool-help").bind("click", function(ev){
				var toolid = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
				removeTool(toolid);
				swapById("addToolButton_visible_" + toolid, "rmToolButton_visible_" + toolid);
			});
			
		//	}
		//});
		}
		
		var hideAddTool = function(){
			jQuery("#" + tuid + " #addToolLB").hide();
		}
		
		/**
	 * Hide the first argument and show the second
	 */
		var swapById = function(hideMe, showMe){
			hideMe = hideMe.replace(/[.]/g, "\\.");
			showMe = showMe.replace(/[.]/g, "\\.");
			jQuery("#" + tuid + " #" + hideMe).hide();
			jQuery("#" + tuid + " #" + showMe).show();
		}
		
		init();
	}

};

sdata.widgets.WidgetLoader.informOnLoad("tools");