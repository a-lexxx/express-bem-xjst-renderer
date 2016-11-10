
var fs = require('fs'),
	path = require('path'),
	bemxjst = require('bem-xjst'),
	bemhtml = bemxjst.bemhtml,
	bemtree = bemxjst.bemtree;

var views;
var filesRegex = /(.+)\.(bemhtml|bemtree)\.js$/i;
			


module.exports.render = function(name, options, calabock){
	var waiter = [];
	if (views == null) {
		waiter.push(precompileViews( path.dirname(name) ));
	}
	key = filesRegex.exec(path.basename(name))[1];
	Promise.all(waiter).then(()=>{
		var bemjson, html;
		view = views[key];
		if (view == null) {
			view = {};
			console.log( 'Warning: no templates found for ', key );
		}
		if (view.btTmpl) {
			bemjson = view.btTmpl.apply({
				block: 'root',
				data: options
			});
			console.log( 'bemjson', JSON.stringify(bemjson, null, 2) );
		} else {
			bemjson = options;
		}
		if (view.tmpl) {
			html = view.tmpl.apply(bemjson);
			console.log( 'html:\n', html );
		} else {
			html = bemjson;
		}
		calabock(null, html);
	})
}

function precompileViews(dir) {
	return new Promise((resolv, reject)=>{
		views = {};
		fs.readdir(dir, (err, files)=>{
			if (err) throw err;
			files.forEach(f => { 
				console.log( 'compiling file ', f );
				var name, res = filesRegex.exec(f);
				if (res != null) {
					name = res[1];
					if (views[name] == null) views[name] = {};
					views[name][res[2]] = path.join(dir, res[0]);
				}
			});
			console.log( 'views', views );
			Object.keys(views).forEach(view=>{
				var view = views[key];
				if (view['bemhtml']) {
					view.tmpl = bemhtml.compile( fs.readFileSync(view['bemhtml'], 'utf8') );
				}
				if (view['bemtree']) {
					view.btTmpl = bemtree.compile(fs.readFileSync(view['bemtree'], 'utf8'));
				}
			})
			resolv(views);
		})	
	})
	
}

// 
