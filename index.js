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

module.exports = function makeRenderer(stateRouter) {

	function active(stateName, params) {
		var isActive = stateRouter.stateIsActive(stateName, params)
		return (isActive ? 'active' : '')
	}

	return {
		render: function render(renderContext, cb) {
			wrapTryCatch(cb, function () {
				var parentEl = renderContext.element
				var template = renderContext.template // Templates are functions returning hyperscript trees
				var originalResolveContent = renderContext.content
				if (typeof parentEl === 'string') {
					parentEl = document.querySelector(parentEl)
				}

				var domApi = {
					emitter: new EventEmitter(),
					sharedState: xtend(originalResolveContent),
					update: update,
					el: null
				}

				var currentTree = makeTree()
				domApi.el = createElement(currentTree)
				parentEl.appendChild(domApi.el)

				stateRouter.on('stateChangeEnd', domApi.update)

				return domApi

				function makeTree() {
					var state = xtend(domApi.sharedState)
					var templateHelpers = {
						makePath: stateRouter.makePath,
						isActive: stateRouter.stateIsActive,
						active: active,
						killEvent: killEvent,
						emitter: domApi.emitter
					}
					return template(h, state, templateHelpers)
				}

				function update() { // Like `git pull` for the DOM
					domApi.emitter.emit('evaluating template')
					var newTree = makeTree()
					var patches = diff(currentTree, newTree)
					domApi.el = patch(domApi.el, patches)
					currentTree = newTree
				}
			})
		},
		reset: function reset(resetContext, cb) {
			wrapTryCatch(cb, function () {
				var domApi = resetContext.domApi
				var content = resetContext.content
				domApi.sharedState = xtend(content)
				domApi.emitter.removeAllListeners()
				domApi.update()
			})
		},
		destroy: function destroy(domApi, cb) {
			domApi.el.outerHTML = ''
			domApi.emitter.removeAllListeners()
			stateRouter.removeListener('stateChangeEnd', domApi.update)
			cb(null)
		},
		getChildElement: function getChildElement(domApi, cb) {
			cb(null, domApi.el.querySelector('ui-view'))
		}
	}
}
