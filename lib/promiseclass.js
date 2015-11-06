'use strict';
/**
 * Copyright (c) 2015, Yanis Wang <yanis.wang@gmail.com>
 * MIT Licensed
 */

const PromiseClass = {
    create: function(classDefines){
        let newPromiseClass = function PromiseClass(){
            var self = this;
            return self._constructor.apply(self, arguments);
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
                if(typeof args[args.length - 1] === 'function'){
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
            if(name !== '_constructor'){
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
            }
        };
        newPromiseClass.addPropertie = function(name, value){
            classPrototype[name] = value;
        };
        let defValue;
        if(classDefines.hasOwnProperty('constructor') === false){
            classDefines['constructor'] = function(){};
        }
        for(let name in classDefines){
            defValue = classDefines[name];
            if(typeof defValue === 'function'){
                newPromiseClass.addMethod(name === 'constructor' ? '_constructor' : name, defValue);
            }
            else{
                newPromiseClass.addPropertie(name, defValue);
            }
        }
        return newPromiseClass;
    }
};

module.exports = PromiseClass;
