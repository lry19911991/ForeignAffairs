/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// https://www.assembla.com/spaces/bryntum/tickets/2405
// https://www.sencha.com/forum/showthread.php?307509
Ext.define('Sch.patches.TablePanel', {
    extend     : 'Sch.util.Patch',

    requires   : ['Ext.panel.Table'],
    target     : 'Ext.panel.Table',

    minVersion : '6.0.1',

    overrides  : {
        ensureVisible   : function (record, options) {
            if (options && options.column && this.getVisibleColumns().indexOf(options.column) === -1) {
                return;
            }

            this.callParent(arguments);
        }
    }
});