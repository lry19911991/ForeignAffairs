/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// https://www.sencha.com/forum/showthread.php?305782-TreeViewDragDrop-cannot-be-disabled
Ext.define('Gnt.patches.SpreadsheetModel', {
    extend : 'Sch.util.Patch',

    requires   : [
        'Ext.grid.selection.SpreadsheetModel',
        'Gnt.patches.SelectionExtender'
    ],
    target     : 'Ext.grid.selection.SpreadsheetModel',
    minVersion : '6.0.0',

    overrides : {
        // asked sencha to make it public/protected
        // https://www.sencha.com/forum/showthread.php?305681-Spreadsheet-tree-dragdrop-plugin&p=1117733#post1117733
        privates    : {
            // prevent selecting cells in normal view
            onMouseMove : function (e, target) {
                // if mouse is moving over scheduling view - do nothing
                if (!Ext.fly(target).up('.sch-ganttview')) {
                    this.callParent(arguments);
                }
            },
            // prevent selection start on click in normal view
            handleMouseDown : function(view, td, cellIndex, record, tr, rowIdx, e) {
                if (!Ext.fly(e.getTarget()).up('.sch-ganttview')) {
                    this.callParent(arguments);
                }
            }
        }
    }
});