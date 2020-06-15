module.exports = {
    configureWebpack: {
    },
    devServer: {
        disableHostCheck: true
    },
    pwa: {
        name: 'DApp Chat',
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: './src/sw.js',
            swDest: 'service-worker.js',
        },
    }
};
