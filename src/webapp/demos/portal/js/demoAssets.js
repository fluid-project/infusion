/*global fluid_1_2, jQuery, window, demo*/

var fluid_1_2 = fluid_1_2 || {};
var demo = demo || {};

(function ($,fluid) {
    /**
     * Using the demo's base url, collect any CSS, JS, HTML code assets 
     */
    var loadedLength = 0;
    var extractKeysFromObject = function (obj) {
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    }
        
    var content = {
        "html" : "html/" + demo.name + ".html",
        "css" : "css/" + demo.name + ".css",
        "js" : "js/" + demo.name + ".js"
    }
    
    var status = {
        "html" : null,
        "css" : null,
        "js" : null
    }

    var extractHTML = function (data) {
        var start = data.indexOf("<body>");
        var end = data.indexOf("</html>");
        
        data = data.substring(start, end);
        data = entityEscape(data);
        return data;
    }

    var entityEscape = function (value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/\'/g, '&#39;')
        ;
    }    
    
    var selectTab = function (tab, code) {
        tab.addClass("fl-tabs-active");
        code.show();
    }
    
    var enableTab = function (thisTab, thisCode, thisPlaintext) {
        thisTab.bind("click", function (event) {
            event.preventDefault();
            $(".fl-tabs-active").removeClass("fl-tabs-active")
            $("code").hide();
            $(".plaintext").hide();
            thisCode.show();
            thisTab.addClass("fl-tabs-active");            
        });

        if (status['css'] != null && status['js'] != null && status['html'] != null) {
            selectTab(thisTab, thisCode);
        }
    }
    
    var makeTab = function (lang, stringData) {
        var tab = $('<li/>').html('<a href="#'+lang+'" title='+lang+'>' + lang + '</a>');
        var code = $('<code/>');
        var plain = $('<textarea/>');
        
        code.attr('id',lang).addClass(lang).html(stringData).hide();
        plain.addClass(lang + " plaintext").html(stringData).hide();
        
        $('.fl-tabs').append(tab);
        $('.fl-tabs-content').append(code).append(plain);

        code.chili();
        enableTab(tab, code, plain);
    }

    var enableFormattingTabs = function () {
        // plain view
        $(".codeOptions [href=#plaintext]").click(function (e) {
            
            var langID = $("#tabs .fl-tabs-active a").attr("title");
            // hide colorised
            $("[class="+langID+"]").hide();            
            // show plaintext
            $('.plaintext.' + langID).show();            
        });
        
        // normal black
        $(".codeOptions [href=#normal]").click(function (e) {
            var langID = $("#tabs .fl-tabs-active a").attr("title");
            // hide colorised
            $("[class="+langID+"]").show();            
            // show plaintext
            $('.plaintext.' + langID).hide();            
        });
    }


    $.each(content, function (name, path) {
        $.ajax({            
            url: path,
            dataType: "text",
            error: function (XMLHttpRequest, state, error) {
                status[name] = false;                
            },
            success: function (data, state) {
                                
                status[name] = (data != "") ? true : false; // for some reason, Safari thinks error is success so check response
                if (status[name]) {
                    data = (name === "html") ?  extractHTML(data) : entityEscape(data);
                    makeTab(name, data);                
                }
            }
        });        
    });

    $(document).ready(function () {
        $("iframe").attr("src", "html/" + demo.name + ".html"); 
        enableFormattingTabs();       
    })
    
    
})(jQuery, fluid_1_2)
