var PromiseClass = require('../');
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
