/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 @class Gnt.column.Milestone
 @extends Ext.grid.column.Column

 A Column showing if a task is a milestone or not.

    var gantt = Ext.create('Gnt.panel.Gantt', {
        height      : 600,
        width       : 1000,

        // Setup your static columns
        columns         : [
            ...
            {
                xtype       : 'milestonecolumn',
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
    });


 */
Ext.define('Gnt.column.Milestone', {
    extend   : 'Ext.grid.column.Column',
    alias    : [
        'widget.milestonecolumn',
        'widget.ganttcolumn.milestone'
    ],

    requires : ['Gnt.field.Milestone'],
    mixins   : ['Gnt.mixin.Localizable'],

    width    : 50,
    align    : 'center',

    // Reference to the field used by the Editor
    field    : null,

    constructor : function (config) {
        config = config || {};

        config.editor = config.editor || new Gnt.field.Milestone();

        this.text = config.text || this.L('text');

        this.field = config.editor;

        this.callParent(arguments);

        this.scope = this;
    },

    renderer : function (value, meta, task) {
        return this.field.valueToVisible(task.isMilestone());
    }
});
