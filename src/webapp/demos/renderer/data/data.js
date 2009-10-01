/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var demo = demo || {};

demo.data = {
    strings: {
        intro: "Please choose your options for the shin-dig.",
        locationLabel: "Locations:",
        winesLabel: "Wines:",
        foodsLabel: "Food Selection:",
        plate: "Canape Plate",
        price: "Price",
        include: "Include?"
    },
    
    locations: {
        codes: ["parlour", "library", "dining"],
        names: ["Parlour", "Library", "Dining Room"],
        choice: "parlour"
    },

    wineList: {
        codes: ["riesling", "weissbergunder", "pinot-grigio", "gewurztraminer"],
        names: ["Berg Rottland Riesling", "Weissbergunder", "Pinot Grigio", "Gewurztraminer Turkheim"],
        choice: "riesling"
    },

    canapeList: {
        codes: ["asparagus", "chicken", "shrimp", "beef", "peppers", "figs"],
        names: ["Filo Wrapped Asparagus", "Chicken Ballotine with Carrot Raita and Pomegranate Chutney", "Spicy Shrimp Crostini", "Broiled Beef Fillet Croutes with Salsa Verde", "Roasted Marinated Peppers with Goat Cheese", "Gorgonzola Stuffed Figs"],
        prices: ["$6", "$5", "$7", "$5", "$5", "$6"],
        choices: []
    },

    modelToString: function (model) {
        var listStringArray = function (array) {
            var string = "";
            for (var i = 0; i < array.length; i++) {
                string += "\"" + array[i] + "\"";
                if (i < array.length - 1) {
                    string += ", ";
                }
            }
            return string;
        };
    
        var listMembers = function (obj, tab) {
            var string = "";
            
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && key !== "modelToHtmlString") {
                    string += tab + key + ": ";
                    if (obj[key] instanceof Array) {
                        string += "[" + listStringArray(obj[key]) + tab + "]\n";
                    } else if (obj[key] instanceof Object) {
                        string +=  "{\n" + listMembers(obj[key], tab + "  ") + "\n" + tab + "}\n";
                    } else {
                        string += "\"" + obj[key] + "\"\n";
                    }
                }
            }
            return string;
        };
        
        return listMembers(model, "");
    }
};


