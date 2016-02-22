/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Sch.data.undoredo.action.Base', {

    constructor : function (config) {
        Ext.apply(this, config);
    },

    undo : function () {
        throw new Error("Abstract method call");
    },

    redo : function () {
        throw new Error("Abstract method call");
    }
});
