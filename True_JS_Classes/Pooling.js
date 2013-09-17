//
//         Pooling for objects using true js classes.
//

// look here for explanations :
// http://gamealchemist.wordpress.com/2013/02/02/no-more-garbage-pooling-objects-built-with-constructor-functions/
//
//
//   This module allows to perform pooling on pure Javascript classes :
//        classes that set their properties in the constructor and have
//        their methods defined on the prototype.
//
//   function MyClass(...) { this. = ... this. = ...}  
//   MyClass.prototype.doThis = function () {...};
//
//   !! If you use both pure Javascript classes and init classes, use
//         the Mixed_Class module                                       !!
//
// Use with :
//        MyClass.setupPool (100);
//        var instance = MyClass.pnew (arg1, arg2, ...);  // same args as with  = new MyClass(...)
//
//  and when you're done with the object :
//        instance.pdispose();
//
//   do not reuse a pdipose object. you might want to set your var
//      to null after pdisposing the object to ensure this.
//
//  Rq : you might want to do some clean up with a dipose method when
//          your oject is pdiposed : 
//           if a dispose method is defined, it will get call inside pdispose();

(function () {

Object.defineProperty(Function.prototype,'setupPool', { value : setupPool });

// setupPool. 
// setup a pool on the function, add a pnew method to retrieve objects
// from the pool, and add a hidden pdispose method to the instances so
// they can be sent back on the pool.
// use : MyPureJSClass.setupPool(100);
// then : var myInstance = MyPureJSClass.pnew(23, 'arg 2', ..)
function setupPool(newPoolSize) {
	if (!(newPoolSize>0)) throw('setupPool takes a size > 0 as argument.');
    this.pool                = this.pool || []    ;
    this.poolSize            = this.poolSize || 0 ;
    this.pnew                = pnew               ;
    Object.defineProperty(this.prototype, 'pdispose', { value : pdispose } ) ; 
    // pre-fill the pool.
    while ( this.poolSize < newPoolSize ) { (new this()).pdispose(); }
    // reduce the pool size if new size is smaller than previous size.
    if (this.poolSize > newPoolSize) {
    	this.poolSize    =  newPoolSize ;
    	this.pool.length =  newPoolSize ; // allow for g.c.
    }
}

// pnew : method of the constructor function. 
//        returns an instance, that might come from the pool
//        if there was some instance left,
//        or created new, if the pool was empty.	
// instance is initialized the same way it would be when using new
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

// pdispose : release on object that will return in the pool.
//             if a dispose method exists, it will get called.
//            do not re-use a pdisposed object. 
function pdispose() {
    var thisCttr = this.constructor           ;
    if (this.dispose) this.dispose()          ;  // Call dispose if defined
    thisCttr.pool[thisCttr.poolSize++] = this ;  // throw the object back in the pool 
}

}                                                       )();
