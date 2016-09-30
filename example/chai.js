'use strict';
var PromiseClass = require('../');
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
