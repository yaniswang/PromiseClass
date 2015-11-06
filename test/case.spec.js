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
