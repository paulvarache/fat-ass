module.exports = {
	context: __dirname,
	entry: "./app/index.js",
	output: {
        path: './www',
		filename: "bundle.js",
	},
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
                presets: ['react']
            }
        }]
    }
};