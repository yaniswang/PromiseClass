'use strict';

var PromiseClass = require('../');
var chai = require("chai");
chai.should();
chai.use(PromiseClass.chaiSupportChainPromise);

var App = PromiseClass.create({
    asyncMethod1(n, done){
        setTimeout(function(){
            done(null, n);
        }, n);
    },
    asyncMethod2(done){
        setTimeout(function(){
        	done(new Error('ttt'))
        }, 100)
    },
    asyncMethod3(){
        asdfa();
    }
});

var app = new App();

describe('chai test : ', function(){
    it('async method test1', function(){
        return app.asyncMethod1(100).should.equal(100)
        .asyncMethod1(88).should.equal(88);
    });

    it('async method test2', function(){
		return app.asyncMethod1(10).should.not.be.a('error')
		.asyncMethod2().should.be.a('error');
    });

    it('async method test3', function(){
        return app.asyncMethod3().should.be.a('error');
    });
});
