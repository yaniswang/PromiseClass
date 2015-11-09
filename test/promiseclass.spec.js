/**
 * Copyright (c) 2015, Yanis Wang <yanis.wang@gmail.com>
 * MIT Licensed
 */

var expect  = require("expect.js");
require('mocha-generators').install();

var PromiseClass = require('../');

describe('PromiseClass Constructor test : ', function(){

    it('should define constructor and been called', function(){
        var isInited = false;
        var App = PromiseClass.create({
            constructor(){
                isInited = true;
            }
        });
        var app = new App();
        expect(app).to.be.an('object');
        expect(isInited).to.be(true);
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
                expect(self.propertie1).to.be(1);
                expect(self.propertie2).to.be(2);
                self.propertie1 = 3;
                self.propertie2 = 4;
            },
            checkProperties(){
                var self = this;
                expect(self.propertie1).to.be(3);
                expect(self.propertie2).to.be(4);
            }
        });
        var app = new App();
        expect(app.propertie1).to.be(3);
        expect(app.propertie2).to.be(4);
        app.checkProperties();
    });

    it('should add properties', function(){
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                expect(self.propertie1).to.be(undefined);
                expect(self.propertie2).to.be(undefined);
            },
            checkProperties(){
                var self = this;
                expect(self.propertie1).to.be(1);
                expect(self.propertie2).to.be(2);
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
                expect(typeof self.method).to.be('function');
            },
            method(str){
                isCalled = true;
                return str;
            }
        });
        var app = new App();
        app.method(111, function(error, ret){
            expect(ret).to.be(111);
            return 222;
        }).then(function(ret){
            expect(isCalled).to.be(true);
            expect(ret).to.be(222);
            done();
        }).catch(done);
    });

    it('should add sync method and can been called', function(done){
        var isCalled = false;
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                expect(self.method).to.be(undefined);
            }
        });
        var app = new App();
        App.addMethod('method', function(str){
            isCalled = true;
            return str;
        });
        app.method(222, function(error, ret){
            expect(ret).to.be(222);
            return 333;
        }).then(function(ret){
            expect(isCalled).to.be(true);
            expect(ret).to.be(333);
            done();
        }).catch(done);
    });

    it('should define async method and can been called', function(done){
        var isCalled = false;
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                expect(typeof self.method).to.be('function');
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
            expect(ret).to.be(222);
            return 333;
        }).then(function(ret){
            expect(isCalled).to.be(true);
            expect(ret).to.be(333);
            done();
        }).catch(done);
    });

    it('should add async method and can been called', function(done){
        var isCalled = false;
        var App = PromiseClass.create({
            constructor(){
                var self = this;
                expect(self.method).to.be(undefined);
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
            expect(ret).to.be(222);
            return 333;
        }).then(function(ret){
            expect(isCalled).to.be(true);
            expect(ret).to.be(333);
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
            expect(ret).to.be(111);
        }).method2(222).then(function(ret){
            expect(ret).to.be(222);
        }).method3(333).then(function(ret){
            expect(ret).to.be(333);
        }).method1(444).then(function(ret){
            expect(ret).to.be(444);
            expect(callCount).to.be(6);
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
            expect(/is not defined/.test(error.message)).to.be(true);
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
        expect(app instanceof App).to.be(true);
    });

    it('should instanceof Promise', function(){
        var App = PromiseClass.create({
            method(){

            }
        });
        var app = new App();
        var promise = app.method();
        expect(promise instanceof Promise).to.be(true);
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
        expect(isInited).to.be(true);
        yield app.method2(111).then(function(ret){
            expect(ret).to.be(111);
        }).method1(222).then(function(ret){
            expect(ret).to.be(222);
        });
        expect(isMethod2Called).to.be(true);
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
            expect(this.aaa).to.be(11);
            expect(ret).to.be(11);
        }).method(22).then(function(ret){
            expect(ret).to.be(22);
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
            expect(this.aaa).to.be(11);
            expect(ret).to.be(11);
        }).method(22).then(function(ret){
            expect(ret).to.be(22);
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
            expect(ret).to.be(11);
            return yield sleep(22);
        }).then(function*(ret){
            // check promise callback
            expect(ret).to.be(22);
            return yield sleep(33);
        }).then(function(ret){
            // check promise onReject callback
            expect(ret).to.be(33);
            throw new Error('test');
        }).then(function(){
        }, function*(error){
            expect(error.message).to.contain('not defined');
            return yield sleep(44);
        }).then(function(ret){
            // check promise catch callback
            expect(ret).to.be(44);
            throw new Error('test');
        }).catch(function*(error){
            expect(error.message).to.contain('not defined');
            return yield sleep(55);
        }).then(function(ret){
            expect(ret).to.be(55);
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
