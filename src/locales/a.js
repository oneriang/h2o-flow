var t = document.getElementById("login-popup");
var div = document.createElement("div");
div.innerHTML = t.innerHTML;
$(div).find("h3").addClass("title");
t.innerHTML = div.innerHTML;


var t = document.querySelector("script#flow-import-files");
var div = document.createElement("div");
div.innerHTML = t.innerHTML;
div.querySelectorAll("th")[2].innerText = div.querySelectorAll("th")[2].innerText + "aaaa"
t.innerHTML = div.innerHTML;

[
    "th",
    "Grid ID",
    ""
],
[
    "td",
    "Destination id for this grid; auto-generated if not specified",
    ""
],
[
    "th",
    "Strategy",
    ""
],
[
    "td",
    "The default strategy 'Cartesian' covers the entire space of hyperparameter combinations. Specify the 'RandomDiscrete' strategy to get random search of all the combinations of your hyperparameters. RandomDiscrete should usually be combined with at least one early stopping criterion, max_models and/or max_runtime_secs.",
    ""
],
[
    "th",
    "Max Models",
    ""
],
[
    "td",
    "Stop grid search after building these many number of models.",
    ""
],
[
    "th",
    "Max Runtime (seconds)",
    ""
],
[
    "td",
    "Stop grid search after running for this amount of time.",
    ""
],
[
    "th",
    "Stopping Rounds",
    ""
],
[
    "td",
    "Early stopping based on convergence of stopping_metric. Stop if simple moving average of length k of the stopping_metric does not improve for k:=stopping_rounds scoring events (0 to disable).",
    ""
],
[
    "th",
    "Stopping Metric",
    ""
],
[
    "td",
    "Metric to use for early stopping (AUTO: logloss for classification, deviance for regression)",
    ""
],
[
    "th",
    "Stopping Tolerance",
    ""
],
[
    "td",
    "Relative tolerance for metric-based stopping criterion (stop if relative improvement is not at least this much)",
    ""
],


"flow-model-input": {
    "label": [
        [
            "h3",
            "Build a Model",
            "建立一个模型"
        ],
        [
            "label",
            "Select an algorithm:",
            "选择一种算法:"
        ],
        [
            "button",
            "Build Model",
            "建立模型"
        ]
    ]
},


"flow-model-parameter-keyvalues": {
    "label": [
        [
            "span",
            "*",
            ""
        ],
        [
            "input[title]",
            "Check to enable grid search on this parameter",
            "",
            "title"
        ]
    ]
},
"flow-model-parameter-stringpairs": {
    "label": [
        [
            "span",
            "*",
            "*"
        ],
        [
            "input[title]",
            "Check to enable grid search on this parameter",
            "检查以启用此参数的网格搜索",
            "title"
        ],
        [
            "th",
            "&nbsp;",
            ""
        ]
    ]
},
"flow-model-parameter-dropdown": {
    "label": [
        [
            "span",
            "*",
            ""
        ],
        [
            "input[title]",
            "Check to enable grid search on this parameter",
            "",
            "title"
        ],
        [
            "th",
            "&nbsp;",
            ""
        ]
    ]
},
"flow-model-parameter-group": {
    "label": [
    ]
},
"flow-model-parameter-textbox": {
    "label": [
        [
            "span",
            "*",
            ""
        ],
        [
            "input[title]",
            "Check to enable grid search on this parameter",
            "",
            "title"
        ],
        [
            "th",
            "&nbsp;",
            ""
        ]
    ]
},
"flow-model-parameter-checkbox": {
    "label": [
        [
            "span",
            "*",
            ""
        ],
        [
            "input[title]",
            "Check to enable grid search on this parameter",
            "",
            "title"
        ],
        [
            "th",
            "&nbsp;",
            ""
        ]
    ]
},
"flow-model-parameter-list": {
    "label": [
        [
            "span",
            "*",
            ""
        ],
        [
            "input[placeholder]",
            "Search...",
            "",
            "placeholder"
        ],
        [
            "h3",
            "Only show columns with more than&nbsp;",
            ""
        ],
        [
            "input[placeholder]",
            "0",
            "",
            "placeholder"
        ],
        [
            "h3",
            "% missing values.",
            ""
        ],
        [
            "input[title]",
            "Check to enable grid search on this parameter",
            "",
            "title"
        ],
        [
            "th",
            "&nbsp;",
            ""
        ]
    ]
},