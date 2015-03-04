Use [virtual-dom](https://github.com/Matt-Esch/virtual-dom) with [abstract-state-router](https://github.com/TehShrike/abstract-state-router)!

## Usage

```js
var StateRouter = require('abstract-state-router')
var virtualdomRenderer = require('virtualdom-state-renderer')()
var domready = require('domready')

var stateRouter = StateRouter(virtualdomRenderer, 'body')

// add whatever states to the state router

domready(function() {
	stateRouter.evaluateCurrentRoute('login')
})
```

## virtualdomRenderer([options])

`options` is an object of options, and is optional.

```js
var StateRouter = require('abstract-state-router')
var virtualdomRenderer = require('virtualdom-state-renderer')

var renderer = virtualdomRenderer({
	data: { hello: 'world' }
})
var stateRouter = StateRouter(renderer, 'body')
```
