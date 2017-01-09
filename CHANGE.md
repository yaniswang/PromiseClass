PromiseClass change log
====================

## ver 1.0.3 (2017-1-9)

1. Fix: fix issue run in node 7.x

## ver 1.0.2 (2016-12-20)

1. Fix: fix issue when catch error by promise

## ver 1.0.1 (2016-10-8)

add:

1. bind this to then callback

## ver 1.0.0 (2016-9-30)

add:

1. Support chai

## ver 0.9.5 (2015-11-9)

add:

1. Support define generator method: `PromiseClass.create({*method(){ }});`
2. Promise callback can use generator function: `.then(function*(){ })`

## ver 0.9.4 (2015-11-8)

change:

1. no wrap for constructor, then should return instance of this class
2. no return value for constructor

## ver 0.9.1 (2015-11-6)

1. first version
