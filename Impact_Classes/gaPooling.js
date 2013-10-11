ig.module(
	'impact.gaPooling'
)
.requires(
	'impact.impact',
	'impact.entity'
)
.defines(function(){ "use strict";


//
//                  **  Pooling for Impact **
//
//
//  Original repository : https://github.com/gamealchemist/Javascript-Pooling

//  Copyright  Vincent Piel 2013.
//
//  blog      : gamealchemist.wordpress.com/
//
//  Fair-ware : Share your thought if it brings you some, tell me 
//    if it was of some use, and share profits if it brings you some.  -Be fair-
//
//
//                  ****   HOW TO USE   ??  ****
//
// To pool a class extending ig.Class, require this module in your main.js, 
//         then use anywhere : 
//                                 MyClass.setupPool(poolInitialSize);
// 
//                                 expl : EntityGrenade.setupPool(20);
//
//  The poolInitialSize represents the number of instances you expect to use at the
//      same time. The pool will increase its size if you happen to use more than this size.
//  In the example, up to 20 grenades can be spawned without memory allocation / garbage creation.
//
//  If you are planning only to pool Entities, then you have nothing more to do,
//  provided you use them in a standard way, i.e. only using spawnEntity() and kill() on them.
//
//  They will automatically be taken from/put back in the pool for you.
//
//  You might want to pool a Class that is not extending entity : in this case pool the
//      Class as explained above, then use pnew on the Class to build an instance :
//
//              var instance = MyClass.pnew(arg1,....);
//              the arguments are the same as the one used with new( ...)
//
//               expl : 1) in main.js  :   Vector2d.setupPool(200);
//                      2) in your game :  var myVector2d = Vector2d.pnew(x,y);
//
// Don't forget to dispose your instances when it is no longer used with : 
//                        instance.pdispose();
//      with the example above : 
//                                 myVector2d.pdispose(); 
//
// Rq 1 : in order to fill up the pool, your init must work properly when called without arguments.
//           so you have to test with, like :  
//        init : function (x,y,settings) {
//              this.parent();
//              this.x = x || 0;   this.y = y || 0;
//              this.tomatoCount = settings ? settings.tomatoCount : 0 ;  // checking against null settings.
//
// Rq 2 : to fully take advantage of pooling, recycle also the properties of the objects you
//       just grabbed from the pool.
//       Most importantly, for Entities, are your animations, and your arrays.
//
//      example :
//                this.bananaArray = this.bananaArray ? this.bananaArray : []; // retrieve array if one is available
//                this.bananaArray.length = 0 ;  // reset length in case it was just retrieved.
//
//      example 2 :
//                 if (!this.anims['idle']) this.addAnim('idle', [1,3,3,2,2]);
//
//                 // . you might want to do setAnim on the animation of your choice here
//
// Rq 3 : this pooling library does work also with standard javascript classes.
// Rq 4 : dispose() will be called when an object is pdisposed in case you need to perform
//                  some operations on diposing. Just like in the C++ scheme.

window.ga = (window.ga) ? ga : {} ;


Object.defineProperty(Function.prototype,'setupPool', { value : setupPool });

setupPool.help =[        ' setupPool.' ,
' Function method. Called with the initial size of the pool.                ',
' The pooled Class must have a constructor / init that accepts no arguments.',
' setup a pool on the function, add a pnew method to retrieve objects       ',
' from the pool, and add a hidden pdispose method to the instances so       ',
' they can be sent back on the pool.                                        ',
' use :  MyClass.setupPool(100);                                            ',
' then : var myInstance = MyClass.pnew(23, "arg 2", ..); // to instanciate  ',
'        myInstance.pdispose();                                             '].join('\n');
function setupPool(newPoolSize) {
	if (!(newPoolSize>0)) throw('setupPool takes a size > 0 as argument.');
    this.pool                = this.pool || []    ;
    this.poolSize            = this.poolSize || 0 ;
    this.pnew                = pnew               ;
    // define pdispose hidden method on this function's protoype
    Object.defineProperty(this.prototype, 'pdispose', { value : pdispose } ) ; 
    // pre-fill the pool.
    try {
	    while ( this.poolSize < newPoolSize ) { (new this()).pdispose(); }	
    } catch(e) {
    	throw('|| Pooling error : error while filling the pool. \n' +
    	       'The constructor or init function must accept no call arguments.\n' +
    	        'Exception encountered : ' + e + '\nStack : ' + (e.stack && e.stack.split('\n')[0+!!window.chrome]) );
    }
    // reduce the pool size if new size is smaller than previous size.
    if (this.poolSize > newPoolSize) {
    	this.poolSize    =  newPoolSize ;
    	this.pool.length =  newPoolSize ; // allow for g.c.
    }
}


pnew.help = [            ' pnew ',
' method of the Constructor Function. Called with same arguments as with new() ',
' returns an instance, that might come from the pool if there was some         ',
' instance remaining, or created new, if the pool was empty.	               ',
' expl : var myVector2d = Vector2d.pnew(100,40); '                               ].join('\n');
function  pnew () {
    var pnewObj  = null     ; 
    if (this.poolSize !== 0 ) {              // the pool contains objects : grab one
           this.poolSize--  ;
           pnewObj = this.pool[this.poolSize];
           this.pool[this.poolSize] = null   ; 
    } else {
           pnewObj = new this() ;             // the pool is empty : create new object
    }
     // initialize object with init class if available, with constructor otherwise
    if (pnewObj.init) {  pnewObj.init.apply(pnewObj, arguments); }
    else this.apply(pnewObj, arguments);          
    return pnewObj;
}


pdispose.help=[       ' pdispose ',
' hidden method added to a pooled class. Takes no arguments.            ',
' release on object that will return back in the pool.                  ',
' Rq : If a dispose method exists, it will get called before disposal,  ',
' so you might free some resources.                                     ',
' !!! do NOT keep a reference to a pdisposed object.   !!!              ' ].join('\n');
function pdispose() {
    var thisCttr = this.constructor           ;
    if (this.dispose) this.dispose()          ;  // Call dispose if defined
    thisCttr.pool[thisCttr.poolSize++] = this ;  // throw the object back in the pool 
}

 

//
//        Helper for auto-pooling  of entites (provided you use spawnEntity and kill only)
//
//        automatically called on module load to set pooling on all entities.
ga.autoPoolEntities = function() {
	
		var EntityKill=ig.Entity.prototype.kill;
		
		ig.Entity.prototype.kill = function() {
			    if (this.pdispose) { this.pdispose(); }		
				ig.game.removeEntity( this );
		};
		
		var spawnEntity =ig.Game.prototype.spawnEntity;
		
		ig.Game.prototype.spawnEntity =	 function( type, x, y, settings ) {
		        if (!type) { throw ('cannot spawn entity of undefined type'); }
			    type =  ( typeof(type) === 'string' ) ? ig.global[type] : type;
				
			 	var ent = null;
		 		if  (type.pnew) {
		 			ent = type.pnew(x,y,settings)	;
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
		
		ga.autoPoolEntities= function() {};
};

// pool entities by default.
ga.autoPoolEntities();


// trick to have the test against init performed faster.
Object.defineProperty(Function.prototype,'init', { value : null, configurable : true, writable : true });


// fix a bug that has the entities -even if pooled- just going out
// of scope without being killed() on a level load or game change. 
// So they are lost for the pool.
// +  allows to send an game instance, not a game class,
// to ig.system.setGame(), to allow more flexilibilty / game re-use.
ga.fixImpactPooling = function(){
	
	  ig.Game.inject( {
	     loadLevel : function() {
	          for (var i=0, l = this.entities.length; i<l; i++) { this.entities[i].kill(); };
	          this.parent();
	      }
	  });
	 
	 ig.System.inject( {
	   _setGameNow: function( ) {
	             if (ig.game) {
	             	                var gEnt = ig.game.entities;
	                for (var i=0, l = gEnt.length; i<l; i++) { gEnt.kill(); };
	             }
	        ig.game = (typeof gameClassOrGameInstance == 'function') ? new (gameClassOrGameInstance)() : gameClassOrGameInstance ;    
	        ig.system.setDelegate( ig.game );
	   }
});
	
	
};


});