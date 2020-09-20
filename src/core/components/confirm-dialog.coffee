lodash = require('lodash')
util = require('../modules/util')

module.exports = (_, _message, _opts={}, _go) ->
  lodash.defaults _opts,
    title: 'Confirm'
    acceptCaption: 'Yes'
    declineCaption: 'No'

  accept = -> _go yes

  decline = -> _go no

  _descendantsComplete = (nodes)->
    console.log(nodes)
    if flow.l && flow.l['flow-confirm-dialog']
      l = flow.l['flow-confirm-dialog']
      if true
        for v, i in l.label
          els = nodes.querySelectorAll(v[0])
          for v1, i1 in els
            if v[3]
              if v1[v[3]] == v[1] && v[2] != ''
                v1[v[3]] = v[2]
                break
            else
              if v1.innerText.indexOf(v[1]) > -1 && v[2] != ''
                v1.title = v1.innerText
                v1.innerHTML = v1.innerHTML.replace(v[1], v[2])
                break
              if v1.innerHTML == v[1] && v[2] != ''
                v1.title = v1.innerText
                v1.innerHTML = v1.innerHTML.replace(v[1], v[2])
                break

  title: _opts.title
  acceptCaption: _opts.acceptCaption
  declineCaption: _opts.declineCaption
  message: util.multilineTextToHTML _message
  accept: accept
  decline: decline
  _descendantsComplete: _descendantsComplete
  template: 'confirm-dialog'

