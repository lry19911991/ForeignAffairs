/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.template.Task
@extends Ext.XTemplate

Template class used to render a regular leaf task.
*/
Ext.define("Gnt.template.Task", {
    extend      : 'Gnt.template.Template',

    /**
     * @cfg {String} innerTpl The template defining the inner visual markup for the task.
     */
    innerTpl : '<div class="sch-gantt-progress-bar" style="width:{progressBarWidth}px;{progressBarStyle}" unselectable="on">&#160;</div>',

    getInnerTpl : function (cfg) {
        var side = cfg.rtl ? 'right' : 'left';

        return '<div id="' + cfg.prefix + '{id}" class="sch-gantt-item sch-gantt-task-bar {cls}" unselectable="on" style="width:{width}px;{style}">'+
            '<tpl if="isRollup">' +
            '<tpl else>' +
                '<tpl if="segments">' +
                    '<div class="sch-gantt-segment-connector"></div>' +
                '</tpl>'+

                ((cfg.resizeHandles === 'both' || cfg.resizeHandles === 'left') ? '<div class="sch-resizable-handle sch-gantt-task-handle sch-resizable-handle-start"></div>' : '') +

                '<tpl for="segments">' +
                    '<div id="' + cfg.prefix + '{parent.Id}-segment-{[xindex-1]}" class="sch-gantt-task-segment {cls}" style="left:{left}px;width:{width}px;{style}"' +
                    ' data-segmentIndex="{[xindex-1]}">' +
                        this.innerTpl +
                        ((cfg.resizeHandles === 'both' || cfg.resizeHandles === 'right') ? '<div class="sch-resizable-handle sch-gantt-task-handle sch-resizable-handle-end"></div>' : '') +
                    '</div>' +
                '</tpl>' +
                this.innerTpl +

                ((cfg.resizeHandles === 'both' || cfg.resizeHandles === 'right') ? '<div class="sch-resizable-handle sch-gantt-task-handle sch-resizable-handle-end"></div>' : '') +

                (cfg.enableProgressBarResize ? '<div style="' + side + ':{progressBarWidth}px" class="sch-gantt-progressbar-handle"></div>': '') +

                // Left / Right terminals
                (cfg.enableDependencyDragDrop ? this.dependencyTerminalMarkup : '') +

            '</tpl>'+
        '</div>';
    }
});
