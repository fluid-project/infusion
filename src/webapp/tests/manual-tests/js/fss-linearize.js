$(document).ready(function() {
    (function ($) {
        $("#normal").click(function() {
        	$("#container").attr("class", "");      
          	$("#linear-choices").hide();    		    	
        });       
        $("#linearize").click(function() {
        	$("#container").attr("class", "");
        	$("#container").addClass("fl-layout-linear");
          	$("#linear-choices").show();

          	if ($("#alignment").attr('checked') == true)
        	  	$("#container").addClass($("#align-choice").val());
        });
        $("#alignment").change(function() {
        	if ($("#alignment").attr('checked') == true) {
        		$("#container").addClass($("#align-choice").val());
        	} else {
        		$("#container").removeClass($("#align-choice").val());
        	}
        });   

        $("#align-choice").change(function() {
        	$("#container").removeClass("fl-layout-align-left");
        	$("#container").removeClass("fl-layout-align-center");
        	$("#container").removeClass("fl-layout-align-right");
        	$("#container").addClass($("#align-choice").val());
        });

    })(jQuery);    
    
    $("#tabs").tabs();
    $("#linear-choices").hide();
});