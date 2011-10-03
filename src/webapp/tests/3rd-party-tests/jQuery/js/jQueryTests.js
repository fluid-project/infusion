/*
Copyright 2011 OCAD University
Copyright 2011 John Kremer

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
 */

/*global */
(function ($){
    var jQueryTests = new jqUnit.TestCase("jQuery Tests");
     $(document).ready(function (){
    //set test case
        jQueryTests.test("Testing val return", function() {          
           var test_value = "abc"; 
           jqUnit.assertEquals("Get the value from the markup", test_value, $("#textbox-with-value").val());
           jqUnit.assertTrue("Element is returned by setting undefined val", test_value, $("#textbox-with-value").val(undefined).is("input"));
           jqUnit.assertTrue("Element is returned by setting empty val", test_value, $("#textbox-with-value").val("").is("input"));                    
        });
        
        jQueryTests.test("Testing val set undefined", function() { 
            //textbox value set to abc prior to this call           
            $("#textbox-with-value").val(undefined)    
            //textbox value gets set to empty string after this call  
            $("#textbox-without-value").val("")      
            jqUnit.assertEquals("Testing textbox value with .val(undefined)", "", $("#textbox-with-value").val());
            jqUnit.assertEquals("Testing textbox value with .val(/"/")", "", $("#textbox-without-value").val());
        });        
     });
})(jQuery);


