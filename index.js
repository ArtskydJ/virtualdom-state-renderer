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

module.exports = function VirtualdomStateRenderer(defaultTemplateContext) {
	var defaultState = xtend(defaultTemplateContext)
	return function makeRenderer(stateRouter) {
		var helpers = {
			makePath: stateRouter.makePath,
			active: function active(stateName) {
				var isActive = stateRouter.stateIsActive(stateName)
				return { class: isActive ? 'active' : '' }
			}
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
					var state = xtend(defaultState, content)

					// template -> tree -> el
					var currentTree = template(h, state)
					var el = createElement(currentTree)
					parentEl.appendChild(el)

					function update(newState) {
						state = xtend(state, newState)
						var newTree = template(h, state)
						var patches = diff(currentTree, newTree)
						el = patch(el, patches)
						currentTree = newTree
					}

					stateRouter.on('stateChangeEnd', function (stateName, params) {
						update()
					})

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
				})
			},
			destroy: function destroy(domApi, cb) {
				domApi.el.outerHTML = ""
				cb(null)
			},
			getChildElement: function getChildElement(domApi, cb) {
				cb(null, domApi.el.querySelector('ui-view'))
			}
		}
	}
}
