/* global ExampleDefaults:true */
ExampleDefaults = {
    width   : 800,
    height  : 400
};

Ext.onReady(function() {
    if (window.location.href.match(/^file:\/\/\//)) {
        Ext.Msg.alert('ERROR: You must use a web server', 'You must run the examples in a web server (not using the file:/// protocol)');
    }
});