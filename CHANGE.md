PromiseClass change log
====================

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
