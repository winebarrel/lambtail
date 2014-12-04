# lambtail

Node module for follow lambda function output

# example

```js
var Lambtail = require('lambtail');
var lambtail = new Lambtail({region: 'us-east-1'})
lambtail.tail('function_name')
```
