/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Sch.data.undoredo.action.flat.Add', {
    extend          : 'Sch.data.undoredo.action.Base',

    store           : null,
    records         : null,

    index           : null,

    undo : function () {
        this.store.remove(this.records);
    },

    redo : function () {
        this.store.insert(this.index, this.records);
    },

    getRecord : function () {
        return this.records[0];
    }
});
