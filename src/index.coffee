# WebPack entry point, just load all necessary files
require('./flow-lib.styl')
require('./flow.styl')
require('./scala-editor.styl')
require('../custom/custom.css')

require('bootstrap/dist/js/bootstrap')
require('../vendor/bootstrap-growl/jquery.bootstrap-growl.js')

require('jquery-textrange/jquery-textrange')

userLang = navigator.language || navigator.userLanguage; 
if userLang
    try
        lang = require('./locales/' + userLang + '.json');
    catch ex 
        console.log(ex);

# Start Flow
require('./core/flow')

# DOM ready event listener
window.ready = ( ->
    window.lang = lang
    nl = document.querySelectorAll("script[type='text/html']");
    el = {};
    for n in nl
        if n.innerHTML.trim().indexOf('<tr') == 0
            el = document.createElement("table")
        else
            el = document.createElement("div");
        el.innerHTML = n.innerHTML;
        if lang && lang[n.id]
            l = lang[n.id]
            if true
                for v, i in l.label
                    console.log(i)
                    console.log(v)
                    els = el.querySelectorAll(v[0])
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
        if n.innerHTML.trim().indexOf('<tr') == 0
            n.innerHTML = el.children[0].innerHTML
        else
            n.innerHTML = el.innerHTML
)()