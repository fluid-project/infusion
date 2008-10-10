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

fluid.preferable = fluid.preferable || {};

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
        var contentTree = {
            "opts": {}
        };    
        fluid.selfRender($("#opts_container"), contentTree);
    };

})(jQuery, fluid_0_6);

  