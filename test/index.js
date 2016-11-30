'use strict';

var chai = require('chai');

chai.should();

var initer = require('../');

function doRender(render, templ, data) {
    return new Promise(function(resolve) {
        render(templ, data, function(err, data) {
            if (err) throw err;
            resolve(data);
        });
    })
}

describe('Exporting init function: ', function() {
    it('function: ', function() {
        initer.should.be.a('function');
    })
})


var users = [
    {
        'user': 'A',
        'age': 16,
        'money': 123
    },
    {
        'user': 'B',
        'age': 26,
        'money': 1231
    },
    {
        'user': 'C',
        'age': 56,
        'money': 12323
    }
];

var pageSkel = [
    { block: 'link', content: 'Some link'},
    { tag: 'br' },
    { block: 'link', url: '/', content: 'Here link', url: '/bemhtml' },
    { tag: 'br' },
    { block: 'link', target: '_blank', url: '/', content: 'Link to blank' },
    { tag: 'br' },
    { block: 'link', mods: { disabled: true }, url: '/', content: 'Link to site root' }
];


var testData = [
    {
        name: 'Empty data with bemhtml',
        template: 'test/views/test.bemhtml.js',
        data: {},
        output: ''
    },
    {
        name: 'Empty data with bemtree',
        template: 'test/views/test.bemtree.js',
        data: {},
        output: '<div></div>'
    },
    {
        name: 'Users',
        template: 'test/views/test.bemtree.js',
        data: {page: users, block: 'root'},
        output: '<div class="page"><div class="user"><h2 class="user__name">A</h2>'
            + '<span class="user__age">Age: 16 </span><span class="user__money">Money: 123</span>'
            + '<hr class="hr"></div><div class="user"><h2 class="user__name">B</h2><span class="user__age">'
            + 'Age: 26 </span><span class="user__money">Money: 1231</span><hr class="hr"></div>'
            + '<div class="user"><h2 class="user__name">C</h2><span class="user__age">Age: 56 </span>'
            + '<span class="user__money">Money: 12323</span><hr class="hr"></div></div>'
    },
    {
        name: 'Bemtree target for bemhtml only template',
        template: 'test/views/test2.bemtree.js',
        data: { bemjson: pageSkel },
        output: '<span class="link">Some link</span><br><a class="link" href="/bemhtml">'
            + 'Here link</a><br><a class="link" href="/" rel="noopener">Link to blank</a><br>'
            + '<a class="link link_disabled" href="/" aria-disabled="true">Link to site root</a>'
    },
    {
        name: 'Bemtree only template',
        template: 'test/views/test3.bemtree.js',
        data: {},
        output: '<div></div>'
    },
    {
        name: 'Bemtree only template on null',
        template: 'test/views/test3.bemtree.js',
        data: null,
        output: ''
    },
    {
        name: 'Non-existent template',
        template: 'test/views/test4.bemtree.js',
        data: {},
        output: ''
    }
];

describe('Output: ', function() {


    [
        {
            name: 'In production envinronment: ',
            env: 'production',
            initOpts: { debug: true}
        },
        {
            name: 'In production envinronment with {debug: true, precompileDir: "views"}: ',
            env: 'production',
            initOpts: {precompileDir: 'views'}
        },
        {
            name: 'In dev envinronment: ',
            env: 'dev',
            initOpts: null
        }
    ].forEach(testEnv => {
        describe(testEnv.name, function() {
            var render;

            before(function() {
                process.env.NODE_ENV = testEnv.env;
                render = initer(testEnv.initOpts);
            });

            testData.forEach(test => {
                it(test.name, function() {
                    return doRender(render, test.template, test.data).then((output)=>{
                        output.should.be.equal(test.output);
                    });
                })
            });
        });
    })

});


