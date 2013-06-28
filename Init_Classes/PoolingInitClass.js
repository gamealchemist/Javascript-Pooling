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


window.ga = (window.ga) ? ga : {} ;


(function () {
	
var Initpnew     = function() {
    var pnewObj  = null     ; 
    if (this.poolSize>0 ) {
           // the pool contains objects -> grab one
           this.poolSize--  ;
           var  pnewObj = this.pool[this.poolSize];
           this.pool[this.poolSize] = null   ; // **

    } else {
          // the pool is empty -> create new object
          // this is the 'right way, but just too slow.
          //   return this.apply ( Object.create (this.prototype) , arguments );
          //  so instead we use new then initialize after :
          pnewObj = new this();    
          this.builtCount++;
    }
     if (pnewObj.init) {
    	                  pnewObj.init.apply(pnewObj, arguments); };
     return pnewObj;
};

var Initpdispose   = function() {
    var thisCttr = this.constructor             ;
    // throw the object back in the pool 
    thisCttr.pool[thisCttr.poolSize++] = this ;
};

ga.setupInitPool  =  function(func, initialPoolSize) {
    if (arguments.length<2) { 
        throw ('setupPool takes two arguments');    }
    func.pool                = [] 				  ;
    func.poolSize            = 0                  ;
    func.pnew                = Initpnew           ;
    func.builtCount          = initialPoolSize    ;
    func.prototype.pdispose  = Initpdispose       ; 
    // pre-fill the pool.
       for (var i=initialPoolSize; i--;) {
                var newObj = (new func());
                newObj.pdispose(); 
            }   
                             
};

})();

