/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
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
    }
};
