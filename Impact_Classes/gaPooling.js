ig.module(
	'impact.gaPooling'
)
.requires(
	'impact.impact',
	'impact.entity'
)
.defines(function(){ "use strict";


//
//        Pooling for Impact
//
// to pool automatically your entities
//  just call ga.autoPoolEntities()
// and pool your classes with EntitySomeBadGuy.setupInitPool( size-of-the-pool )
// then if you only use spawnEntity() and kill() your entities are
// taken from/put back in the pool automatically
//
// to pool a true javascript class, use MyClass.setupPool(100);
// to pool a class with an init() scheme, use MyClass.setupInitPool(100);
//
// once a class is pooled, create an instance with :  var instance = MyClass.pnew(arg1,....);
// and don't forget to dispose it when it is no longer used with : instance.pdispose();
//


window.ga = (window.ga) ? ga : {} ;

//
//         Pooling for objects using true js classes.
//


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



//
//         Pooling for objects using an init() scheme.
//

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