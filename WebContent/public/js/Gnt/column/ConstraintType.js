/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * A Column showing the `ConstraintType` field of a task. The column is editable when adding a
 * `Sch.plugin.TreeCellEditing` plugin to your Gantt panel. The overall setup will look like this:
 *
 * var gantt = Ext.create('Gnt.panel.Gantt', {
 *       height      : 600,
 *       width       : 1000,
 *
 *       columns         : [
 *           ...
 *           {
 *               xtype       : 'constrainttypecolumn',
 *               width       : 80
 *           }
 *           ...
 *       ],
 *
 *       plugins             : [
 *           Ext.create('Sch.plugin.TreeCellEditing', {
 *               clicksToEdit: 1
 *           })
 *       ],
 *       ...
 *   })
 *
 * @class Gnt.column.ConstraintType
 * @extends Ext.grid.column.Column
 */
Ext.define("Gnt.column.ConstraintType", {
    extend          : "Ext.grid.column.Column",

    requires        : ['Gnt.field.ConstraintType'],
    mixins          : ['Gnt.mixin.Localizable'],

    alias           : [
        'widget.constrainttypecolumn',
        'widget.ganttcolumn.constrainttype'
    ],

    /**
     * @cfg {Object} l10n A object, purposed for the class localization.
     * @cfg {String} l10n.text Column title
     */
    l10n : {
        text : "Constraint"
    },

    /**
     * @cfg {Number} width The width of the column.
     */
    width           : 100,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align           : 'left',

    /**
     * @cfg {Array} data The to pass to Constraint Type field to be created in case the column is not configured with one already.
     * @cfg {String} data[][0] Valid constraint type
     * @cfg {String} data[][1] Constraint name
     */
    data            : null,

    // Reference to the field used by the Editor
    field           : null,
    
    // Need to properly obtain the data index if none is given
    fieldProperty   : 'constraintTypeField',
    
    constructor : function (config) {
        config = config || {};        

        this.text   = config.text || this.L('text');

        // this will be a real field
        var field   = config.editor || new Gnt.field.ConstraintType({
            store           : config.data,
            taskField       : this.fieldProperty
        });

        delete config.editor;

        if (!(field instanceof Gnt.field.ConstraintType)) {
            field   = Ext.ComponentManager.create(field, 'constrainttypefield');
        }

        config.field    = config.editor   = field;

        this.scope      = this;

        this.callParent([ config ]);
    },

    renderer : function (value, meta, task) {
        return this.field.valueToVisible(value, task);
    },

    afterRender : function() {

        if (!this.dataIndex) {
            var panel = this.up('treepanel');
            this.dataIndex = panel.store.model.prototype[ this.fieldProperty ];
        }

        this.callParent(arguments);
    }
});
