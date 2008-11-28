var sakai = sakai || {};
sakai.siteSettingsMembers = function(){
	var jsonUrl;
	var membersJson;

	/*** Start of copy from site_setting_general.js - TODO refactor ***/
	var siteJson;
	var getSiteJsonUrl = function() {
		var siteJsonUrl;
		if (window.location.protocol == "file:") {
			siteJsonUrl = "js/demo_site.json";
		} else {
			var qs = new Querystring();
			var siteId = qs.get("site");
			if (siteId) {
				siteJsonUrl = "/direct/site/" + siteId + ".json";
			}
		}
		getSiteJsonUrl = function() {
			return siteJsonUrl;
		};
		return getSiteJsonUrl();
	};
	function refreshSiteJson() {
		// Work around Entity Broker JSON caching.
		$.ajax({
			type: "GET",
			url: getSiteJsonUrl(),
			dataType: "json",
			cache: false,
			success: function(data){
				siteJson = data;
				refreshSiteScreen();
			}
		});
	}
	function removeSuccessMessages() {
		$(".msg-success").hide();
	}
	function removeErrorMessages() {
		$(".msg-error-cause").removeClass("msg-error-cause");
		$(".msg-error").hide();
	}
	/*** End of copy from site_setting_general.js - TODO refactor ***/

	function removeSuccessMessage() {
		$(this).parents(".msg-success").hide();
	}
	function removeErrorMessage() {
		$(this).parents(".msg-error").hide();
	}

	function init() {
		YAHOO.widget.Logger.enableBrowserConsole();

		$(".msg-error .msg-remove a").click(removeErrorMessage);
		$(".msg-success .msg-remove a").click(removeSuccessMessage);

		$("#command-selected-members").change(function() {
			if ($(this).val()) {
				$("#change-selected-members").removeClass("inactive").addClass("active");
			} else {
				$("#change-selected-members").removeClass("active").addClass("inactive");
			}
		});

		if (window.location.protocol == "file:") {
			jsonUrl = "js/demo_site_membership.json";
		} else {
			var qs = new Querystring();
			var siteId = qs.get("site");
			if (siteId) {
				jsonUrl = "/direct/membership/site/" + siteId + ".json";
			}
		}
		refreshSiteJson();
		refreshMembersJson();
		$("div.ss-members").show();
	}

	function refreshMembersJson() {
		// Work around Entity Broker JSON caching.
		$.ajax({
			type: "GET",
			url: jsonUrl,
			dataType: "json",
			cache: false,
			success: function(data){
				membersJson = data;
				refreshMembersScreen();
			},
			error: function(xmlHttpRequest, textStatus, errorThrown) {
				$("#msg-error-default .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
				$("#msg-error-default").show();
			}
		});
	}

	function saveChanges(memberId, changedProps) {
		removeErrorMessages();
		removeSuccessMessages();
		$.ajax({
			type: "POST",
			url: "/direct/membership/" + memberId,
			data: changedProps,
			success: function(data){
				$("#msg-success-default").show();
				refreshMembersJson();
			},
			error: function(xmlHttpRequest, textStatus, errorThrown) {
				$("#msg-error-default .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
				$("#msg-error-default").show();
			}
		});
	}

	function checkboxChanged(checkedIdsLength) {
		// If any rows have been selected, enable the bottom
		// buttons. Otherwise, disable them.
		if (checkedIdsLength === undefined) {
			checkedIdsLength = getCheckedIds().length;
		}
		if (checkedIdsLength > 0) {
			$("#delete-selected-members").removeClass("inactive").addClass("active");
			$("#command-selected-members").removeClass("inactive").removeAttr("disabled");
		} else {
			$("#delete-selected-members").removeClass("active").addClass("inactive");
			$("#command-selected-members").attr("selectedIndex", 0);
			$("#command-selected-members").addClass("inactive").attr("disabled", "true");
			$("#change-selected-members").removeClass("active").addClass("inactive");
		}
		$(".selected-count").text(checkedIdsLength);
	}

	function getSelectedMembersData() {
		var checkedIds = getCheckedIds();
		var selectedMembers = {};
		for (var i = 0; i < checkedIds.length; i++) {
			var memberId = checkedIds[i];
			if (i == 0) {
				if (console) console.log("Selected targetMemberId=" + memberId);
				selectedMembers.targetMemberId = memberId;
			} else {
				if (i == 1) {
					selectedMembers.additionalParams = {userIds: []};
				}
				var userId = memberId.split("::")[0];
				if (console) console.log("Also selected userId=" + userId);
				selectedMembers.additionalParams.userIds.push(userId);
			}
		}
		return selectedMembers;
	}

	function updateSelectedMembers() {
		removeErrorMessages();
		removeSuccessMessages();
		var updateCommand = $("#command-selected-members").val().replace("selected-members-", "");
		updateCommand = updateCommand.split("-");
		var params = {};
		params[updateCommand[0]] = updateCommand[1];
		var selectedMembers = getSelectedMembersData();
		if (selectedMembers.targetMemberId !== undefined) {
			var targetUrl = "/direct/membership/" + selectedMembers.targetMemberId;
			if (selectedMembers.additionalParams) {
				params.userIds = selectedMembers.additionalParams.userIds;
			}
			$.ajax({
				type: "POST",
				url: targetUrl,
				data: params,
				success: function(data){
					$("#msg-success-default").show();
					refreshMembersJson();
				},
				error: function(xmlHttpRequest, textStatus, errorThrown) {
					$("#msg-error-default .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
					$("#msg-error-default").show();
				}
			});
		}
	}

	function deleteSelectedMembers(){
		removeErrorMessages();
		removeSuccessMessages();
		var selectedMembers = getSelectedMembersData();
		if (selectedMembers.targetMemberId !== undefined) {
			// Work around jquery.ajax bug: treats DELETE like POST instead of like GET.
			var targetUrl = "/direct/membership/" + selectedMembers.targetMemberId;
			if (selectedMembers.additionalParams) {
				var additionalParams = $.param(selectedMembers.additionalParams);
				targetUrl += (targetUrl.match(/\?/) ? "&" : "?") + additionalParams;
			}

			$.ajax({
				type: "DELETE",
				url: targetUrl,
				success: function(data){
					$("#msg-success-default").show();
					refreshMembersJson();
				},
				error: function(xmlHttpRequest, textStatus, errorThrown) {
					$("#msg-error-default .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
					$("#msg-error-default").show();
				}
			});
		}
	}

	function findInactiveMembers(){
		$(".memberStatus select").each(function(index, item) {
			var value = $(item).val();
			if($(item).val() == "false") {
				var rowParent = $(item).parents("tr");
				rowParent.addClass("inactive");
				$(".memberRole select", rowParent).attr("disabled","disabled");
			}
		});
	}

	var yuiDataTable;

	function refreshMembersScreen() {
		membersJson["userRoles"] = siteJson.userRoles;
		$(".membership-count").text(membersJson.membership_collection.length);

		yuiDataTable = buildYuiDataTable();
		var paginator = yuiDataTable.getState().pagination.paginator;

		$(".nextPage").click(function() {
			if (paginator.hasNextPage()) {
				paginator.setPage(paginator.getNextPage());
			}
		});
		$(".prevPage").click(function() {
			if (paginator.hasPreviousPage()) {
				paginator.setPage(paginator.getPreviousPage());
			}
		});
		$(".rowsPerPageDropdown").change(function() {
			paginator.setRowsPerPage(parseInt($(this).val()));
		});
		$("select.rowsPerPageDropdown").attr("selectedIndex", 0);

		var refreshPageLinksDropdown = function() {
			var totalPages = paginator.getTotalPages();
			$(".pageLinksDropdown").empty();
			for (var i = 1; i <= totalPages; i++) {
				$(".pageLinksDropdown").append('<option value="' + i +
											'">Page ' + i + ' of ' + totalPages + '</option>');
			}
		}
		refreshPageLinksDropdown();
		$(".pageLinksDropdown").change(function() {
			paginator.setPage(parseInt($(this).val()));
		});
		paginator.subscribe("pageChange", function(oEvent) {
			if ($(".pageLinksDropdown").val() != oEvent.newValue) {
				$(".pageLinksDropdown").val(oEvent.newValue);
			}
		});
		paginator.subscribe("rowsPerPageChange", function(oEvent) {
			refreshPageLinksDropdown();
		});

		yuiDataTable.subscribe("renderEvent", function(oEvent) {
			if (!paginator.hasNextPage()) {
				$(".nextPage").addClass("nonbuttonInactive");
			} else {
				$(".nextPage").removeClass("nonbuttonInactive");
			}
			if (!paginator.hasPreviousPage()) {
				$(".prevPage").addClass("nonbuttonInactive");
			} else {
				$(".prevPage").removeClass("nonbuttonInactive");
			}
			findInactiveMembers();
		});

		var setSelectedMembers = function(isSelect, startPos, endPos) {
			var checkedIdsLength;	// May be used as undefined
			var records = yuiDataTable.getRecordSet().getRecords();
			if (startPos === undefined) {
				startPos = 0;
				endPos = records.length;
				checkedIdsLength = isSelect ? endPos : 0;
			}
			var col = yuiDataTable.getColumn("member-checked");
			for (var i = startPos; i < endPos; i++) {
				var record = records[i];
				if (record.getData("member-checked") != isSelect) {
					yuiDataTable.updateCell(record, col, isSelect);
				}
			}
			checkboxChanged(checkedIdsLength);
		};
		$(".selectAllVisibleMembers").click(function() {
			var startAndEnd = paginator.getPageRecords();
			setSelectedMembers(true, startAndEnd[0], startAndEnd[1] + 1);
		});
		$(".selectAllMembers").click(function() {
			setSelectedMembers(true);
		});
		$(".unselectMembers").click(function() {
			setSelectedMembers(false);
		});
		$('#delete-selected-members').click(deleteSelectedMembers);
		$("#change-selected-members").click(updateSelectedMembers);

		checkboxChanged(0);
	}

	function refreshSiteScreen() {
		document.title = siteJson.title + " - Members Settings";
		$("#back_site").attr("href", "/dev/site_home_page.html?siteid=" + siteJson.id);
		$(".site-title").text(siteJson.title);
		$("a.site-setting-link").attr("href", "site_setting_general.html?site=" + siteJson.id);
		$(".add-widgets").click(showAddMembersWidget);
		$(".csbc4-link").click(hideAddMembersWidget);
		$(".lhr-close").click(hideAddMembersWidget);
		$(".save").click(sendInvitation);
		$("#message").keyup(textCountLeft);
		$("#message").keydown(textCountLeft);

		sdata.html.Template.render("selected-members-roles-template", siteJson, $("#selected-members-roles"));
		sdata.html.Template.render("default-members-roles-template", siteJson, $("#default-members-roles"));
		if(siteJson.joinerRole!=null) {
			$("option[value="+siteJson.joinerRole+"]").attr("selected","selected");
		}
	}

	function getCheckedIds() {
		var checkedIds = [];
		var records = yuiDataTable.getRecordSet().getRecords();
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			if (record.getData("member-checked")) {
				checkedIds.push(record.getData("id"));
			}
		}
		return checkedIds;
	}

	function buildYuiDataTable() {
		var parseFromBoolean = function(oData) {
			return (oData ? "true" : "false");
		};
		var memberLinkFormatter = function(elCell, oRecord, oColumn, oData) {
			var memberName = oData;
			elCell.innerHTML = "<a href=\"#\">" + memberName + "</a>";
		};
		var myColumnDefs = [
		{key:"member-checked", label:" ", formatter:"checkbox", sortable:true,
			className:"w28 bgEBECED"},
		{key:"userDisplayName", label:"Members",
			formatter:memberLinkFormatter,
			sortable:true, className:"per47 fs13 memberName"},
		{key:"userEmail", label:"Email", formatter:"email", sortable:true, className:"per23 fs13"},
		{key:"memberRole", label:"Role",
			formatter:"dropdown", dropdownOptions: siteJson.userRoles,
			sortable:true, className:"per18 memberRole"},
		{key:"active", label:"Status",
			formatter:"dropdown",
			dropdownOptions: [{value:"true", text:"Active"}, {value:"false", text:"Inactive"}],
			sortable:true, className:"per18 memberStatus"}
				];
		var myDataSource = new YAHOO.util.DataSource(membersJson);
		myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
		myDataSource.responseSchema = {
			resultsList: "membership_collection",
			fields: ["id","userDisplayName","userEmail","memberRole",
			{key:"active", parser:parseFromBoolean}]
		};

		var oConfigs = {
			paginator: new YAHOO.widget.Paginator({
				rowsPerPage: 10,
				totalRecords: membersJson.membership_collection.length,
				template: ""
			})
		};

		var myDataTable = new YAHOO.widget.DataTable("membership-table", myColumnDefs, myDataSource, oConfigs);

		myDataTable.subscribe("checkboxClickEvent", function(oArgs){
			var elCheckbox = oArgs.target;
			var record = this.getRecord(elCheckbox);
			record.setData("member-checked", elCheckbox.checked);
			checkboxChanged();
		});

		myDataTable.subscribe("dropdownChangeEvent", function(oArgs){
			var elDropdown = oArgs.target;
			var record = this.getRecord(elDropdown);
			var memberId = record.getData("id");
			var column = this.getColumn(elDropdown);
			var changedMember = {};
			changedMember[column.key] = elDropdown.value;
			saveChanges(memberId, changedMember);
		});

		return myDataTable;
	};

	function showAddMembersWidget(){
		$(".overlay-lightbox").show();
		$("#add-members-title").removeClass("msg-error-cause");
	}

	function hideAddMembersWidget(){
		$(".overlay-lightbox").hide();
		$("#add-members-title").removeClass("msg-error-cause");
	}

	function sendInvitation(){
		var invites = $("#invitees").val();
		var defaultRole = $("#default-members-roles").val();
		var message = $("#message").val();
		var locationReference = siteJson.entityReference;
		var users = invites.split("\n");
		var userid;
		if (isValid()) {
			addUsers(userid, users, locationReference, defaultRole);
			hideAddMembersWidget();
		}
	}

	function addUsers(userId, userIds, locationReference, memberRole){
		removeErrorMessages();
		removeSuccessMessages();
		var postUrl = "/direct/membership/site/" + siteJson.id + ".json";
		var userData = {
			userSearchValues: userIds,
			memberRole:memberRole
		};
		$.ajax({
			type: "POST",
			url: postUrl,
			data: userData,
			dataType: "json",
			success: function(data){
				$("#invitees").val("");
				membersJson = data;
				refreshMembersScreen();
			},
			error: function(xmlHttpRequest, textStatus, errorThrown) {
				$(".msg-error .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
				$(".msg-error").show();
			},
			complete: function(xmlHttpRequest, textStatus) {
				var message = xmlHttpRequest.getResponseHeader("x-success-count");
				if (message) {
					$(".added-member-count").text(message);
					$("#msg-success-count").show();
				}
				message = xmlHttpRequest.getResponseHeader("x-warning-not-found");
				if (message) {
					$(".users-not-found").text(message);
					$("#msg-error-not-found").show();
				}
				message = xmlHttpRequest.getResponseHeader("x-warning-already-members");
				if (message) {
					$(".users-already-members").text(message);
					$("#msg-error-already-members").show();
				}
			}
		});
	}

	function isValid() {
		var candidates = $("#invitees").val();
		if (!candidates) {
			$("#add-members-title").addClass("msg-error-cause");
			return false;
		} else {
			return true;
		}
	}

	function textCountLeft(){
		var maxCount = 500;
		var txtCount;
		if($("#message").val().length < maxCount){
			txtCount = maxCount - $("#message").val().length ;
			console.log("rem txt "+txtCount);
		}else{
			$("#message").val($("#message").val().substring(0,maxCount));
			txtCount = 0;
		}
	}

	init();
};

sdata.registerForLoad("sakai.siteSettingsMembers");
