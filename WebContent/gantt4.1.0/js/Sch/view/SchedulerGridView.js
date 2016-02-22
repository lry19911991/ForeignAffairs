/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Sch.view.SchedulerGridView
@extends Sch.view.TimelineGridView
@mixin Sch.mixin.SchedulerView

Empty class just consuming the Sch.mixin.SchedulerView mixin.

*/
Ext.define("Sch.view.SchedulerGridView", {
    extend              : 'Sch.view.TimelineGridView',
    mixins              : ['Sch.mixin.SchedulerView', 'Sch.mixin.Localizable'],
    alias               : 'widget.schedulergridview'
}, function() {
    this.override(Sch.mixin.SchedulerView.prototype.inheritables() || {});
});

