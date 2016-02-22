/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/*

 Overrides to detect and save task segments state before any editing takes place
 The flow is as follows:

 1. taskStore.onSegmentEditBegin() is called
 2. We serialize and save current segments on the Task
 3. Any following change to segments from here on
 4. At some point later 'processSavingOldValue' is called as a result of the 'update' event fired
 5. The Undo action now has a reliable before-edit copy of all segment data for the Task
 6a. If no undo manager active: State cache cleared in onSegmentEditEnd
 6b. If undo manager active : State cache cleared in onUndoRedoTransactionEnd
 */
Ext.define('Gnt.data.undoredo.mixin.TaskStoreHint', {
    extend : 'Sch.data.undoredo.mixin.StoreHint',

    segmentsStateByTaskId : null,

    onSegmentEditBegin : function (task, segment) {
        var me = this;

        this.segmentsStateByTaskId = this.segmentsStateByTaskId || {};

        // Before any editing takes place of a segment, store the original
        if (!this.segmentsStateByTaskId.hasOwnProperty(task.internalId)) {
            this.segmentsStateByTaskId[task.internalId] = task.buildSegmentsSnapshot();
        }
    },

    onSegmentEditEnd : function (task, segment) {
        var me = this;

        if (!me.isInUndoRedoTransaction()) {
            delete this.segmentsStateByTaskId[task.internalId];
        }
    },

    onUndoRedoTransactionEnd : function (manager, transaction) {
        var me = this;

        // After a transaction is completed, clear the cached data
        this.segmentsStateByTaskId = null;

        me.callParent([manager, transaction]);
    },

    getOriginalSegmentsState : function (task) {
        return this.segmentsStateByTaskId[ task.internalId ];
    }
});
