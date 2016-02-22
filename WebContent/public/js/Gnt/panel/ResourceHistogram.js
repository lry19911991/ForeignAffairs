/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.panel.ResourceHistogram
@extends Sch.panel.TimelineGridPanel

A histogram panel, which allows you to visualize resource utilization and highlight overallocation.
The panel is a subclass of the Ext.grid.Panel class so any normal grid configs can be applied to it.

#Two ways of using

You can either use this widget as a standalone panel or it can be used together with a {@link Gnt.panel.Gantt gantt panel}.
When using it together with a {@link Gnt.panel.Gantt gantt panel} you need to specify its instance as the {@link Sch.mixin.TimelinePanel#partnerTimelinePanel partnerTimelinePanel} config.

#Predefined columns

The panel has a default set of columns which is used if no `columns` config has been specified.
The default columns include a resource name column and a {@link Gnt.column.Scale scale column} to display a resource utilization scale.

For example in the following code snippet, the histogram will be created with a default set of columns:

    var histogram = Ext.create('Gnt.panel.ResourceHistogram', {
        taskStore           : taskStore,
        resourceStore       : resourceStore,
        viewPreset          : 'weekAndDayLetter',
        startDate           : new Date(2010, 0, 11),
        endDate             : new Date(2010, 1, 11),
        renderTo            : Ext.getBody()
    });


{@img gantt/images/histogram-panel.png}

*/
Ext.define('Gnt.panel.ResourceHistogram', {
    extend                  : 'Sch.panel.TimelineGridPanel',

    requires                : [
        'Ext.XTemplate',
        'Sch.util.Date',
        'Gnt.feature.WorkingTime',
        'Gnt.column.Scale',
        'Gnt.view.ResourceHistogram'
    ],

    alias                   : 'widget.resourcehistogram',

    viewType                : 'resourcehistogramview',

    layout                  : 'border',

    preserveScrollOnRefresh : true,

    /**
     * @cfg {Ext.XTemplate} barTpl The template used to render the bars in the histogram view.
     *
     * When specifying a custom template please make sure that the bar element must have:
     *
     *  - unique `id` attribute, like this: ... id="{id}" ...
     *  - `gnt-bar-index` attribute defined this way: ... gnt-bar-index="{index}" ...
     *  - support for {@link #barCls} config.
     *  - support bar labels
     *
     * Please take a look at the default markup of this template to see an example of how the above restrictions can be applied:
     *
     *      this.barTpl = new Ext.XTemplate(
     *          '<tpl for=".">',
     *              '<div id="{id}" class="'+ this.barCls +' {cls}" gnt-bar-index="{index}" style="left:{left}px;top:{top}px;height:{height}px;width:{width}px"></div>',
     *              // here we check if this bar should have a label
     *              '<tpl if="text !== \'\'">',
     *                  '<span class="'+ this.barCls +'-text" style="left:{left}px;">{text}</span>',
     *              '</tpl>',
     *          '</tpl>'
     *      );
     *
     * See {@link Ext.XTemplate} for more information on templates syntax.
     */

    /**
     * @cfg {Function} barRenderer Use this function to create context object for renderer.
     *
     *      this.barRenderer = function (data) {
     *          var task = data.assignments[0].getTask();
     *
     *          return {
     *              taskName : task.getName()
     *          }
     *      }
     *
     * @param {Number} resourceId Id of the current resource
     *
     * @param {Object} allocationData
     * @param {Data} allocationData.startDate Bar start date
     * @param {Data} allocationData.endDate Bar end date
     * @param {Int} allocationData.allocationMS Duration of rendering bar
     * @param {Number} allocationData.totalAllocation Allocation of resource in percent
     * @param {Gnt.model.Assignment[]} allocationData.assignments Assignments for current resource
     *
     * @return {Object} Specify properties you would like to use in your {@link #barTpl template}
     */

    /**
     * @cfg {String} barCls The CSS class to apply to rendered bars in the histogram view.
     * This can be used if you want to implement your own bar styling.
     */

    /**
     * @cfg {Ext.XTemplate} lineTpl The template used to render the scale line in the histogram view.
     */

    /**
     * @cfg {String} lineCls The CSS class to apply to scale lines in the histogram view.
     * This can be used if you want to implement your own line styling.
     */

    /**
     * @cfg {Ext.XTemplate} limitLineTpl The template used to render the maximum resource utilization line in the histogram view.
     */

    /**
     * @cfg {String} limitLineCls The CSS class to apply to the maximum resource utilization lines in the histogram view.
     * This can be used if you want to implement your own line styling.
     */

    /**
     * @cfg {Number} limitLineWidth The width of the maximum resource utilization line. Used for the line coordinates calculations.
     * Should be specified only if the width of that utilization line was changed as result of any custom styling.
     */

    /**
     * @cfg {Mixed} labelMode Defines the type of scale labels to be used or disables labels completely.
     * Possible values are:
     *
     *  - empty string or `false` to disable labels (default).
     *  - `units` - displays the per day allocation in {@link #scaleUnit units}.
     *  - `percent` - displays the per day allocation in percents.
     *  - any other non-empty value will be considered as compiled `Ext.XTemplate` instance.
     */

    /**
     * @cfg {String} labelPercentFormat Defines the label format to use when the {@link #labelMode} is set to `percent`.
     *
     * For more details on format usage please refer to the `Ext.util.Format.number` method description.
     */

    /**
     * @cfg {String} labelUnitsFormat Defines the label format to use when the {@link #labelMode} is set to `units`.
     *
     * For more details on format usage please refer to the `Ext.util.Format.number` method description.
     */

    /**
     * @cfg {Object[]} scalePoints Alternative way of defining the utilization scale.
     * Can be used instead of setting {@link #scaleMin}, {@link #scaleMax}, {@link #scaleStep} configs.
     * When using the default columns, this config will be applied to the {@link Gnt.column.Scale} instance.
     *
     * For usage details please refer to the {@link Gnt.column.Scale#scalePoints scalePoints} property.
     */

    /**
     * @cfg {Boolean} showScaleLines Whether to show scale lines or not.
     */
    showScaleLines          : false,

    /**
     * @cfg {Boolean} showLimitLines
     * Whether to show maximum resource allocation lines or not.
     * See {@link #showVerticalLimitLines} to disable vertical segments of the lines drawing.
     */
    showLimitLines          : true,

    /**
     * @cfg {Number} showLimitLinesThreshold Sets the histogram to show maximum resource allocation lines only wider than specified width in pixels.
     * This option allows to get rid of redundant details during zooming out (which also implicitly raises performance).
     * When line has smaller size than the provided value the histogram will merge it with neighbor segments and approximate its level.
     * Use {@link #showLimitLines} to completely disable resource allocation lines rendering.
     */
    showLimitLinesThreshold : 10,

    /**
     * @cfg {Boolean} showVerticalLimitLines
     * Set this to false to not render vertical segments of maximum resource allocation lines.
     * This implicitly raises performance due to reducing the number of DOM elements being generated.
     */
    showVerticalLimitLines  : true,

    calendarListeners       : null,

    calendarListenersHash   : null,

    /**
     * @cfg {Gnt.data.Calendar} calendar A {@link Gnt.data.Calendar calendar} instance for this histogram panel. Can be also provided
     * as a {@link Gnt.data.TaskStore#calendar configuration option} of the `taskStore`.
     *
     * **Please note,** that this option is required if the {@link #taskStore} option is not specified.
     */
    calendar                : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore The {@link Gnt.data.TaskStore store} holding the tasks.
     * When using this option, the histogram will instantly reflect any changes made to a task.
     *
     * **Please note,** that this option is required if the {@link #calendar} option is not specified.
     */
    taskStore               : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore The {@link Gnt.data.ResourceStore store} holding the resources to be rendered into the histogram (required).
     *
     * See also {@link Gnt.model.Resource}
     */
    resourceStore           : null,

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore The {@link Gnt.data.AssignmentStore store} holding the assignments information (optional).
     *
     * If not specified, it will be taken from the {@link #resourceStore} or {@link #taskStore}.
     *
     * See also {@link Gnt.model.Assignment}
     */
    assignmentStore         : null,

    /**
     * @cfg {Date} startDate Defines the start date of this panel.
     *
     * **Note:** This option is **required** if a {@link Sch.mixin.TimelinePanel#partnerTimelinePanel partnerTimelinePanel} is not specified.
     */
    startDate               : null,

    /**
     * @cfg {Date} endDate Defines the end date of this panel.
     *
     * **Note:** This option is **required** if a {@link Sch.mixin.TimelinePanel#partnerTimelinePanel partnerTimelinePanel} is not specified.
     */
    endDate                 : null,

    /**
     * @cfg {Boolean} highlightWeekends `True` to highlight weekends and holidays, using the {@link Gnt.feature.WorkingTime} plugin.
     */
    highlightWeekends       : true,

    allocationData          : null,

    /**
     * @cfg {String} scaleUnit Name of the resource utilization scale unit. `Sch.util.Date` constants can be used, like `Sch.util.Date.HOUR`.
     */
    scaleUnit               : 'HOUR',

    /**
     * @cfg {Number} scaleMin Minimum for the resource utilization scale (required).
     */
    scaleMin                : 0,

    /**
     * @cfg {Number} scaleMax Maximum for the resource utilization scale.
     *
     * **Note:** this option is **required** except in cases when you use {@link #scalePoints} to define utilization scale.
     */
    scaleMax                : 24,

    /**
     * @cfg {Number} scaleLabelStep Defines the interval between two adjacent scale lines which have labels.
     * The histogram itself does not render any labels but corresponding lines will get a specific CSS class for styling purposes.
     */
    scaleLabelStep          : 4,

    /**
     * @cfg {Number} scaleStep Defines the interval between two adjacent scale lines.
     *
     * **Also,** this value is used as a margin between the top scale line (defined by {@lin #scaleMax} option) and the top border of the cell
     * containing the histogram for a resource.
     */
    scaleStep               : 2,

    rowHeight               : 50,

    /**
     * @cfg {String} resourceText The text to show in the resource name column header (which is used for the default columns).
     */
    resourceText            : 'Resource',

    scaleColumnConfigs      : [ 'scalePoints', 'scaleStep', 'scaleLabelStep', 'scaleMin', 'scaleMax', 'scaleLabelStep', 'scaleStep' ],

    normalViewConfigs       : [
        'barCls', 'barTpl', 'barRenderer', 'lineTpl', 'lineCls', 'limitLineTpl', 'limitLineCls', 'limitLineWidth', 'labelMode', 'labelPercentFormat', 'labelUnitsFormat',
        'scaleMin', 'scaleMax', 'scaleStep', 'loadMask', 'showLimitLinesThreshold', 'showVerticalLimitLines'
    ],

    // private
    initComponent : function () {
        this.lockedViewConfig = this.lockedViewConfig || {};
        this.normalViewConfig = this.normalViewConfig || {};

        this.normalViewConfig.histogram = this;
        this.normalViewConfig.trackOver = false;

        this.lockedGridConfig = this.lockedGridConfig || {};

        Ext.applyIf(this.lockedGridConfig, {
            reserveScrollbar    : false,
            width               : 300,
            forceFit            : true
        });

        // Copy some properties to the view instance
        this.lockedViewConfig.rowHeight                = this.normalViewConfig.rowHeight = this.rowHeight;
        this.lockedViewConfig.preserveScrollOnRefresh  = this.normalViewConfig.preserveScrollOnRefresh = this.preserveScrollOnRefresh;

        // if scale was specified by scalePoints
        if (this.scalePoints) {
            this.scalePoints.sort(function (a, b) { return a.value > b.value ? 1 : -1; });

            this.scaleMin   = this.scalePoints[0].value;
            this.scaleMax   = this.scalePoints[this.scalePoints.length - 1].value;
            this.scaleStep  = (this.scaleMax - this.scaleMin) / 10;
        }

        // if CrudManager is used let's grab store references from it
        if (this.crudManager) {
            this.taskStore          = this.taskStore || this.crudManager.getTaskStore();
            this.resourceStore      = this.resourceStore || this.crudManager.getResourceStore();
            this.assignmentStore    = this.assignmentStore || this.crudManager.getAssignmentStore();
        }

        this.initColumns();

        // relay some configs to the view instance
        Ext.Array.forEach( this.normalViewConfigs, function (prop) {
            if (prop in this) this.normalViewConfig[prop] = this[prop];
        }, this);

        // resourceStore act as store for our grid
        this.store      = this.resourceStore;

        this.taskStore  = this.taskStore || this.store.getTaskStore();

        if (this.taskStore) {
            this.mon(this.taskStore, {
                refresh     : this.onTaskStoreRefresh,
                // EtxJS5: tree store doesn't fire 'refresh' on load completion so we listen to 'load' as well
                load        : this.onTaskStoreRefresh,
                update      : this.onTaskUpdate,
                // we listen to append to support twisted case when someone first adds assignment and then adds a task
                nodeappend  : this.onTaskUpdate,

                scope       : this
            });
        }

        // get project calendar
        this.calendar   = this.calendar || this.taskStore && this.taskStore.getCalendar();

        if (!this.calendar) throw 'Cannot get project calendar instance: please specify either "calendar" or "taskStore" option';

        // on calendar change we rebuild bars & re-render grid
        this.mon(this.calendar, {
            calendarchange  : this.onProjectCalendarChange,
            scope           : this
        });

        // bind listeners to resources calendars
        this.bindCalendarListeners();

        this.assignmentStore = this.assignmentStore || this.store.getAssignmentStore() || this.taskStore && this.taskStore.getAssignmentStore();

        if (this.assignmentStore) {
            // on assignments change we update corresponding resource row
            this.mon(this.assignmentStore, {
                refresh : this.onAssignmentsRefresh,
                remove  : this.onAssignmentsChange,
                update  : this.onAssignmentsChange,
                add     : this.onAssignmentsChange,

                scope   : this
            });
        }

        this.plugins    = [].concat(this.plugins || []);

        // if we need to highlight weekends
        if (this.highlightWeekends) {

            this.initWeekendsHightlight();
        }

        this.callParent(arguments);

        var cls     = 'gnt-resourcehistogram sch-horizontal ';

        // if we need to highlight weekends
        if (this.highlightWeekends) {
            cls     += ' gnt-resourcehistogram-highlightweekends ';
        }

        this.addCls(cls);

        var view = this.getSchedulingView();

        // register our renderer
        this.registerRenderer(this.columnRenderer, this);

        this.relayEvents(view, [
            /**
            * @event barclick
            * Fires when a histogram bar is clicked
            *
            * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
            * @param {Object} context Object containing a description of the clicked bar.
            * @param {Gnt.model.Resource} context.resource The resource record.
            * @param {Date} context.startDate Start date of corresponding period.
            * @param {Date} context.endDate End date of corresponding period.
            * @param {Number} context.allocationMS Resource allocation time in milliseconds.
            * @param {Number} context.totalAllocation Resource allocation (in percents).
            * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
            * @param {Ext.EventObject} e The event object
            */
            'barclick',
            /**
            * @event bardblclick
            * Fires when a histogram bar is double clicked
            *
            * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
            * @param {Object} context Object containing description of clicked bar.
            * @param {Gnt.model.Resource} context.resource The resource record.
            * @param {Date} context.startDate Start date of corresponding period.
            * @param {Date} context.endDate End date of corresponding period.
            * @param {Number} context.allocationMS Resource allocation time in milliseconds.
            * @param {Number} context.totalAllocation Resource allocation (in percents).
            * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
            * @param {Ext.EventObject} e The event object
            */
            'bardblclick',
            /**
            * @event barcontextmenu
            * Fires when contextmenu is activated on a histogram bar
            *
            * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
            * @param {Object} context Object containing description of clicked bar.
            * @param {Gnt.model.Resource} context.resource The resource record.
            * @param {Date} context.startDate Start date of corresponding period.
            * @param {Date} context.endDate End date of corresponding period.
            * @param {Number} context.allocationMS Resource allocation time in milliseconds.
            * @param {Number} context.totalAllocation Resource allocation (in percents).
            * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
            * @param {Ext.EventObject} e The event object
            */
            'barcontextmenu'
        ]);

        if (!this.syncRowHeight) this.enableRowHeightInjection(this.lockedGrid.getView(), this.normalGrid.getView());

        // Initializing the allication cache
        this.resetAllocationDataCache();

        this.mon(this.store, {
            update  : this.onResourceUpdate,
            refresh : this.onResourceStoreRefresh,

            scope   : this,
            priority : 100
        });
    },


    createDefaultColumns : function () {
        var columns         = [],
            resourceNameCol,
            scaleCol;

        resourceNameCol = this.resourceNameCol = new Ext.grid.column.Column({
            flex        : 1,
            resizable   : false,
            header      : this.resourceText,
            dataIndex   : this.resourceStore.model.prototype.nameField
        });

        columns.push(resourceNameCol);

        scaleCol        = { width : 40, resizable : false };

        // map some scale column configs from this panel
        Ext.Array.forEach( this.scaleColumnConfigs, function (prop) {
            scaleCol[prop] = this[prop];
        }, this );

        scaleCol = this.scaleCol = new Gnt.column.Scale(scaleCol);

        // before column render we'll give it information about row height
        this.mon(scaleCol, {
            beforerender    : function () {
                scaleCol.setAvailableHeight(this.getSchedulingView().getAvailableRowHeight());

                if (this.scalePoints) {
                    // we update scalePoints since it was
                    // filled in with calculated top-coordinates
                    this.scalePoints    = scaleCol.scalePoints;
                }
            },
            scope           : this,
            single          : true
        });

        columns.push(scaleCol);

        return columns;
    },


    initColumns : function () {
        // if no columns provided we'll generate default column set: resource name & scale
        if (!this.columns) {

            this.columns    = this.createDefaultColumns();

            var scaleCol    = this.scaleCol;

            // if scale was specified by scalePoints let's set params equal to scale column ones
            // since they were calculated there
            if (this.scalePoints) {
                this.scaleMin       = scaleCol.scaleMin;
                this.scaleMax       = scaleCol.scaleMax;
                this.scaleStep      = scaleCol.scaleStep;
            }

        // if columns specified we try to find Gnt.column.Scale instances and set its configs
        } else {
            var columns = !Ext.isArray(this.columns) ? [this.columns] : this.columns;

            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];

                if (this.isScaleColumn(col)) {

                    // map some scale column configs from this panel
                    Ext.Array.forEach( this.scaleColumnConfigs, function (prop) {
                        if (!(prop in col)) col[prop] = this[prop];
                    }, this );

                    if (!(col instanceof Gnt.column.Scale)) {
                        col = columns[i] = Ext.ComponentManager.create(col, col.xtype);
                    }

                    // before column render let's give it information about row height
                    this.mon(col, {
                        beforerender    : function () {
                            col.setAvailableHeight(this.getSchedulingView().getAvailableRowHeight());
                        },
                        scope           : this,
                        single          : true
                    });
                }
            }
        }
    },


    isScaleColumn : function (col) {
        var proto   = col.xtype && (Ext.ClassManager.getByAlias(col.xtype));
        proto       = proto && proto.prototype;

        return (col instanceof Gnt.column.Scale || (proto && proto instanceof Gnt.column.Scale));
    },


    initWeekendsHightlight : function () {
        // add Gnt.feature.WorkingTime instance
        this.workingTimePlugin = new Gnt.feature.WorkingTime({
            calendar    : this.calendar
        });

        this.plugins.push(this.workingTimePlugin);
    },


    destroy : function () {
        this.unbindCalendarListeners();

        if (this.assignmentStore) {
            this.mun(this.assignmentStore, {
                refresh : this.onAssignmentsRefresh,
                remove  : this.onAssignmentsChange,
                update  : this.onAssignmentsChange,
                add     : this.onAssignmentsChange,

                scope   : this
            });
        }

        if (this.taskStore) {
            this.mun(this.taskStore, {
                refresh     : this.onTaskStoreRefresh,
                load        : this.onTaskStoreRefresh,
                update      : this.onTaskUpdate,
                nodeappend  : this.onTaskUpdate,

                scope       : this
            });
        }

        this.mun(this.calendar, {
            calendarchange  : this.onProjectCalendarChange,
            scope           : this
        });

        this.callParent(arguments);
    },

    /**
     * Returns the task store instance
     * @return {Gnt.data.TaskStore}
     */
    getEventStore : function () {
        return this.taskStore;
    },

    getTimeSpanDefiningStore : function () {
        return this.taskStore;
    },

    onTaskStoreRefresh : function () {
        var me = this;
        // Reset all allocations data and refresh view
        me.resetAllocationDataCache();
        me.refreshIfRendered();
    },

    onProjectCalendarChange : function () {
        var me = this;
        // Reset all allocations data and refresh view
        me.resetAllocationDataCache();
        me.refreshIfRendered();
    },

    unbindResourceCalendarListeners : function (resource) {
        var listeners   = this.calendarListenersHash && this.calendarListenersHash[resource.getInternalId()];
        if (listeners) {
            Ext.Array.remove(this.calendarListeners, listeners);
            Ext.destroy(listeners);
        }
    },

    bindResourceCalendarListeners : function (resource, calendar) {
        var me      = this;

        calendar    = calendar || resource.getOwnCalendar();

        // on calendar load/change we'll recalculate allocation data and redraw row
        var fn  = function () {
            me.resetAllocationDataCache(resource);
            me.refreshIfRendered(resource);
        };

        var listeners   = me.mon(calendar, {
            load            : fn,
            calendarchange  : fn,
            scope           : me,
            destroyable     : true
        });

        me.calendarListenersHash[resource.getInternalId()] = listeners;
        me.calendarListeners.push(listeners);
    },

    bindCalendarListeners : function () {
        // unbind exisiting listeners (if any)
        this.unbindCalendarListeners();

        var me = this;

        this.store.each(function (resource) {
            // if resource has own calendar and it differs from project one
            var calendar    = resource.getOwnCalendar();
            if (calendar && calendar !== me.calendar) {
                me.bindResourceCalendarListeners(resource, calendar);
            }
        });
    },

    unbindCalendarListeners : function () {
        if (this.calendarListeners && this.calendarListeners.length) {
            Ext.destroy.apply(Ext, this.calendarListeners);
        }
        // reset array of listeners
        this.calendarListeners      = [];
        this.calendarListenersHash  = {};
    },

    onTaskUpdate : function (taskStore, task) {
        var taskInternalId,
            allAssignments,
            assignments,
            i, len, asn;

        if (this.assignmentStore && task.getAssignmentStore() != this.assignmentStore) {
            taskInternalId = task.getInternalId();
            assignments    = [];
            allAssignments = this.assignmentStore.getRange();

            for (i = 0, len = allAssignments.length; i < len; ++i) {
                asn = allAssignments[i];
                if (asn.getTaskId() == taskInternalId) {
                    assignments.push(asn);
                }
            }
        } else {
            assignments = task.getAssignments();
        }

        this.onAssignmentsChange(this.assignmentStore, assignments);
    },

    onAssignmentsRefresh : function (assignmentStore) {
        this.onAssignmentsChange(assignmentStore, assignmentStore.getRange());
    },

    onAssignmentsChange : function (assignmentStore, assignments, operation, modifiedFieldNames, previous) {
        var me = this,
            resourceIdField = me.assignmentStore.model.prototype.resourceIdField,
            resource;

        // if an assignment resource has been changed
        if (operation == Ext.data.Model.EDIT && modifiedFieldNames && Ext.Array.contains(modifiedFieldNames, resourceIdField)) {
            var oldValues       = assignments.previous || previous,
                oldResourceId   = oldValues[resourceIdField];

            resource = this.resourceStore.getByInternalId(oldResourceId);
            if (resource) {
                // resetting previous resource allocation and refresh corresponding row,
                // resource allocation data will be updated upon row rendering
                me.resetAllocationDataCache(resource);
                me.refreshIfRendered(resource);
            }
        }

        if (!Ext.isArray(assignments)) assignments = [assignments];

        // for each provided assignment
        for (var i = 0, l = assignments.length; i < l; i++) {
            // get assigned resource
            resource = this.resourceStore.getByInternalId(assignments[i].getResourceId());

            if (resource) {
                // resetting resource allocation and refresh corresponding row,
                // resource allocation data will be updated upon row rendering
                me.resetAllocationDataCache(resource);
                me.refreshIfRendered(resource);
            }
        }
    },

    enableRowHeightInjection : function (lockedView, schedulingView) {
        var cellTpl                 = new Ext.XTemplate(
            '{%',
                'this.processCellValues(values);',
                'this.nextTpl.applyOut(values, out, parent);',
            '%}',
            {
                priority            : 1,
                processCellValues   : function (cellValues) {
                    if (schedulingView.orientation == 'horizontal') {
                        var height          = schedulingView.getAvailableRowHeight();

                        cellValues.style    = (cellValues.style || '') + ';height:' + height + 'px;';
                    }
                }
            }
        );

        lockedView.addCellTpl(cellTpl);
        schedulingView.addCellTpl(cellTpl);
    },

    findEndIndex : function (array, endDate) {
        endDate = endDate || this.getEndDate();

        var result  = array.length - 1;

        for (var i = result; i >= 0; i--) {
            if (array[i].endDate >= endDate) result = i;
        }

        return result;
    },

    findStartIndex : function (array, startDate) {
        startDate   = startDate || this.getStartDate();

        var result  = 0;

        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i].startDate <= startDate) result = i;
        }

        return result;
    },

    resetAllocationDataCache : function(resource) {
        var me = this;

        if (!resource) {
            me.allocationData = {};
        }
        else {
            me.allocationData = me.allocationData || {};
            me.allocationData[resource.getInternalId()] = null;
        }
    },

    updateAllocationDataCache : function(resource, start, end) {
        var DATE = Sch.util.Date,
            me = this,
            allocData,
            cacheStart, cacheEnd,
            left, right;

        start = start || me.getStartDate();
        end   = end   || me.getEndDate();

        if (!resource) {
            me.resourceStore.each(function(resource) {
                me.updateAllocationDataCache(resource, start, end);
            });
        }
        else {
            // Update resource cache
            allocData  = me.allocationData[resource.getInternalId()] || {};
            cacheStart = allocData.cacheStart;
            cacheEnd   = allocData.cacheEnd;

            if (
                // check if update is needed at all
                (cacheStart != start || cacheEnd != end) &&
                // check if we already have cached allocation data for required span or part of it
                (cacheStart && cacheEnd && DATE.intersectSpans(cacheStart, cacheEnd, start, end))
            ) {
                // new span starts earlier, calculate missing allocation
                if (cacheStart > start) {
                    left = me.processAllocationData(resource.getAllocationInfo({
                        startDate               : start,
                        endDate                 : cacheStart,
                        includeResCalIntervals  : true
                    }));

                    // when bars are calculated, start/end dates are nullified, to be picked from time axis
                    // at this point we can and have to set proper values, otherwise maxbar will be rendered from time axis start
                    left.maxBars.length      && (left.maxBars[left.maxBars.length - 1].endDate = cacheStart);
                    allocData.maxBars.length && (allocData.maxBars[0].startDate                = cacheStart);

                    // insert missing allocation data to the allocation cache beginning
                    allocData.bars              = left.bars.concat(allocData.bars);
                    allocData.maxBars           = left.maxBars.concat(allocData.maxBars);

                    // visible span starts from the very first cached item
                    allocData.maxBarsStartIndex = 0;
                    allocData.barsStartIndex    = 0;

                    allocData.cacheStart = start;
                }
                else {
                    // update start indexes of the visible cache items
                    allocData.maxBarsStartIndex = me.findStartIndex(allocData.maxBars, start);
                    allocData.barsStartIndex    = me.findStartIndex(allocData.bars, start);
                }

                // new span ends later, calculate trailing allocation
                if (cacheEnd < end) {
                    right = me.processAllocationData(resource.getAllocationInfo({
                        startDate               : cacheEnd,
                        endDate                 : end,
                        includeResCalIntervals  : true
                    }));

                    right.maxBars.length     && (right.maxBars[0].startDate                              = cacheEnd);
                    allocData.maxBars.length && (allocData.maxBars[allocData.maxBars.length - 1].endDate = cacheEnd);

                    allocData.bars            = allocData.bars.concat(right.bars);
                    allocData.maxBars         = allocData.maxBars.concat(right.maxBars);

                    allocData.maxBarsEndIndex = allocData.maxBars.length - 1;
                    allocData.barsEndIndex    = allocData.bars.length - 1;

                    allocData.cacheEnd        = end;
                } else {
                    // update end indexes of the visible cache items
                    allocData.maxBarsEndIndex   = me.findEndIndex(allocData.maxBars, end);
                    allocData.barsEndIndex      = me.findEndIndex(allocData.bars, end);
                }
            }
            else if (
                // check if update is needed at all
                cacheStart != start || cacheEnd != end
                // and cached and new timespans do not intersect (as opposite to previous condition)
            ) {
                allocData = me.processAllocationData(resource.getAllocationInfo({
                    startDate              : start,
                    endDate                : end,
                    includeResCalIntervals : true
                }));

                // we completely replace cache so indexes have to wrap whole arrays
                allocData.maxBarsStartIndex = 0;
                allocData.maxBarsEndIndex   = allocData.maxBars.length - 1;
                allocData.barsStartIndex    = 0;
                allocData.barsEndIndex      = allocData.bars.length - 1;

                allocData.cacheStart        = start;
                allocData.cacheEnd          = end;
            }

            me.allocationData[resource.getInternalId()] = allocData;
        }
    },

    loadAllocationDataCache : function(resource) {
        var me      = this,
            start   = me.getStartDate(),
            end     = me.getEndDate();

        if (!resource) {
            me.resetAllocationDataCache();
            me.updateAllocationDataCache(null, start, end);
        }
        else {
            me.resetAllocationDataCache(resource);
            me.updateAllocationDataCache(resource, start, end);
        }
    },

    // This function processes report made by resource.getAllocationInfo() method and build arrays of
    // histogram bars and levels of max resource allocation.
    // Returns:
    //      {
    //        bars: [], // array of histogram bars
    //        maxBars: [] // levels of max resource allocation
    //      }
    processAllocationData : function (data) {
        var period, bar, maxBar, prevDay, closeDate, openDate,
            allocationMS, prevAllocationMS, maxAllocationMS, prevMaxAllocationMS, totalOverAllocationMS, prevTotalOverAllocationMS,
            bars        = [],
            maxBars     = [],
            barOpened   = false,
            me          = this;

        // another set of task started
        var taskFinished = function () {
            if (!bar.assignments || !period.inResourceCalendar || !period.totalAllocation || !period.inTasksCalendar) return false;

            for (var i = 0, l = bar.assignments.length; i < l; i++) {
                if (period.assignmentsHash[ bar.assignments[i].getTaskId() ]) return false;
            }

            // no intersection with previous set of tasks
            return true;
        };

        // open histogram bar
        var openBar     = function (openDate) {
            bar = {
                startDate               : openDate,
                totalAllocation         : period.totalAllocation,
                allocationMS            : allocationMS,
                assignments             : period.assignments,
                totalOverAllocationMS   : totalOverAllocationMS
            };

            barOpened = true;
        };

        // close histogram bar
        var closeBar    = function (closeDate) {
            if (!barOpened) return false;

            if (closeDate) bar.endDate = closeDate;
            bars.push(bar);

            barOpened   = false;
        };

        // appends zero level line
        var appendZeroMaxBars   = function (fromDate, toDate) {
            if (!fromDate) return false;

            var diff    = Sch.util.Date.getDurationInDays(fromDate, toDate);

            if (diff < 2) return false;

            var add     = true;
            // if there is a previous level line
            if (maxBar) {
                if (!maxBar.allocationMS) {
                    add     = false;
                // and it's not zero
                } else {
                    // let's close it
                    maxBar.endDate      = Sch.util.Date.getStartOfNextDay(fromDate, true);
                    maxBars.push(maxBar);
                }
            }

            if (add) {
                // ..and start new line with zero level
                maxBar = {
                    startDate       : maxBar && maxBar.endDate || me.getStart(),
                    allocationMS    : 0
                };
            }

            // update last calculated allocation limit
            maxAllocationMS = 0;

            return true;
        };

        var newDay;
        for (var i = 0, l = data.length; i < l; i++) {
            period = data[i];

            newDay = Ext.Date.clearTime(period.startDate, true);
            // if it's 1st period of a new day
            if (newDay - prevDay !== 0) {
                // if there is a gap between working days in resource calendar
                // we need to fill it with zero level lines
                this.showLimitLines && appendZeroMaxBars(prevDay, newDay);

                prevDay             = newDay;

                prevAllocationMS            = allocationMS;
                prevTotalOverAllocationMS   = totalOverAllocationMS;
                prevMaxAllocationMS         = maxAllocationMS;
                // reset allocation time counters
                allocationMS                = 0;
                totalOverAllocationMS       = 0;
                maxAllocationMS             = 0;
                var j = i;
                // let's calculate allocation time for the day
                while (data[j] && Ext.Date.clearTime(data[j].startDate, true) - newDay === 0) {
                    // if it's working time according to resource calendar
                    if (data[j].inResourceCalendar) {
                        // increment maximum possible resource allocation time
                        maxAllocationMS     += data[j].endDate - data[j].startDate;
                        // if it's working time and task is in progress
                        if (data[j].totalAllocation && data[j].inTasksCalendar) {
                            // increment allocation time
                            allocationMS            += data[j].totalAllocationMS || (data[j].endDate - data[j].startDate) * data[j].totalAllocation / 100;
                            totalOverAllocationMS   += data[j].totalOverAllocationMS || 0;
                        }
                    }
                    j++;
                }
            } else {
                newDay = false;
            }

            // if we need to render limit lines
            if (this.showLimitLines) {
                // here we trace resource max available allocation changes
                if (newDay && maxAllocationMS != prevMaxAllocationMS) {
                    // on change we close existing line
                    if (maxBar) {
                        maxBar.endDate      = newDay;
                        maxBars.push(maxBar);
                    }
                    // ..and start new one with new allocationMS value
                    maxBar = {
                        startDate       : newDay,
                        allocationMS    : maxAllocationMS
                    };
                }

                // update end of max available allocation line
                maxBar.endDate  = period.endDate;
            }

            // if no bar opened
            if (!barOpened) {
                // if period belongs to some task(s)
                // need to open new bar
                if (period.inTask) {
                    openBar(new Date(period.startDate));
                }

            // bar opened & task is finished
            // need to close opened bar
            } else if (!period.inTask) {
                closeBar();

            // bar opened & task in progress
            } else {

                var splitBar = false;

                // if there is a gap we need to close old bar and start new one
                // ("gap" is when we have no periods during day before newDay)
                if (newDay && bar.endDate <= Sch.util.Date.add(newDay, Sch.util.Date.DAY, -1)) {

                    // close bar at midnight after bar.endDate
                    closeDate   = Ext.Date.clearTime(bar.endDate, true);
                    if (closeDate < bar.endDate) {
                        closeDate   = Sch.util.Date.add(closeDate, Sch.util.Date.DAY, 1);
                    }

                    // open new bar at midnight before period.startDate
                    openDate    = Ext.Date.clearTime(period.startDate, true);
                    splitBar    = true;

                // if day allocation has changed (due to calendars)
                } else if (newDay && allocationMS !== prevAllocationMS && period.totalAllocation && period.totalAllocation == bar.totalAllocation) {

                    closeDate   = openDate = period.startDate;
                    splitBar    = true;

                // another task(s) started
                } else if (period.totalAllocation && taskFinished()) {

                    closeDate   = bar.endDate;
                    openDate    = new Date(period.startDate);
                    splitBar    = true;

                // if % of allocation was changed (result of assignments change)
                } else if (period.totalAllocation && period.totalAllocation != bar.totalAllocation) {

                    closeDate   = openDate = period.totalAllocation > bar.totalAllocation ? new Date(period.startDate) : bar.endDate;
                    splitBar    = true;

                }


                if (splitBar) {
                    closeBar(closeDate);
                    openBar(openDate);
                }
            }

            // if we have opened bar
            if (barOpened) {
                // update its end date
                bar.endDate     = period.endDate;
            }

        }

        // close bar if task goes after timeline end
        closeBar();

        // if we need to render limits lines
        if (this.showLimitLines) {
            // if there is a gap between working days in resource calendar
            // we need to fill it with zero level lines
            appendZeroMaxBars(prevDay || this.getStart(), this.getEnd());

            // push last line to lines array
            if (maxBar) {
                maxBars.push(maxBar);
            }

            // updating start of 1st and end of last max available allocation lines with nulls
            // will make view to call timeAxis.getStart() and timeAxis.getEnd() respectively to get these values
            if (maxBars.length) {
                maxBars[0].startDate                = null;
                maxBars[maxBars.length - 1].endDate = null;
            }
        }

        return {
            bars    : bars,
            maxBars : maxBars
        };
    },

    onResourceUpdate : function (store, resource, operation, changedFieldNames) {
        // if calendar on resource was changed
        var resourceModel = store.model;

        if (Ext.Array.indexOf(resourceModel.prototype.calendarIdField, changedFieldNames) > -1) {

            // setting allocation data for resource it will be updated upon next resource row rendering
            // which should happen as the result of update
            this.resetAllocationDataCache(resource);

            // unbind old listeners from resource calendar
            this.unbindResourceCalendarListeners(resource);

            // if new resource calendar differs from project one
            var calendar    = resource.getOwnCalendar();
            if (calendar && calendar !== this.calendar) {
                // bind listener on it
                this.bindResourceCalendarListeners(resource, calendar);
            }
        }
    },

    onResourceStoreRefresh : function () {
        var me = this;
        // Reset all allocations data and refresh view
        me.resetAllocationDataCache();
        me.refreshIfRendered();
        // bind listeners to resources calendars
        me.bindCalendarListeners();
    },

    refreshIfRendered : function(resource) {
        var me = this;

        if (me.rendered && me.resourceStore && resource) {
            me.getView().refreshNode(me.resourceStore.indexOf(resource));
        }
        else if (me.rendered) {
            me.getView().refresh();
        }
    },

    columnRenderer : function (val, meta, resource, rowIndex, colIndex) {
        var me = this,
            resourceId  = resource.getInternalId(),
            view        = this.normalGrid.getView(),
            data, bars, maxBars;

        // The method is protected against unneeded recalculation
        me.updateAllocationDataCache(resource);

        data    = this.allocationData[resourceId];
        bars    = data && data.bars;
        maxBars = data && data.maxBars;

        // if visible window for the histogram bars is less than all cached bars
        // let's cut this array to pass only related data
        if (bars && (data.barsStartIndex > 0 || data.barsEndIndex < bars.length - 1)) {
            bars    = Ext.Array.slice(bars, data.barsStartIndex, data.barsEndIndex + 1);
        }

        // if visible window for the resource limit lines is less than all cached limit lines info
        // let's cut this array to pass only related data
        if (maxBars && (data.maxBarsStartIndex > 0 || data.maxBarsEndIndex < maxBars.length - 1)) {
            maxBars = Ext.Array.slice(maxBars, data.maxBarsStartIndex, data.maxBarsEndIndex + 1);
        }

        // render: scale lines (if requested),
        return (this.showScaleLines ? view.renderLines(this) : '') +
                // histogram bars,
            view.renderBars(this, bars, resourceId) +
                // max resource allocation line (if requested)
            (this.showLimitLines ? view.renderLimitLines(this, maxBars) : '');
    }
});
