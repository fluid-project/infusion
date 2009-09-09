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
        "html" : demo.path + demo.name + "/html/" + demo.name + ".html",
        "css" : demo.path + demo.name + "/css/" + demo.name + ".css",
        "js" : demo.path + demo.name + "/js/" + demo.name + ".js"
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
    
    var selectTab = function (tab) {
        tab.addClass("fl-tabs-active");
        $(tab.children("a").attr("href")).show();
    }
    
    var enableTabbing = function (tabs) {
        
        $.each(tabs, function (i, tab) {
            tab = $(tab);
            tab.children().bind("click", function (e) {                                        
                var activeTab = $(e.target);
                var panel = $(activeTab.attr("href"));
                e.preventDefault();
                $(".fl-tabs-active").removeClass("fl-tabs-active")
                $("code").hide();
                $(".plaintext").hide();
                
                selectTab(tab);
                
            });
            // Chili syntax colorizer
            $(tab.children("a").attr("href")).chili();
        });
        selectTab($(tabs[0]));

    }
    
    var makeTab = function (lang, stringData) {
        var tab = $('<li/>').html('<a href="#'+lang+'" title='+lang+'>' + lang + '</a>');
        var code = $('<code/>');
        var plain = $('<div/>');
        
        code.attr('id',lang).addClass(lang).html(stringData).hide();
        plain.addClass(lang + " plaintext").html(stringData).hide();
        
        $('.fl-tabs').append(tab);
        $('.fl-tabs-content').append(code).append(plain);
        
        var tabs = $('#tabs li');
        
        if (loadedLength === extractKeysFromObject(content).length) {
            enableTabbing(tabs);
        }
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
            error: function (XMLHttpRequest, status, error) {
                loadedLength = loadedLength + 1;
            },
            success: function (data, status) {
                loadedLength = loadedLength + 1;
                data = (name === "html") ?  extractHTML(data) : entityEscape(data);
                makeTab(name, data);                
            }
        });        
    });

    $(document).ready(function () {
        $("iframe").attr("src", demo.path + demo.name + "/html/" + demo.name + ".html"); 
        enableFormattingTabs();       
    })
    
    
})(jQuery, fluid_1_2)
