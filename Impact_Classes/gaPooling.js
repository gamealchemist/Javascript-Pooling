ig.module(
	'impact.gaPooling'
)
.requires(
	'impact.impact',
	'impact.entity'
)
.defines(function(){ "use strict";

window.ga = (window.ga) ? ga : {} ;

//
//         Pooling for objects using true js classes.
//


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
    this.apply(pnewObj, arguments);
    return pnewObj;
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



//
//         Pooling for objects using an init() scheme.
//

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


//
//        Helper for auto-pooling  of entites (provided you use spawnEntity and kill only)
//


ga.autoPoolEntities = function() {
	
		var EntityKill=ig.Entity.prototype.kill;
		
		ig.Entity.prototype.kill = function() {
			    if (this.pdispose) { this.pdispose(); }		
				ig.game.removeEntity( this );
		};
		
		var spawnEntity =ig.Game.prototype.spawnEntity;
		
		ig.Game.prototype.spawnEntity =	 function( type, x, y, settings ) {
		        if (!type) { throw ('cannot spawn entity of undefined type')}
			    type =  ( typeof(type) === 'string' ) ? ig.global[type] : type;
				
			 	var ent = null;
		 		if  (type.pnew) {
		 			ent = type.pnew(x,y,settings )	
		 			ent._killed = false;
					var pr = ent.__proto__;
					ent.type = pr.type  ; 
					ent.checkAgainst = pr.checkAgainst; 
					ent.collides =  pr.collides;  

		 		} else  { ent = new (type)( x, y, settings ); }
	 		
		 		
				this.entities.push( ent );
				if( ent.name ) {
					this.namedEntities[ent.name] = ent;
				}
				return ent;
		};
};

});