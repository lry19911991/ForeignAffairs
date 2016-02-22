/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// https://www.sencha.com/forum/showthread.php?301772-Wrong-value-selected-in-combobox-editor
// IMPORTANT: this bug still exists in Ext6, but this fix doesn't work and tests seem to be green.
// Do not remove unless you're 100% sure
Ext.define('Gnt.patches.CellEditing', {
    extend : 'Sch.util.Patch',

    requires   : ['Ext.grid.plugin.CellEditing'],
    target     : 'Ext.grid.plugin.CellEditing',
    minVersion : '5.1.1',

    overrides : {
        showEditor: function(ed, context, value) {
            // clean lastSelectedRecords cache for combobox if record was changed
            if (ed.context && ed.context.record !== context.record && 
                ed.field instanceof Ext.form.field.ComboBox) {
                ed.field.lastSelectedRecords = null;
            }
            this.callParent(arguments);
        }
    }
});