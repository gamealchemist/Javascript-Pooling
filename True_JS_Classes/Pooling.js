//
//         Pooling for objects using true js classes.
//

// look here for explanations :
// http://gamealchemist.wordpress.com/2013/02/02/no-more-garbage-pooling-objects-built-with-constructor-functions/

// Use with :
//        MyClass.setupPool (100);
//        var instance = MyClass.pnew (arg1, arg2, ...);
//
//  and when you're done with the object :
//        instance.pdispose();
//
// if a dispose method is defined, it will get call inside pdispose();


(function () {

Object.defineProperty(Function.prototype,'setupPool', { value : setupPool });

function setupPool(initialPoolSize) {
	if (!initialPoolSize || !isFinite(initialPoolSize)) throw('setupPool takes a size > 0 as argument.');
    this.pool                = []          ;
    this.poolSize            = 0           ;
    this.pnew                = pnew        ;
    Object.defineProperty(this.prototype, 'pdispose', { value : pdispose } ) ; 
    // pre-fill the pool.
    while (initialPoolSize-- >0) { (new this()).pdispose(); }
}

	
function  pnew () {
    var pnewObj  = null     ; 
    if (this.poolSize !== 0 ) {              // the pool contains objects : grab one
           this.poolSize--  ;
           pnewObj = this.pool[this.poolSize];
           this.pool[this.poolSize] = null   ; 
    } else {
           pnewObj = new this() ;             // the pool is empty : create new object
    }
    this.apply(pnewObj, arguments);           // initialize object
    return pnewObj;
}

function pdispose() {
    var thisCttr = this.constructor           ;
    if (this.dispose) this.dispose()          ;  // Call dispose if defined
    thisCttr.pool[thisCttr.poolSize++] = this ;  // throw the object back in the pool 
}

}                                                       )();
