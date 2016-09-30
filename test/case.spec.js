/**
 * Copyright (c) 2015-2016, Yanis Wang <yanis.wang@gmail.com>
 * MIT Licensed
 */

var PromiseClass = require('../');
var chai = require("chai");
chai.should();
chai.use(PromiseClass.chaiSupportChainPromise);

require('mocha-generators').install();

describe('PromiseClass other test : ', function(){

    it('all kind of callback should work well', function*(){
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
        callbackCount.should.equal(6);
    });

    it('type of the first argument is function should work well', function*(){
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
        callbackCount.should.equal(2);
    });

    it('method should return PromiseClass object', function*(){
        var App1 = PromiseClass.create({
            method1(){
                return new App2();
            }
        });
        var App2 = PromiseClass.create({
            method2(){
                return 2;
            }
        });
        var app1 = new App1();
        var app2 = yield app1.method1();
        app2.should.be.instanceof(App2);
    });

});
