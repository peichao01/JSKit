/**
 * Inheritance plugin
 *
 * Copyright (c) 2010 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * 
 * source: https://raw.github.com/dfilatov/jquery-plugins/master/src/jquery.inherit/jquery.inherit.js
 *		   https://github.com/dfilatov/jquery-plugins/tree/master/src/jquery.inherit
 *
 * @modified   chao2(i@peichao01.com)
 * @modify     delete the compatible codes, only for the mordern mobile browsers
 *
 * @dependencies: none
 *
 * @version 1.3.6
 */
define("inherit", [], function(require,exports,module) {
    var parentName = '__base', constructorName = '__constructor', ClassName = '__self',
        eachObj = function (list, iterator) { for (var key in list) if (list.hasOwnProperty(key)) iterator(key, list[key]) },
	    isFunction = function(fn){return Object.prototype.toString.call(fn)==='[object Function]'},
	    extend = function (target, source) { eachObj(source, function (name, value) { target[name] = value }); return target },
        emptyBase = function () { };
    function override(base, result, add){
        eachObj(add, function (name, prop){
            if (isFunction(prop) && prop.toString().indexOf('.'+parentName) > -1){
                var baseMethod = base[name] || function() {};
                result[name] = function() {
                    var baseSaved = this[parentName];
                    this[parentName] = baseMethod;
                    var result = prop.apply(this, arguments);
                    this[parentName] = baseSaved;
                    return result;
                };
            } else {
                result[name] = prop;
            }
        });
    }
    /**
    * @param {Object}   proto     -- instance/prototype member of Class
    * @param {Function} [base]    -- BaseClass
    * @param {String}   [name]    -- ClassName
    * @param {Object}   [statics] -- static member of Class
    */
    module.exports = function inherit(options) {
        if(!options.proto) throw new Error("[inherit] no proto property was set.");
        var base = options.base || emptyBase,
            result = (options.proto[constructorName] || (options.base && base.prototype[constructorName]))
                    ? new Function("return function " + (options.name || "") + "(){this." + constructorName + ".apply(arguments)}")()
                    : function () { };
        if(!options.base) {
            result.prototype = options.proto;
            result.prototype[ClassName] = result.prototype.constructor = result;
            return extend(result, options.statics);
        }
        var basePtp = base.prototype, resultPtp = result.prototype = Object.create(basePtp);
        resultPtp[ClassName] = resultPtp.constructor = result;

        extend(result, base);//copy the static member from base to result
        override(basePtp, resultPtp, options.proto);//override prototype member
        options.statics && override(base, result, options.statics);//override static member

        return result;
    };
});
