/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Sch.panel.TimelineGridPanel
@extends Ext.grid.Panel
@mixin Sch.mixin.TimelinePanel

Internal class.

*/
Ext.define("Sch.panel.TimelineGridPanel", {
    extend                  : "Ext.grid.Panel",
    mixins                  : [
        'Sch.mixin.Localizable',
        'Sch.mixin.TimelinePanel'
    ],
    alias                   : [ 'widget.timelinegrid'],
    subGridXType            : 'gridpanel',

    isTimelineGridPanel     : true,

    initComponent           : function() {
        this.callParent(arguments);
        this.getSchedulingView()._initializeTimelineView();
    }
}, function() {
    this.override(Sch.mixin.TimelinePanel.prototype.inheritables() || {});
});