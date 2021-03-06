/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define("Gnt.template.RollupTask", {
    extend      : 'Ext.XTemplate',

    isLegacyIE  : Ext.isIE8m,

    tplConfig   : null,

    constructor : function (cfg) {

        Ext.apply(this, cfg);

        var tpl = [
            '<div class="sch-rollup-wrap">',
                '<tpl for=".">',
                    '{[values.tpl.apply(values)]}',
                '</tpl>',
            '</div>'
        ];

        this.tplConfig = Ext.apply(this.tplConfig || {}, {
            disableFormats  : true,
            applyRollup     : this.applyRollup
        });

        this.callParent(tpl.concat([this.tplConfig]));
    }
});