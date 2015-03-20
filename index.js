var h = require('virtual-dom/h')
var diff = require('virtual-dom/diff')
var patch = require('virtual-dom/patch')
var createElement = require('virtual-dom/create-element')
var xtend = require('xtend')
var EventEmitter = require('events').EventEmitter

function wrapTryCatch(cb, fn) {
	try {
		var args = [].slice.call(arguments, 2)
		var res = fn.apply(fn, args)
		cb(null, res)
	} catch (e) {
		cb(e)
	}
}

function killEvent(ev) {
	ev.preventDefault()
	ev.stopPropagation()
}

module.exports = function VirtualdomStateRenderer() {
	return function makeRenderer(stateRouter) {

		function hookUpUpdateFunction(domApi, update) {
			if (domApi.update) {
				stateRouter.removeListener('stateChangeEnd', domApi.update)
			}
			domApi.update = function () {
				update(domApi.sharedState)
			}
			stateRouter.on('stateChangeEnd', domApi.update)
		}

		var templateHelpers = {
			makePath: stateRouter.makePath,
			active: function active(stateName, params) {
				var isActive = stateRouter.stateIsActive(stateName, params)
				return (isActive ? 'active' : '')
			},
			killEvent: killEvent
		}

		return {
			render: function render(renderContext, cb) {
				wrapTryCatch(cb, function () {
					var parentEl = renderContext.element
					var template = renderContext.template // Template is a function returning a hyperscript tree
					var originalResolveContent = renderContext.content
					if (typeof parentEl === 'string') {
						parentEl = document.querySelector(parentEl)
					}

					var domApi = {}
					domApi.emitter = new EventEmitter()

					domApi.hookUpUpdateFunction = hookUpUpdateFunction.bind(null, domApi, update) // why is this on the domApi?

					domApi.sharedState = xtend(originalResolveContent)
					domApi.hookUpUpdateFunction()

					function makeTree(sharedState) {
						return template(h, sharedState, xtend(templateHelpers, { emitter: domApi.emitter }))
					}

					var currentTree = makeTree(originalResolveContent)
					var el = createElement(currentTree)
					parentEl.appendChild(el)

					function update(resolveContent) {
						domApi.emitter.emit('update')
						var newTree = makeTree(resolveContent)
						var patches = diff(currentTree, newTree)
						el = patch(el, patches)
						currentTree = newTree
					}

					domApi.el = el

					return domApi
				})
			},
			reset: function reset(resetContext, cb) {
				wrapTryCatch(cb, function () {
					var domApi = resetContext.domApi
					var content = resetContext.content
					domApi.sharedState = xtend(content)
					domApi.hookUpUpdateFunction()
					domApi.emitter.removeAllListeners()
					domApi.update()
				})
			},
			destroy: function destroy(domApi, cb) {
				domApi.el.outerHTML = ""
				domApi.removeAllListeners()
				stateRouter.removeListener('stateChangeEnd', domApi.update)
				cb(null)
			},
			getChildElement: function getChildElement(domApi, cb) {
				cb(null, domApi.el.querySelector('ui-view'))
			}
		}
	}
}
