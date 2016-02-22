/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.column.SchedulingMode
@extends Ext.grid.column.Column

A Column showing the `SchedulingMode` field of a task. The column is editable when adding a
`Sch.plugin.TreeCellEditing` plugin to your Gantt panel. The overall setup will look like this:

    var gantt = Ext.create('Gnt.panel.Gantt', {
        height      : 600,
        width       : 1000,

        columns         : [
            ...
            {
                xtype       : 'schedulingmodecolumn',
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
Ext.define("Gnt.column.SchedulingMode", {
    extend          : "Ext.grid.column.Column",

    requires        : ['Gnt.field.SchedulingMode'],
    mixins          : ['Gnt.mixin.Localizable'],

    alias           : [
        "widget.schedulingmodecolumn",
        "widget.ganttcolumn.schedulingmode"
    ],


    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - text : 'Mode'
     */

    /**
     * @cfg {Number} width The width of the column.
     */
    width           : 100,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align           : 'left',

    /**
     * @cfg {Array} data A 2-dimensional array used for editing in combobox. The first item of inner arrays will be treated as "value" and 2nd - as "display"
     */
    data            : null,

    /**
     * @cfg {Boolean} instantUpdate Set to `true` to instantly apply any changes in the field to the task.
     * This option is just translated to the {@link Gnt.field.mixin.TaskField#instantUpdate} config option.
     */
    instantUpdate   : false,

    // Reference to the field used by the Editor
    field           : null,

    fieldProperty           : 'schedulingModeField',


    constructor : function (config) {
        config = config || {};

        this.text   = config.text || this.L('text');

        // this will be a real field
        var field   = config.editor || this.editor || new Gnt.field.SchedulingMode({
            store           : config.data || Gnt.field.SchedulingMode.prototype.store,
            instantUpdate   : this.instantUpdate
        });

        delete config.editor;

        if (!(field instanceof Gnt.field.SchedulingMode)) {

            if (Ext.isString(field)) {
                field = { xtype : field };
            }

            // apply default instantUpdate state
            Ext.applyIf(field, {
                instantUpdate   : this.instantUpdate
            });

            field   = Ext.ComponentManager.create(field, 'schedulingmodefield');
        }

        this.field      = config.editor   = field;

        this.scope      = this;

        this.callParent([ config ]);
    },

    renderer : function (value, meta, task) {
        return this.field.valueToVisible(value, task);
    },

    afterRender: function() {
        this.callParent(arguments);

        var panel = this.up('treepanel');

        this.mon(panel, 'beforeedit', function(ed, e) {
            if (this.field.setTask) {
                this.field.setTask(e.record);
            }
        }, this);

        if (!this.dataIndex) {
            this.dataIndex = panel.store.model.prototype[ this.fieldProperty ];
        }
    }
});
