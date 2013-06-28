//
//         Pooling for objects using an init() scheme.
//

// look here for explanations :
// http://gamealchemist.wordpress.com/2013/02/02/no-more-garbage-pooling-objects-built-with-constructor-functions/
// and here :
// http://gamealchemist.wordpress.com/2013/05/04/pooling-with-init-lets-throw-impactjs-classes-in-the-pool/

// Use with :
//        ga.setupInitPool (MyClass, 100);
//        var instance = MyClass.pnew (arg1, arg2, ...);
//
//  and when you're done with the object :
//        instance.pdispose();


(function () {

Object.defineProperty(Function.prototype,'setupInitPool', { value : setupInitPool } );  

function setupInitPool(initialPoolSize) {
    if (arguments.length<2) { 
        throw ('setupPool takes two arguments');    }
    this.pool                = [] 				  ;
    this.poolSize            = 0                  ;
    this.pnew                = pnew           ;
    Object.defineProperty(this.prototype, 'pdispose', { value : pdispose } ) ; 
     // pre-fill the pool.
    while (initialPoolSize-- >0) { (new this()).pdispose(); }                             
};

	
function pnew() {
    var pnewObj  = null     ; 
    if (this.poolSize>0 ) {
           // the pool contains objects -> grab one
           this.poolSize--  ;
           pnewObj = this.pool[this.poolSize];
           this.pool[this.poolSize] = null   ; // **

    } else {
          // the pool is empty -> create new object
           pnewObj = new this();    
           this.builtCount++;
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

