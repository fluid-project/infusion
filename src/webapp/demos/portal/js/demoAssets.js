/*global fluid_1_2, jQuery, window, demo*/

var fluid_1_2 = fluid_1_2 || {};
var demo = demo || {};

(function ($,fluid) {
    /**
     * Using the demo's base url, collect any CSS, JS, HTML code assets 
     */
    var loadedLength = 0;
    var firstContentLoaded = null;
    var extractKeysFromObject = function (obj) {
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    }
        
    var dataModel = {
        "html" : {
            path : "html/" + demo.name + ".html",
            tab : null,
            content : null
        },
        "css" : {
            path: "css/" + demo.name + ".css",
            tab : null,
            content : null
        },
        "js" : {
            path: "js/" + demo.name + ".js",
            tab : null,
            content : null
        },
        "data" : {
            path: "data/" + demo.name + ".js",
            tab : null,
            content : null
        }
    }
    
    var status = {
        "html" : null,
        "css" : null,
        "js" : null
    }

    var extractHTML = function (data) {
        var start = data.indexOf("<body");
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
    
    var selectTab = function (name) {
        dataModel[name].tab.addClass("fl-tabs-active");
        dataModel[name].content.show();
    }
    
    var bindTabsContent = function (thisTab, thisCode) {
        thisTab.bind("click", function (event) {
            event.preventDefault();
            $(".fl-tabs-active").removeClass("fl-tabs-active");
            $("code").hide();
            $("textarea").hide();
            
            thisCode.show();
            thisTab.addClass("fl-tabs-active");            
        });
    }
    
    var makeTab = function (name) {
        var tab = $('<li/>').html('<a href="#'+name+'" title='+name+'>' + name + '</a>');
        $('.fl-tabs').append(tab);
        return tab;
    };
    
    var makeContent = function (name, data) {
        var code = $('<code/>');
        var plain = $('<textarea/>');

        data = (name === "html") ?  extractHTML(data) : entityEscape(data);
        
        code.addClass(name).html(data).hide();
        plain.addClass(name + " plaintext").html(data).hide();
        
        $('.fl-tabs-content').append(code).append(plain);

        code.chili();
        return code;
    };
    
    var loadComplete = function (name, data) {        
        
        if (data && data !== "") {
            // keep track of the first tab.            
            firstContentLoaded = (firstContentLoaded) ? firstContentLoaded : name;
            
            dataModel[name].tab = makeTab(name);
            dataModel[name].content = makeContent(name, data); 
            
            bindTabsContent(dataModel[name].tab, dataModel[name].content);
            
        } else {
            dataModel[name].content = false;
        }        

        var selectTabNow = true;
        $.each(dataModel, function (name, data) {
            if (data.content === null) {
                selectTabNow = false;
            }
        });
        if (selectTabNow){            
            selectTab(firstContentLoaded);
        }
    };
    
    var togglePlainColorized = function () {
        // plain view
        $(".codeOptions [href=#plaintext]").click(function (e) {            
            var langID = $("#tabs .fl-tabs-active a").attr("title");            
            $("code." + langID).hide(); // hide colorised            
            $("textarea." + langID).show(); // show plaintext            
        });
        
        // normal black
        $(".codeOptions [href=#normal]").click(function (e) {
            var langID = $("#tabs .fl-tabs-active a").attr("title");            
            $("code." + langID).show(); // show colorised            
            $("textarea." + langID).hide(); // hide plaintext            
        });
    }

    // Loop through all content types, and deliver their content if found
    $.each(dataModel, function (name, data) {
        $.ajax({            
            url: data.path,
            dataType: "text",
            error: function (XMLHttpRequest, state, error) {                
                loadComplete(name, false);
            },
            success: function (data, state) {
                loadComplete(name, data);
            }
        });        
    });

    $(document).ready(function () {
        $("iframe").attr("src", "html/" + demo.name + ".html"); 
        togglePlainColorized();       
    })
    
    
})(jQuery, fluid_1_2)
