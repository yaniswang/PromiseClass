PromiseClass
=======================

![PromiseClass logo](https://raw.github.com/yaniswang/PromiseClass/master/logo.png)

Create your own chain Promise Class easily.

[![Build Status](https://img.shields.io/travis/yaniswang/PromiseClass.svg)](https://travis-ci.org/yaniswang/PromiseClass)
[![Coverage Status](https://img.shields.io/coveralls/yaniswang/PromiseClass.svg)](https://coveralls.io/github/yaniswang/PromiseClass?branch=master)
[![NPM version](https://img.shields.io/npm/v/promiseclass.svg?style=flat)](https://www.npmjs.com/package/promiseclass)
[![License](https://img.shields.io/npm/l/promiseclass.svg?style=flat)](https://www.npmjs.com/package/promiseclass)
[![NPM count](https://img.shields.io/npm/dm/promiseclass.svg?style=flat)](https://www.npmjs.com/package/promiseclass)
[![NPM count](https://img.shields.io/npm/dt/promiseclass.svg?style=flat)](https://www.npmjs.com/package/promiseclass)

Features
======================

1. All method will warp to chain Promise
2. Support constructor define
3. Support property define
4. Support sync & async method define
5. Support addMethod & addPropertie after class define
6. Support generator & ES7 await
7. Support async callback & promise & generator mix use
8. Supoort define generator method, and promise callback support generator function
9. Support chai

Quick start
======================

Try it:
-----------------

    var PromiseClass = require('promiseclass');
    var co = require('co');

    var App = PromiseClass.create({

        constructor(str){
            console.log('constructor:',str);
        },

        syncMethod(n){
            console.log('syncMethod called : '+n);
            return 'syncMethod return : '+n;
        },

        asyncMethod1(n, done){
            console.log('asyncMethod1 called : '+n);
            this.asyncMethod2(n).then(function(){
                console.log('asyncMethod1 done : '+n);
                done(null, 'asyncMethod1 return : '+n);
            }).catch(done);
        },

        asyncMethod2(n, done){
            console.log('asyncMethod2 called : '+n);
            setTimeout(function(){
                console.log('asyncMethod2 done : '+n);
                done(null, 'asyncMethod2 return : '+n);
            }, n);
        },

        *generatorMethod1(n){
            console.log('generatorMethod1 called : '+n);
            return yield this.asyncMethod2(n);
        },

        propertie1: 1,
        propertie2: 2

    });

    // add async method
    App.addMethod('asyncMethod3', function(n, done){
        console.log('asyncMethod3 called : '+n);
        setTimeout(function(){
            console.log('asyncMethod3 done : '+n);
            done(null, 'asyncMethod3 return : '+ n);
        }, n);
    });
    // add generator method
    App.addMethod('generatorMethod2', function*(n){
        console.log('generatorMethod2 called : '+n);
        return yield this.asyncMethod2(n);
    });
    // add propertie
    App.addPropertie('propertie3', 3);

    // async callback
    function async(){
        console.log('================ async start ================');
        var deferred = Promise.defer();
        var app = new App('async');
        app.syncMethod(0, function(error, ret){
            console.log(ret);
            console.log('--------------------------');
            app.asyncMethod1(1, function(error, ret){
                console.log(ret);
                console.log('================ async end ================');
                console.log('');
                deferred.resolve();
            });
        });
        return deferred.promise;
    }

    // promise
    function promise(){
        console.log('================ promise start ================');
        var deferred = Promise.defer();
        var app = new App('promise');
        app.syncMethod(0).then(function(ret){
            console.log(ret);
            console.log('--------------------------');
        }).asyncMethod1(1).then(function(ret){
            console.log(ret);
            console.log('--------------------------');
        }).asyncMethod2(2).then(function(ret){
            console.log(ret);
            console.log('--------------------------');
        }).asyncMethod3(3).then(function(ret){
            console.log(ret);
            console.log('================ promise end ================');
            console.log('');
            deferred.resolve();
        });
        return deferred.promise;
    }

    // generator
    function generator(){
        console.log('================ generator start ================');
        var deferred = Promise.defer();
        co(function *(){
            var app = new App('generator');
            yield app.syncMethod(0).then(function(ret){
                console.log(ret);
            });
            console.log('--------------------------');
            yield app.asyncMethod1(1).then(function(ret){
                console.log(ret);
            });
            console.log('--------------------------');
            yield app.asyncMethod2(2).then(function(ret){
                console.log(ret);
            });
            console.log('--------------------------');
            yield app.asyncMethod3(3).then(function(ret){
                console.log(ret);
            });
            console.log('--------------------------');
            yield app.generatorMethod1(4).then(function*(ret){
                console.log(ret);
                return yield this.asyncMethod1(5);
            }).then(function(ret){
                console.log(ret);
            });
        }).then(function(){
            console.log('done!');
            console.log('================ generator end ================');
            console.log('');
            deferred.resolve();
        });
        return deferred.promise;
    }

    async().then(function(){
        return promise();
    }).then(function(){
        return generator();
    });


Try chai
-----------------------

    var PromiseClass = require('promiseclass');
    var chai = require("chai");
    chai.should();
    chai.use(PromiseClass.chaiSupportChainPromise);

    var App = PromiseClass.create({
        asyncMethod(n, done){
            setTimeout(function(){
                done(null, n);
            }, n);
        },
    });

    var app = new App();

    describe('chai test', function(){
        it('test', function(){
            return app.asyncMethod(100).should.equal(100)
            .asyncMethod(88).should.equal(88);
        });
    });


License
================

PromiseClass is released under the MIT license:

> The MIT License
>
> Copyright (c) 2015-2016 Yanis Wang \< yanis.wang@gmail.com \>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

Thanks
================

* mocha: [https://github.com/visionmedia/mocha](https://github.com/visionmedia/mocha)
* chai: [https://github.com/chaijs/chai](https://github.com/chaijs/chai)
* istanbul: [https://github.com/gotwarlost/istanbul](https://github.com/gotwarlost/istanbul)
* Grunt: [http://gruntjs.com/](http://gruntjs.com/)
* jshint: [https://github.com/jshint/jshint](https://github.com/jshint/jshint)
* GitHub: [https://github.com/](https://github.com/)
