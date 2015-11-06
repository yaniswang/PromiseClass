/**
 * Copyright (c) 2015, Yanis Wang <yanis.wang@gmail.com>
 * MIT Licensed
 */

var expect  = require("expect.js");
var co  = require("co");

var PromiseClass = require('../');

describe('PromiseClass Generator test : ', function(){

    it('should run all chain method', function(done){
        co(function*(){
            var isInited = false;
            var isMethod2Called = false;
            var App = PromiseClass.create({
                constructor(str){
                    isInited = true;
                    return str;
                },
                method1(n){
                    return n;
                },
                method2(n, done){
                    setTimeout(function(){
                        isMethod2Called = true;
                        done(null, n);
                    }, 10);
                }
            });
            var app = new App('test');
            app.then(function(ret){
                expect(ret).to.be('test');
                expect(isInited).to.be(true);
            });
            yield app.method2(111).then(function(ret){
                expect(ret).to.be(111);
            }).method1(222).then(function(ret){
                expect(ret).to.be(222);
            });
            expect(isMethod2Called).to.be(true);
        }).then(function(){
            done();
        }).catch(done);
    });

    it('should catch sync method error', function(done){
        co(function*(){
            var App = PromiseClass.create({
                method(){
                    throw new Error('test');
                }
            });
            var app = new App();
            yield app.method();
        }).catch(function(){
            done();
        });
    });

    it('should catch async method error', function(done){
        co(function*(){
            var App = PromiseClass.create({
                method(n, done){
                    setTimeout(function(){
                        done('error');
                    }, 10);
                }
            });
            var app = new App();
            yield app.method(111);
        }).catch(function(){
            done();
        });
    });

});

describe('PromiseClass other test : ', function(){

    it('all kind of callback should work well', function(done){
        co(function*(){
            var callbackCount = 0;
            var App = PromiseClass.create({
                method(n, done){
                    done(null, n);
                }
            });
            var app = new App();
            yield app.method(1, function(error){
                !error && callbackCount ++;
            });
            yield app.method(2, function(err){
                !err && callbackCount ++;
            });
            yield app.method(3, function(e){
                !e && callbackCount ++;
            });
            yield app.method(4, function done(){
                callbackCount ++;
            });
            yield app.method(5, function callback(){
                callbackCount ++;
            });
            yield app.method(6, function cb(){
                callbackCount ++;
            });
            expect(callbackCount).to.be(6);
            done();
        }).catch(done);
    });

    it('type of the first argument is function should work well', function(done){
        co(function*(){
            var App = PromiseClass.create({
                method(n, done){
                    done();
                }
            });
            var callbackCount = 0;
            var app = new App();
            yield app.method(function(){
                throw new Error('test');
            });
            yield app.method(function(){
                throw new Error('test');
            }, function(err){
                !err && callbackCount ++;
            });
            yield app.method(function(arg){
                !arg;
                throw new Error('test');
            }, function done(){
                callbackCount ++;
            });
            expect(callbackCount).to.be(2);
            done();
        }).catch(done);
    });

});
