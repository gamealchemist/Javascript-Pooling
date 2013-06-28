//
//         Pooling in Javascript
//

Pooling is basically about recycling object, in
order to avoid memory allocation and garbage collecting
while your application is running.

I wrote some explanations about pooling here :

http://gamealchemist.wordpress.com/2013/02/02/no-more-garbage-pooling-objects-built-with-constructor-functions/

People using Init Classes, as well as Impact game framework users
should look here for an explanation :

http://gamealchemist.wordpress.com/2013/05/04/pooling-with-init-lets-throw-impactjs-classes-in-the-pool/



So to make a long story short :

// ============================================
// True Javascript classes :
// ============================================

True JS Classes look like :

var MyClass = function(a1, a2, �) {
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

- setup the pool with its size with :
ga.setupPool(MyClass, 100);

- build a new item with the same arguments as with new() :
var myInstance = MyClass.pnew(a1,a2, ... );

-don't forget to dispose your unused objects with :
myInstance.pdispose();

  !!! you should't keep any reference to a dispose object !!
  
- define a dispose() method on your class's prototype if
you need to clear up things before reclaiming the object into
the pool.
( one example might be : if you are using properties that are
themselves pooled.)

- you can watch the maximum number of object that was reach with MyClass.pool.length.

- For best efficiency, the initial pool size should be >= to the 
max of MyClass.pool.length for best efficiency.





// ============================================
// Javascript Classes using an init() scheme :
// ============================================

If you are using a class system that does extend
class with an object containing an init() function
that will perform init at the end of the constructor.

To enable pooling on such a class,
 use  :  /Init_Classes/PoolingInitClass
 then  :


- check that ** the init() function ** initializes 
all object properties, even when called with no arguments.
- setup the pool with its size with :

ga.setupInitPool(MyClass, 100);

- build a new item with :
var myInstance = MyClass.pnew(a1,a2, �);

- don't forget to dispose your unused objects with :
myInstance.pdispose();

  !!! you should't keep any reference to a dispose object !!

- you can watch the maximum number of object in
use with MyClass.builtCount.
The initial pool size should be > to the max of
the measured MyClass.builtCount for best efficiency.





