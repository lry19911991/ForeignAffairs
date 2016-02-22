﻿/**
@class Sch.plugin.TreeCellEditing
@extends Ext.grid.plugin.CellEditing

A specialized "cell editing" plugin (ptype = 'scheduler_treecellediting'), purposed to correctly work with trees. Add it to your component (scheduler with tree view or gantt)
as usual grid plugin:

    var gantt = Ext.create('Gnt.panel.Gantt', {

        plugins             : [
            Ext.create('Sch.plugin.TreeCellEditing', {
                clicksToEdit: 1
            })
        ],
        ...
    })

This class allows us to do 'complex data editing', which is not supported by the regular CellEditing plugin or the Ext.grid.CellEditor which
 assumes a column is always tied to a single field existing on the grid store model (which is not the case for Gantt, dependencies, assignments etc).
*/
Ext.define('Sch.plugin.TreeCellEditing', {
    extend              : 'Ext.grid.plugin.CellEditing',
    alias               : 'plugin.scheduler_treecellediting',

    lockableScope       : 'locked',

    editorsStarted      : 0,

    init : function (pnl) {
        this._grid      = pnl;

        // This is used to prevent editing of readonly cells
        this.on('beforeedit', this.onMyBeforeEdit, this);

        this.callParent(arguments);
    },

    bindPositionFixer : function () {
        //Ext.on({
        //    afterlayout : this.fixEditorPosition,
        //
        //    scope       : this
        //});
    },

    unbindPositionFixer : function () {
        //Ext.un({
        //    afterlayout : this.fixEditorPosition,
        //
        //    scope       : this
        //});
    },

    /*
     * Fixes active editor position.
     */
    fixEditorPosition : function () {
        // check if we have an active editor
        var editor  = this.getActiveEditor();
        if (editor && editor.getEl()) {
            // rebuild editing context
            var editingContext  = this.getEditingContext(this.context.record, this.context.column);
            if (editingContext) {
                // after layout flushing we have references to not exisiting
                // DOM elements for row and for cell, so we update them
                this.context.row        = editingContext.row;
                this.context.rowIdx     = editingContext.rowIdx;
                editor.boundEl          = this.getCell(editingContext.record, editingContext.column);
                editor.realign();

                this.scroll             = this.view.el.getScroll();

                var lockedView          = this._grid.getView();
                // Since gridview/treeview isn't built to handle a refresh during editing,
                // we help the view by re-setting the focusedRow which is invalid after the refresh
                lockedView.focusedRow = lockedView.getNode(editingContext.rowIdx);
            }
        }
    },

    /*
     * Checks if panel is not locked for editing, and prevents cell edits if needed
     */
    checkReadOnly : function() {
        var pnl = this._grid;

        if (!(pnl instanceof Sch.panel.TimelineTreePanel)) {
            pnl = pnl.up('tablepanel');
        }
        return !pnl.isReadOnly();
    },

    // @OVERRIDE - model set() method
    onEditComplete : function(ed, value, startValue) {
        var me = this;
        
        // if field instance contains applyChanges() method
        // then we delegate saving to it
        // TODO: though this is a dirty code and must be rethought
        if (ed.field.applyChanges) {
            ed.field.applyChanges(ed.field.task || me.context.record);
            // Calling parent with value === startValue makes it not to call record.set() method, we don't need it 
            // to be called since changes are already applyed, but leaves all other functionality inplace.
            me.callParent([ed, value, value]);
        }
        else {
            me.callParent([ed, value, startValue]);
        }

        me.unbindPositionFixer();
    },


    onMyBeforeEdit : function(sender, context) {
        return this.checkReadOnly();
    },

    // @OVERRIDE - Fixes layout issues during editing in IE
    showEditor : function(ed, context, value) {
        //var me                  = this;
        //
        //// increment number of shown editors
        //this.editorsStarted++;
        //
        //// if ed.hideEdit is not overridden yet
        //if (!ed.hideEditOverridden) {
        //    var originalHideEdit    = ed.hideEdit;
        //
        //    // override ed.hideEdit to take into account this.editorsStarted
        //    // it will hide editor only if no further this.showEditor calls were done
        //    ed.hideEdit             = function () {
        //        me.editorsStarted--;
        //        // will hide it only if no more showEditor calls were done before this hideEdit call
        //        if (!me.editorsStarted) {
        //            originalHideEdit.apply(this, arguments);
        //        }
        //    };
        //
        //    ed.hideEditOverridden    = true;
        //}

        var field               = ed.field;

        // if editor has suppress record updating method - call it
        //if (field && field.setSuppressTaskUpdate) {
        //    field.setSuppressTaskUpdate(true);
        //
        //    // Sencha can't decide whether this method should be called synchronously or not
        //    // in some versions it is called synchronously, in others - with 1ms delay
        //    // so we can't call the "setSuppressTaskUpdate(false)" synchronously after `callParent()` here
        //    // need to do this only after the `startEdit` of the editor has happened
        //    if (!ed.startEditOverridden) {
        //        // remember that we've overridden ed.startEdit
        //        ed.startEditOverridden   = true;
        //
        //        var originalStartEdit   = ed.startEdit;
        //
        //        ed.startEdit            = function () {
        //            // call the original startEdit method
        //            originalStartEdit.apply(this, arguments);
        //
        //            // restore suppressing state
        //            field.setSuppressTaskUpdate(false);
        //        };
        //    }
        //}

        // For editing of cells where the data isn't coming from the task model itself, we need to help the
        // editor understand what's going on and set a proper initial value instead of 'undefined'
        if (field) {
            // if it's a field mixed with TaskField mixin
            if (field.setTask) {
                // then after setTask calling field already has correct value
                field.setTask(context.record);
                value = context.value = context.originalValue = field.getValue();

            } else if (!context.column.dataIndex && context.value === undefined) {
                value = context.value = field.getDisplayValue(context.record);
            }
        }
        
        this.callParent([ed, context, value]);

        //this.bindPositionFixer();
    },

    _cancelEdit : function () {
        this.callParent(arguments);

        this.unbindPositionFixer();
    }

});
