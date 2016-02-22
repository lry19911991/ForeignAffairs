/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * Mixin which might be included and/or overridden by stores under control of undo/redo manager. If mixin is
 * part of a store then undo/redo manager will call {@link #beforeUndoRedo()} method before undoing or redoing
 * a data transaction, and, correspondigly, it will call {@link #afterUndoRedo()} method after undoing or redoing
 * a data transaction. Store might override those methods to turn off/on caches recalculation during a transaction
 * execution.
 */
Ext.define('Sch.data.undoredo.mixin.StoreHint', {
    extend : 'Ext.Mixin',

    uses : [
        'Ext.util.Observable'
    ],

    undoRedoPostponed : null,

    inUndoRedoTransaction : false,

    undoRedoEventBus : null,

    /**
     * This is an important part of undo/redo management, it allows an undo/redo manager to always be notified about
     * low-level events of a store.
     */
    mixinConfig : {
        before : {
            constructor   : 'constructor',
            destroy       : 'destroy',
            fireEventArgs : 'fireEventArgs',
            setRoot       : 'beforeSetRoot',
            fillNode      : 'beforeFillNode'
        },

        after: {
            setRoot       : 'afterSetRoot',
            fillNode      : 'afterFillNode'
        }
    },

    constructor : function() {
        var me = this;

        me.undoRedoEventBus = new Ext.util.Observable();
        me.callParent(arguments);
    },

    destroy : function() {
        Ext.destroy(this.undoRedoEventBus);
    },

    fireEventArgs : function(eventName, args) {
        var me = this;
        // HACK:
        // Args is an array (i.e. passes by reference) we will use it to mark it as being fired already
        // by undo/redo event bus by adding a private property to it, otherwise we will be firing the same event
        // twice if/when the event is suspended on the original bus, queued and then fired again upon resuming.
        // Since the same args array might be used several times (in 'before' event and 'normal' event, for example),
        // we do not use just boolean flag, instead we use a map with event names as keys.
        if (!args.hasOwnProperty('$undoRedoEventBusFired')) {
            args.$undoRedoEventBusFired = {};
        }
        if (!args.$undoRedoEventBusFired[eventName]) {
            args.$undoRedoEventBusFired[eventName] = true;
            me.undoRedoEventBus.hasListener(eventName) && me.undoRedoEventBus.fireEventArgs(eventName, args);
        }
    },

    /**
     * Checks whether an undo/redo transaction is in progress.
     *
     * @return {Boolean}
     */
    isInUndoRedoTransaction : function() {
        return this.inUndoRedoTransaction;
    },

    /**
     * Called by undo/redo manager upon undo/redo transaction start
     *
     * @param {Sch.data.undoredo.Manager} manager
     * @param {Sch.data.undoredo.Transaction} transaction
     * @protected
     */
    onUndoRedoTransactionStart : function(manager, transaction) {
        this.inUndoRedoTransaction = true;
    },

    /**
     * Called by undo/redo manager upon undo/redo transaction end
     *
     * @param {Sch.data.undoredo.Manager} manager
     * @param {Sch.data.undoredo.Transaction} transaction
     * @protected
     */
    onUndoRedoTransactionEnd : function(manager, transaction) {
        this.inUndoRedoTransaction = false;
    },

    /**
     * Checks wheither an undo/redo transaction currenly rollbacks or replays.
     *
     * @return {Boolean}
     */
    isUndoingOrRedoing : function() {
        return !!this.undoRedoPostponed;
    },

    /**
     * Called by undo manager before executing an undo/redo transaction
     *
     * @param {Sch.data.undoredo.Manager} manager
     * @protected
     */
    beforeUndoRedo : function(manager) {
        this.undoRedoPostponed = [];
    },

    /**
     * Called by undo manager after executing an undo/redo transaction
     *
     * @param {Sch.data.undoredo.Manager} manager
     * @protected
     */
    afterUndoRedo  : function(manager) {
        var me = this;
        Ext.Array.forEach(me.undoRedoPostponed, function(fn) {
            fn();
        });
        me.undoRedoPostponed = null;
    },

    /**
     * Store might use this method to postpone a code execution to the moment right before undo/redo transaction is
     * done. The code postponed will be called right before call to {@link afterUndoRedo()} method.
     *
     * @param {Function} fn A code to postpone
     *
     * @protected
     */
    postponeAfterUndoRedo : function(fn) {
        // <debug>
        Ext.Assert && Ext.Assert.isFunction(fn, 'Parameter must be a function');
        // </debug>

        this.undoRedoPostponed.push(fn);
    },

    beforeSetRoot : function() {
        this.__isSettingRoot = true;
    },

    afterSetRoot : function() {
        this.__isSettingRoot = false;

        // https://www.sencha.com/forum/showthread.php?307767-TreeStore-removeAll-doesn-t-fire-quot-clear-quot&p=1124119#post1124119
        if (!this.getRoot()) {
            this.fireEvent('clear', this);
        }
    },

    beforeFillNode : function(node) {
        if (node.isRoot()) this.beforeSetRoot();
    },

    afterFillNode : function(node) {
        if (node.isRoot()) this.afterSetRoot();
    },

    /**
     * Returns true if store is in process of loading/filling the root node
     *
     * @return {Boolean}
     * @protected
     */
    isRootSettingOrLoading : function() {
        return this.isLoading() || (this.isTreeStore && this.__isSettingRoot);
    }
});
