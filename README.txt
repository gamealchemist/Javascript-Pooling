//
//         Pooling in Javascript
//

Pooling is basically about recycling object, in
order to avoid memory allocation and garbage collection
while your application is running.

A pool is just a stack in which you will put your unused
objects, and from which you will take new objects. This
way you avoid both disallocation and reallocation, which
is very efficient with short-lived / spawn often objects.
If you pre-fill the pool with enough object during the app
intialisation, you might even not need to create a single 
instance of this object while the app is running.

To install the pool, just use
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

I wrote 4 slighly different version :
- one for true javascript classes (see below)
- one for classes with a .init() scheme (see below)
- one for both of those classes -mixed case-
- one for Impact, which is just a repack of the mixed case + an utility function to
      auto-pool entities.
      

I wrote some explanations about pooling here :

http://gamealchemist.wordpress.com/2013/02/02/no-more-garbage-pooling-objects-built-with-constructor-functions/

People using Classes with an init method for initialisation, like Impact.js game framework users
should look here for an explanation :

http://gamealchemist.wordpress.com/2013/05/04/pooling-with-init-lets-throw-impactjs-classes-in-the-pool/



// ============================================
// True Javascript classes :
// ============================================

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

  !!! you should't keep any reference to a disposed object !!
  
Advanced users only :  define a dispose() method on your class's prototype if
you need to clear up things before reclaiming the object into
the pool.
( one example might be : if you are using properties that are
themselves pooled.)

- you can watch the maximum number of object that was reached with MyClass.pool.length.

- For best efficiency, the initial pool size should be >= to the 
max of MyClass.pool.length.





// ============================================
// Javascript Classes using an init() scheme :
// ============================================

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

  !!! you should't keep any reference to a dispose object !!

- you can watch the maximum number of object in
use with MyClass.builtCount.
The initial pool size should be > to the max of
the measured MyClass.builtCount for best efficiency.


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


