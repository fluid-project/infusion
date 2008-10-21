/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 - 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {

    fluid.preferable = function (container, options){
        if (!container) {
            fluid.fail("Preferable initialised with no container");
        }
        var that = fluid.initView("fluid.preferable", container, options);
    };

    fluid.defaults("fluid.preferable", {
        selectors: {
            textSizeCtrl: ".textsize-control",
            textSpacingCtrl: ".textspace-control",
            fontCtrl: ".font-control",
            colorCtrl: ".color-control",
            tocCtrl: ".toc-control",
            preview: ".preview"
        },
        events: {
            onPrefChange: null,
            afterPreview: null,
            onSave: null,
            onCancel: null
        }
    });


    fluid.a4aPlus = {
        foregroundColor: "#FFFFFF",
        backgroundColor: "#000000",
        highlightColor: "#000000", 
        fontSize: "12"        
    };
    
    fluid.uiAspects = {
        "textSize": [
            {
                "prefs": { "fontSize": "8"},
                "name": "-2",
                "styles": [{
                    "selector": "body",
                    "rules": "font-size: 45%"
                }]  
            },
            {
                "prefs": { "fontSize": "10"},
                "name": "-1",
                "styles": [{
                    "selector": "body",
                    "rules": "font-size: 55%"
                }]  
            },
            {
                "prefs": { "fontSize": "12"},
                "name": "Default",
                "styles": [{
                    "selector": "body",
                    "rules": "font-size: 62.5%"
                }]  
            },
            {
                "prefs": { "fontSize": "14"},
                "name": "+1",
                "styles": [{
                    "selector": "body",
                    "rules": "font-size: 75%"
                }]  
            }
        ],
        "colorScheme": [
            {
                "prefs": {
                    "foregroundColor": "#FFFFFF",  // some way of specifying all valid values
                    "backgroundColor": "#000000",
                    "highlightColor": "#FFFFFF"
                },
                "name": "Black and White",
                "styles": [{
                    "selector": "body",
                    "rules": "background-color: #00000; border-color: #FFFFFF; color: #FFFFFF"
                }]
            },
            {
                "prefs": {
                    "foregroundColor": "#659D32",  // some way of specifying all valid values
                    "backgroundColor": "#000000",
                    "highlightColor": "#659D32"
                },
                "name": "Black and Green",
                "styles": [{
                    "selector": "body",
                    "rules": "background-color: #00000; border-color: #659D32; color: #659D32"
                }]
            },
            {
                "prefs": {
                    "foregroundColor": "#FFFF00",  // some way of specifying all valid values
                    "backgroundColor": "#000000",
                    "highlightColor": "#FFFF00"
                },
                "name": "High Contrast",
                "styles": [{
                    "selector": "body",
                    "rules": "background-color: #00000; border-color: #FFFF00; color: #FFFF00"
                }]
            }
        ]
    };
    
    fluid.skins = [
        {
            "name": "Matrix",
            "text-size": fluid.uiAspects.textSize[2],
            "color-scheme": fluid.uiAspects.colorScheme[1]
        },
        {
            "name": "High Visibility",
            "text-size": fluid.uiAspects.textSize[3],
            "color-scheme": fluid.uiAspects.colorScheme[2]
        }
    ];
    
fluid.preferable.presets = {
    "Text Size": {
        "-2": {"body": {"font-size" : "45%"}},
        "-1": {"body": {"font-size" : "55%"}},
        "Default": {}, // 62.5%
        "+1": {"body": {"font-size" : "75%"}},
        "+2": {"body": {"font-size" : "87.5%"}},
        "+3": {"body": {"font-size" : "95%"}},
        "+4": {"body": {"font-size" : "100%"}},
        "+5": {"body": {"font-size" : "105%"}},
        "+6": {"body": {"font-size" : "110%"}}
    },
    "Text Spacing": {
        "Default": {},
        "Wide": {"body *": {
                    "letter-spacing": "0.04em",
                     "word-spacing" : "0.1em"}},
        "Wider": {"body *": {
                 "letter-spacing": "0.05em",
                 "word-spacing" : "0.15em"}},
        "Widest": {
            "body *": {
                "letter-spacing": "0.06em",
                "word-spacing": "0.2em"
            },
            "p, li, dd, dt, blockquote, th, td, pre": {
                "line-height": "150%"
            }
        }
    },
    "Font": {
         "Default": {},
         "Arial":    {"body, body *": {"font-family": "arial,helvetica,sans-serif"}},
         "Verdana":  {"body, body *": {"font-family": "verdana,arial,helvetica,sans-serif"}},
         "Courier":  {"body, body *": {"font-family": "\"Courier New\",Courier,monospace"}},
         "Times":    {"body, body *": {"font-family": "\"Times New Roman\",Times,serif"}}
    },
    
    "Link Hover": {
       "No Hover": {},
       "Hover": { "a:hover": {"text-decoration": "underline"}}
    },
    
    "Colour": {
      "Original": {},
      "High Viz": {
          "*": {
              "background-color": "#00000",
              "border-color": "#FFFF00",
              "color":        "#FFFF00"},
          "a:active, a:focus, a:hover, a:active *, a:active *, a:focus *": {
              "background-color":  "#000000",
              "color":            "#00FF00"
          }
      },
      "Blue 1": {
          "*": {
              "background-color": "#ECECEC",
              "border-color": "#010066",
              "color":        "#010066"},
          "a:active, a:focus, a:hover, a:active *, a:active *, a:focus *": {
            "background-color":  "#7196B8",
            "color":            "#E4E4FF"
          }
       }
    }
};

    fluid.preferable.render = function () {
        // hydrated tree
        var contentTree = {
            children: [{
                ID: "opts",
                value: null
            },{
                ID: "textsizeset",
                value: null
            },{
                ID: "textsize_name",
                value: "taille des textes"
            },{
                ID: "textsize",
                value: null, 
                valuebinding: "size" // el expression
            }]
        };
        
/*     dehydrated tree - cannot be used with data binding   
        
        var contentTree = {
            "opts": null,
            "textsizeset": null,
            "textsize_name": "taille des textes",
            "textsize": null 
        };
*/
        var options = {
            "bind": [
                {"size": -2},
                {"size": -1},
                {"size": 0},
                {"size": 1},
                {"size": 2},
                {"size": 3},
                {"size": 4},
                {"size": 6},
                {"size": 8}
            ]
        };
        
        fluid.selfRender($("#opts_container"), contentTree, options);
    };

})(jQuery, fluid_0_6);

  