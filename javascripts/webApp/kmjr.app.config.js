/**
 * hetao
 * 20160119
 * app html5 common require js config
 * @param {baseUrl}
 * @param {paths}
 * @param {shim}
 */

require.config({
    baseUrl:'http://statics.aijialicai.com.cn/CDN/',
    paths:{
        'jquery':'lib/jquery/jquery-1.11.3.min',
        'bootstrap':'lib/bootstrap/js/bootstrap.min',
        'loading':'app/Public/js/kmjr.app.loading'
    },
    shim:{
        'bootstrap':['jquery']
    }
});