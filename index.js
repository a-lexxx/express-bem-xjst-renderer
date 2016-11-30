'use strict';

const fs = require('mz/fs');
const path = require('path');
const bemxjst = require('bem-xjst');

var viewsCache,
    waitForPrecompile,
    filesRegex = /(.+)\.(bemhtml|bemtree)\.js$/i,
    emptyBemhtml = bemxjst.bemhtml.compile(''),
    log;

module.exports = function(opts) {
    log = (opts && opts.debug) ? console.log.bind(console) : function() {};

    if (process.env.NODE_ENV !== 'production') return simpleRender;

    if (opts && opts.precompileDir) {
        precompileViews(opts.precompileDir);
    }

    return cachedRender;
};


function simpleRender(name, options, callback) {
    var nameParts = filesRegex.exec(path.basename(name)),
        isBemhtmlOnly = (nameParts[2].toLowerCase() === 'bemhtml'),
        templateName = nameParts[1],                        // name of view to render, i.e. "example"
                                                            // (from /some/path/views/example.bemtree.js)
        templateDir = path.dirname(name);

    (isBemhtmlOnly
        ? Promise.resolve(options.bemjson)
        : fs.readFile(path.join(templateDir, templateName + '.bemtree.js'))
            .then(bemtreeText => bemxjst.bemtree.compile(bemtreeText).apply(options)) // compile and render
            .catch(err => {
                if (err.code === 'ENOENT' && err.syscall === 'open') {  // file bemtree.js don't exists
                    return options.bemjson;                          // fallback to pure bemjson in data
                }
                throw err;
            })
    )
    .then(bemjson => {
        log('Bemjson', JSON.stringify(bemjson, null, 2));       // try to get bemhtml template
        return fs.readFile(path.join(templateDir, templateName + '.bemhtml.js'))
            .then(bemhtmlData => {
                return {
                    bemjson,
                    bemhtmlData
                }
            })
            .catch(err => {
                if (err.code === 'ENOENT' && err.syscall === 'open') {  // file bemhtml.js don't exists
                    return {
                        bemjson,
                        bemhtmlData: ''         // fallback to pure bemhtml
                    }
                }
                throw err;
            })
    })
    .then(bemdata => {
        log('bemhtmlData', bemdata.bemhtmlData.toString());
        var html = bemxjst.bemhtml.compile(bemdata.bemhtmlData).apply(bemdata.bemjson);            // compile and render
        log('Html:\n', html);
        callback(null, html);
    }).catch(e => callback(e));
}


function cachedRender(name, options, callback) {

    if (viewsCache) return renderFromCache(name, options, callback);

    (waitForPrecompile ? waitForPrecompile : precompileViews(path.dirname(name)))
    .then(()=>{
        renderFromCache(name, options, callback);
    }).catch(err => {
        callback(err);
    });
}


function renderFromCache(name, options, callback) {
    var nameParts = filesRegex.exec(path.basename(name)),
        isBemhtmlOnly = (nameParts[2].toLowerCase() === 'bemhtml'),
        templateName = nameParts[1];
    let bemjson, html,
        view = viewsCache[templateName];

    if (!view) {
        view = { };
        log('Warning: no templates found for ', templateName);
    }

    bemjson = (view.bemtree && !isBemhtmlOnly) ? view.bemtree.apply(options) : options.bemjson;

    log('bemjson', JSON.stringify(bemjson, null, 2));

    html = (view.bemhtml) ? view.bemhtml.apply(bemjson) : emptyBemhtml.apply(bemjson);

    log('html:\n', html);

    callback(null, html);
}


function precompileViews(dir) {
    return waitForPrecompile = fs.readdir(dir).then(files => {
        return Promise.all(files
            .map(f => filesRegex.exec(f))
            .filter(filenameChunks => filenameChunks)
            .map(filenameChunks => fs.readFile(path.join(dir, filenameChunks[0]), 'utf8')
                .then(templateData => {
                    return {
                        type: filenameChunks[2],
                        name: filenameChunks[1],
                        data: templateData
                    }
                })
            )
        )
    })
    .then(templates => {
        waitForPrecompile = null;
        log('viewsCache', templates);

        return viewsCache = templates.reduce((hash, template) => {
                if (!hash[template.name]) hash[template.name] = {
                    bemhtml: emptyBemhtml
                };
                hash[template.name][template.type] = bemxjst[template.type].compile(template.data);
                return hash;
            }, {});

    });

}
