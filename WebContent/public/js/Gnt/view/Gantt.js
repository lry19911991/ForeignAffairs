/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.view.Gantt
@extends Sch.view.TimelineGridView

A view of the gantt panel. Use the {@link Gnt.panel.Gantt#getSchedulingView} method to get its instance from gantt panel.

*/
Ext.define("Gnt.view.Gantt", {
    extend : "Sch.view.TimelineGridView",

    alias : ['widget.ganttview'],

    requires : [
        'Ext.dd.ScrollManager',
        'Gnt.view.Dependency',
        'Gnt.model.Task',
        'Gnt.template.Task',
        'Gnt.template.ParentTask',
        'Gnt.template.Milestone',
        'Gnt.template.RollupTask',
        'Gnt.feature.TaskDragDrop',
        'Gnt.feature.ProgressBarResize',
        'Gnt.feature.TaskResize',
        'Sch.view.Horizontal'
    ],

    uses : [
        'Gnt.feature.LabelEditor',
        'Gnt.feature.DragCreator'
    ],

    mixins : [
        'Sch.mixin.FilterableTreeView'
    ],

    _cmpCls : 'sch-ganttview',

    barMargin : 4,

    scheduledEventName : 'task',

    trackOver           : false,
    toggleOnDblClick    : false,

    // private
    eventSelector : '.sch-gantt-item',

    eventWrapSelector : '.sch-event-wrap',


    progressBarResizer  : null,
    taskResizer         : null,
    taskDragDrop        : null,
    dragCreator         : null,
    dependencyView      : null,

    resizeConfig            : null,
    createConfig            : null,
    dragDropConfig          : null,
    progressBarResizeConfig : null,

    /**
     * @cfg {Object} dependencyViewConfig
     * A config object to apply to internal instance of the {@link Gnt.view.Dependency}. Inner properties like {@link Gnt.view.Dependency#dragZoneConfig} and {@link Gnt.view.Dependency#dropZoneConfig}
     * will be applied to the dependency drag- and dropzone instances respectively.
     */
    dependencyViewConfig    : null,

    externalGetRowClass     : null,

    /**
     * @cfg {Number} outsideLabelsGatherWidth Defines width of special zone outside (before and after) of visible area within which tasks will be still rendered into DOM.
     * This is used to render partially visible labels of invisible tasks bordering with visible area.
     *
     * Increase this value to see long labels, set to 0 if you want to hide labels of invisible tasks completely.
     */
    outsideLabelsGatherWidth : 200,

    // Task click-events --------------------------
    /**
     * @event taskclick
     * Fires when a task is clicked
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event taskdblclick
     * Fires when a task is double clicked
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event taskcontextmenu
     * Fires when contextmenu is activated on a task
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record
     * @param {Ext.EventObject} e The event object
     */

    // Resizing events start --------------------------
    /**
     * @event beforetaskresize
     * Fires before a resize starts, return false to stop the execution
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task about to be resized
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event taskresizestart
     * Fires when resize starts
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task about to be resized
     */

    /**
     * @event partialtaskresize
     * Fires during a resize operation and provides information about the current start and end of the resized event
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     *
     * @param {Gnt.model.Task} taskRecord The task being resized
     * @param {Date} startDate The start date of the task
     * @param {Date} endDate The end date of the task
     * @param {Ext.Element} element The element being resized
     */

    /**
     * @event aftertaskresize
     * Fires after a succesful resize operation
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task that has been resized
     */

    // Task progress bar resizing events start --------------------------
    /**
     * @event beforeprogressbarresize
     * Fires before a progress bar resize starts, return false to stop the execution
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The record about to be have its progress bar resized
     */

    /**
     * @event progressbarresizestart
     * Fires when a progress bar resize starts
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The record about to be have its progress bar resized
     */

    /**
     * @event afterprogressbarresize
     * Fires after a succesful progress bar resize operation
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord record The updated record
     */

    // Dnd events start --------------------------
    /**
     * @event beforetaskdrag
     * Fires before a task drag drop is initiated, return false to cancel it
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record that's about to be dragged
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event taskdragstart
     * Fires when a dnd operation starts
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The record being dragged
     */

    /**
     * @event beforetaskdropfinalize
     * Fires before a succesful drop operation is finalized. Return false to finalize the drop at a later time.
     * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
     * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
     * @param {Mixed} view The gantt view instance
     * @param {Object} dragContext An object containing 'record', 'start', 'finalize' properties.
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event beforetaskresizefinalize
     * Fires before a succesful resize operation is finalized. Return false to finalize the resize at a later time.
     * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
     * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
     * @param {Mixed} view The gantt view instance
     * @param {Object} resizeContext An object containing 'record', 'start', 'end', 'finalize' properties.
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event beforedragcreatefinalize
     * Fires before a succesful create operation is finalized. Return false to finalize creating at a later time.
     * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
     * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
     * @param {Mixed} view The gantt view instance
     * @param {Object} createContext An object containing 'record', 'start', 'end', 'finalize' properties.
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event taskdrop
     * Fires after a succesful drag and drop operation
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The dropped record
     */

    /**
     * @event aftertaskdrop
     * Fires after a drag and drop operation, regardless if the drop valid or invalid
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     */

    // Label editors events --------------------------
    /**
     * @event labeledit_beforestartedit
     * Fires before editing is started for a field
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record
     */

    /**
     * @event labeledit_beforecomplete
     * Fires after a change has been made to a label field, but before the change is reflected in the underlying field.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Mixed} value The current field value
     * @param {Mixed} startValue The original field value
     * @param {Gnt.model.Task} taskRecord The affected record
     */

    /**
     * @event labeledit_complete
     * Fires after editing is complete and any changed value has been written to the underlying field.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Mixed} value The current field value
     * @param {Mixed} startValue The original field value
     * @param {Gnt.model.Task} taskRecord The affected record
     */

    // Dependencies events--------------------------
    /**
     * @event beforedependencydrag
     * Fires before a dependency drag operation starts (from a "task terminal"). Return false to prevent this operation from starting.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The source task record
     */

    /**
     * @event dependencydragstart
     * Fires when a dependency drag operation starts
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     */

    /**
     * @event dependencydrop
     * Fires when a dependency drag drop operation has completed successfully and a new dependency has been created.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} fromRecord The source task record
     * @param {Gnt.model.Task} toRecord The destination task record
     * @param {Number} type The dependency type
     */

    /**
     * @event afterdependencydragdrop
     * Always fires after a dependency drag-drop operation
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     */

    // Drag create events start --------------------------
    /**
     * @event beforedragcreate
     * Fires before a drag create operation starts, return false to prevent the operation
     * @param {Gnt.view.Gantt} gantt The gantt view
     * @param {Gnt.model.Task} task The task record being updated
     * @param {Date} date The date of the drag start point
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event dragcreatestart
     * Fires before a drag starts, return false to stop the operation
     * @param {Gnt.view.Gantt} view The gantt view
     */

    /**
     * @event dragcreateend
     * Fires after a successful drag-create operation
     * @param {Gnt.view.Gantt} view The gantt view
     * @param {Gnt.model.Task} task The updated task record
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event afterdragcreate
     * Always fires after a drag-create operation
     * @param {Gnt.view.Gantt} view The gantt view
     */
    // Drag create events end --------------------------


    /**
     * @event scheduleclick
     * Fires after a click on the schedule area
     * @param {Gnt.view.Gantt} ganttView The gantt view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event scheduledblclick
     * Fires after a doubleclick on the schedule area
     * @param {Gnt.view.Gantt} ganttView The gantt view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event schedulecontextmenu
     * Fires after a context menu click on the schedule area
     * @param {Gnt.view.Gantt} ganttView The gantt view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Ext.EventObject} e The event object
     */

    constructor : function (config) {
        config = config || {};

        if (config) {
            this.externalGetRowClass = config.getRowClass;

            delete config.getRowClass;
        }

        this.callParent(arguments);

        this.on('boxready', this.onMyBoxReady, this);
        this.initTreeFiltering();
    },

    onRender : function () {
        this.configureLabels();
        this.setupGanttEvents();
        this.setupTemplates();
        this.callParent(arguments);
    },

    onMyBoxReady : function() {
        if (Ext.supports.Touch && this.getNodeContainer()) {
            // Need to move the dependency container to the right place in the DOM to get it synced when
            // the virtual scroller is scrolling
            this.getDependencyView().getDependencyCanvas().insertBefore(this.getNodeContainer());
        }
    },

    /**
     * Returns the associated dependency store
     * @return {Gnt.data.TaskStore}
     */
    getDependencyStore : function () {
        return this.dependencyStore;
    },


    configureFeatures : function () {
        if (this.enableProgressBarResize !== false) {
            this.progressBarResizer = Ext.create("Gnt.feature.ProgressBarResize", Ext.apply({
                ganttView: this
            }, this.progressBarResizeConfig || {}));

            this.on({
                beforeprogressbarresize : this.onBeforeTaskProgressBarResize,
                progressbarresizestart  : this.onTaskProgressBarResizeStart,
                afterprogressbarresize  : this.onTaskProgressBarResizeEnd,
                scope                   : this
            });
        }

        if (this.resizeHandles !== 'none') {

            this.taskResizer = Ext.create("Gnt.feature.TaskResize", Ext.apply({
                ganttView           : this,
                validatorFn         : this.resizeValidatorFn || Ext.emptyFn,
                validatorFnScope    : this
            }, this.resizeConfig || {}));

            this.on({
                beforedragcreate    : this.onBeforeDragCreate,
                beforetaskresize    : this.onBeforeTaskResize,
                taskresizestart     : this.onTaskResizeStart,
                aftertaskresize     : this.onTaskResizeEnd,
                scope: this
            });
        }

        if (this.enableTaskDragDrop) {
            // Seems we cannot use the gantt view el for the drag zone, it crashes IE9 in some cases.
            // See https://www.assembla.com/spaces/bryntum/tickets/716

            this.taskDragDrop = Ext.create("Gnt.feature.TaskDragDrop", this.ownerCt.el, Ext.apply({
                gantt               : this,
                validatorFn         : this.dndValidatorFn || Ext.emptyFn,
                validatorFnScope    : this
            }, this.dragDropConfig));

            this.on({
                beforetaskdrag  : this.onBeforeTaskDrag,
                taskdragstart   : this.onDragDropStart,
                aftertaskdrop   : this.onDragDropEnd,
                scope: this
            });
        }

        if (this.enableDragCreation) {
            this.dragCreator = Ext.create("Gnt.feature.DragCreator", Ext.apply({
                ganttView           : this,
                validatorFn         : this.createValidatorFn || Ext.emptyFn,
                validatorFnScope    : this
            }, this.createConfig));
        }
    },

    /**
     * Returns the template for the task. Override this template method to supply your own custom UI template for a certain type of task.
     *
     * @template
     * @protected
     * @param {Gnt.model.Task} task The task to get template for.
     * @param {Boolean} isBaseline True to return the template for a baseline version of the task.
     * @return {Gnt.template.Template} Template for the task.
     */
    getTemplateForTask : function (task, isBaseline) {
        if (task.isMilestone(isBaseline)) {
            return this.milestoneTemplate;
        }
        if (task.isLeaf()) {
            return this.eventTemplate;
        }
        return this.parentEventTemplate;
    },

    refreshParentNode : function (record) {

        var parent = record.parentNode;
        if (parent) {
            var index = this.store.indexOf(parent);
            if (index != -1) {
                this.refreshNode(index);
            }
        }
    },

    setShowRollupTasks : function (show) {

        this.showRollupTasks = show;

        var parentNodes = {};

        this.taskStore.getRootNode().cascadeBy(function (node) {

            if (node.getRollup()) {
                var parentNode = node.parentNode;

                parentNodes[parentNode.internalId] = parentNode;
            }
        });

        for (var id in parentNodes) {
            var index = this.store.indexOf(parentNodes[id]);

            if (index >= 0) {
                this.refreshNode(index);
            }
        }
    },

    //Todo combine generic parts this function with columnRenderer
    getRollupRenderData : function(parentModel){

        var rollupData = [];

        var ta = this.timeAxis,
            viewStart = ta.getStart(),
            viewEnd = ta.getEnd();

        for (var i = 0; i < parentModel.childNodes.length; i++) {

            var taskModel = parentModel.childNodes[i];

            if (taskModel.getRollup()) {

                var taskStart = taskModel.getStartDate(),
                    taskEnd = taskModel.getEndDate() || Sch.util.Date.add(taskStart, taskModel.getDurationUnit() || Sch.util.Date.DAY, 1);

                if (Sch.util.Date.intersectSpans(taskStart, taskEnd, viewStart, viewEnd)) {

                   var data = {}, isMileStone = taskModel.isMilestone();

                   data.isRollup = true;
                   data.id = 'rollup_' + taskModel.getId();

                    var endsOutsideView = taskEnd > viewEnd,
                        startsInsideView = Sch.util.Date.betweenLesser(taskStart, viewStart, viewEnd),
                        taskStartX = Math.floor(this.getXFromDate(startsInsideView ? taskStart : viewStart)),
                        taskEndX = Math.floor(this.getXFromDate(endsOutsideView ? viewEnd : taskEnd)),
                        itemWidth = isMileStone ? 0 : taskEndX - taskStartX;

                    data.offset = (isMileStone ? (taskEndX || taskStartX) - this.getXOffset(taskModel) : taskStartX);

                    data.tpl = isMileStone ? this.milestoneTemplate : this.eventTemplate;

                    data.cls = taskModel.getCls();
                    data.ctcls = '';

                    data.record = taskModel;

                    if (isMileStone) {
                        data.side = Math.round(0.5 * this.getRowHeight());
                        data.ctcls += " sch-gantt-milestone";
                    } else {
                        data.width = Math.max(1, itemWidth);

                        if (endsOutsideView) {
                            data.ctcls += ' sch-event-endsoutside ';
                        }

                        if (!startsInsideView) {
                            data.ctcls += ' sch-event-startsoutside ';
                        }

                        data.ctcls += " sch-gantt-task";
                    }

                    data.cls += " sch-rollup-task";

                    rollupData.push(data);
                }
            }
        }

        return rollupData;
    },

    getLabelRenderData : function (taskModel) {
        var lField = this.leftLabelField,
            rField = this.rightLabelField,
            tField = this.topLabelField,
            bField = this.bottomLabelField,
            renderData = {};

        if (lField) {
            renderData.leftLabel = Ext.util.Format.htmlEncode(lField.renderer.call(lField.scope || this, taskModel.data[lField.dataIndex], taskModel));
        }

        if (rField) {
            renderData.rightLabel = Ext.util.Format.htmlEncode(rField.renderer.call(rField.scope || this, taskModel.data[rField.dataIndex], taskModel));
        }

        if (tField) {
            renderData.topLabel = Ext.util.Format.htmlEncode(tField.renderer.call(tField.scope || this, taskModel.data[tField.dataIndex], taskModel));
        }

        if (bField) {
            renderData.bottomLabel = Ext.util.Format.htmlEncode(bField.renderer.call(bField.scope || this, taskModel.data[bField.dataIndex], taskModel));
        }

        return renderData;
    },

    // private
    columnRenderer    : function (value, meta, taskModel) {
        var taskStart   = taskModel.getStartDate(),
            ta          = this.timeAxis,
            D           = Sch.util.Date,
            tplData     = {},
            cellResult  = '',
            ctcls       = '',
            viewStart   = ta.getStart(),
            viewEnd     = ta.getEnd(),
            isMilestone = taskModel.isMilestone(),
            isLeaf      = taskModel.isLeaf(),
            labelsRenderDataPrepared = false,
            userData, startsInsideView, endsOutsideView;

        if (taskStart) {
            var taskEnd         = taskModel.getEndDate() || D.add(taskStart, taskModel.getDurationUnit() || D.DAY, 1),
                tick            = ta.getAt(0),
                // milliseconds per pixel ratio
                msPerPx         = (tick.getEndDate() - tick.getStartDate()) / this.timeAxisViewModel.getTickWidth(),
                timeDelta       = msPerPx * this.outsideLabelsGatherWidth,
                // if task belongs to the visible time span
                doRender        = D.intersectSpans(taskStart, taskEnd, viewStart, viewEnd),
                renderBuffer    = this.outsideLabelsGatherWidth > 0,
                // if task belongs to the buffered zone before/after visible time span
                renderAfter     = renderBuffer && D.intersectSpans(taskStart, taskEnd, viewEnd, new Date(viewEnd.getTime() + timeDelta)),
                renderBefore    = renderBuffer && D.intersectSpans(taskStart, taskEnd, new Date(viewStart.getTime() - timeDelta), viewStart);

            // if task belongs to the visible time span
            // or belongs to the buffered zone before/after visible time span
            if (doRender || renderAfter || renderBefore) {
                endsOutsideView     = taskEnd > viewEnd;
                startsInsideView    = D.betweenLesser(taskStart, viewStart, viewEnd);

                var taskStartX, taskEndX, itemWidth;

                // regular case ..task intersects visible time span
                if (doRender) {
                    taskStartX  = Math.floor(this.getXFromDate(startsInsideView ? taskStart : viewStart));
                    taskEndX    = Math.floor(this.getXFromDate(endsOutsideView ? viewEnd : taskEnd));
                    itemWidth   = isMilestone ? 0 : taskEndX - taskStartX;
                // task belongs to the buffered zone before/after visible time span
                } else {
                    startsInsideView = true;
                    itemWidth = 0;

                    if (renderAfter) {
                        taskStartX  = Math.floor(this.getXFromDate(viewEnd) + (taskStart - viewEnd) / msPerPx);
                    } else {
                        taskStartX  = Math.floor(this.getXFromDate(viewStart) - (viewStart - taskEnd) / msPerPx);
                    }
                }

                var taskOffset = isMilestone ? (taskEndX || taskStartX) - this.getXOffset(taskModel) : taskStartX;

                // if task is partially hidden progress bar should be rendered accordingly
                // eg. task is halfway done and rendered only half of the task
                // progress bar in this case should be hidden (width is 0)
                var percentDone = Math.min(taskModel.getPercentDone() || 0, 100) / 100,
                    percentDoneAtDate,
                    percentDoneX,
                    progressBarWidth;

                var parts   = taskModel.getSegments(),
                    segments;

                // if task is split
                if (parts) {
                    var percentDoneDuration = 0,
                        partsNumber         = parts.length,
                        i, part;

                    // since task is fragmented we cannot use just: (taskEnd - taskStart) * percentDone
                    // we have to get sum of all parts instead
                    for (i = 0; i < partsNumber; i++) {
                        part                = parts[i];
                        percentDoneDuration += (part.getEndDate() - part.getStartDate()) * percentDone;
                    }

                    segments    = [];

                    var partStartX, partEndX, partStartDate, partEndDate;

                    for (i = 0; i < partsNumber; i++) {

                        part            = parts[i];

                        var segment     = {},
                            segmentCls  = part.getCls() || '';

                        partEndDate     = part.getEndDate() || taskModel.getStartDate();
                        partStartDate   = part.getStartDate();

                        // if this segment starts in the visible area
                        if (D.betweenLesser(partStartDate, viewStart, viewEnd)) {
                            partStartX      = Math.floor(this.getXFromDate( partStartDate ));

                            // if it ends in visible area as well
                            if (D.betweenLesser(partEndDate, viewStart, viewEnd)) {
                                partEndX    = Math.floor(this.getXFromDate( partEndDate ));
                            } else {
                                partEndX    = Math.floor(this.getXFromDate( viewEnd ));
                            }

                        // if its start is invisible
                        } else {
                            partStartX  = Math.floor(this.getXFromDate( viewStart ));

                            // if end is visible
                            if (D.betweenLesser(partEndDate, viewStart, viewEnd)) {
                                partEndX    = Math.floor(this.getXFromDate( partEndDate ));

                            // if both ends are invisible lets move them outside of visible area
                            } else if (partStartDate > viewEnd && partEndDate > viewEnd) {
                                partStartX  = partEndX = Math.floor(this.getXFromDate( viewEnd )) + 100;
                            } else if (partStartDate < viewStart && partEndDate < viewStart) {
                                partStartX  = partEndX = Math.floor(this.getXFromDate( viewStart )) - 100;

                            // if segment start before view start and ends after view end
                            } else {
                                partEndX    = Math.floor(this.getXFromDate( viewEnd ));
                            }
                        }


                        segment.left    = partStartX - taskStartX;
                        segment.width   = partEndX - partStartX;

                        if (!percentDoneAtDate) {

                            percentDoneDuration     -= (partEndDate - partStartDate);

                            if (percentDoneDuration <= 0) {

                                percentDoneAtDate   = D.add(partEndDate, D.MILLI, percentDoneDuration);

                                // mark part that has progress bar slider
                                segmentCls          += ' sch-segment-in-progress';

                                percentDoneX        = Math.floor(this.getXFromDate(percentDoneAtDate));

                                // get progress bar size for this part
                                segment.progressBarWidth    = Math.min(Math.abs(percentDoneX - partStartX), segment.width);

                            // all parts before the time span that has "percentDoneAtDate" have 100% percent done
                            } else {
                                segment.progressBarWidth    = part.width;
                            }

                        // all parts after the time span that has "percentDoneAtDate" have zero percent done
                        } else {
                            segment.progressBarWidth        = 0;
                        }

                        segment.percentDone   = percentDone * 100;

                        Ext.apply(segment, part.data);

                        segment.cls             = segmentCls;
                        segment.SegmentIndex    = i;

                        segments.push(segment);
                    }

                    segments[0].cls                 += ' sch-gantt-task-segment-first';
                    segments[partsNumber - 1].cls   += ' sch-gantt-task-segment-last';

                // if task is NOT split
                } else {

                    // picks date between task start and end according to percentDone value
                    percentDoneAtDate = new Date((taskEnd - taskStart) * percentDone + taskStart.getTime());

                    if (percentDoneAtDate < viewStart) {
                        percentDoneAtDate = viewStart;
                    } else if (percentDoneAtDate > viewEnd) {
                        percentDoneAtDate = viewEnd;
                    }

                }

                percentDoneX = Math.floor(this.getXFromDate(percentDoneAtDate));

                // what if rtl?
                // in case task is rendered outside of view and has width 0, we should also set progress bar
                // width to 0 or progress bar will be visible as a 1px width vertical lines
                progressBarWidth = Math.min(Math.abs(percentDoneX - taskStartX), itemWidth);

                // Data provided to the Task XTemplate is composed in these steps
                //
                // 1. Get the default data from the Task Model
                // 2. Apply internal rendering properties: id, sizing, position etc
                // 3. Allow user to add extra properties at runtime using the eventRenderer template method
                tplData = Ext.apply({}, {
                    // Core properties
                    id               : taskModel.internalId,
                    offset           : taskOffset,
                    width            : Math.max(1, itemWidth),
                    ctcls            : '',
                    cls              : '',
                    print            : this._print,
                    record           : taskModel,
                    percentDone      : percentDone * 100,
                    progressBarWidth : Math.max(0, progressBarWidth - 2*this.eventBorderWidth),
                    segments         : segments
                }, taskModel.data);

                // Get data from user "renderer"
                userData = this.eventRenderer.call(this.eventRendererScope || this, taskModel, tplData, taskModel.store) || {};

                // Labels

                Ext.apply(tplData, this.getLabelRenderData(taskModel));

                labelsRenderDataPrepared = true;

                Ext.apply(tplData, userData);

                var dataCls = ' sch-event-resizable-' + taskModel.getResizable();

                if (isMilestone) {
                    tplData.side = Math.round((this.enableBaseline ? 0.4 : 0.5) * this.getRowHeight());
                    ctcls += " sch-gantt-milestone";
                } else {
                    tplData.width = Math.max(1, itemWidth);

                    if (endsOutsideView) {
                        ctcls += ' sch-event-endsoutside ';
                    }

                    if (!startsInsideView) {
                        ctcls += ' sch-event-startsoutside ';
                    }

                    if (isLeaf) {
                        ctcls += " sch-gantt-task";
                    } else {
                        ctcls += " sch-gantt-parent-task";
                    }
                }

                if (taskModel.dirty)                    dataCls += ' sch-dirty ';
                if (taskModel.isDraggable() === false)  dataCls += ' sch-event-fixed ';
                if (taskModel.isSegmented())            dataCls += ' sch-event-segmented ';

                tplData.cls = (tplData.cls || '') + (taskModel.getCls() || '') + dataCls;
                tplData.ctcls += ' ' + ctcls;

                if (this.showRollupTasks) {

                    var rollupData = this.getRollupRenderData(taskModel);

                    if (rollupData.length > 0) {
                        cellResult += this.rollupTemplate.apply(rollupData);
                    }
                }

                cellResult += this.getTemplateForTask(taskModel).apply(tplData);
            }
        }

        if (this.enableBaseline) {

            var taskBaselineStart           = taskModel.getBaselineStartDate(),
                taskBaselineEnd             = taskModel.getBaselineEndDate();

            if (!userData) {
                userData                    = this.eventRenderer.call(this, taskModel, tplData, taskModel.store) || {};
            }

            if (taskBaselineStart && taskBaselineEnd && D.intersectSpans(taskBaselineStart, taskBaselineEnd, viewStart, viewEnd)) {
                endsOutsideView             = taskBaselineEnd > viewEnd;
                startsInsideView            = D.betweenLesser(taskBaselineStart, viewStart, viewEnd);

                var isBaselineMilestone     = taskModel.isBaselineMilestone(),
                    baseStartX              = Math.floor(this.getXFromDate(startsInsideView ? taskBaselineStart : viewStart)),
                    baseEndX                = Math.floor(this.getXFromDate(endsOutsideView ? viewEnd : taskBaselineEnd)),
                    baseWidth               = Math.max(1, isBaselineMilestone ? 0 : baseEndX - baseStartX),
                    baseTpl                 = this.getTemplateForTask(taskModel, true),
                    data                    = {
                        progressBarStyle : userData.baseProgressBarStyle || '',
                        id               : taskModel.internalId + '-base',
                        // TODO this should use same rendering as the regular task
                        progressBarWidth : Math.min(100, taskModel.getBaselinePercentDone()) * baseWidth / 100,
                        percentDone      : taskModel.getBaselinePercentDone(),
                        offset           : isBaselineMilestone ? (baseEndX || baseStartX) - this.getXOffset(taskModel, true) : baseStartX,
                        print            : this._print,
                        width            : Math.max(1, baseWidth),
                        baseline         : true
                    };

                ctcls                       = '';

                if (isBaselineMilestone) {
                    data.side               = Math.round(0.40 * this.getRowHeight());
                    ctcls                   = "sch-gantt-milestone-baseline sch-gantt-baseline-item";
                } else if (taskModel.isLeaf()) {
                    ctcls                   = "sch-gantt-task-baseline sch-gantt-baseline-item";
                } else {
                    ctcls                   = "sch-gantt-parenttask-baseline sch-gantt-baseline-item";
                }

                if (endsOutsideView) {
                    ctcls                   += ' sch-event-endsoutside ';
                }

                if (!startsInsideView) {
                    ctcls                   += ' sch-event-startsoutside ';
                }

                // HACK, a bit inconsistent. 'basecls' should probably end up on the task el instead of the wrapper.
                data.ctcls                  = ctcls + ' ' + (userData.basecls || '');

                if (!labelsRenderDataPrepared) {
                    Ext.apply(data, this.getLabelRenderData(taskModel));
                }

                cellResult                  += baseTpl.apply(data);
            }
        }

        return cellResult;
    },


    setupTemplates : function () {

        var tplCfg = {
            leftLabel                : this.leftLabelField,
            rightLabel               : this.rightLabelField,
            topLabel                 : this.topLabelField,
            bottomLabel              : this.bottomLabelField,
            prefix                   : this.eventPrefix,
            resizeHandles            : this.resizeHandles,
            enableDependencyDragDrop : this.enableDependencyDragDrop !== false,
            allowParentTaskDependencies : this.allowParentTaskDependencies !== false,
            enableProgressBarResize  : this.enableProgressBarResize,
            rtl                      : this.rtl
        };

        var config;

        if (!this.eventTemplate) {
            config = this.taskBodyTemplate ? Ext.apply({ innerTpl : this.taskBodyTemplate }, tplCfg) : tplCfg;
            this.eventTemplate = Ext.create("Gnt.template.Task", config);
        }

        if (!this.parentEventTemplate) {
            config = this.parentTaskBodyTemplate ? Ext.apply({ innerTpl : this.parentTaskBodyTemplate }, tplCfg) : tplCfg;
            this.parentEventTemplate = Ext.create("Gnt.template.ParentTask", config);
        }

        if (!this.milestoneTemplate) {
            config = this.milestoneBodyTemplate ? Ext.apply({ innerTpl : this.milestoneBodyTemplate }, tplCfg) : tplCfg;
            this.milestoneTemplate = Ext.create("Gnt.template.Milestone", config);
        }

        if (!this.rollupTemplate) {
            this.rollupTemplate = Ext.create("Gnt.template.RollupTask", tplCfg);
        }

    },

    /**
     * Wrapper function returning the dependency manager instance
     * @return {Gnt.view.Dependency} dependencyManager The dependency manager instance
     */
    getDependencyView : function () {
        return this.dependencyView;
    },


    /**
     * Returns the associated task store
     * @return {Gnt.data.TaskStore}
     */
    getTaskStore     : function () {
        return this.taskStore;
    },

    // private
    initDependencies : function () {

        if (this.dependencyStore) {
            var me = this,
                dv = Ext.create("Gnt.view.Dependency", Ext.apply({
                    containerEl              : me.el,
                    ganttView                : me,
                    enableDependencyDragDrop : me.enableDependencyDragDrop,
                    allowParentTaskDependencies : me.allowParentTaskDependencies,
                    store                    : me.dependencyStore,
                    rtl                      : me.rtl
                }, this.dependencyViewConfig));

            dv.on({
                beforednd     : me.onBeforeDependencyDrag,
                dndstart      : me.onDependencyDragStart,
                drop          : me.onDependencyDrop,
                afterdnd      : me.onAfterDependencyDragDrop,
                scope         : me
            });

            me.dependencyView = dv;

            me.relayEvents(dv, [
            /**
             * @event dependencyclick
             * Fires after clicking on a dependency line/arrow
             * @param {Gnt.view.Dependency} view The dependency view instance
             * @param {Gnt.model.Dependency} record The dependency record
             * @param {Ext.EventObject} event The event object
             * @param {HTMLElement} target The target of this event
             */
                'dependencyclick',

            /**
             * @event dependencycontextmenu
             * Fires after right clicking on a dependency line/arrow
             * @param {Gnt.view.Dependency} view The dependency view instance
             * @param {Gnt.model.Dependency} record The dependency record
             * @param {Ext.EventObject} event The event object
             * @param {HTMLElement} target The target of this event
             */
                'dependencycontextmenu',

            /**
             * @event dependencydblclick
             * Fires after double clicking on a dependency line/arrow
             * @param {Gnt.view.Dependency} view The dependency view instance
             * @param {Gnt.model.Dependency} record The dependency record
             * @param {Ext.EventObject} event The event object
             * @param {HTMLElement} target The target of this event
             */
                'dependencydblclick'
            ]);
        }
    },

    // private
    setupGanttEvents : function () {
        var taskStore = this.taskStore;

        if (this.toggleParentTasksOnClick) {
            this.on({
                taskclick : function (view, model) {

                    if (!model.isLeaf() && (!taskStore.isTreeFiltered() || taskStore.allowExpandCollapseWhileFiltered)) {
                        var me = this;

                        // Since row is being repainted in the DOM, no native 'dblclick' event will be fired
                        // We need to detect this case and fake it
                        var dblClickHandler = function() {
                            this.fireEvent.apply(this, ['taskdblclick'].concat(Array.prototype.slice.apply(arguments)));
                        };

                        this.on('taskclick', dblClickHandler);

                        // Remove listener after 300ms
                        setTimeout(function() {
                            me.un('taskclick', dblClickHandler);
                        }, 300);

                        model.isExpanded() ? model.collapse() : model.expand();
                    }
                }
            });
        }
    },

    // private
    configureLabels  : function () {

        var defaults = {
            renderer  : function (v) {
                return v;
            },
            dataIndex : undefined
        };

        Ext.Array.forEach(['left', 'right', 'top', 'bottom'], function(pos) {

            var field = this[pos+'LabelField'];

            if (field) {
                if (Ext.isString(field)) {
                    field = this[pos + 'LabelField'] = { dataIndex : field };
                }
                Ext.applyIf(field, defaults);

                // Initialize editor (if defined)
                if (field.editor) {
                    field.editor = Ext.create("Gnt.feature.LabelEditor", this, {
                        labelPosition : pos,
                        field         : field.editor,
                        dataIndex     : field.dataIndex
                    });
                }
            }
        }, this);

        this.on('labeledit_beforestartedit', this.onBeforeLabelEdit, this);
    },

    // private
    onBeforeTaskDrag : function (p, record) {
        return !this.readOnly && record.isDraggable() !== false && (this.allowParentTaskMove || record.isLeaf());
    },

    onDragDropStart : function () {
        if (this.tip) {
            // HACK tip disable doesn't work in Ext 5.1
            // http://www.sencha.com/forum/showthread.php?296286-Ext.Tooltip-disable-doesn-t-work-in-5.1&p=1081931#post1081931
            this.tip.on('beforeshow', this.falseReturningFn);
        }
    },

    falseReturningFn : function() { return false; },

    onDragDropEnd : function () {
        if (this.tip) {
            this.tip.un('beforeshow', this.falseReturningFn);
        }
    },

    onTaskProgressBarResizeStart : function () {
        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }
    },

    onTaskProgressBarResizeEnd : function () {
        if (this.tip) {
            this.tip.enable();
        }
    },

    onTaskResizeStart : function () {
        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }

        // TODO review for Ext 5.1.
        // While resizing a task, we don't want the scroller to interfere
        if (this.scrollManager) {
            this.scrollManager.scroller.setDisabled(true);
        }
    },

    onTaskResizeEnd    : function () {
        if (this.tip) {
            this.tip.enable();
        }

        // TODO review for Ext 5.1.
        // While resizing a task, we don't want the scroller to interfere
        if (this.scrollManager) {
            this.scrollManager.scroller.setDisabled(false);
        }
    },

    // private
    onBeforeDragCreate : function () {
        return !this.readOnly;
    },

    // private
    onBeforeTaskResize : function (view, task) {
        return !this.readOnly && task.getSchedulingMode() !== 'EffortDriven';
    },

    onBeforeTaskProgressBarResize : function () {
        return !this.readOnly;
    },

    onBeforeLabelEdit : function () {
        return !this.readOnly;
    },

    onBeforeEdit : function () {
        return !this.readOnly;
    },

    afterRender : function () {
        this.initDependencies();
        this.callParent(arguments);

        this.el.on('mousemove', this.configureFeatures, this, { single : true });

        Ext.dd.ScrollManager.register(this.el);
    },

    resolveTaskRecord : function (el) {
        var node = this.findItemByChild(el);

        if (node) {
            return this.getRecord(this.findItemByChild(el));
        }
        return null;
    },

    resolveEventRecord : function (el) {
        return this.resolveTaskRecord(el);
    },

    resolveEventRecordFromResourceRow: function (el) {
        return this.resolveTaskRecord(el);
    },

    /**
     * Highlights a task and optionally any dependent tasks. Highlighting will add the `sch-gantt-task-highlighted`
     * class to the task's row.
     *
     * @param {Mixed} task Either a task record or the id of a task
     * @param {Boolean} highlightDependentTasks `true` to highlight the depended tasks. Defaults to `true`
     *
     */
    highlightTask : function (task, highlightDependentTasks) {
        if (!(task instanceof Ext.data.Model)) {
            task = this.taskStore.getNodeById(task);
        }

        if (task) {
            task.isHighlighted = true;

            var el = this.getNode(task);
            if (el) {
                Ext.fly(el).addCls('sch-gantt-task-highlighted');
            }

            if (highlightDependentTasks !== false) {
                for (var i = 0, l = task.successors.length; i < l; i++) {
                    var dep     = task.successors[ i ];

                    this.highlightDependency(dep);
                    this.highlightTask(dep.getTargetTask(), highlightDependentTasks);
                }
            }
        }
    },


    /**
     * Un-highlights a task and optionally any dependent tasks.
     *
     * @param {Mixed} task Either a task record or the id of a task
     * @param {Boolean} includeSuccessorTasks `true` to also highlight successor tasks. Defaults to `true`
     *
     */
    unhighlightTask : function (task, includeSuccessorTasks) {
        if (!(task instanceof Ext.data.Model)) {
            task = this.taskStore.getNodeById(task);
        }

        if (task) {
            task.isHighlighted = false;

            var el = this.getNode(task);
            if (el) {
                Ext.fly(el).removeCls('sch-gantt-task-highlighted');
            }

            if (includeSuccessorTasks !== false) {
                for (var i = 0, l = task.successors.length; i < l; i++) {
                    var dep     = task.successors[ i ];

                    this.unhighlightDependency(dep);
                    this.unhighlightTask(dep.getTargetTask(), includeSuccessorTasks);
                }
            }
        }
    },


    getRowClass : function (task) {
        var cls = '';

        if (task.isHighlighted) cls = 'sch-gantt-task-highlighted';

        if (this.externalGetRowClass) cls += ' ' + (this.externalGetRowClass.apply(this, arguments) || '');

        return cls;
    },


    // private
    clearSelectedTasksAndDependencies : function () {
        this.getDependencyView().clearSelectedDependencies();
        this.el.select('tr.sch-gantt-task-highlighted').removeCls('sch-gantt-task-highlighted');

        this.taskStore.getRootNode().cascadeBy(function (task) {
            task.isHighlighted = false;
        });
    },


    /**
     * Returns the critical path(s) that can affect the end date of the project
     * @return {Array} paths An array of arrays (containing task chains)
     */
    getCriticalPaths : function () {
        return this.taskStore.getCriticalPaths();
    },


    /**
     * Highlights the critical path(s) that can affect the end date of the project.
     */
    highlightCriticalPaths : function () {
        // First clear any selected tasks/dependencies
        this.clearSelectedTasksAndDependencies();

        var paths   = this.getCriticalPaths(),
            dm      = this.getDependencyView(),
            t, i, l, depRecord;

        Ext.each(paths, function (tasks) {
            for (i = 0, l = tasks.length; i < l; i++) {
                t = tasks[i];
                this.highlightTask(t, false);

                if (i < l - 1) {

                    for (var j = 0, m = t.predecessors.length; j < m; j++) {
                        if (t.predecessors[j].getSourceId() == tasks[i + 1].getInternalId()) {
                            depRecord = t.predecessors[j];
                            break;
                        }
                    }

                    dm.highlightDependency(depRecord);
                }
            }
        }, this);

        this.addCls('sch-gantt-critical-chain');
    },


    /**
     * Removes the highlighting of the critical path(s).
     */
    unhighlightCriticalPaths : function () {
        this.el.removeCls('sch-gantt-critical-chain');

        this.clearSelectedTasksAndDependencies();
    },


    //private
    getXOffset               : function (task, isBaseline) {
        var offset      = 0;

        if (task.isMilestone(isBaseline)) {
            // For milestones, the offset should be half the square diagonal
            offset      = Math.floor(this.getRowHeight() * Math.sqrt(2) / 4) - 2;
        }

        return offset;
    },

    //private
    onDestroy                : function () {
        if (this.dependencyView) {
            this.dependencyView.destroy();
        }

        if (this.rendered) Ext.dd.ScrollManager.unregister(this.el);

        this.callParent(arguments);
    },

    /**
     * Convenience method wrapping the dependency manager method which highlights the elements representing a particular dependency
     * @param {Mixed} record Either the id of a record or a record in the dependency store
     */
    highlightDependency : function (record) {
        this.dependencyView.highlightDependency(record);
    },

    /**
     * Convenience method wrapping the dependency manager method which unhighlights the elements representing a particular dependency
     * @param {Mixed} depId Either the id of a record or a record in the dependency store
     */
    unhighlightDependency  : function (record) {
        this.dependencyView.unhighlightDependency(record);
    },


    // private
    onBeforeDependencyDrag : function (dm, sourceTask) {
        return this.fireEvent('beforedependencydrag', this, sourceTask);
    },

    // private
    onDependencyDragStart  : function (dm) {
        this.fireEvent('dependencydragstart', this);

        if (this.tip) {
            this.tip.disable();
        }

        this.preventOverCls = true;
    },

    onDependencyDrop          : function (dm, fromId, toId, type) {
        this.fireEvent('dependencydrop', this, this.taskStore.getNodeById(fromId), this.taskStore.getNodeById(toId), type);
    },

    // private
    onAfterDependencyDragDrop : function () {
        this.fireEvent('afterdependencydragdrop', this);

        // Enable tooltip after drag again
        if (this.tip) {
            this.tip.enable();
        }

        this.preventOverCls = false;
    },

    /**
     * Returns the editor defined for the left task field
     * @return {Gnt.feature.LabelEditor} editor The editor
     */
    getLeftEditor : function () {
        return this.leftLabelField.editor;
    },

    /**
     * Returns the editor defined for the right task field
     * @return {Gnt.feature.LabelEditor} editor The editor
     */
    getRightEditor : function () {
        return this.rightLabelField.editor;
    },

    /**
     * Returns the editor defined for the top task field
     * @return {Gnt.feature.LabelEditor} editor The editor
     */
    getTopEditor : function () {
        return this.topLabelField.editor;
    },

    /**
     * Returns the editor defined for the bottom task field
     * @return {Gnt.feature.LabelEditor} editor The editor
     */
    getBottomEditor : function () {
        return this.bottomLabelField.editor;
    },

    /**
     * Programmatically activates the editor for the left field
     * @param {Gnt.model.Task} record The task record
     */
    editLeftLabel : function (record) {
        var ed = this.leftLabelField && this.leftLabelField.editor;
        if (ed) {
            ed.edit(record);
        }
    },

    /**
     * Programmatically activates the editor for the right field
     * @param {Gnt.model.Task} record The task record
     */
    editRightLabel                 : function (record) {
        var ed = this.rightLabelField && this.rightLabelField.editor;
        if (ed) {
            ed.edit(record);
        }
    },

    /**
     * Programmatically activates the editor for the top field
     * @param {Gnt.model.Task} record The task record
     */
    editTopLabel : function (record) {
        var ed = this.topLabelField && this.topLabelField.editor;
        if (ed) {
            ed.edit(record);
        }
    },

    /**
     * Programmatically activates the editor for the bottom field
     * @param {Gnt.model.Task} record The task record
     */
    editBottomLabel                 : function (record) {
        var ed = this.bottomLabelField && this.bottomLabelField.editor;
        if (ed) {
            ed.edit(record);
        }
    },

    // symmetric method `getElementFromEventRecord` - always returns the outer-most element for event/task in both scheduler/gantt
    getOuterElementFromEventRecord : function (record) {
        var prev = this.callParent([ record ]);

        return prev && prev.up(this.eventWrapSelector) || null;
    },


    // deprecated
    getDependenciesForTask         : function (record) {
        // <debug>
        window.console && console.warn && console.warn('`ganttPanel.getDependenciesForTask()` is deprecated, use `task.getAllDependencies()` instead');
        // </debug>
        return record.getAllDependencies();
    },

    // Performance tweak, preventing extra layout cycles
    // @OVERRIDE
    //onAdd                          : function () {
    //    Ext.suspendLayouts();
    //    this.callParent(arguments);
    //    Ext.resumeLayouts();
    //},

    // Performance tweak, preventing extra layout cycles
    // @OVERRIDE
    //onRemove                       : function () {
    //    Ext.suspendLayouts();
    //    this.callParent(arguments);
    //    Ext.resumeLayouts();
    //},

    // @OVERRIDE
    // Preventing extra reflows due to the expensive re-layout performed by the superclass
    onUpdate                       : function (store, record, operation, changedFieldNames) {
        //Ext.suspendLayouts();
        this.callParent(arguments);
        //Ext.resumeLayouts();

        // The code below will handle the redraw when user does "setRollup" on some task
        // However generally the parent tasks are refreshed at the end of the cascading in the `onAfterCascade` method
        // of the Gnt.panel.Gantt
        var prev = record.previous;

        if (prev && (record.rollupField in prev || record.getRollup())) {
            this.refreshParentNode(record);
        }
    },


    handleScheduleEvent : function (e) {
        var t = e.getTarget('.' + this.timeCellCls, 3);

        if (t) {
            var rowNode = this.findRowByChild(t);

            if (e.type.indexOf('pinch') >= 0) {
                    this.fireEvent('schedule' + e.type, this, e);
            } else {
                this.fireEvent('schedule' + e.type, this, this.getDateFromDomEvent(e, 'floor'), this.indexOf(rowNode), e);
            }
        }
    },


    /**
     *  Scrolls a task record into the viewport.
     *  This method will also expand all relevant parent nodes to locate the event.
     *
     *  @param {Gnt.model.Task} taskRec, the task record to scroll into view
     *  @param {Boolean/Object} highlight, either `true/false` or a highlight config object used to highlight the element after scrolling it into view
     *  @param {Boolean/Object} animate, either `true/false` or an animation config object used to scroll the element
     */
    scrollEventIntoView : function (taskRec, highlight, animate, callback, scope) {
        scope = scope || this;

        var me = this;
        var taskStore = this.taskStore;

        var basicScroll = function (el, scrollHorizontally) {

            // HACK
            // After a time axis change, the header is resized and Ext JS TablePanel reacts to the size change.
            // Ext JS reacts after a short delay, so we cancel this task to prevent Ext from messing up the scroll sync
            me.up('panel').scrollTask.cancel();

            me.scrollElementIntoView(el, scrollHorizontally, animate);

            if (highlight) {
                if (typeof highlight === "boolean") {
                    el.highlight();
                } else {
                    el.highlight(null, highlight);
                }
            }

            // XXX callback will be called too early, need to wait for scroll & highlight to complete
            callback && callback.call(scope);
        };

        // Make sure the resource is expanded all the way up first.
        if (!taskRec.isVisible()) {
            taskRec.bubble(function (node) {
                node.expand();
            });
        }

        var targetEl;

        var startDate = taskRec.getStartDate();
        var endDate = taskRec.getEndDate();
        var isScheduled = Boolean(startDate && endDate);

        if (isScheduled) {
            var timeAxis = this.timeAxis;

            // If task is not in the currently viewed time span, change time span
            if (!timeAxis.dateInAxis(startDate) || !timeAxis.dateInAxis(endDate)) {
                var range = timeAxis.getEnd() - timeAxis.getStart();

                timeAxis.setTimeSpan(new Date(startDate.getTime() - range / 2), new Date(endDate.getTime() + range / 2));
            }
            targetEl = this.getElementFromEventRecord(taskRec);
        } else {
            // No date information in the task, scroll to row element instead
            targetEl = this.getNode(taskRec);

            if (targetEl) {
                targetEl = Ext.fly(targetEl).down(this.getCellSelector());
            }
        }

        if (targetEl) {
            basicScroll(targetEl, isScheduled);
        } else {
            if (this.bufferedRenderer) {

                Ext.Function.defer(function () {
                    me.bufferedRenderer.scrollTo(taskStore.getIndexInTotalDataset(taskRec), false, function () {
                        // el should be present now
                        var targetEl = me.getElementFromEventRecord(taskRec);

                        if (targetEl) {
                            basicScroll(targetEl, true);
                        } else {
                            callback && callback.call(scope);
                        }
                    });

                }, 10);
            }
        }
    }
});
