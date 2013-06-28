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
//
// if a dispose method is defined, it will get call inside pdispose();

window.ga = (window.ga) ? ga : {} ;


(function () {

ga.setupPool  =  function (func, initialPoolSize) {
    if (arguments.length != 2) {  throw ('setupPool takes two arguments');    }
    func.pool                = []        ;
    func.poolSize            = 0         ;
    func.pnew                = pnew      ;
    Object.defineProperty(func.prototype, 'pdispose', {value : pdispose } ) ; 
    // pre-fill the pool.
    while (initialPoolSize-- >0) { (new func()).pdispose(); }
};

	
function  pnew () {
    var pnewObj  = null     ; 
    if (this.poolSize !== 0 ) {              // the pool contains objects  grab one
           this.poolSize--  ;
           pnewObj = this.pool[this.poolSize];
           this.pool[this.poolSize] = null   ; 
    } else {
           pnewObj = new this() ;             // the pool is empty : create new object
    }
    // return initialized object.
    this.apply(pnewObj, arguments);
    retrun pnewObj;
}

function pdispose() {
    var thisCttr = this.constructor           ;
    if (this.dispose) this.dispose()          ;  // Call dispose if defined
    thisCttr.pool[thisCttr.poolSize++] = this ;  // throw the object back in the pool 
}

}                                                       )();
