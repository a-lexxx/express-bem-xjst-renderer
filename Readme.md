#Express BEM render plugin => express-bem-xjst-renderer

[![Build Status](https://img.shields.io/travis/stochastical/express-bem-xjst-renderer/master.svg)](https://travis-ci.org/stochastical/express-bem-xjst-renderer)
[![Coveralls branch](https://img.shields.io/coveralls/stochastical/express-bem-xjst-renderer/master.svg)](https://coveralls.io/github/stochastical/express-bem-xjst-renderer)

##Install

npm i --save https://github.com/stochastical/express-bem-xjst-renderer.git

##Usage

Activate plugin in express in a usual way

```javascript
var renderer = require('express-bem-xjst-renderer')({
    debug: true,
    precompileDir: 'views'
});

app
    .set('views', './views')
    .set('view engine', 'bemtree.js')
    .engine('bemtree.js', renderer)
```

###Options

* **debug** --- (`Boolean`) show messages about compiling templates and rendering views
* **precompileDir** --- (`String`) path to view dir. If set, then precompile and cache all views (`*.bemtree.js` and `*.bemhtml.js`) from this directory. Works only in production environment (`NODE_ENV=production`). Without this option precaching will occur on first render request.

##Examples
See examples in example project https://github.com/stochastical/express-bem-xjst-renderer-test.git
