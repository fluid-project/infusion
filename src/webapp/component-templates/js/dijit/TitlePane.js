if(!dojo._hasResource["dijit.TitlePane"]){
dojo._hasResource["dijit.TitlePane"] = true;
dojo.provide("dijit.TitlePane");

dojo.require("dojo.fx");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare(
	"dijit.TitlePane",
	[dijit._Widget, dijit._Templated],
{
	// summary
	//		A pane with a title on top, that can be opened or collapsed.

	// title: String
	//		Title of the pane
	title: "",

	// open: Boolean
	//		Whether pane is opened or closed.
	open: true,

	// duration: Integer
	//		milliseconds to fade in/fade out
	duration: 250,

	contentClass : "dijitTitlePaneContent",

	templateString:"<div id=\"${id}\">\n\t<div dojoAttachEvent=\"onclick: _onTitleClick; onkeypress: _onTitleKey\" tabindex=\"0\"\n\t\t\twaiRole=\"button\" class=\"dijitTitlePaneTitle\" dojoAttachPoint=\"focusNode\">\n\t\t<span class=\"dijitOpenCloseArrowOuter\" style=\"float: left;\"><span class=\"dijitOpenCloseArrowInner\"></span></span>\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitInlineBox dijitTitleNode\"></span>\n\t</div>\n\t<div dojoAttachPoint=\"containerNode\" waiRole=\"region\" tabindex=\"-1\" class=\"dijitTitlePaneContent\"></div>\n</div>\n",

	postCreate: function(){
		this.setTitle(this.title);
		if(!this.open){
			dojo.style(this.containerNode, "display", "none");
		}
		this._setCss();
		dijit.TitlePane.superclass.postCreate.apply(this, arguments);
		dijit.util.wai.setAttr(this.containerNode, "waiState", "titleledby", this.titleNode.id);
		dijit.util.wai.setAttr(this.focusNode, "waiState", "haspopup", "true");

		// setup open/close animations
		this._slideIn = dojo.fx.slideIn({node: this.containerNode, duration: this.duration});
		this._slideOut = dojo.fx.slideOut({node: this.containerNode, duration: this.duration});
	},

	_onTitleClick: function(){
		// summary: callback when title is clicked
		dojo.forEach([this._slideIn, this._slideOut], function(animation){
			if(animation.status() == "playing"){
				animation.stop();
			}
		});
		this[this.open ? "_slideOut" : "_slideIn"].play();
		this.open=!this.open;
		this._setCss();
	},

	_setCss: function(){
		var classes = ["dijitClosed", "dijitOpen"];
		var boolIndex = this.open;
		dojo.removeClass(this.domNode, classes[!boolIndex+0]);
		this.domNode.className += " " + classes[boolIndex+0];
	},

	_onTitleKey: function(/*Event*/ e){
		// summary: callback when user hits a key
		if(e.keyCode == dojo.keys.ENTER || e.charCode == dojo.keys.SPACE){
			this._onTitleClick();
		}
		else if (e.keyCode == dojo.keys.DOWN_ARROW){
			if(this.open){
				this.containerNode.focus();
				e.preventDefault();
			}
	 	}
	},

	setTitle: function(/*String*/ title){
		// summary: sets the text of the title
		this.titleNode.innerHTML=title;
	}
});

}
