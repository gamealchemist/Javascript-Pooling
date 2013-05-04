//
//         Pooling for objects using true js classes.
//

// look here for explanations :
// http://gamealchemist.wordpress.com/2013/02/02/no-more-garbage-pooling-objects-built-with-constructor-functions/

// Use with :
//        ga.setupPool (MyClass, 100);
//        var instance = MyClass.pnew (arg1, arg2, ...);
//
//  and when you're done with the object :
//        instance.pdispose();

window.ga === (ga) ? ga : {} ;


(function {
	
var pnew     = function() {
    var pnewObj  = null     ; 
    if (this.poolSize != 0 ) {
           // the pool contains objects -&gt; grab one
           this.poolSize--  ;
           pnewObj = this.pool[this.poolSize];
           this.pool[this.poolSize] = null   ; // **
    } else {
           // the pool is empty : create new object
           pnewObj = new this() ;
           this.builtCount++;
    }
    // return initialized object.
    return this.apply(pnewObj, arguments);
};

var pdispose   = function() {
    var thisCttr = this.constructor             ;
    // throw the object back in the pool 
    thisCttr.pool[thisCttr.poolSize++] = this ;
};

ga.setupPool  =  function(func, initialPoolSize) {
    if (arguments.length != 2) { 
        throw ('setupPool takes two arguments');    }
    func.pool                = []        ;
    func.poolSize            = 0         ;
    func.builtCount          = initialPoolSize ;
    func.pnew                = pnew      ;
    func.prototype.pdispose  = pdispose  ; 
    // pre-fill the pool.
    if (initialPoolSize != 0)
    {
       for (var i=initialPoolSize; i--; ) {
          (new func()).pdispose();
        }
    }
};

})();
