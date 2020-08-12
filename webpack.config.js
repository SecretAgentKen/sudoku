const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const {VueLoaderPlugin} = require('vue-loader');

module.exports = {
	entry: {
		app: './src/ui/js/index.js',
	},
	output: {
		path: path.join(__dirname,'dist/ui'),
		publicPath: '/',
		filename: '[name].js'
	},
	target: 'web',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader'
			},
			{
				test: /\.(wav|ttf|woff|woff2|eot|svg)$/,
				use: 'file-loader'
			},
			{
				test: /\.scss$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.css$/,
				use: ['style-loader','css-loader']
			}
		]
	},
	plugins: [
		new HtmlPlugin({
			template: './src/ui/index.html',
			filename: './index.html',
			chunks: ['app']
		}),
		new VueLoaderPlugin()
	]
};