{ defer } = require('lodash')

module.exports = (_, _go, _items) ->
  createAssistItem = (name, item) ->
    name: name
    description: item.description
    icon: "fa fa-#{item.icon} flow-icon"
    execute: -> _.insertAndExecuteCell 'cs', name

  test2 = (nodes)->
    if flow.l && flow.l['flow-assist']
      for v, i in flow.l['flow-assist'].description
        els = nodes.querySelectorAll(v[0])
        for v1, i1 in els
            if v[3]
                if v1[v[3]] == v[1] && v[2] != ''
                    v1[v[3]] = v[2]
                    break
            else
                if v1.innerText.indexOf(v[1]) > -1 && v[2] != ''
                    v1.innerHTML = v1.innerHTML.replace(v[1], v[2])
                    break
                if v1.innerHTML == v[1] && v[2] != ''
                    v1.innerHTML = v1.innerHTML.replace(v[1], v[2])
                    break

  defer _go

  test2: test2
  routines: (createAssistItem name, item for name, item of _items)
  template: 'flow-assist'
