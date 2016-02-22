/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.column.ResourceAssignment
@extends Ext.grid.column.Column

{@img gantt/images/resource-assignment.png}

A Column showing the resource assignments of a task. To make the column editable,
add the {@link Sch.plugin.TreeCellEditing} plugin to your gantt panel:

    var gantt = Ext.create('Gnt.panel.Gantt', {
        height      : 600,
        width       : 1000,

        columns         : [
            ...
            {
                xtype       : 'resourceassignmentcolumn',
                width       : 80
            }
            ...
        ],

        plugins             : [
            Ext.create('Sch.plugin.TreeCellEditing', {
                clicksToEdit: 1
            })
        ],
        ...
    })

*/
Ext.define("Gnt.column.ResourceAssignment", {
    extend      : "Ext.grid.column.Column",
    alias       : [
        "widget.resourceassignmentcolumn",
        "widget.ganttcolumn.resourceassignment"
    ],
    requires    : ['Gnt.field.Assignment'],
    mixins      : ['Gnt.mixin.Localizable'],

    tdCls       : 'sch-assignment-cell',

    /**
     * @cfg {Boolean} showUnits Set to `true` to show the assignment units (in percent). Default value is `true`.
     */
    showUnits   : true,

    // Reference to the field used by the Editor
    field       : null,

    // Copied from the panel view if cells for this columns should be marked dirty
    dirtyCls    : null,

    constructor : function(config) {
        config      = config || {};



        this.text   = config.text || this.L('text');

        var field   = config.editor;
        var showUnits = config.showUnits || this.showUnits;

        delete config.editor;

        config.editor   = field || {};

        if (!(config.editor instanceof Ext.form.Field)) {
            config.editor   = Ext.ComponentManager.create(Ext.applyIf(config.editor, {
                expandPickerOnFocus : true,
                formatString        : '{0}' + (showUnits ? ' [{1}%]' : '')
            }), 'assignmentfield');
        }

        config.field = config.editor;

        this.callParent([ config ]);

        this.scope          = this;

        if (this.field){
            // HACK, complete editing when the field is collapsed
            this.field.on('collapse', function () {
                this.up('treepanel').getView().setActionableMode(false);
            }, this);
        }
    },

    afterRender: function() {
        var view       = this.up('treepanel').getView();

        // Check if the current view is configured to highlight dirty cells
        if (view.markDirty) {
            this.dirtyCls = view.dirtyCls;
        }

        this.callParent(arguments);
    },

    /**
     * Return assignment data to be saved to memory, only works with 'raw' format
     * @param {Gnt.model.Task} task Task being copied
     * @return {Object[]}
     */
    getRawData : function (task) {
        return Ext.Array.map(task.getAssignments(), function (assignment) {
            var data = assignment.copy(null).data;
            delete data[assignment.idProperty];

            return data;
        });
    },

    /**
     * Will validate and insert previously prepared assignment data
     * @param {Object[]} data Data to insert, should be valid input for store.add method
     * @param {Gnt.model.Task} task Record being populated with this data
     */
    putRawData : function (data, task) {
        var assignmentStore = task.getAssignmentStore();
        var toAdd           = [];
        assignmentStore.removeAssignmentsForTask(task);

        Ext.isArray(data) && Ext.Array.each(data, function (item) {
            if (task.getResourceStore().getById(item[assignmentStore.model.prototype.resourceIdField])) {
                item[assignmentStore.model.prototype.taskIdField] = task.getId();
                toAdd.push(item);
            }
        });

        assignmentStore.add(toAdd);
    },

    renderer : function(value, meta, task) {
        if (this.dirtyCls && this.field.isDirty(task)) {
            meta.tdCls   = this.dirtyCls;
        }

        return this.field.getFieldDisplayValue(task);
    }
});
