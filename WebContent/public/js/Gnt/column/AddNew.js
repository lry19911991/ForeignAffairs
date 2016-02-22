/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.column.AddNew
@extends Ext.grid.column.Column

A column allowing the user to add a new column to the Gantt chart. To include your own custom columns in this list,
 just create an alias for them starting with 'widget.ganttcolumn.XXX'. Example:

    Ext.define('Your.column.DeadlineDate', {
        extend              : 'Ext.grid.column.Date',

        alias               : [
            'widget.ganttcolumn.deadlinedate'
        ],

        ...
    });

*/
Ext.define("Gnt.column.AddNew", {
    extend      : "Ext.grid.column.Column",

    alias       : [
        "widget.addnewcolumn",
        "widget.ganttcolumn.addnew"
    ],

    requires    : [
        'Ext.form.field.ComboBox',
        'Ext.Editor'
    ],

    mixins      : ['Gnt.mixin.Localizable'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

        - text  : 'Add new column...'
     */

    width       : 100,
    resizable   : false,
    sortable    : false,
    draggable   : false,

    colEditor      : null,
    colEditorStore : null,

    /**
     * @cfg {Array} [columnList] An array of column definition objects. It should be a list containing data as seen below
     *
     *      [
     *          { clsName : 'Gnt.column.StartDate', text : 'Start Date', config : {...} },
     *          { clsName : 'Gnt.column.Duration', text : 'Duration', config : {...} },
     *          ...
     *      ]
     *
     * If not provided, a list containing all the columns from the `Gnt.column.*` namespace will be created.
     */
    columnList  : null,

    initComponent : function() {
        if (!this.text) this.text = this.L('text');

        this.addCls('gnt-addnewcolumn');

        this.on({
            headerclick         : this.myOnHeaderClick,
            headertriggerclick  : this.myOnHeaderClick,
            scope               : this
        });

        this.callParent(arguments);
    },

    getGantt : function () {
        if (!this.gantt) {
            this.gantt = this.up('ganttpanel');
        }

        return this.gantt;
    },

    /**
     * @protected
     */
    getColEditor : function() {
        var me = this,
            editor;

        if (!me.colEditor) {
            editor = me.colEditor = new Ext.Editor({
                shadow      : false,
                updateEl    : false,
                itemId      : 'addNewEditor',

                // HACK: we need this editor to exist in the column header for scrolling of the grid
                renderTo    : me.el,
                offsets     : [20, 0],
                field       : new Ext.form.field.ComboBox({
                    displayField    : 'text',
                    valueField      : 'clsName',
                    hideTrigger     : true,
                    queryMode       : 'local',
                    forceSelection  : true,
                    multiSelect     : false,
                    listConfig      : {
                        itemId      : 'addNewEditorComboList',
                        minWidth    : 150
                    },
                    store           : me.getColEditorStore(),
                    listeners : {
                        render  : function() {
                            this.on('blur', function(){
                                editor.cancelEdit();
                            });
                        },
                        select  : me.onSelect,
                        scope   : me
                    }
                })
            });
        }

        return me.colEditor;
    },

    /**
     * @protected
     */
    getColEditorStore : function() {
        var me = this;

        if (!me.colEditorStore) {
            me.columnList = me.columnList || Gnt.column.AddNew.buildDefaultColumnList();

            me.colEditorStore = new Ext.data.Store({
                fields  : ['text', 'clsName', 'config'],
                data    : me.columnList,
                sorters : [{
                    property  : 'text',
                    direction : 'ASC'
                }]
            });
        }

        return me.colEditorStore;
    },

    /**
     * @private
     */
    myOnHeaderClick : function() {
        var me = this,
            editor,
            titleEl;

        titleEl = me.el.down('.' + Ext.baseCSSPrefix + 'column-header-text');
        editor = me.getColEditor();
        editor.startEdit(titleEl, '');
        editor.field.reset();
        editor.field.setWidth(this.getWidth() - 20);
        editor.field.expand();

        return false;
    },

    /**
     * @private
     */
    onSelect : function(combo, records) {
        var me  = this;

        me.colEditor.cancelEdit();
        me.addColumn(Ext.isArray(records) ? records[0] : records);
    },

    /**
     * @protected
     */
    addColumn : function(record) {
        var me              = this;
        var rec             = record;
        var owner           = me.ownerCt;
        var text            = rec.get('text');
        var config          = rec.get('config') || {};
        var clsName         = rec.get('clsName') || config.xclass || 'Ext.grid.column.Column';

        Ext.require(clsName, function() {
            var cls = Ext.ClassManager.get(clsName);

            var col = Ext.create(Ext.applyIf(config, {
                xclass    : clsName,
                dataIndex : me.getGantt().taskStore.model.prototype[cls.prototype.fieldProperty],
                text      : text
            }));
            
            owner.insert(owner.items.indexOf(me), col);
        });
    },

    statics : {
        /**
         * Builds the default column list to show in the combo box picker. The list will contain all columns matching the "widget.ganttcolumn.XXX" alias.
         *
         * @return {{className: string, text: string, config: Object}[]}
         */
        buildDefaultColumnList : function() {
            var list = [];

            Ext.Array.each(Ext.ClassManager.getNamesByExpression('widget.ganttcolumn.*'), function(name) {
                var cls = Ext.ClassManager.get(name);

                if (
                    cls !== Gnt.column.AddNew &&
                    !Gnt.column.AddNew.prototype.isPrototypeOf(cls.prototype)
                ) {
                    list.push({
                        clsName : name,
                        text    : cls.prototype.localize ? cls.prototype.localize('text') : cls.prototype.text
                    });
                }
            });

            return Ext.Array.sort(list, function(a, b) { return a.text > b.text ? 1 : -1; });
        }
    } 
});
