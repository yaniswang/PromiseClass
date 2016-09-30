/**
 * Copyright (c) 2015-2016, Yanis Wang <yanis.wang@gmail.com>
 * MIT Licensed
 */

var PromiseClass = require('../');
var chai = require("chai");
var should = chai.should();
chai.use(PromiseClass.chaiSupportChainPromise);

require('mocha-generators').install();

describe('PromiseClass Constructor test : ', function(){

    it('should define constructor and been called', function(){
        var isInited = false;
        var App = PromiseClass.create({
            constructor(){
                isInited = true;
            }
        });
        var app = new App();
        app.should.be.an('object');
        isInited.should.be.true;
    });

    it('should return promise when no constructor', function(done){
        var App = PromiseClass.create({
            method(n){
                return n;
            }
        });
        new App().method(11).then(function(){
            done();
        }).catch(done);
    });

});

describe('PromiseClass Propertie test : ', function(){

    it('should define properties', function(){
        var App = PromiseClass.create({
            propertie1: 1,
            propertie2: 2,
            constructor(){
                var self = this;
                self.propertie1.should.equal(1);
                self.propertie2.should.equal(2);
                self.propertie1 = 3;
                self.propertie2 = 4;
            },
            checkProperties(){
                var self = this;
                self.propertie1.should.equal(3);
                self.propertie2.should.equal(4);
            }
        });
        var app = new App();
        app.propertie1.should.equal(3);
        app.propertie2.should.equal(4);
        app.checkProperties();
    });

    it('should add properties', function(){
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                should.equal(self.propertie1, undefined);
                should.equal(self.propertie2, undefined);
            },
            checkProperties(){
                var self = this;
                self.propertie1.should.equal(1);
                self.propertie2.should.equal(2);
            }
        });
        var app = new App();
        App.addPropertie('propertie1', 1);
        App.addPropertie('propertie2', 2);
        app.checkProperties();
    });

});

describe('PromiseClass Method test : ', function(){

    it('should define sync method and can been called', function(done){
        var isCalled = false;
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                self.method.should.be.a('function');
            },
            method(str){
                isCalled = true;
                return str;
            }
        });
        var app = new App();
        app.method(111, function(error, ret){
            ret.should.equal(111);
            return 222;
        }).then(function(ret){
            isCalled.should.equal.true;
            ret.should.equal(222);
            done();
        }).catch(done);
    });

    it('should add sync method and can been called', function(done){
        var isCalled = false;
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                should.equal(self.method, undefined);
            }
        });
        var app = new App();
        App.addMethod('method', function(str){
            isCalled = true;
            return str;
        });
        app.method(222, function(error, ret){
            ret.should.equal(222);
            return 333;
        }).then(function(ret){
            isCalled.should.be.true;
            ret.should.equal(333);
            done();
        }).catch(done);
    });

    it('should define async method and can been called', function(done){
        var isCalled = false;
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                self.method.should.be.a('function');
            },
            method(str, done){
                isCalled = true;
                setTimeout(function(){
                    done(null, str);
                }, 10);
            }
        });
        var app = new App();
        app.method(222, function(error, ret){
            ret.should.equal(222);
            return 333;
        }).then(function(ret){
            isCalled.should.be.true;
            ret.should.equal(333);
            done();
        }).catch(done);
    });

    it('should add async method and can been called', function(done){
        var isCalled = false;
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                should.equal(self.method, undefined);
            }
        });
        var app = new App();
        App.addMethod('method', function(str, done){
            isCalled = true;
            setTimeout(function(){
                done(null, str);
            }, 10);
        });
        app.method(222, function(error, ret){
            ret.should.equal(222);
            return 333;
        }).then(function(ret){
            isCalled.should.be.true;
            ret.should.equal(333);
            done();
        }).catch(done);
    });

});

describe('PromiseClass Chain test : ', function(){

    it('should call all method by chain', function(done){
        var callCount = 0;
        var App = PromiseClass.create({
            constructor(){
                callCount++;
            },
            method1(n){
                callCount++;
                return n;
            },
            method2(n, done){
                setTimeout(function(){
                    callCount ++;
                    done(null, n);
                }, 10);
            },
            method3(n, done){
                this.method2(n).then(function(){
                    callCount ++;
                    done(null, n);
                }).catch(done);
            }
        });
        new App().method1(111).then(function(ret){
            ret.should.equal(111);
        }).method2(222).then(function(ret){
            ret.should.equal(222);
        }).method3(333).then(function(ret){
            ret.should.equal(333);
        }).method1(444).then(function(ret){
            ret.should.equal(444);
            callCount.should.equal(6);
            done();
        }).catch(done);
    });

});

describe('PromiseClass Error test : ', function(){

    it('should catch method error', function(done){
        var App = PromiseClass.create({
            method1: function(){
                throw new Error('test');
            },
            method2: function(done){
                setTimeout(function(){
                    done('error');
                }, 10);
            }
        });
        new App().method1().catch(function(error){
            error.message.should.contain('is not defined');
        }).method2().catch(function(){
            done();
        });
    });

});

describe('PromiseClass instanceof test : ', function(){

    it('should instanceof Class', function(){
        var App = PromiseClass.create({
            constructor(){

            }
        });
        var app = new App();
        app.should.instanceof(App);
    });

    it('should instanceof Promise', function(){
        var App = PromiseClass.create({
            method(){

            }
        });
        var app = new App();
        var promise = app.method();
        promise.should.instanceof(Promise);
    });

});

describe('PromiseClass Generator test : ', function(){

    it('should run all chain method', function*(){
        var isInited = false;
        var isMethod2Called = false;
        var App = PromiseClass.create({
            constructor(){
                isInited = true;
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
        var app = new App();
        isInited.should.be.true;
        yield app.method2(111).then(function(ret){
            ret.should.equal(111);
        }).method1(222).then(function(ret){
            ret.should.equal(222);
        });
        isMethod2Called.should.be.true;
    });

    it('should catch sync method error', function(done){
        var App = PromiseClass.create({
            method(){
                throw new Error('test');
            }
        });
        var app = new App();
        app.method().catch(function(){
            done();
        });
    });

    it('should catch async method error', function(done){
        var App = PromiseClass.create({
            method(n, done){
                setTimeout(function(){
                    done('error');
                }, 10);
            }
        });
        var app = new App();
        app.method(111).catch(function(){
            done();
        });
    });

    it('method should define generator method', function*(){
        var App = PromiseClass.create({
            *method(n){
                this.aaa=n;
                return yield sleep(n);
            }
        });
        var app = new App();
        yield app.method(11, function(error, ret){
            this.aaa.should.equal(11);
            ret.should.equal(11);
        }).method(22).then(function(ret){
            ret.should.equal(22);
        });
    });

    it('should add generator method', function*(){
        var App = PromiseClass.create({
        });
        App.addMethod('method', function*(n){
            this.aaa=n;
            return yield sleep(n);
        });
        var app = new App();
        yield app.method(11, function(error, ret){
            this.aaa.should.equal(11);
            ret.should.equal(11);
        }).method(22).then(function(ret){
            ret.should.equal(22);
        });
    });

    it('async callback and promise callback should use generator', function*(){
        var App = PromiseClass.create({
            method(n){
                return n;
            }
        });
        var app = new App();
        yield app.method(11, function*(error, ret){
            // check async callback
            ret.should.equal(11);
            return yield sleep(22);
        }).then(function*(ret){
            // check promise callback
            ret.should.equal(22);
            return yield sleep(33);
        }).then(function(ret){
            // check promise onReject callback
            ret.should.equal(33);
            throw new Error('test');
        }).then(function(){
        }, function*(error){
            error.message.should.contain('not defined');
            return yield sleep(44);
        }).then(function(ret){
            // check promise catch callback
            ret.should.equal(44);
            throw new Error('test');
        }).catch(function*(error){
            error.message.should.contain('not defined');
            return yield sleep(55);
        }).then(function(ret){
            ret.should.equal(55);
        });
    });

});

// promise sleep
function sleep(ms){
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve(ms);
        }, ms);
    });
}
