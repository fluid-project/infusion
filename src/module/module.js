/*!
Infusion Module System

Copyright 2014 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* jshint node:true */
/* global fluid */

"use strict";

// An extremely simple base for the module system that just has the functionality of
// tracking base directories for loaded modules, and the ability to interpolate paths
// of the form ${module}/further-path

fluid.registerNamespace("fluid.module");

fluid.module.modules = {};

/** A module which has just loaded will call this API to register itself into
 * the Fluid module loader's records. The call will generally take the form:
 * <code>fluid.module.register("my-module", __dirname, require)</code>
 */
fluid.module.register = function (name, baseDir, moduleRequire) {
    fluid.log(fluid.logLevel.WARN, "Registering module " + name + " from path " + baseDir);
    fluid.module.modules[name] = {
        baseDir: fluid.module.canonPath(baseDir),
        require: moduleRequire
    };
};

/** Canonicalise a path by replacing all backslashes with forward slashes
 * (the latter are always valid when supplied to Windows APIs)
 */
fluid.module.canonPath = function (path) {
    return path.replace(/\\/g, "/");
};

/** Resolve a path expression which may begin with a module reference of the form,
 * say, ${module-name}, into an absolute path relative to that module, using the
 * database of base directories registered previously with fluid.module.register.
 * If the path does not begin with such a module reference, it is returned unchanged.
 */

fluid.module.resolvePath = function (path) {
    if (path.indexOf("${") === 0) {
        var ic = path.indexOf("}");
        if (ic === -1) {
            fluid.fail("Malformed context path without }: ", path);
        } else {
            var context = path.substring(2, ic);
            var record = fluid.module.modules[context];
            if (!record) {
                fluid.fail("Unrecognised module " + context + ": loaded modules are " + fluid.keys(fluid.module.modules).join(", "));
            }
            return record.baseDir + path.substring(ic + 1);
        }
    } else {
        return path;
    }
};