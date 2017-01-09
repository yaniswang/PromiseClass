'use strict';
/**
 * Copyright (c) 2015-2016, Yanis Wang <yanis.wang@gmail.com>
 * MIT Licensed
 */
const co = require('co');

const PromiseClass = {
    create: function(classDefines){
        let constructor;
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
        PromisePrototype.then = function(onResolve, onReject){
            let self = this;
            if(isGeneratorFunction(onResolve)){
                // support then generator
                let rawOnResolve = onResolve;
                onResolve = function(){
                    return co(rawOnResolve.apply(self, arguments));
                };
            }
            else if(onResolve){
                onResolve = onResolve.bind(self);
            }
            if(isGeneratorFunction(onReject)){
                let rawOnReject = onReject;
                onReject = function(){
                    return co(rawOnReject.apply(self, arguments));
                };
            }
            else if(onReject){
                onReject = onReject.bind(self);
            }
            let promise = rawThen.call(self, onResolve, onReject);
            promise._context = self._context;
            return promise;
        };
        // add promise+chain method
        newPromiseClass.addMethod = function(name, fn){
            function wrapFunction(){
                let self = this;
                let args = Array.prototype.slice.call(arguments, 0);
                let isAsync = /(\(|,)\s*(done|callback|cb)\s*\)\s*\{/i.test(fn);
                var promise = new ChainPromise(function(resolve, reject){
                    let callback;
                    if(isCallback(args[args.length - 1])){
                        // async mode
                        callback = args.pop();
                    }
                    function done(error, ret){
                        if(callback){
                            let newRet = callback.call(self, error, ret);
                            if(isGenerator(newRet)){
                                // support callback generator
                                newRet = co(newRet);
                            }
                            resolve(newRet);
                        }
                        else{
                            error ? reject(error) : resolve(ret);
                        }
                    }
                    // async modem hook done
                    if(isAsync){
                        args.push(done);
                    }
                    try{
                        let ret = fn.apply(self, args);
                        // sync mode
                        if(isAsync === false){
                            if(ret !== undefined && isGenerator(ret)){
                                // support method generator
                                co(ret).then(function(ret){
                                    done(null, ret);
                                }).catch(done);
                            }
                            else{
                                done(null, ret);
                            }
                        }
                    }
                    catch(error){
                        done(error);
                    }
                });
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
        let str = String(arg);
        if(/^function\*?(\s+(done|callback|cb))\s*\(/.test(str) ||
            /^function\*?(\s+\w+)?\s*\(\s*(error|err|e)\s*(,|\))/i.test(str)){
            return true;
        }
    }
    return false;
}

// check is generator function
function isGeneratorFunction(obj) {
    let constructor = obj && obj.constructor;
    if (constructor && ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName)) {
        return true;
    }
    return false;
}

// check is generator
function isGenerator(obj) {
  return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

// support ChainPromise for chai
function chaiSupportChainPromise(chai, utils){
    function copyChainPromise(promise, assertion){
        let protoPromise = Object.getPrototypeOf(promise);
        let protoNames = Object.getOwnPropertyNames(protoPromise);
        let protoAssertion = Object.getPrototypeOf(assertion);
        protoNames.forEach(function(protoName){
            if(protoName !== 'constructor' && !protoAssertion[protoName]){
                assertion[protoName] = promise[protoName].bind(promise);
            }
        });
    }
    function doAsserterAsync(asserter, assertion, args){
        let self = utils.flag(assertion, "object");
        if(self && self.then && typeof self.then === "function"){
            let promise = self.then(function(value){
                assertion._obj = value;
                asserter.apply(assertion, args);
                return value;
            }, function(error){
                assertion._obj = new Error(error);
                asserter.apply(assertion, args);
            });
            copyChainPromise(promise, assertion);
        }
        else{
            return asserter.apply(assertion, args);
        }
    }
    let Assertion = chai.Assertion;
    let propertyNames = Object.getOwnPropertyNames(Assertion.prototype);

    let propertyDescs = {};
    propertyNames.forEach(function (name) {
        propertyDescs[name] = Object.getOwnPropertyDescriptor(Assertion.prototype, name);
    });

    let methodNames = propertyNames.filter(function (name) {
        return name !== "assert" && typeof propertyDescs[name].value === "function";
    });

    methodNames.forEach(function (methodName) {
        Assertion.overwriteMethod(methodName, function (originalMethod) {
            return function () {
                doAsserterAsync(originalMethod, this, arguments);
            };
        });
    });

    let getterNames = propertyNames.filter(function (name) {
        return name !== "_obj" && typeof propertyDescs[name].get === "function";
    });

    getterNames.forEach(function (getterName) {
        let isChainableMethod = Assertion.prototype.__methods.hasOwnProperty(getterName);
        if (isChainableMethod) {
            Assertion.overwriteChainableMethod(
                getterName,
                function (originalMethod) {
                    return function() {
                        doAsserterAsync(originalMethod, this, arguments);
                    };
                },
                function (originalGetter) {
                    return function() {
                        doAsserterAsync(originalGetter, this);
                    };
                }
            );
        } else {
            Assertion.overwriteProperty(getterName, function (originalGetter) {
                return function () {
                    doAsserterAsync(originalGetter, this);
                };
            });
        }
    });
}

PromiseClass.chaiSupportChainPromise = chaiSupportChainPromise;

module.exports = PromiseClass;
