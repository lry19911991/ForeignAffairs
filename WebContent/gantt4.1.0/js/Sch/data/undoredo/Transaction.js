/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * @class Sch.data.undoredo.Transaction
 *
 * This class encapsulates a single undo/redo transaction used with the {@link Sch.data.undoredo.Manager}.
 *
 */
Ext.define('Sch.data.undoredo.Transaction', {

    actions             : null,
    title               : null,

    constructor : function (config) {
        config                      = config || {};

        Ext.apply(this, config);

        this.callParent([config]);

        this.actions                = [];
    },

    /**
     * Checks wheither a transaction has any actions recorded
     *
     * @return {Boolean}
     */
    hasActions : function () {
        return this.actions.length > 0;
    },

    addAction : function (action) {
        this.actions.push(action);
    },

    getActions : function () {
        return this.actions;
    },

    /**
     * Undoes this transaction
     */
    undo : function () {
        for (var i = this.actions.length - 1; i >= 0; i--) {
            this.actions[ i ].undo();
        }
    },

    /**
     * Redoes this transaction
     */
    redo : function () {
        for (var i = 0; i < this.actions.length; i++) {
            this.actions[ i ].redo();
        }
    }
});
