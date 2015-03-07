var h = require('virtual-dom/h')
var diff = require('virtual-dom/diff')
var patch = require('virtual-dom/patch')
var createElement = require('virtual-dom/create-element')
var xtend = require('xtend')

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

module.exports = function VirtualdomStateRenderer(defaultTemplateContext) {
	var state = xtend(defaultTemplateContext)
	return function makeRenderer(stateRouter) {
		var helpers = {
			makePath: stateRouter.makePath,
			active: function active(stateName, params) {
				var isActive = stateRouter.stateIsActive(stateName, params)
				return { class: isActive ? 'active' : '' }
			},
			killEvent: killEvent
		}
		return {
			render: function render(renderContext, cb) {
				wrapTryCatch(cb, function () {
					var parentEl = renderContext.element
					var template = renderContext.template // Template is a function returning a hyperscript tree
					var content = renderContext.content
					if (typeof parentEl === 'string') {
						parentEl = document.querySelector(parentEl)
					}

					function makeTree(newState) {
						if (typeof newState === 'object') {
							state = xtend(state, newState)
						}
						return template(h, state, xtend(helpers, { update: update }))
					}

					var currentTree = makeTree(content)
					var el = createElement(currentTree)
					parentEl.appendChild(el)

					function update(newState) {
						var newTree = makeTree(newState)
						var patches = diff(currentTree, newTree)
						el = patch(el, patches)
						currentTree = newTree
					}

					stateRouter.on('stateChangeEnd', update)

					console.log('renderer.render')

					return {
						update: update,
						state: state,
						el: el
					}
				})
			},
			reset: function reset(resetContext, cb) {
				wrapTryCatch(cb, function () {
					var domApi = resetContext.domApi
					stateRouter.removeListener('stateChangeEnd', domApi.update)
					domApi.state = null
					console.log('renderer.reset')
				})
			},
			destroy: function destroy(domApi, cb) {
				domApi.el.outerHTML = ""
				console.log('renderer.destroy')
				cb(null)
			},
			getChildElement: function getChildElement(domApi, cb) {
				cb(null, domApi.el.querySelector('ui-view'))
			}
		}
	}
}
