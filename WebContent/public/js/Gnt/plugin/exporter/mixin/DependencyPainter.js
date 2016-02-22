/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 @private

 @class Gnt.plugin.exporter.mixin.DependencyPainter

 This mixin class handles the rendering of dependencies for the exporters.

 */

Ext.define ('Gnt.plugin.exporter.mixin.DependencyPainter', {

    taskBoxes           : null,

    dependencyPainter   : null,

    dependenciesHtml    : '',

    ganttView           : null,

    initDependencyPainter : function () {
        var me  = this;

        me.dependencyPainter    = me.normalView.dependencyView.painter;
        me.ganttView            = me.dependencyPainter.ganttView;
        me.taskBoxes            = {};
    },


    getLineCoordinates : function () {
        var me  = this;
        // redirect to real painter method
        return me.dependencyPainter.getLineCoordinates.apply(me.dependencyPainter, arguments);
    },


    renderDependencies : function (dependencies) {
        var me              = this;

        me.dependenciesHtml = me.normalView.dependencyView.lineTpl.apply( me.getDependencyTplData(dependencies) );
    },


    fillTaskBox : function (task) {
        var me      = this,
            painter = me.normalView.dependencyView.painter;

        if (task.hasIncomingDependencies() || task.hasOutgoingDependencies()) {
            me.taskBoxes[task.getId()] = painter.getTaskBox(task);
        }
    },


    getRenderData : function (dependency) {
        var me          = this,
            fromTask    = dependency.getSourceTask(),
            toTask      = dependency.getTargetTask();

        if (fromTask && toTask) {
            return {
                fromBox : me.taskBoxes[fromTask.getId()],
                toBox   : me.taskBoxes[toTask.getId()]
            };
        }
    },


    getDependencyTplData : function (dependencyRecords) {
        dependencyRecords   = dependencyRecords || this.normalView.dependencyView.store.getRange();

        return this.dependencyPainter.getDependencyTplData.call(this, dependencyRecords);
    }

});