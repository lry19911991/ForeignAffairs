
;(function(w){
    var loader = function(){
        var dc = document;
        function createScript(url, callback){
            var urls = url,
                scripts = [],
                completed = 0;
            for( var i = 0, len = urls.length; i < len; i++ ){
                scripts[i] = dc.createElement('script');
                scripts[i].src = urls[i];
                dc.getElementsByTagName('head')[0].appendChild(scripts[i]);
                if( scripts[i].readyState ){ //ie
                    scripts[i].onreadystatechange = function(){
                        if( this.readyState == 'complete' || this.readyState == 'loaded' ){
                            this.onreadystatechange = null; //确保事件不被处理2次
                            completed++;
                            completed >= urls.length ? callback() : '';
                        }
                    }
                }else{ //not ie
                    scripts[i].onload = function(){
                        completed++;
                        completed >= urls.length ? callback() : '';
                    }                            
                }
            }
        }
        function createLink(url, callback){
            var urls = url,
                links = [];
            for( var i = 0, len = urls.length; i < len; i++ ){
                links[i] = dc.createElement('link');
                links[i].rel = 'stylesheet';
                links[i].href = urls[i];
                dc.getElementsByTagName('head')[0].appendChild(links[i]);    
            }
            callback();
        }
        return {
            load: function(option, callback){
                var _type = option.type || 'js',
                    _url = option.url,
                    _callback = callback || function(){};
                switch( _type ){
                    case 'js':
                    case 'javascript':
                        createScript(_url, _callback);
                        break;
                    case 'css':
                        createLink(_url, _callback);
                        break;
                }
                return this;
            }
        }
    }();
    w.Cme ? '' : w.Cme = {};
    w.Cme.loader = loader;    
})(window);
			Cme.loader.load({
                url: [
                    'http://hq.sinajs.cn/list=sz000009'
                ]
            },function(){
                alert( hq_str_sz000009 );
            })  

