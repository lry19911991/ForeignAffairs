/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/*
 * @class Gnt.column.AssignmentUnits
 * @extends Ext.grid.Column
 * @private
 * Private class used inside Gnt.widget.AssignmentGrid.
 */
Ext.define("Gnt.column.AssignmentUnits", {
    extend      : "Ext.grid.column.Number",
    mixins      : ['Gnt.mixin.Localizable'],
    alias       : "widget.assignmentunitscolumn",

    dataIndex   : 'Units',
    format      : '0 %',
    align       : 'left',

    constructor : function (config) {
        config = config || {};        

        this.text   = config.text || this.L('text');
        this.scope = this;

        this.callParent(arguments);
    },

    // HACK, without 3 arguments the grid doesn't behave sanely
    renderer : function(value, meta, record) {
        if (value) return Ext.util.Format.number(value, this.format);
    }
});
