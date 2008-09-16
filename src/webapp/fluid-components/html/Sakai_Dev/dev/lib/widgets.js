var Widgets = {
	groups:[
		"Administrators",
		"Lecturers & Supervisors",
		"Researchers",
		"Students"],
	layouts : {
		dev : 
		{
			name:"Dev Layout",
			widths:["300px","","300px"]
		},
		twocolumn :
		{
			name:"Two equal columns",
			widths:[50,50]
		},
		threecolumn :
		{
			name:"Three equal columns",
			widths:[33,33,33]
		},
		twocolumnspecial :
		{
			name:"One wide and one narrow column",
			widths:[66,33]
		},
		fourcolumn :
		{
			name:"Four equal columns",
			widths:[25,25,25,25]
		},
		onecolumn :
		{
			name:"One column",
			widths:[100]
		},
		threecolumnspecial :
		{
			name:"Two narrow columns, one wide column",
			widths:[25,50,25]
		}
	},
	widgets: {
	    tools :
		{
			description:"List of tools\r\n",
			iframe:0,
			url:"/devwidgets/tools/tools.html",
			name:"Tools",
			id:"tools",
			personalportal:1,
			siteportal:1,
			img:"/dev/img/tools.png"
		},
		sites :
		{
			description:"Listing of the sites I'm a member of\r\n",
			iframe:0,
			url:"/devwidgets/sites/sites.html",
			name:"Sites",
			id:"sites",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/sites.png"
		},
		myprofile :
		{
			description:"My Personal Profile\r\n",
			iframe:0,
			url:"/devwidgets/myprofile/myprofile.html",
			name:"My Profile",
			id:"myprofile",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/myprofile.png"
		},
		helloworld :
		{
			description:"Sakai Hackathon Example\r\n",
			iframe:0,
			url:"/devwidgets/helloworld/helloworld.html",
			name:"Hello World",
			id:"helloworld",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/myprofile.png"
		},
		sparkline :
		{
			description:"Sparkline\r\n",
			iframe:0,
			url:"/devwidgets/sparkline/sparkline.html",
			name:"Sparkline",
			id:"sparkline",
			personalportal:0,
			siteportal:1,
			img:"/dev/img/sparkline.png"
		},
		createsite :
		{
			description:"Create site\r\n",
			iframe:0,
			url:"/devwidgets/createsite/createsite.html",
			name:"Create Site",
			id:"createsite",
			personalportal:0,
			siteportal:0,
			img:"/dev/img/sites.png"
		},
		myfriends :
		{
			description:"A list of my friends\r\n",
			iframe:0,
			url:"/devwidgets/myfriends/myfriends.html",
			name:"My Friends",
			id:"myfriends",
			personalportal:1,
			siteportal:0,
			img:"/dev/img/myprofile.png",
			multipleinstance: false
		},
		announcementupdates :
		{
			description:"A list of Announcements & Updates\r\n",
			iframe:0,
			url:"/devwidgets/announcementupdates/announcementupdates.html",
			name:"Announcements & Updates",
			id:"announcementupdates",
			personalportal:0,
			siteportal:1,
			img:"/dev/img/myprofile.png",
			multipleinstance: false
		},
		pagemanagement :
		{
			description:"pagemanagement",
			iframe:0,
			url:"/devwidgets/pagemanagement/pagemanagement.html",
			name:"pagemanagement",
			id:"pagemanagement",
			personalportal:0,
			siteportal:0
		},
		youtubevideo :
		{
			description:"YouTube Video",
			iframe:0,
			url:"/devwidgets/youtubevideo/youtubevideo.html",
			name:"YouTube Video",
			id:"youtubevideo",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/youtubevideo/images/icon.png"
		},
		singlefile :
		{
			description:"Single File Reference",
			iframe:0,
			url:"/devwidgets/singlefile/singlefile.html",
			name:"Single File Reference",
			id:"singlefile",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/singlefile/images/icon.gif"
		},
		comments :
		{
			description:"Comments",
			iframe:0,
			url:"/devwidgets/comments/comments.html",
			name:"Comments",
			id:"comments",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/comments/images/icon.jpg"
		},
		poll :
		{
			description:"Poll",
			iframe:0,
			url:"/devwidgets/poll/poll.html",
			name:"Poll",
			id:"poll",
			personalportal:0,
			siteportal:0,
			ca:1,
			img:"/devwidgets/poll/images/poll_icon.gif"
		},
		Resources :
		{
			description:"Resources tool",
			iframe:"0",
			url:"/devwidgets/Resources/Resources.html",
			name:"Resources",
			id:"resources",
			personalportal:0,
			siteportal:0,
			history : {"init":"Resources.initHistory","nav":"Resources.browser.printResources",tag:"Resources.tagging.showTagViewReal"}
		},
		polltracker :
		{
			description:"Track the results of all of the polls on the sites you are a member of",
			iframe:0,
			url:"/devwidgets/polltracker/polltracker.html",
			name:"Poll Tracker",
			id:"polltracker",
			personalportal:1,
			siteportal:0,
			multipleinstance: true,
			img:"/devwidgets/polltracker/images/poll_icon.gif"
		}
	},
	orders:[
		{
			grouptype:"General",
			widgets: ["mycoursesandprojects","messageoftheday","recentactivity"],
			id:1,
			layout: "twocolumnspecial"
		},
		{
			grouptype:"Administrators",
			widgets: ["mycoursesandprojects","messageoftheday","quickannouncement"],
			id:1,
			layout: "twocolumn"
		},
		{
			grouptype:"Lecturers & Supervisors",
			widgets:["mycoursesandprojects","recentactivity"],
			id:2,
			layout: "twocolumnspecial"
		},
		{
			grouptype:"Researchers",
			widgets:["recentactivity","mycoursesandprojects","messageoftheday"],
			id:3,
			layout: "threecolumn"
		},
		{
			grouptype:"Students",
			widgets:["recentactivity","mycoursesandprojects","quickannouncement","messageoftheday","myrssfeed"],
			id:4,
			layout: "fourcolumn"
		}
	]
};



