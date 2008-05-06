var jqUnit = jqUnit || {};

(function ($) {
    var jsUnitCompat = {
        assertEquals: function (msg, expected, actual) {
            jqUnit.equals (actual, expected, msg);
        },

        assertTrue: function (msg, expected) {
            jqUnit.ok (expected, msg);
        },

        assertFalse: function (msg, expected) {
            jqUnit.ok (!expected, msg);
        },

        assertUndefined: function (msg, expected) {
            jqUnit.equals ((typeof expected), 'undefined', msg);
        },

        assertNotUndefined: function (msg, expected) {
            jqUnit.ok (!(typeof expected === 'undefined'), msg);
        },

        assertNull: function (msg, expected) {
            jqUnit.equals (expected, null, msg);
        },

        assertNotNull: function (msg, expected) {
            jqUnit.ok (!(expected === null), msg);
        }
    };

    // Mix these compatibility functions into the jqUnit namespace.
    $.extend(jqUnit, jsUnitCompat);

    var testFns = {
        isVisible: function (msg, selector) {
            jqUnit.ok($(selector + ":visible")[0], msg);
        },
        
        notVisible: function (msg, selector) {
            jqUnit.ok(!$(selector + ":visible")[0], msg);
        }, 
        
        exists: function (msg, selector) {
            jqUnit.ok($(selector)[0], msg);
        },
        
        notExists: function (msg, selector) {
            jqUnit.ok(!$(selector)[0], msg);
        }
    };
    
    // Mix these test functions into the jqUnit namespace.
    $.extend(jqUnit, testFns);
    
    // TestCase object
    function TestCase (moduleName, setUpFn, tearDownFn) {
        this.moduleName = moduleName;
        this.setUp = setUpFn || null;
        this.tearDown = tearDownFn || null;

        jqUnit.module(this.moduleName);
    };

    TestCase.prototype.test = function (string, testFn) {
        if (this.setUp) {
            this.setUp ();
        }

        jqUnit.test (string, testFn);

        if (this.tearDown) {
            this.tearDown ();
        }
    };

    //  Mix the TestCase type into the jqUnit namespace.
    $.extend(jqUnit, {TestCase: TestCase});
}) (jQuery);
