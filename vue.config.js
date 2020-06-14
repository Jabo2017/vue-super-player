const path = require('path');

//拼接路径
function resolve(dir) {
	return path.join(__dirname, dir)
}

module.exports = {
	// 修改 src 为 examples
	pages: {
		index: {
			entry: 'examples/main.js',
			template: 'public/index.html',
			filename: 'index.html'
		}
	}
}
