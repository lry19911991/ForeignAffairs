var page = require('webpage').create();
var system = require('system');
console.log(system.args[1]);
//page.open('/var/folders/bk/ws3thqwn261fsdjxhv83t7wm0000gn/T/printHtml-11453333895.1309.html',
//page.open('printHtml-11453333895.1309.html',
page.open(system.args[1],
    function() {
        page.render(system.args[2]);
        phantom.exit();
    }
);