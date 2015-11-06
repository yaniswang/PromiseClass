/**
 * Copyright (c) 2015, Yanis Wang <yanis.wang@gmail.com>
 * MIT Licensed
 */

var expect  = require("expect.js");

var PromiseClass = require('../');

describe('PromiseClass Constructor test : ', function(){

    it('should define constructor and return value', function(done){
        var isInited = false;
        var App = PromiseClass.create({
            constructor(str){
                isInited = true;
                return str;
            }
        });
        new App('test').then(function(ret){
            expect(isInited).to.be(true);
            expect(ret).to.be('test');
            done();
        }).catch(done);
    });

});

describe('PromiseClass Propertie test : ', function(){

    it('should define properties', function(done){
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
        expect(app.propertie1).to.be(undefined);
        expect(app.propertie2).to.be(undefined);
        app.checkProperties().then(function(){
            done();
        }).catch(done);
    });

    it('should add properties', function(done){
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
        app.checkProperties().then(function(){
            done();
        }).catch(done);
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
        app.method('111', function(error, ret){
            expect(ret).to.be('111');
        }).then(function(ret){
            expect(isCalled).to.be(true);
            expect(ret).to.be('111');
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
        app.method('222', function(error, ret){
            expect(ret).to.be('222');
        }).then(function(ret){
            expect(isCalled).to.be(true);
            expect(ret).to.be('222');
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
        app.method('222', function(error, ret){
            expect(ret).to.be('222');
        }).then(function(ret){
            expect(isCalled).to.be(true);
            expect(ret).to.be('222');
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
        app.method('222', function(error, ret){
            expect(ret).to.be('222');
        }).then(function(ret){
            expect(isCalled).to.be(true);
            expect(ret).to.be('222');
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

    it('should catch constructor error', function(done){
        var App = PromiseClass.create({
            constructor(){
                throw new Error('test');
            }
        });
        new App().catch(function(){
            done();
        });
    });

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
