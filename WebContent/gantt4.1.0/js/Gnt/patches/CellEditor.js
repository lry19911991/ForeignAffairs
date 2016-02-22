/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// http://www.sencha.com/forum/showthread.php?295802-5.1-Knightly-Picker-collapses-on-ENTER-key&p=1080010#post1080010
Ext.define('Gnt.patches.CellEditor', {
    extend : 'Sch.util.Patch',

    requires   : ['Ext.grid.CellEditor'],
    target     : 'Ext.grid.CellEditor',
    minVersion : '5.1.0',

    overrides : {
        onHide : function () {
            this.restoreCell();
            this.superclass.onHide.apply(this, arguments);
        }
    }
});