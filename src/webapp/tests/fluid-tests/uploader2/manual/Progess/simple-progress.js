
(function ($, fluid) {
    var absoluteProgress, floatyProgress, staticProgressOne, staticProgressTwo;
	
	function customCallback() {	
		$("#custom").show('slow')
		.animate({fontSize: "1.1em"},600)
		.animate({fontSize: "1em"},400)
		.animate({fontSize: "1.2em"},600)
		.animate({fontSize: "1em"},400)
		.animate({fontSize: "1.3em"},600)
		.animate({fontSize: "0em"},600)
		.hide('slow');
	}
	
	function differentCustomCallback() {	
		$("#floatyProgress .fluid-progress-bar")
		.animate({marginLeft: "1.5em"},600)
		.animate({marginLeft: "0.5em"},400)
		.animate({marginLeft: "1.5em"},600)
		.animate({marginLeft: "0em"},400)
		.animate({marginLeft: "1.5em"},600)
		.animate({marginLeft: "0.5em"},600);
	}
	var customShowAnimation = {params:{opacity: "show", width: "200px"}, duration: "fast", callback: function() { 
		differentCustomCallback();
		}
	};
 
	var customHideAnimation = {params:{opacity: "hide", width: 0}, duration: "fast", callback: function() { 
		customCallback();
		}
	};

    var bindButtonHandlers = function () {
        $("#percentField").change(function(){
			var progressString = "Progressor now at " + Math.min(this.value,100) + "%";
			var percentAsNum = parseFloat(this.value);
			absoluteProgress.update(percentAsNum, progressString);
			floatyProgress.update(percentAsNum, progressString, customShowAnimation);
			staticProgressOne.update(percentAsNum, progressString);
			staticProgressTwo.update(percentAsNum, progressString);
		});
        $("#showButton").click(function(){
			absoluteProgress.show();
			floatyProgress.show(customShowAnimation);
			staticProgressOne.show();
			staticProgressTwo.show();
		});
       	$("#hideButton").click(function(){
			absoluteProgress.hide(2000);
			floatyProgress.hide(null,customHideAnimation);
			staticProgressOne.hide();
			staticProgressTwo.hide();
		});
    };
 
    $(function () {
		fluid.setLogging(true);
        absoluteProgress = fluid.progress("#absoluteProgress");
		floatyProgress = fluid.progress("#floatyProgress",{selectors: {
 			displayElement: ".fluid-progress-bar" // required
	        },
			animate: "backwards"
		});
		staticProgressOne = fluid.progress("#staticProgressOne",{animate: "both"});
		staticProgressTwo = fluid.progress("#staticProgressTwo",{animate: "none"});
        bindButtonHandlers(); 
    });
})(jQuery, fluid);
