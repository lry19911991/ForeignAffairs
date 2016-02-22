/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Sch.data.undoredo.action.tree.Insert', {
    extend          : 'Sch.data.undoredo.action.Base',

    parent          : null,
    newChild        : null,

    insertedBefore  : null,

    undo : function () {
        this.parent.removeChild(this.newChild);
    },

    redo : function () {
        this.parent.insertBefore(this.newChild, this.insertedBefore);
    },

    getRecord : function () {
        return this.newChild;
    }
});
