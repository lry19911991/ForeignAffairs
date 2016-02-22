/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Sch.data.undoredo.action.flat.Remove', {
    extend          : 'Sch.data.undoredo.action.Base',

    store           : null,
    records         : null,

    index           : null,
    isMove          : false,

    undo : function () {
        var me = this;

        me.store.insert(me.index, me.records);
    },

    redo : function () {
        var me = this;

        me.store.remove(me.records);
    },

    getRecord : function () {
        return this.records[0];
    }
});
