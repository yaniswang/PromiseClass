'use strict';
/**
 * Copyright (c) 2015, Yanis Wang <yanis.wang@gmail.com>
 * MIT Licensed
 */

const PromiseClass = {
    create: function(classDefines){
        var constructor;
        if(classDefines.hasOwnProperty('constructor') === true){
            constructor = classDefines['constructor'];
            delete classDefines['constructor'];
        }
        let newPromiseClass = function PromiseClass(){
            if(constructor !== undefined){
                constructor.apply(this, arguments);
            }
        };
        let classPrototype = newPromiseClass.prototype;
        // define private Promise
        let ChainPromise = class ChainPromise extends Promise {};
        // hook Promise then function
        let PromisePrototype = ChainPromise.prototype;
        let rawThen = PromisePrototype.then;
        PromisePrototype.then = function(){
            let self = this;
            let promise = rawThen.apply(self, arguments);
            promise._context = self._context;
            return promise;
        };
        // add promise+chain method
        newPromiseClass.addMethod = function(name, fn){
            function wrapFunction(){
                let self = this;
                let args = Array.prototype.slice.call(arguments, 0);
                let isAsync = /(\(|,)\s*(done|callback|cb)\s*\)\s*\{/i.test(fn);
                let deferred = ChainPromise.defer();
                let promise = deferred.promise;
                let callback;
                if(isCallback(args[args.length - 1])){
                    // async mode
                    callback = args.pop();
                }
                function done(error, ret){
                    callback && callback(error, ret);
                    error ? deferred.reject(error) : deferred.resolve(ret);
                }
                // async modem hook done
                if(isAsync){
                    args.push(done);
                }
                try{
                    let ret = fn.apply(self, args);
                    // sync mode
                    if(isAsync === false){
                        done(null, ret);
                    }
                }
                catch(error){
                    done(error);
                }
                promise._context = self;
                return promise;
            }
            classPrototype[name] = wrapFunction;
            // add promise chain
            PromisePrototype[name] = function(){
                let self = this;
                let args = arguments;
                let context = self._context;
                let promise = self.then(function(){
                    return wrapFunction.apply(context, args).then(function(ret){
                        return ret;
                    });
                });
                promise._context = context;
                return promise;
            };
        };
        newPromiseClass.addPropertie = function(name, value){
            classPrototype[name] = value;
        };
        let defValue;
        for(let name in classDefines){
            defValue = classDefines[name];
            if(typeof defValue === 'function'){
                newPromiseClass.addMethod(name, defValue);
            }
            else{
                newPromiseClass.addPropertie(name, defValue);
            }
        }
        return newPromiseClass;
    }
};

// check callback
function isCallback(arg){
    if(typeof arg === 'function'){
        var str = String(arg);
        if(/^function(\s+(done|callback|cb))\s*\(/.test(str) ||
            /^function(\s+\w+)?\s*\(\s*(error|err|e)\s*(,|\))/i.test(str)){
            return true;
        }
    }
    return false;
}
module.exports = PromiseClass;
