const webpack = require('webpack')
const path = require("path");
module.exports = {

    publicPath: './',
    outputDir: 'dist',
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                jQuery: 'jquery',
                $: 'jquery',
                'windows.jQuery': 'jquery'
            })
        ]
    },
    devServer: {
        proxy: {
            '/be/': {
                target: "https://thvideo.tv/be/",
                changeOrigin: true,
                pathRewrite: {
                    '^/be/': ''
                }
            },
            '/images/': {
                target: "https://thvideo.tv/images/",
                changeOrigin: true,
                pathRewrite: {
                    '^/images/': ''
                }
            },
            '/autocomplete/ ': {
                target: "https://thvideo.tv/autocomplete/",
                changeOrigin: true,
                pathRewrite: {
                    '^/autocomplete/': ''
                }
            }
        }

    }
}