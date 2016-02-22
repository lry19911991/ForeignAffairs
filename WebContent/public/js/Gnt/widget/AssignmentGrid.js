/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 @class Gnt.widget.AssignmentGrid
 @extends Ext.grid.Panel

 A class used to display and edit the task assignments. You can configure this through the {@link Gnt.widget.AssignmentField#gridConfig gridConfig} object
 available on the {@link Gnt.widget.AssignmentField} class.

 */
Ext.define('Gnt.widget.AssignmentGrid', {
    extend : 'Ext.grid.Panel',
    alias  : 'widget.assignmentgrid',

    requires : [
        'Gnt.model.Resource',
        'Gnt.model.Assignment',
        'Gnt.column.ResourceName',
        'Gnt.column.AssignmentUnits',
        'Ext.grid.plugin.CellEditing'
    ],

    /**
     * @cfg {Ext.data.Store} assignmentStore A store with assignments
     */
    assignmentStore : null,

    /**
     * @cfg {Ext.data.Store} resourceStore A store with resources
     */
    resourceStore : null,

    readOnly : false,
    cls      : 'gnt-assignmentgrid',

    defaultAssignedUnits : 100,
    taskId               : null,

    cellEditing : null,

    assignmentUnitsEditor : null,

    // HACK, breaks too many features
    bufferedRenderer      : false,

    sorter : {
        sorterFn : function (o1, o2) {
            var un1 = o1.getUnits(),
                un2 = o2.getUnits();

            if ((!un1 && !un2) || (un1 && un2)) {
                return o1.get('ResourceName') < o2.get('ResourceName') ? -1 : 1;
            }

            return un1 ? -1 : 1;
        }
    },

    constructor : function (config) {
        var me = this;
        this.store = Ext.create("Ext.data.JsonStore", {
            model : 'Gnt.model.AssignmentEditing'
        });

        this.columns = this.buildColumns();

        if (!this.readOnly) {
            this.plugins = this.buildPlugins();
        }

        Ext.applyIf(this, {
            selModel : {
                selType   : 'checkboxmodel',
                mode      : 'MULTI',
                checkOnly : true
            }
        });

        this.callParent(arguments);
    },

    initComponent : function () {
        this.loadResources();

        this.mon(this.resourceStore, {
            datachanged : this.loadResources,
            scope       : this
        });

        this.callParent(arguments);

        this.getSelectionModel().on({
            select   : this.onSelect,
            deselect : this.onDeselect,
            scope    : this
        });
    },

    onSelect : function (sm, rec) {
        if ((!this.cellEditing || !this.cellEditing.getActiveEditor()) && !rec.getUnits()) {
            rec.setUnits(this.defaultAssignedUnits);
        }
    },

    onDeselect : function (sm, rec) {
        rec.setUnits(0);
    },

    loadResources : function () {
        var data = [],
            rs = this.resourceStore;

        for (var i = 0, l = rs.getCount(); i < l; i++) {
            var resource = rs.getAt(i);

            data.push({
                ResourceId   : resource.getId(),
                ResourceName : resource.getName(),
                Units        : ''
            });
        }
        this.store.loadData(data);
    },

    // @private
    buildPlugins  : function () {
        var cellEditing = this.cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });

        cellEditing.on('edit', this.onEditingDone, this);

        return [
            cellEditing
        ];
    },

    hide : function () {
        this.cellEditing.cancelEdit();
        this.callParent(arguments);
    },

    onEditingDone : function (ed, e) {
        // Make sure row is selected after editing a cell
        if (e.value) {
            this.getSelectionModel().select(e.record, true);
        } else {
            this.getSelectionModel().deselect(e.record);
            e.record.reject();
        }
    },

    // @private
    buildColumns  : function () {
        return [
            {
                xtype : 'resourcenamecolumn'
            },
            {
                xtype           : 'assignmentunitscolumn',
                assignmentStore : this.assignmentStore,
                editor          : {
                    xtype         : 'numberfield',
                    minValue      : 0,
                    step          : 10,
                    selectOnFocus : true
                }
            }
        ];
    },

    setEditableFields : function (taskId) {
        if (!this.assignmentUnitsEditor) this.assignmentUnitsEditor = this.down('assignmentunitscolumn').getEditor();

        var taskStore = this.assignmentStore && this.assignmentStore.taskStore,
            task = taskStore && taskStore.getNodeById(taskId);

        if (task) {
            switch (task.getSchedulingMode()) {
                case 'DynamicAssignment' :
                    this.assignmentUnitsEditor.setReadOnly(true);
                    break;
                default :
                    this.assignmentUnitsEditor.setReadOnly(false);
            }
        }
    },

    loadTaskAssignments : function (taskId) {
        var store = this.store,
            sm = this.getSelectionModel();

        this.taskId = taskId;

        // clear all checkboxes
        sm.deselectAll(true);

        // Reset all "Units" values of all resource assignment records first
        for (var i = 0, l = store.getCount(); i < l; i++) {
            // should be ok to use field names here, since we are inheriting directly from Gnt.model.Assignment
            var record = store.getAt(i);
            record.data.Units = 0;
            record.data.Id = null;
            // after each saveTaskAssignments we should call loadTaskAssignments to set proper __id__'s on task assignments
            delete record.__id__;
        }


        var taskAssignments = this.assignmentStore.queryBy(function (a) {
            return a.getTaskId() == taskId;
        });

        taskAssignments.each(function (assignment) {
            var resourceAssignmentRecord = store.findRecord("ResourceId", assignment.getResourceId(), 0, false, true, true);

            if (resourceAssignmentRecord) {
                resourceAssignmentRecord.setUnits(assignment.getUnits());
                // can't assign to "idProperty" of the record because if "id" is missing
                // the store internal mapping will be broken (and "indexOf" method of the store will stop working)
                resourceAssignmentRecord.__id__ = assignment.getId();

                // mark the record with checkbox
                sm.select(resourceAssignmentRecord, true, true);
            }
        });

        // HACK: Weird Safari only bug
        // https://www.assembla.com/spaces/bryntum/tickets/1810-assignment-editor-doesn-t-work-on-safari#/activity/ticket:
        if (Ext.isSafari) {
            this.focus();
        }

        // Apply sort to show assigned resources at the top
        store.sort(this.sorter);

        // HACK Ext JS saves the sorter, remove it explicitly
        store.getSorters().removeAll();

        this.setEditableFields(taskId);
    },

    saveTaskAssignments : function () {
        var aStore = this.assignmentStore,
            taskId = this.taskId;

        var assignmentsToStay = {};
        var newAssignments = [];

        this.getSelectionModel().selected.each(function (resourceAssignmentRecord) {
            var units = resourceAssignmentRecord.getUnits();

            if (units > 0) {
                // if not undefined that means resource was assigned to another task
                var id = resourceAssignmentRecord.__id__;

                if (id) {
                    assignmentsToStay[id] = true;

                    aStore.getById(id).setUnits(units);
                } else {
                    var newAssignment = Ext.create(aStore.model);
                    newAssignment.setTaskId(taskId);
                    newAssignment.setResourceId(resourceAssignmentRecord.getResourceId());
                    newAssignment.setUnits(units);

                    assignmentsToStay[newAssignment.internalId] = true;

                    newAssignments.push(newAssignment);
                }
            }
        });

        var assignmentsToRemove = [];

        // Remove any assignments that
        // - are not phantom
        // - and have been unchecked (and thus are not included in `assignmentsToStay`)
        aStore.each(function (assignment) {
            //   assignment is for our task       | not phantom |       was unchecked
            if (assignment.getTaskId() == taskId && !assignmentsToStay[assignment.getId() || assignment.internalId]) {
                assignmentsToRemove.push(assignment);
            }
        });

        // Fire this event so UI can ignore the datachanged events possibly fired below
        aStore.fireEvent('beforetaskassignmentschange', aStore, taskId, newAssignments);

        aStore.suspendAutoSync();

        aStore.remove(assignmentsToRemove);

        // Add selected assignments for this task
        aStore.add(newAssignments);

        aStore.resumeAutoSync();

        // Fire this event so UI can just react and update the row for the task
        aStore.fireEvent('taskassignmentschanged', aStore, taskId, newAssignments);

        if (aStore.autoSync) {
            aStore.sync();
        }
    },

    isDataChanged : function () {
        var me = this;

        return me.store &&
            me.store.getUpdatedRecords().length > 0 ||
            me.store.getNewRecords().length > 0 ||
            me.store.getRemovedRecords().length > 0;
    },


    isDataValid : function () {
        var result = true;
        this.store.each(function (record) {
            if (!record.isValid()) {
                result = false;
                return false;
            }
        });
        return result;
    }

});
