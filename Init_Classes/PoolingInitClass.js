//
//         Pooling for objects using an init() scheme.
//

// look here for explanations :
// http://gamealchemist.wordpress.com/2013/02/02/no-more-garbage-pooling-objects-built-with-constructor-functions/
// and here :
// http://gamealchemist.wordpress.com/2013/05/04/pooling-with-init-lets-throw-impactjs-classes-in-the-pool/
//
//   This module allows to perform pooling on classes that are defined
//        with an extend method and a parameter object and that make use 
//            of an init() method to initialize their instances.
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
//
//  Rq : you might want to do some clean up with a dipose method when
//          your oject is pdiposed : 
//           if a dispose method is defined, it will get call inside pdispose();


(function () {

Object.defineProperty(Function.prototype,'setupPool', { value : setupInitPool } );  

// setupPool. 
// setup a pool on the function (an init class constuctor), add a pnew method to 
// retrieve objects  from the pool, and add a hidden pdispose method to the instances
// so they can be sent back on the pool.
// use : MyPureJSClass.setupPool(100);
function setupPool(newPoolSize) {
	if (!initialPoolSize || (!(newPoolSize>0))) throw('setupInitPool takes a size > 0 as argument.');
    this.pool                = this.pool ||   []  ;
    this.poolSize			 = this.poolSize || 0 ;    
    this.pnew                = pnew               ;
    Object.defineProperty(this.prototype, 'pdispose', { value : pdispose } ) ;         
    // pre-fill the pool.
    
    while ( this.poolSize < newPoolSize ) { (new this()).pdispose(); }    
    // reduce the pool size if new size is smaller than previous size.
    if (this.poolSize > newPoolSize) {
    	this.poolSize    =  newPoolSize ;
    	this.pool.length =  newPoolSize ; // allow for g.c.
    }                           
};

	
// pnew : method of the constructor function. 
//        returns an instance, that might come from the pool
//        if there was some instance left,
//        or created new, if the pool was empty.	
// instance is initialized the same way it would be when using new
// instance is initialized the same way it would be when using new
function pnew() {
    var pnewObj  = null     ; 
    if (this.poolSize>0 ) {
           this.poolSize--  ;   // the pool contains objects -> grab one
           pnewObj = this.pool[this.poolSize];
           this.pool[this.poolSize] = null   ; // **

    } else {
           pnewObj = new this();    // the pool is empty -> create new object
    }
    if (pnewObj.init) {  pnewObj.init.apply(pnewObj, arguments); }
    return pnewObj;
}

function pdispose() {
    var thisCttr = this.constructor           ;
    if (this.dispose) this.dispose()          ;  // Call dispose if defined 
    // throw the object back in the pool 
    thisCttr.pool[thisCttr.poolSize++] = this ;
}


})();

