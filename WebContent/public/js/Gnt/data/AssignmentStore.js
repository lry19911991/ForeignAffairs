/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.data.AssignmentStore
@extends Ext.data.Store

A class representing a collection of assignments between tasks in the {@link Gnt.data.TaskStore} and resources
in the {@link Gnt.data.ResourceStore}.

Contains a collection of {@link Gnt.model.Assignment} records.

*/

Ext.define('Gnt.data.AssignmentStore', {
    extend      : 'Ext.data.Store',

    requires    : [
        'Gnt.model.Assignment'
    ],

    model       : 'Gnt.model.Assignment',
    alias       : 'store.gantt_assignmentstore',

    proxy       : 'memory',

    ignoreInitial   : true,

    // we set it to true to catch `datachanged` event from `loadData` method and ignore this event from records' CRUD operations
    isLoadingRecords            : false,

    // when we call `removeAll` `datachanged` event fires before `clear`. We listen `datachanged` event to refresh grid and in every case except removeAll assignments cache is correct.
    // this flag handles case when we call `removeAll` method and expect correct cache state
    isRemovingAll   : false,

    /**
     * @property {Gnt.data.TaskStore} taskStore The task store to which this assignment store is associated.
     * Usually is configured automatically, by the task store itself.
     */
    taskStore   : null,

    constructor : function(config) {
        config  = config || {};

        this.callParent([config]);

        // subscribing to the CRUD before parent constructor - in theory, that should guarantee, that our listeners
        // will be called first (before any other listeners, that could be provided in the "listeners" config)
        // and state in other listeners will be correct
        this.init();

        if (this.autoSync) {
            // Need some preprocessing in case the store tries to persist a record referencing phantom records.
            this.on('beforesync', this.onMyBeforeSync, this);
        }

        this.ignoreInitial      = false;
    },

    init : function() {
        this.on({
            add         : this.onAssignmentAdd,
            update      : this.onAssignmentUpdate,

            load        : this.onAssignmentsLoad,
            datachanged : this.onAssignmentDataChanged,
            // seems we can't use "bulkremove" event, because one can listen to `remove` event on the task store
            // and expect correct state in it
            remove      : this.onAssignmentRemove,
            // note that we don't listen `clear` event because we update assignments cache via `datachanged` event and `isRemovingAll` flag

            priority    : 100,
            scope       : this
        });

    },

    onAssignmentsLoad  : function () {
        var taskStore = this.getTaskStore();
        taskStore && taskStore.fillTasksWithAssignmentInfo();
    },

    onAssignmentDataChanged : function () {
        var taskStore = this.getTaskStore();

        if (taskStore && (this.isLoadingRecords || this.isRemovingAll)) taskStore.fillTasksWithAssignmentInfo();
    },

    //override
    removeAll   : function () {
        this.isRemovingAll = true;
        this.callParent(arguments);
        this.isRemovingAll = false;
    },

    loadRecords    : function () {
        this.isLoadingRecords = true;
        this.callParent(arguments);
        this.isLoadingRecords = false;
    },


    onAssignmentAdd : function (me, assignments) {
        // need to ignore the initial "add" events for data provided in the config
        if (this.ignoreInitial) return;

        for (var i = 0; i < assignments.length; i++) {
            var assignment  = assignments[ i ];
            var task        = assignment.getTask();

            task && task.assignments.push(assignment);
        }
    },


    onAssignmentRemove : function (me, assignments) {
        var taskStore       = this.getTaskStore();

        if (!taskStore) return;

        Ext.Array.each(assignments, function(assignment) {
            // assignments are already removed from the assignments store and has no reference to it
            // so `getTaskStore` on the Assignment instance won't work, need to provide `taskStore`
            var task            = assignment.getTask(taskStore);

            task && Ext.Array.remove(task.assignments, assignment);
        });
    },


    onAssignmentUpdate : function (me, assignment, operation) {
        if (operation != Ext.data.Model.COMMIT) {
            var taskStore       = this.getTaskStore();

            if (!taskStore) return;

            var previous        = assignment.previous;

            var newTask         = assignment.getTask();

            if (previous && assignment.taskIdField in previous) {
                var oldTask   = taskStore.getNodeById(previous[ assignment.taskIdField ]);

                if (oldTask !== newTask) {
                    // remove from old array
                    if (oldTask) Ext.Array.remove(oldTask.assignments, assignment);
                    // put the assignment into new task assignments cache (if it's not there already)
                    if (newTask && !Ext.Array.contains(newTask.assignments, assignment)) newTask.assignments.push(assignment);
                }
            }
        }
    },


    /**
     * Returns the associated task store instance.
     *
     * @return {Gnt.data.TaskStore}
     */
    getTaskStore: function(){
        return this.taskStore;
    },


    /**
     * Returns the associated resource store instance.
     *
     * @return {Gnt.data.ResourceStore}
     */
    getResourceStore: function(){
        return this.getTaskStore().resourceStore;
    },


    getByInternalId : function (id) {
        return this.data.getByKey(id) || this.getById(id);
    },

    removeAssignmentsForResource : function(resource) {
        var resourceId = resource.getId();

        if (resourceId) {

            var toRemove = this.queryBy(function(assignment) {
                return assignment.getResourceId() == resourceId;
            }).items;

            this.remove(toRemove);
        }
    },

    // Only used when not batching writes to the server. If batching is used, the server will always
    // see the full picture and can resolve parent->child relationships based on the PhantomParentId and PhantomId field values
    onMyBeforeSync: function (records, options) {
        var recordsToCreate     = records.create;

        if (recordsToCreate) {
            for (var r, i = recordsToCreate.length - 1; i >= 0; i--) {
                r = recordsToCreate[i];

                if (!r.isPersistable()) {
                    // Remove records that cannot yet be persisted (if parent is a phantom)
                    Ext.Array.remove(recordsToCreate, r);
                }
            }

            // Prevent empty create request
            if (recordsToCreate.length === 0) {
                delete records.create;
            }
        }

        return Boolean((records.create  && records.create.length  > 0) ||
        (records.update  && records.update.length  > 0) ||
        (records.destroy && records.destroy.length > 0));
    }
});
