//
//         Pooling in Javascript
//
//  Original repository : https://github.com/gamealchemist/Javascript-Pooling

//  Copyright  Vincent Piel 2013.
//
//  blog      : gamealchemist.wordpress.com/
//
//  Fair-ware : Share your thought if it brings you some, tell me 
//    if it was of some use, and share profits if it brings you some.  
//

Pooling is basically about recycling object, in
order to avoid memory allocation and garbage collection
while your application is running.

A pool is a stack which stores objects from a given Class.
Once an object is no longer of use, instead of dropping it,
the pool stores it. When you later need a new object, it will
be taken from the pool than initialized insted of beeing 
created from scratch. This way you avoid memory disallocation
, memory allocation and garbage collection, which
is very efficient with short-lived / spawning often objects.

If you pre-fill the pool with enough object during the app
intialisation, you might even not need to create a single 
instance of this object while the app is running.

To install a pool on a class, just use
    MyClassFunction.setupPool(*initial pool size*)
Then to grab an object from the pool, use 
    var myInstance = MyClassFunction.pnew(....)
where the arguments are the same as in the call to new.
Then, for all this to be usefull, you have to notify when an object
is no longer in use : 
     myInstance.pdispose();
so it will be put back on the pool for later use.

Beware : 
1) Since the initialisation of the object is made prior to any
real call, the initialisation function must behave nicely even
when called with no arguments.
2) Since an object might (will) be re-used, the initialisation must
initialise each and every property used by the object during its life.
3) take good care of releasing any reference to a pdisposed object,
weird bug could occur if you happen to reference the same object with
two different names.   
!!! you should't keep any reference to a pdisposed object !!


Advice :
- re-use as much as possible your instance object/arrays/... when
performing initialisation. For instance do not write :
  this.myArray = [];
but rather :
  if (this.myArray) this.myArray.length = 0 ; else this.myArray = []; 
- you can change the pool size on the go by calling again setupPool.
- you can even clear the pool for an object that will no longer get
used by calling setupPool(0) on the Class.
- you might want to perform some specific actions when
an object is pdisposed. -For instance you might want to pdispose some 
pooled objects handled by your pooled Class. (nested pooling).
In this case, just add a dispose (not *p*dispose) method to your object, 
in which you do the clean-up, it will get called in the pdispose method.
- you can watch the maximum number of object that was reached so far by
looking at MyClass.pool.length 
- For best efficiency, the initial pool size should be >= to the 
max of MyClass.pool.length.

I wrote 4 slighly different version :
- one for true javascript classes (see below)
- one for classes with a .init() scheme (see below)
- one for both of those classes -mixed case-
- one for Impact, which is just a repack of the mixed case
   + an utility function to auto-pool entities.
      

I wrote some explanations about pooling here :

http://gamealchemist.wordpress.com/2013/02/02/no-more-garbage-pooling-objects-built-with-constructor-functions/

People using Classes with an init method for initialisation, like Impact.js game framework users
should look here for an explanation :

http://gamealchemist.wordpress.com/2013/05/04/pooling-with-init-lets-throw-impactjs-classes-in-the-pool/



// =================================================
// Pooling True Javascript classes :
// =================================================

True JS Classes look like :

var MyClass = function(a1, a2, ...) {
    this.p1 = a1 ;
    this.p2 = a2 ;
    ...
};

MyClass.prototype.meth1 = function( .., ..) {
};

MyClass.prototype.meth2 = function( .., ..) {
};

To enable pooling on such a class,
 get the file  :  /True_JS_Classes/Pooling.js

and include it in your project (or copy-paste)/ then  :

- check that the constructor initializes all 
    object properties, even when called with no arguments.
		var MyClass = function(a1, a2, ...) {
		    this.p1 = a1 || 0;
		    this.p2 = a2 || 'a string';
		    ...
		};

- setup the pool with its size, that is the max object count that you will
have simutaneously :
MyClass.setupPool(100);

- build a new item using pnew the same arguments as with new() :
var myInstance = MyClass.pnew(a1,a2, ... );

-don't forget to dispose your unused objects with :
myInstance.pdispose();

  !!! you should't keep any reference to a pdisposed object !!


// ===================================================
// Pooling Javascript Classes using an init() scheme :
// ===================================================

If you are using a class system that does extend
class with an object containing an init() function
that will perform init at the end of the constructor.

MyClass = class.extend( {
    prop1 : 10,
    meth1 : function () { ... } ,
    init  : function () { this.xx = ... ; this. = ... } 
} );

To enable pooling on such a class,
 use  :  /Init_Classes/PoolingInitClass
 then  :


- check that ** the init() function ** initializes 
all object properties, even when called with no arguments.

- setup the pool with its size with :
MyClass.setupPool(, 100);

- build a new item with :
var myInstance = MyClass.pnew(a1,a2);

- don't forget to dispose your unused objects with :
myInstance.pdispose();

!!! you should't keep any reference to a pdisposed object !!


// ============================================
// Pure Javascript Classes AND classes using an init() scheme :
// ============================================


To use pooling on both pure javascript classes and init classes, 
use the Mixed_Classes module.
The way it works is the same. 
A class is assumed to be pure javascript if no init method is defined,
and to be an extended class if an init method is defined.
==>>> You should not define an init method on your true js class for this
module to work.


