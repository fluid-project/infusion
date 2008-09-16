var sakai = sakai || {};
sakai.dashboard = function(){

	var domyportal = false;
	var myportaljson = false;
	var startSaving = true;
	var person = false;

	var decideExists = function (response, exists){
		if (exists === false) {
			if (response === 401 || response === "error"){
				//document.location = "/dev/index.html";
			} else {
				doInit();
			}
		} else {
			myportaljson = eval('(' + response + ')');
			var cleanContinue = true;
			for (var c in myportaljson.columns){
				for (var pi in myportaljson.columns[c]){
					if (!myportaljson.columns[c][pi].uid){
						cleanContinue = false;
					}
				}
			}
			if (cleanContinue){
				domyportal = true;
			} 
			doInit();
		}
	}
	
	sakai.dashboard.showSettings = function(id, generic){
		var old = document.getElementById(id);
		var newel = document.createElement("div");
		newel.id = generic;
		newel.className = "widget_inline";
		old.parentNode.replaceChild(newel,old);
		document.getElementById("close_settings_" + generic).style.display = "";
		document.getElementById("show_settings_" + generic).style.display = "none";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(newel.parentNode.id,true);
	}
	
	sakai.dashboard.showWidgetContent = function(id, generic){
		var old = document.getElementById(id);
		var newel = document.createElement("div");
		newel.id = generic;
		newel.className = "widget_inline";
		old.parentNode.replaceChild(newel,old);
		document.getElementById("close_settings_" + generic).style.display = "none";
		document.getElementById("show_settings_" + generic).style.display = "";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(newel.parentNode.id,false);
	}

	var showInit = function(){
		
		var toAdd = new Array();
		var added = new Array();
		var grouptype = "General";
	
		var columns = [];
		var layout = "dev";
		var olayout = null;
		
		columns[0] = [];
		columns[1] = [];
		columns[2] = [];		

		columns[0][0] = "tools";
		columns[1][0] = "sites";
		columns[2][0] = "myprofile";

		var jsonstring = '{"columns":{';
		
		for (var i = 0; i < columns.length; i++){
			if (i != 0){
				jsonstring += ",";
			}	
			jsonstring += '"column' + (i + 1) + '":[';
			for (var ii = 0; ii < columns[i].length; ii++){
				if (ii != 0){
					jsonstring += ",";
				}
				jsonstring += '{"name":"' + columns[i][ii] + '","visible":"block","uid":"id' + Math.round(Math.random() * 10000000000000) + '"}';
			}
			jsonstring += "]";
		}

		jsonstring += '},"layout":"' + layout + '"}';
	
		myportaljson = eval('(' + jsonstring + ')');
	
		sdata.widgets.WidgetPreference.save("/sdata/p/widgets","devstate",jsonstring, saveGroup);
		
	}

	var doInit = function (){
		sdata.Ajax.request( { 
			url : "/sdata/me",
			onSuccess :  function (response) {
				person = eval('(' + response + ')');
				inituser = person.items.displayId;
				if (person.items.firstname || person.items.lastname){
					$("#userid").text(person.items.firstname + " " + person.items.lastname);
				} else {
					$("#userid").text(inituser);
				}
				$("#body2").show();
	
				if (domyportal){
					showMyPortal();
				} else {
					showInit();
				}
			},
			onFail : function(httpstatus) {			
	        	//document.location = "/dev/index.html"
	        }
	    });
	
	}

	var saveGroup = function (success){
	
		if (success){
	
			selected = "General"

			var jsonstring = '{"items":{"group":"' + selected + '"}}';
			
			sdata.widgets.WidgetPreference.save("/sdata/p/widgets","group",jsonstring, buildLayout);
	
		} else {
			alert("An error occured while saving your layout");
		}
	
	}

	var buildLayout = function (success){
	
		if (success){
			showMyPortal();
		} else {
			alert("An error occured while saving your group");
		}
	
	}

	var showMyPortal = function(){
	
		var layout = myportaljson;
		
		if (!Widgets.layouts[layout.layout]) {
		
			var selectedlayout = "";
			var layoutindex = 0;
			
			for (var l in Widgets.layouts) {
				if (layoutindex == 0) {
					selectedlayout = l;
					layoutindex++;
				}
			}
			
			var columns = [];
			for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++) {
				columns[i] = [];
			}
			
			var initlength = 0;
			for (var l in myportaljson.columns) {
				initlength++;
			}
			var newlength = Widgets.layouts[selectedlayout].widths.length;
			
			var index = 0;
			for (var l in myportaljson.columns) {
				if (index < newlength) {
					for (var i = 0; i < myportaljson.columns[l].length; i++) {
						columns[index][i] = new Object();
						columns[index][i].name = myportaljson.columns[l][i].name;
						columns[index][i].visible = myportaljson.columns[l][i].visible;
						columns[index][i].uid = myportaljson.columns[l][i].uid;
					}
					index++;
				}
			}
			
			index = 0;
			if (newlength < initlength) {
				for (var l in myportaljson.columns) {
					if (index >= newlength) {
						for (var i = 0; i < myportaljson.columns[l].length; i++) {
							var lowestnumber = -1;
							var lowestcolumn = -1;
							for (var iii = 0; iii < columns.length; iii++) {
								var number = columns[iii].length;
								if (number < lowestnumber || lowestnumber == -1) {
									lowestnumber = number;
									lowestcolumn = iii;
								}
							}
							var _i = columns[lowestcolumn].length;
							columns[lowestcolumn][_i] = new Object();
							columns[lowestcolumn][_i].name = myportaljson.columns[l][i].name;
							columns[lowestcolumn][_i].visible = myportaljson.columns[l][i].visible;
							columns[lowestcolumn][_i].uid = myportaljson.columns[l][i].uid;
						}
					}
					index++;
				}
			}
			
			var jsonstring = '{"columns":{';
			for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++) {
				jsonstring += '"column' + (i + 1) + '":[';
				for (var ii = 0; ii < columns[i].length; ii++) {
					jsonstring += '{"name":"' + columns[i][ii].name + '","visible":"' + columns[i][ii].visible + '","uid":"' + columns[i][ii].uid + '"}';
					if (ii !== columns[i].length - 1) {
						jsonstring += ',';
					}
				}
				jsonstring += ']';
				if (i !== Widgets.layouts[selectedlayout].widths.length - 1) {
					jsonstring += ',';
				}
			}
			
			jsonstring += '},"layout":"' + selectedlayout + '"}';
			
			myportaljson = eval('(' + jsonstring + ')');
			layout = myportaljson;
			
			sdata.widgets.WidgetPreference.save("/sdata/p/widgets", "devstate", jsonstring, null);
			
		}
		
		var final = [];
		final.columns = [];
		var currentindex = -1;
		var isvalid = true;
		
		try {
			for (var c in layout.columns) {
			
				currentindex++;
				var index = final.columns.length;
				final.columns[index] = [];
				final.columns[index].portlets = [];
				final.columns[index].width = Widgets.layouts[layout.layout].widths[currentindex];
				
				var columndef = layout.columns[c];
				for (var pi in columndef) {
					var portaldef = columndef[pi];
					if (portaldef.name && Widgets.widgets[portaldef.name]) {
						var widget = Widgets.widgets[portaldef.name];
						var iindex = final.columns[index].portlets.length;
						final.columns[index].portlets[iindex] = [];
						final.columns[index].portlets[iindex].id = widget.id;
						final.columns[index].portlets[iindex].iframe = widget.iframe;
						final.columns[index].portlets[iindex].url = widget.url;
						final.columns[index].portlets[iindex].title = widget.name;
						final.columns[index].portlets[iindex].display = portaldef.visible;
						final.columns[index].portlets[iindex].uid = portaldef.uid;
						final.columns[index].portlets[iindex].placement = "~" + person.items.userid;
						final.columns[index].portlets[iindex].height = widget.height;
					}
				}
			}
			
		} 
		catch (err) {
			isvalid = false
		};
		
		
		if (isvalid) {
		
			document.getElementById('widgetscontainer').innerHTML = sdata.html.Template.render("widgetscontainer_template", final);
			
			/*
		 var doselectors = {
		 columns: ".groupWrapper",
		 modules: ".widget1",
		 lockedModules: ".lockedModules"
		 }
		 
		 orderableFinderFunction = function () {
		 return jQuery("#widgetscontainer .widget1");
		 };
		 
		 fluid.lightbox(fluid.utils.jById("widgetscontainer"), {
		 selectors: {
		 movables: ".widget1",
		 grabHandle: ".widget1-head"
		 }
		 });
		 */
			/*
		 $('div.groupWrapper').Sortable(
		 {
		 accept: 'widget1',
		 helperclass: 'sortHelper',
		 activeclass : 	'sortableactive',
		 hoverclass : 	'sortablehover',
		 handle: 'div.widget1-head',
		 tolerance: 'pointer',
		 onChange : function(ser)
		 {
		 },
		 onStart : function()
		 {
		 $.iAutoscroller.start(this, document.getElementsByTagName('body'));
		 },
		 onStop : function()
		 {
		 $.iAutoscroller.stop();
		 saveState();
		 }
		 }
		 );
		 
		 if (navigator.userAgent.indexOf("MSIE") != -1){
		 var items = $(".itemHeader");
		 for (var i = 0; i < items.length; i++){
		 items[i].style.width = "100%";
		 }
		 }
		 */
			var layout, dropTargetPerms, grabHandle;
			
			var columnsdef = [];
			var tussen = 0;
			
			for (var c = 0 ; c < final.columns.length ; c++) {
				var portlets = final.columns[c].portlets;
				tussen++;
				var index = columnsdef.length;
				columnsdef[index] = {};
				columnsdef[index].id = "column_uid_" + tussen;
				columnsdef[index].children = [];
				for (var p = 0; p < portlets.length; p++){
					var index2 = columnsdef[index].children.length;
					columnsdef[index].children[index2] = portlets[p].id + "_" + portlets[p].uid;
				}
			}
			
			layout = {
				id: "widgetscontainer",
				columns: columnsdef
			};
			
			grabHandle = function(item){
				// the handle is the toolbar. The toolbar id is the same as the portlet id, with the
				// "portlet_" prefix replaced by "toolbar_".
				return jQuery("[id=draghandle_" + item.id + "]");
			};
			
			var classNames, options;
			
			classNames = {
				mouseDrag: "orderable-mouse-drag",
				dropMarker: "orderable-drop-marker-box",
				avatar: "orderable-avatar-clone"
			};
			
			createAvatar = function(el){
				var div = document.createElement("div");
				var element = $(el);
				div.style.width = element.width() + "px";
				div.style.height = element.height() + "px";
				div.innerHTML = el.innerHTML;
				console.debug(element.width());
				div.style.backgroundColor = "#EEEEEE";
				div.className = "widget1";
				//div.style.border = "2px dashed #AAAAAA"
				return div;
			}
			
			options = {
				styles: classNames,
				dropWarningId: "drop-warning",
				grabHandle: grabHandle,
				avatarCreator: createAvatar,
				orderChangedCallback: saveState
			};
			
			fluid.initLayoutCustomizer(layout, dropTargetPerms, null, options);
			
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced("widgetscontainer");
			
		} else {
			showInit();
		}
	
	}		

	var saveState = function (){
		
		serString = '{"columns":{';
		if (startSaving === true){
	
			var columns = $(".groupWrapper");
	   	 	for (var i = 0; i < columns.length; i++){
				if (i != 0){
					serString += ",";
				}
				serString += '"column' + (i + 1) + '":[';
				var column = columns[i];
				var iii = -1;
				for (var ii = 0; ii < column.childNodes.length; ii++){
					
					try {
						var node = column.childNodes[ii];
			
						widgetdisplay = "block";
						var nowAt = 0;
						var id = node.style.display;
						var uid = Math.round(Math.random() * 100000000000);
						for (var y = 0; y < node.childNodes.length; y++){
							if (node.childNodes[y].style){
								if (nowAt == 1){
									if (node.childNodes[y].style.display.toLowerCase() === "none"){
										widgetdisplay = "none";
									}
									uid = node.childNodes[y].id;
								}
								nowAt++;
							}
						}
						
						iii++;
						if (iii != 0){
							serString += ",";
						}
						serString += '{"name":"' + node.id.split("_")[0] + '","visible":"' + widgetdisplay + '","uid":"' + uid + '"}';
					} catch (err){}			
	
				}

				serString += "]";

			}

			serString += '},"layout":"' + myportaljson.layout + '"}';
	
			myportaljson = eval('(' + serString + ')');
			
			var isempty = true;
			for (var i in myportaljson.columns){
				if (myportaljson.columns[i].length > 0){
					isempty = false;
				}
			}

			sdata.widgets.WidgetPreference.save("/sdata/p/widgets","devstate",serString, checksucceed);
	
		}
		
	}

	var checksucceed= function (success){
		if (!success){
			window.alert("Connection with the server was lost");
		}
	}

	sakai.dashboard.closePortlet = function(id){
		var el = document.getElementById(id);
		var parent = el.parentNode;
		parent.removeChild(el);
		saveState();
	}

	sakai.dashboard.showAddWidgets = function(){

		addingPossible = [];
		addingPossible.items = [];
		document.getElementById("addwidgetlist").innerHTML = "";
	
		for (var l in Widgets.widgets){
			var alreadyIn = false;
			if (! Widgets.widgets[l].multipleinstance) {
				for (var c in myportaljson.columns) {
					for (var ii = 0; ii < myportaljson.columns[c].length; ii++) {
						if (myportaljson.columns[c][ii].name === l) {
							alreadyIn = true;
						}
					}
				}
			}
			if (Widgets.widgets[l].personalportal){
				var index = addingPossible.items.length;
				addingPossible.items[index] = [];
				addingPossible.items[index].alreadyIn = alreadyIn;
				addingPossible.items[index].title = Widgets.widgets[l].name;
				addingPossible.items[index].id = Widgets.widgets[l].id;
				addingPossible.items[index].description = Widgets.widgets[l].description;
				addingPossible.items[index].img = Widgets.widgets[l].img;
			}
		}

		document.getElementById("addwidgetlist").innerHTML = sdata.html.Template.render("addwidgetlist_template", addingPossible);
		currentlyopen = addingPossible.items[0].id;

		$("#addWidgets_selected_title").text(addingPossible.items[0].title);
		$("#addWidgets_selected_description").text(addingPossible.items[0].description);
		$("#widget_img").attr("src",addingPossible.items[0].img);
		if (addingPossible.items[0].alreadyIn){
			$("#btnAddWidget").hide();
			$("#btnRemoveWidget").show();
		} else {
			$("#btnRemoveWidget").hide();
			$("#btnAddWidget").show();
		}
		
		$("#addwidgetslightbox").fadeIn();	
		$("#addwidgetslightbox2").fadeIn();
	}

	sakai.dashboard.hideAddWidgets = function(){
		$("#addwidgetslightbox").fadeOut();
		$("#addwidgetslightbox2").fadeOut();
	}

	sakai.dashboard.finishAddWidgets = function(){
		document.reload(true);
	}

	var currentlyopen = "";

	sakai.dashboard.showdetails = function(id){
		for (var l in Widgets.widgets){
			if (Widgets.widgets[l].personalportal && Widgets.widgets[l].id == id){
				var alreadyIn = false;
				if (!Widgets.widgets[l].multipleinstance) {
					for (var c in myportaljson.columns) {
						for (var ii = 0; ii < myportaljson.columns[c].length; ii++) {
							if (myportaljson.columns[c][ii].name === l) {
								alreadyIn = true;
							}
						}
					}
				}
				currentlyopen = Widgets.widgets[l].id;
				$("#addWidgets_selected_title").text(Widgets.widgets[l].name);
				$("#addWidgets_selected_description").text(Widgets.widgets[l].description);
				$("#widget_img").attr("src",Widgets.widgets[l].img);
				if (alreadyIn){
					$("#btnAddWidget").hide();
					$("#btnRemoveWidget").show();
				} else {
					$("#btnRemoveWidget").hide();
					$("#btnAddWidget").show();
				}
			}
		}	
	}

	sakai.dashboard.removeWidget = function(){
		sakai.dashboard.closePortlet(currentlyopen);
		document.getElementById('li_' + currentlyopen).className = "";
		$("#btnRemoveWidget").hide();
		$("#btnAddWidget").show();
	}

	sakai.dashboard.addWidget = function(){
		
		var selectedlayout = "dev";

		var columns = [];
		for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++){
			columns[i] = [];
		}

		var initlength = Widgets.layouts[myportaljson.layout].widths.length;
		var newlength = Widgets.layouts[selectedlayout].widths.length;
	
		var index = 0;
		for (var l in myportaljson.columns){
			if (index < newlength){
				for (var i = 0; i < myportaljson.columns[l].length; i++){
					columns[index][i] = new Object();
					columns[index][i].name = myportaljson.columns[l][i].name;
					columns[index][i].visible = myportaljson.columns[l][i].visible;
					columns[index][i].uid = myportaljson.columns[l][i].uid;
				}
				index++;
			}
		}

		index = 0;
		if (myportaljson.layout != selectedlayout){
			if (newlength < initlength){
				for (var l in myportaljson.columns){
					if (index >= newlength){
						for (var i = 0; i < myportaljson.columns[l].length; i++){
							var lowestnumber = -1;
							var lowestcolumn = -1;
							for (var iii = 0; iii < columns.length; iii++){
								var number = columns[iii].length;
								if (number < lowestnumber || lowestnumber == -1){
									lowestnumber = number;
									lowestcolumn = iii;
								}
							}
							var _i = columns[lowestcolumn].length;
							columns[lowestcolumn][_i] = new Object();
							columns[lowestcolumn][_i].name = myportaljson.columns[l][i].name;
							columns[lowestcolumn][_i].visible = myportaljson.columns[l][i].visible;
							columns[lowestcolumn][_i].uid = myportaljson.columns[l][i].uid;
						}
					}
					index++;
				}
			}
		} 

		var currentWidget = currentlyopen;
	
		var lowestnumber = -1;
		var lowestcolumn = -1;
		for (var iii = 0; iii < columns.length; iii++){
			var number = columns[iii].length;
			if (number < lowestnumber || lowestnumber == -1){
				lowestnumber = number;
				lowestcolumn = iii;
			}
		}
		var _i = columns[lowestcolumn].length;
		columns[lowestcolumn][_i] = new Object();
		columns[lowestcolumn][_i].name = currentWidget;
		columns[lowestcolumn][_i].visible = "block";
		columns[lowestcolumn][_i].uid = "id" + Math.round(Math.random() * 10000000000);
	
		var jsonstring = '{"columns":{';
		for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++){
			jsonstring += '"column' + (i + 1) + '":[';
			for (var ii = 0; ii < columns[i].length; ii++){
				jsonstring += '{"name":"' + columns[i][ii].name + '","visible":"' + columns[i][ii].visible + '","uid":"' + columns[i][ii].uid + '"}';
				if (ii !== columns[i].length - 1){
					jsonstring += ',';
				}	
			}
			jsonstring += ']';
			if (i !== Widgets.layouts[selectedlayout].widths.length - 1){
				jsonstring += ',';
			}
		}
		jsonstring += '},"layout":"' + selectedlayout + '"}';

		myportaljson = eval('(' + jsonstring + ')');

		sdata.widgets.WidgetPreference.save("/sdata/p/widgets","devstate",jsonstring, finishAddWidgets);

	}

	finishAddWidgets = function (success){
		if (success){
			document.getElementById("widgetscontainer").innerHTML = "";
			if (!Widgets.widgets[currentlyopen].multipleinstance) {
				document.getElementById('li_' + currentlyopen).className = "awm-minus";
				$("#btnAddWidget").hide();
				$("#btnRemoveWidget").show();
			}
			showMyPortal();
		} 
		else {
			window.alert("The connection with the server has been lost");
		}
	}

	sdata.widgets.WidgetPreference.get("devstate", decideExists);

};

sdata.registerForLoad("sakai.dashboard");