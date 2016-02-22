/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * 
 * @class Gnt.column.ConstraintDate
 * @extends Ext.grid.column.Date
 * 
 * A Column displaying a task's constraint date. The column is editable when adding a
 * `Sch.plugin.TreeCellEditing` plugin to your Gantt panel. The overall setup will look like this:
 *
 * 
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height      : 600,
 *         width       : 1000,
 * 
 *         columns         : [
 *             ...
 *             {
 *                 xtype       : 'constraintdatecolumn',
 *                 width       : 80
 *             }
 *             ...
 *         ],
 *         ...
 *     })
 * 
 * Note, that this class inherit from [Ext.grid.column.Date](http://docs.sencha.com/ext-js/4-2/#!/api/Ext.grid.column.Date) and supports its configuration options, notably the "format".
*/
Ext.define('Gnt.column.ConstraintDate', {
    extend              : 'Ext.grid.column.Date',

    alias               : [
        'widget.constraintdatecolumn',
        'widget.ganttcolumn.constraintdate'
    ],

    requires            : ['Gnt.field.ConstraintDate'],
    mixins              : ['Gnt.mixin.Localizable'],

    /**
     * @cfg {string} text The text to show in the column header, defaults to `Mode`
     * @deprecated Please use {@link #l10n l10n} instead.
     */
    /**
     * @cfg {Object} l10n A object, purposed for the class localization.
     * @cfg {String} l10n.text Column title
     */
    l10n : {
        text : "Constraint date"
    },

    /**
     * @cfg {Number} width The width of the column.
     */
    width               : 100,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align               : 'left',

    // Need to properly obtain the data index if none is given
    fieldProperty   : 'constraintDateField',

    // Reference to the field used by the Editor
    field           : null,

    constructor : function (config) {
        config = config || {};        
        this.text   = config.text || this.L('text');

        // this will be a real field
        var field   = config.editor || new Gnt.field.ConstraintDate({
            format          : config.format || this.format || Ext.Date.defaultFormat,
            taskField       : config.fieldProperty || this.fieldProperty
        });

        delete config.editor;

        if (!(field instanceof Gnt.field.ConstraintDate)) {
            field   = Ext.ComponentManager.create(field, 'constraintdate');
        }

        config.field    = config.editor   = field;

        this.scope      = this;

        this.callParent([ config ]);
    },

    renderer : function (value, meta, task) {
        var me = this,
            format = me.format || Ext.Date.defaultFormat,
            constraintClass;

        constraintClass = task.getConstraintClass();
        value = constraintClass && constraintClass.getDisplayableConstraintDateForFormat(value, format, task) || value;

        return Ext.Date.format(value, format);
    },

    afterRender : function() {

        if (!this.dataIndex) {
            var panel = this.up('treepanel');
            this.dataIndex = panel.store.model.prototype[ this.fieldProperty ];
        }

        this.callParent(arguments);
    }
});
