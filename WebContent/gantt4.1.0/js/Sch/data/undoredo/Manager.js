/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * @class Sch.data.undoredo.Manager
 * @extends Ext.util.Observable
 *
 * This class provides undo-redo capabilities for the provided array of {@link Ext.data.Store} instances. To enable undo support for your data store, simply
 * create an UndoManager and configure it with your store:
 *
 *      var yourStore = new Ext.data.Store({ ... });
 *
 *      var undoManager = new Sch.data.undoredo.Manager({
            transactionBoundary : 'timeout',
            stores              : [
                yourStore
            ]
        });

        undoManager.start();

        yourStore.getAt(0).set('name', 'a new name');

        undoManager.undo(); // Call 'undo' to revert last action
 *
 */
Ext.define('Sch.data.undoredo.Manager', {

    extend      : 'Ext.util.Observable',

    uses        : [
        'Sch.data.undoredo.Transaction',

        'Sch.data.undoredo.action.flat.Update',
        'Sch.data.undoredo.action.flat.Add',
        'Sch.data.undoredo.action.flat.Remove',

        'Sch.data.undoredo.action.tree.Append',
        'Sch.data.undoredo.action.tree.Insert',
        'Sch.data.undoredo.action.tree.Remove',

        'Ext.data.Store'
    ],

    /**
     * @cfg {[Ext.data.Store]} stores A list of stores to be managed by the Undo manager
     */
    stores                  : null,
    storesById              : null,

    treeStoreListeners      : null,
    flatStoreListeners      : null,

    undoQueue               : null,
    redoQueue               : null,

    ignoredFieldNames       : {
        // Tree store view state should not be considered 'data' to be tracked
        expanded : 1
    },

    state                   : 'created',

    /**
     * @cfg
     *
     * Transaction boundary detection mode, either 'manual' or 'timeout'.
     *
     * In 'timeout' mode the manager waits for any change in any store being managed and starts a transaction, i.e.
     * records all the changes in the monitored stores. The transaction lasts for {@link #transactionMaxDuration} and
     * afterwards creates one undo/redo step.
     *
     * In 'manual' mode you have to call {@link #startTransaction} / {@link #endTransaction} to start and end
     * a transaction.
     */
    transactionBoundary     : 'manual',
    /**
     * @cfg
     *
     * The transaction duration
     */
    transactionMaxDuration  : 100,

    transactionTimeout      : null,

    currentTransaction      : null,

    /**
     * @event start Fired when the undo manager starts recording events
     *
     * @param {Sch.data.undoredo.Manager} this
     */

    /**
     * @event stop Fired after the undo manager has stopped recording events
     *
     * @param {Sch.data.undoredo.Manager} this
     */

    /**
     * @event transactionadd
     *
     * @param {Sch.data.undoredo.Manager} this
     * @param {Sch.data.undoredo.Transaction} transaction
     */

    /**
     * @event undoqueuechange
     *
     * @param {Sch.data.undoredo.Manager} this
     * @param {[Sch.data.undoredo.Transaction]} undoQueue
     */

    /**
     * @event redoqueuechange
     *
     * @param {Sch.data.undoredo.Manager} this
     * @param {[Sch.data.undoredo.Transaction]} redoQueue
     */

    /**
     * @event beforeundo Fired before an undo operation
     *
     * @param {Sch.data.undoredo.Manager} this
     */

    /**
     * @event afterundo Fired after an undo operation
     *
     * @param {Sch.data.undoredo.Manager} this
     */

    /**
     * @event beforeredo Fired before a redo operation
     *
     * @param {Sch.data.undoredo.Manager} this
     */

    /**
     * @event afterredo Fired after a redo operation
     *
     * @param {Sch.data.undoredo.Manager} this
     */

    constructor : function (config) {
        var me                      = this;

        config                      = config || {};

        Ext.apply(me, config);

        me.treeStoreListeners     = {
            nodeappend      : me.onTreeStoreAppend,
            nodeinsert      : me.onTreeStoreInsert,
            noderemove      : me.onTreeStoreRemove,
            update          : me.onTreeStoreUpdate,
            load            : me.clearQueues,
            clear           : me.clearQueues,
            scope           : me
        };

        me.flatStoreListeners     = {
            add             : me.onFlatStoreAdd,
            remove          : me.onFlatStoreRemove,
            update          : me.onFlatStoreUpdate,
            load            : me.clearQueues,
            clear           : me.clearQueues,
            scope           : me
        };

        me.callParent([config]);

        var myStores              = me.stores || [];
        me.stores                 = [];
        me.storesById             = {};

        me.undoQueue              = [];
        me.redoQueue              = [];

        Ext.Array.forEach(myStores, function (store) {
            me.addStore(store);
        });
    },

    /**
     * Adds a store to the list of managed stores
     *
     * @param {Ext.data.Store/String} A data store or a 'storeId' identifier
     */
    addStore : function (store) {
        store = Ext.data.StoreMgr.lookup(store);

        // <debug>
        Ext.Assert && Ext.Assert.isObject(store, 'Must provide a store or a valid store id');
        // </debug>
        this.stores.push(store);

        this.storesById[ store.storeId ] = store;
    },

    /**
     * Gets a store from the managed store list by its id
     *
     * @param {String} id
     * @return {Ext.data.Store}
     */
    getStoreById : function (id) {
        return this.storesById[ id ];
    },

    bindStore : function (store) {
        (store.undoRedoEventBus || store).on(this.getStoreTypeListeners(store));
    },

    unbindStore : function (store) {
        (store.undoRedoEventBus || store).un(this.getStoreTypeListeners(store));
    },

    /**
     * Returns listeners object to use with particular store type
     *
     * @param {Ext.data.Store} store
     * @return {Object}
     *
     * @protected
     */
    getStoreTypeListeners : function(store) {
        var listeners;

        if (Ext.data.TreeStore && store instanceof Ext.data.TreeStore) {
            listeners = this.treeStoreListeners;
        }
        else {
            listeners = this.flatStoreListeners;
        }

        return listeners;
    },

    /**
     * Removes a store from the list of managed stores
     *
     * @param {Ext.data.Store} store
     */
    removeStore : function (store) {
        Ext.Array.remove(this.stores, store);

        this.storesById[store.storeId] = null;

        this.unbindStore(store);
    },

    forEachStore : function (func) {
        Ext.Array.forEach(this.stores, func, this);
    },

    onAnyChangeInAnyStore : function (store) {
        if (this.state === 'paused' || (store.isRootSettingOrLoading && store.isRootSettingOrLoading())) {
            return false;
        }

        if (!this.currentTransaction) {
            this.startTransaction();
        }

        return true;
    },

    hasPersistableChanges : function(record, modifiedFieldNames) {
        var ignored = this.ignoredFieldNames;

        return Ext.Array.reduce(modifiedFieldNames, function(result, field) {
            var fieldInstance = record.getField(field);

            return result || !fieldInstance || (fieldInstance.persist && (!record.isNode || !ignored.hasOwnProperty(field)));
        }, false);
    },


    onFlatStoreUpdate : function (store, record, operation, modifiedFieldNames) {
        if (!this.onAnyChangeInAnyStore(store) ||
            operation != 'edit'  ||
            !modifiedFieldNames ||
            !modifiedFieldNames.length ||
            !this.hasPersistableChanges(record, modifiedFieldNames)) {
            return;
        }

        this.currentTransaction.addAction(new Sch.data.undoredo.action.flat.Update({
            record          : record,
            fieldNames      : modifiedFieldNames
        }));
    },

    onFlatStoreAdd : function (store, records, index) {
        if (!this.onAnyChangeInAnyStore(store)) {
            return;
        }

        this.currentTransaction.addAction(new Sch.data.undoredo.action.flat.Add({
            store           : store,
            records         : records,
            index           : index
        }));
    },

    onFlatStoreRemove : function (store, records, index, isMove) {
        if (!this.onAnyChangeInAnyStore(store)) {
            return;
        }

        this.currentTransaction.addAction(new Sch.data.undoredo.action.flat.Remove({
            store           : store,
            records         : records,
            index           : index,
            isMove          : isMove
        }));
    },

    onTreeStoreUpdate : function (store, record, operation, modifiedFieldNames) {
        if (!this.onAnyChangeInAnyStore(store) ||
            operation != 'edit' ||
            !modifiedFieldNames ||
            !modifiedFieldNames.length ||
            !this.hasPersistableChanges(record, modifiedFieldNames)) {
            return;
        }

        this.currentTransaction.addAction(new Sch.data.undoredo.action.flat.Update({
            record          : record,
            fieldNames      : modifiedFieldNames
        }));
    },

    onTreeStoreAppend : function (parent, newChild, index) {
        if (!parent || !this.onAnyChangeInAnyStore(parent.getTreeStore())) {
            return;
        }

        if (newChild.$undoRedoMoving) {
            delete newChild.$undoRedoMoving;
        }
        else {
            this.currentTransaction.addAction(new Sch.data.undoredo.action.tree.Append({
                parent          : parent,
                newChild        : newChild
            }));
        }
    },

    onTreeStoreInsert : function (parent, newChild, insertedBefore) {
        // Don't react to root loading
        if (!parent || !this.onAnyChangeInAnyStore(parent.getTreeStore())) {
            return;
        }

        if  (newChild.$undoRedoMoving) {
            delete newChild.$undoRedoMoving;
        }
        else {
            this.currentTransaction.addAction(new Sch.data.undoredo.action.tree.Insert({
                parent          : parent,
                newChild        : newChild,
                insertedBefore  : insertedBefore
            }));
        }
    },

    onTreeStoreRemove : function (parent, removedChild, isMove, context) {
        if (!this.onAnyChangeInAnyStore(parent.getTreeStore())) {
            return;
        }

        if (isMove) {
            removedChild.$undoRedoMoving = true;
        }

        this.currentTransaction.addAction(new Sch.data.undoredo.action.tree.Remove({
            parent          : parent,
            removedChild    : removedChild,
            nextSibling     : context.nextSibling,
            isMove          : isMove
        }));
    },

    /**
     * Starts undo/redo monitoring
     */
    start : function () {
        // when we start first time - fire events to notify the possibly listening UI about our current state
        if (this.state == 'created' || this.state == 'disabled') {
            this.fireEvent('start', this);
        }

        if (this.state !== 'hold') {
            this.forEachStore(this.bindStore);
            this.state = 'enabled';
        }
    },

    /**
     * Stops undo/redo monitoring and removes any recorded transactions.
     */
    stop : function () {
        this.endTransaction();

        this.forEachStore(this.unbindStore);

        this.state  = 'disabled';

        this.clearQueues();

        this.fireEvent('stop', this);
    },

    clearQueues : function() {
        this.clearUndoQueue();
        this.clearRedoQueue();
    },

    // @protected
    pause : function () {
        this.state  = 'paused';
    },

    // @protected
    resume : function () {
        this.state  = 'enabled';
    },

    // @protected
    hold : function() {
        // <debug>
        Ext.Assert && Ext.Assert.isObject(this.currentTransaction, "Can't hold, no transaction is currently in progress");
        // </debug>

        this.state = 'hold';
    },

    // @protected
    release : function() {
        // <debug>
        Ext.Assert && Ext.Assert.isObject(this.currentTransaction, "Can't release, no transaction is currently in progress");
        // </debug>
        this.state = 'enabled';
    },

    /**
     * Gets the undo queue
     *
     * @return {[Sch.data.undoredo.Transaction]}
     */
    getUndoQueue : function() {
        return this.undoQueue.slice();
    },

    /**
     * Gets the redo queue
     *
     * @return {[Sch.data.undoredo.Transaction]}
     */
    getRedoQueue : function() {
        return this.redoQueue.slice();
    },

    /**
     * Clears the undo queue
     */
    clearUndoQueue : function() {
        if (this.undoQueue.length) {
            this.undoQueue = [];
            this.fireEvent('undoqueuechange', this, this.undoQueue.slice());
        }
    },

    /**
     * Clears redo queue
     */
    clearRedoQueue : function() {
        if (this.redoQueue.length) {
            this.redoQueue = [];
            this.fireEvent('redoqueuechange', this, this.redoQueue.slice());
        }
    },

    /**
     * Starts new undo/redo transaction recording.
     *
     * @param {String} title Transaction title
     */
    startTransaction : function (title) {
        var me = this,
            transaction;

        if (me.state == 'disabled') {
            return;
        }

        if (me.currentTransaction) {
            me.endTransaction();
        }

        transaction = new Sch.data.undoredo.Transaction({
            title : title
        });

        me.currentTransaction = transaction;

        me.notifyStoresAboutTransactionStart(transaction);

        if (me.transactionBoundary == 'timeout') {
            me.scheduleEndTransaction();
        }
    },

    scheduleEndTransaction : function() {
        var me = this;

        if (me.transactionTimeout) {
            clearTimeout(me.transactionTimeout);
        }

        me.transactionTimeout = setTimeout(function () {
            if (me.state !== 'hold') {
                me.endTransaction();
                me.transactionTimeout = null;
            }
            else {
                me.scheduleEndTransaction();
            }
        }, me.transactionMaxDuration);
    },

    /**
     * Ends the current undo/redo transaction.
     */
    endTransaction : function () {
        var me = this,
            currentTransaction = me.currentTransaction;

        if (!currentTransaction) {
            return false;
        }

        me.currentTransaction     = null;

        if (me.transactionBoundary == 'timeout') {
            clearTimeout(me.transactionTimeout);
            me.transactionTimeout = null;
        }

        if (currentTransaction.hasActions()) {
            me.addTransaction(currentTransaction);
        }

        me.notifyStoresAboutTransactionEnd(currentTransaction);

        return currentTransaction.hasActions();
    },

    addTransaction : function (transaction) {
        this.undoQueue.push(transaction);
        this.fireEvent('undoqueuechange', this, this.undoQueue.slice());

        if (this.redoQueue.length) {
            this.redoQueue.length = 0;
            this.fireEvent('redoqueuechange', this, this.redoQueue.slice());
        }

        this.fireEvent('transactionadd', this, transaction);
    },

    /**
     * Undoes previously recorded undo/redo transaction or several transactions depending on optional parameter.
     *
     * @param {Number/Sch.data.undoredo.Transaction} [howMany] The number of transactions to undo
     */
    undo : function (howMany) {
        var undoQueue       = this.undoQueue,
            index,
            transaction,
            i;

        if (this.state == 'disabled' || howMany === 0 || !undoQueue.length) {
            return;
        }

        if (howMany instanceof Sch.data.undoredo.Transaction) {
            index   = Ext.Array.indexOf(undoQueue, howMany);

            if (index == -1) {
                return;
            }

            howMany     = undoQueue.length - index;
        }

        howMany         = howMany || 1;


        this.fireEvent('beforeundo', this);

        this.pause();

        this.notifyStoresAboutUndoRedoStart();

        for (i = 0; i < howMany; i++) {
            transaction     = undoQueue.pop();

            transaction.undo();

            this.redoQueue.unshift(transaction);
        }

        this.notifyStoresAboutUndoRedoComplete();

        this.fireEvent('undoqueuechange', this, undoQueue.slice());
        this.fireEvent('redoqueuechange', this, this.redoQueue.slice());

        this.resume();

        this.fireEvent('afterundo', this);
    },

    /**
     * Redoes the previously recorded undo/redo transaction or several transactions depending on optional parameter.
     *
     * @param {Number} [howMany] how many transactions to redo
     */
    redo : function (howMany) {
        var redoQueue       = this.redoQueue,
            transaction,
            index,
            i;

        if (this.state == 'disabled' || howMany === 0 || !redoQueue.length) {
            return;
        }

        if (howMany instanceof Sch.data.undoredo.Transaction) {
            index   = Ext.Array.indexOf(redoQueue, howMany);

            if (index == -1) {
                return;
            }

            howMany     = index + 1;
        }

        howMany         = howMany || 1;

        this.fireEvent('beforeredo', this);

        this.pause();

        this.notifyStoresAboutUndoRedoStart();

        for (i = 0; i < howMany; i++) {
            transaction     = this.redoQueue.shift();

            transaction.redo();

            this.undoQueue.push(transaction);
        }

        this.notifyStoresAboutUndoRedoComplete();

        this.fireEvent('redoqueuechange', this, this.redoQueue.slice());
        this.fireEvent('undoqueuechange', this, this.undoQueue.slice());

        this.resume();

        this.fireEvent('afterredo', this);
    },

    notifyStoresAboutTransactionStart : function(transaction) {
        this.forEachStore(function(store) {
            store.onUndoRedoTransactionStart && store.onUndoRedoTransactionStart(this, transaction);
        });
    },

    notifyStoresAboutTransactionEnd : function(transaction) {
        this.forEachStore(function(store) {
            store.onUndoRedoTransactionEnd && store.onUndoRedoTransactionEnd(this, transaction);
        });
    },

    notifyStoresAboutUndoRedoStart : function() {
        this.forEachStore(function(store) {
            store.beforeUndoRedo && store.beforeUndoRedo(this);
        });
    },

    notifyStoresAboutUndoRedoComplete : function() {
        this.forEachStore(function(store) {
            store.afterUndoRedo && store.afterUndoRedo(this);
        });
    }
});
