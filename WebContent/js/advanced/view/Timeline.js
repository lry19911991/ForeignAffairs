Ext.define('Gnt.examples.advanced.view.Timeline', {
    extend   : 'Gnt.panel.Timeline',
    xtype    : 'advanced-timeline',
    requires : ['Gnt.examples.advanced.view.ControlHeader'],

    //split  : true,
    border   : '0 0 1 0',

    header   : {
        xtype : 'controlheader'
    }
});
