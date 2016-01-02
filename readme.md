virtualdom-state-renderer
=========================

> Use [virtual-dom][v-dom] with [abstract-state-router][asr]!

# example

*index.js*
```js
var StateRouter = require('abstract-state-router')
var virtualdomRenderer = require('virtualdom-state-renderer')
var domready = require('domready')

var stateRouter = StateRouter(virtualdomRenderer, 'body')

// add whatever states to the state router
stateRouter.addState({
	name: 'app',
	route: '/',
	template: require('./template.js')
})

domready(function() {
	stateRouter.evaluateCurrentRoute('app')
})
```

*template.js*
```js
module.exports = function template(h, resolveContent, helpers) {
	return (
		h('div', [
			h('p', 'Pretty sweet, isn\'t it?'),
			h('p', 'Here, let me give some examples or something.')
		])
	)
}
```

# api

```js
var virtualdomRenderer = require('virtualdom-state-renderer')
```

## `virtualdomRenderer`

Pass this object into the `StateRouter`.

```js
var Router = require('abstract-state-router')
var renderer = require('virtualdom-state-renderer')

Router(renderer, 'body')
```

## templates

A template is a function that returns a `virtual-dom` object. If you wanted, you could use the [`virtual-html`][v-html] library to generate a `virtual-dom` object.

The function is supplied with these arguments:
- `h` is a function that returns a `virtual-dom` node. [View API here][v-hyperscript].
- `resolveContent` is the resolve content, which is the set in the resolve callback. See the [`resolve()` function docs][asr-resolve].
- `helpers` is an object with the following properties:
	- `var active = isActive(stateName, parameters)` is a reference to [`stateRouter.stateIsActive(stateName, parameters)`][asr-stateisactive]. Returns `true` or `false`.
	- `var class = active(stateName, parameters)` is an abstraction to [`stateRouter.stateisActive(stateName, parameters)`][asr-stateisactive]. Returns `'active'` or `''`.
	- `var url = makePath(stateName, parameters)` is a reference to [`stateRouter.makePath(stateName, parameters)`][asr-makepath]. This function returns a URL for the given state and parameters.
	- `killEvent(ev)` is a function that does `ev.preventDefault()` and `ev.stopPropagation()`.
	- `emitter` is the event emitter that is on the `domApi`. This allows a bit of communication between the template's DOM events (e.g. a mouse-click), and the [`activate()` function][asr-activate].

template.js
```js
var virtualHtml = require('virtual-html')

module.exports = function template(h, resolveContent, helpers) {
	var html = (
		'<div>' +
			'<p>Pretty sweet, isn\'t it?</p>' +
			'<p>Here, let me give some examples or something.</p>' +
			'<a href="' + helpers.makePath('app') + '">' +
				'Click to go to the "app" state.' +
			'</a>' +
		'</div>'
	)
	return virtualHtml(html)
}
```

## `domApi`

This object is exposed by the state router in the [`activate()` function][asr-activate]. The object has the following properties:

- `el` is the DOM element that is created/updated.
- `emitter` is the event emitter on `helpers`. This allows the template to request an update, or something.
- `sharedState` is the object that comes from the resolve content, which is the set in the resolve callback. See the [`resolve()` function docs][asr-resolve].
- `update()` is a function that will render the template, and update the DOM if necessary.

# license

[VOL][vol]

[asr]: https://github.com/TehShrike/abstract-state-router
[asr-activate]: https://github.com/TehShrike/abstract-state-router#activatecontext
[asr-makepath]: https://github.com/TehShrike/abstract-state-router/blob/master/index.js#L213
[asr-resolve]: https://github.com/TehShrike/abstract-state-router#resolvedata-parameters-callbackerr-contentredirectstatename-params
[asr-stateisactive]: https://github.com/TehShrike/abstract-state-router/blob/master/index.js#L240
[v-dom]: https://github.com/Matt-Esch/virtual-dom
[v-html]: https://github.com/azer/virtual-html
[v-hyperscript]: https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/README.md
[vol]: http://veryopenlicense.com
