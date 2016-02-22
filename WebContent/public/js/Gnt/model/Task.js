/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.model.Task
@extends Sch.model.Range

This class represents a single task in your Gantt chart.

The inheritance hierarchy of this class includes {@link Sch.model.Customizable} and {@link Ext.data.Model} classes.
This class will also receive a set of methods and additional fields that stem from the {@link Ext.data.NodeInterface}.
Please refer to the documentation of those classes to become familiar with the base interface of this class.

By default, a Task has the following fields as seen below.

Task Fields
------

- `Id` - (mandatory) a unique identifier of the task
- `Name` - the name of the task (task title)
- `StartDate` - the start date of the task in the ISO 8601 format. See {@link Ext.Date} for a formats definitions.
- `EndDate` - the end date of the task in the ISO 8601 format, **see "Start and End dates" section for important notes**
- `Duration` - the numeric part of the task duration (the number of units)
- `DurationUnit` - the unit part of the task duration (corresponds to units defined in `Sch.util.Date`), defaults to "d" (days). Valid values are:
     - "ms" (milliseconds)
     - "s" (seconds)
     - "mi" (minutes)
     - "h" (hours)
     - "d" (days)
     - "w" (weeks)
     - "mo" (months)
     - "q" (quarters)
     - "y" (years)
- `Effort` - the numeric part of the task effort (the number of units). The effort of the "parent" tasks will be automatically set to the sum
of efforts of their "child" tasks
- `EffortUnit` - the unit part of the task effort (corresponds to units defined in `Sch.util.Date`), defaults to "h" (hours). Valid values are:
     - "ms" (milliseconds)
     - "s" (seconds)
     - "mi" (minutes)
     - "h" (hours)
     - "d" (days)
     - "w" (weeks)
     - "mo" (months)
     - "q" (quarters)
     - "y" (years)
- `PercentDone` - the current status of a task, expressed as the percentage completed (integer from 0 to 100)
- `Cls` - A CSS class that will be applied to each rendered task DOM element
- `BaselineStartDate` - the baseline start date of the task in the ISO 8601 format. See {@link Ext.Date} for a formats definitions.
- `BaselineEndDate` - the baseline end date of the task in the ISO 8601 format, **see "Start and End dates" section for important notes**
- `BaselinePercentDone` - the baseline status of a task, expressed as the percentage completed (integer from 0 to 100)
- `CalendarId` - the id of the calendar, assigned to task. Allows you to set the time when task can be performed.
Should be only provided for specific tasks - all tasks by default are assigned to the project calendar, provided as the
{@link Gnt.data.TaskStore#calendar} option.
- `SchedulingMode` - the field, defining the scheduling mode for the task. Based on this field some fields of the task
will be "fixed" (should be provided) and some - computed. See {@link #schedulingModeField} for details.
- `ManuallyScheduled` - When set to `true`, the `StartDate` of the task will not be changed by any of its incoming dependencies
or constraints. Also, a manually scheduled parent task is not affected by its child tasks and behaves like any other normal task.
- `ConstraintType` - A string containing the alias for a constraint class (w/o the `gntconstraint` prefix). Valid values are:

  - "finishnoearlierthan"
  - "finishnolaterthan"
  - "mustfinishon"
  - "muststarton"
  - "startnoearlierthan"
  - "startnolaterthan"

If you want to define your own custom constraint class, you need to alias it:

        Ext.define('MyConstraint', {
            extend      : 'Gnt.constraint.Base',

            alias       : 'gntconstraint.myconstraint',
            ...
        })

- `ConstraintDate` - A date, defining the constraint boundary date, if applicable.
- `Note` A freetext note about the task.
- `Rollup` Set this to 'true' if the task should rollup to its parent task.

If you want to add new fields or change the name/options for the existing fields,
you can do that by subclassing this class (see example below).

Subclassing the Task class
--------------------

The name of any field can be customized in the subclass. Please refer to {@link Sch.model.Customizable} for details.

    Ext.define('MyProject.model.Task', {
        extend      : 'Gnt.model.Task',

        nameField           : 'myName',
        percentDoneField    : 'percentComplete',

        isAlmostDone : function () {
            return this.get('percentComplete') > 80;
        },
        ...
    });

Creating a new Task instance programmatically
--------------------

To create a new task programmatically, simply call the Gnt.model.Task constructor and pass in any default field values.

    var newTask = new Gnt.model.Task({
        Name            : 'An awesome task',
        PercentDone     : 80, // So awesome it's almost done
        ...
    });

    // To take weekends and non-working time into account, the new task needs a reference to the task store (which has access to the global calendar)
    newTask.taskStore = taskStore;

    // Initialize new task to today
    newTask.setStartDate(new Date());

    // This is a leaf task
    newTask.set('leaf', true);

    // Now it will appear in the UI if the Gantt panel is rendered
    taskStore.getRootNode().appendChild(newTask);


Start and End dates
-------------------

For all tasks, the range between start date and end date is supposed to be not-inclusive on the right side: StartDate <= date < EndDate.
So, for example, the task which starts at 2011/07/18 and has 2 days duration, should have the end date: 2011/07/20, **not** 2011/07/19 23:59:59.

Also, both start and end dates of tasks in our components are *points* on time axis. For example, if user specifies that some task starts
01/01/2013 and has 1 day duration, that means the start point is 01/01/2013 00:00 and end point is 02/01/2013 00:00.
However, its a common requirement, to *display* such task as task with both start and end date as 01/01/2013. Because of that,
during rendering the end date is adjusted so for such task user will see a 01/01/2013 end date. In the model layer however, the precise point is stored.

Conversion to "days" duration unit
-----------------------------------

Some duration units cannot be converted to "days" consistently. For example a month may have 28, 29, 30 or 31 days. The year may have 365 or 366 days and so on.
So in such conversion operations, we will always assume that a task with a duration of 1 month will have a duration of 30 days.
This is {@link Gnt.data.Calendar#daysPerMonth a configuration option} of the calendar class.

Task API
-------

One important thing to consider is that, if you are using the availability/scheduling modes feature, then you need to use the task API call to update the fields like `StartDate / EndDate / Duration`.
Those calls will calculate the correct value of each the field, taking into account the information from calendar/assigned resources.

Server-side integration
-----------------------

Also, at least for now you should not use the "save" method of the model available in Ext 4:

    task.save() // WON'T WORK

This is because there are some quirks in using CRUD for Ext tree stores. These quirks are fixed in the TaskStore. To save the changes in task to server
use the "sync" method of the task store:

    taskStore.sync() // OK

*/
Ext.define('Gnt.model.Task', {
    extend              : 'Sch.model.Range',

    requires            : [
        'Sch.util.Date',
        'Ext.data.NodeInterface'
    ],

    uses                : [
        'Gnt.model.TaskSegment'
    ],

    mixins              : [
        'Gnt.model.mixin.ProjectableModel',
        'Gnt.model.task.More',
        'Gnt.model.task.Constraints',
        'Gnt.model.task.Splittable'
    ],

    segmentClassName    : 'Gnt.model.TaskSegment',

    idProperty          : "Id",

    customizableFields     : [
        { name: 'Duration', type: 'number', allowNull: true },
        { name: 'Effort', type: 'number', allowNull: true },
        { name: 'EffortUnit', type: 'string', defaultValue: 'h' },
        { name: 'CalendarId', type: 'string'},
        { name: 'Note', type: 'string'},

        {
            name: 'DurationUnit',
            type: 'string',
            defaultValue: "d",
            // make sure the default value is applied when user provides empty value for the field, like "" or null
            convert: function (value) {
                return value || "d";
            }
        },
        { name: 'PercentDone', type: 'number', defaultValue: 0 },

        { name: 'ConstraintType', type: 'string', defaultValue: '' },
        { name: 'ConstraintDate', type: 'date', dateFormat: 'c' },

        { name: 'ManuallyScheduled', type: 'boolean', defaultValue: false },
        { name: 'SchedulingMode', type: 'string', defaultValue: 'Normal' },

        { name: 'BaselineStartDate', type: 'date', dateFormat: 'c' },
        { name: 'BaselineEndDate', type: 'date', dateFormat: 'c' },
        { name: 'BaselinePercentDone', type: 'int', defaultValue: 0 },
        { name: 'Draggable', type: 'boolean', persist: false, defaultValue : true },   // true or false
        { name: 'Resizable', persist: false, defaultValue : '' },                      // true, false, 'start' or 'end'

        { name: 'Rollup', type: 'boolean', defaultValue: false },
        {
            name    : 'Segments',
            persist : true,

            convert : function (value, record) {
                return record.processSegmentsValue(value, record);
            },

            serialize : function (value, record) {
                if (!value) return null;

                var segments    = [].concat(value),
                    data        = [];

                for (var i = 0, l = segments.length; i < l; i++) {
                    data.push(segments[i].serialize());
                }

                return data;
            }
        },
        // Two fields which specify the relations between "phantom" tasks when they are
        // being sent to the server to be created (e.g. when you create a new task containing a new child task).
        { name : 'PhantomId',          type: 'string' },
        { name : 'PhantomParentId',    type: 'string' },

        // Override NodeInterface defaults
        { name: 'index', type : 'int', persist : true }
    ],

    /**
     * @cfg {String} constraintTypeField The name of the field specifying if the constraint type of this task.
     */
    constraintTypeField     : 'ConstraintType',

    /**
     * @cfg {String} constraintDateField The name of the field specifying if the date of constraint for this task.
     */
    constraintDateField     : 'ConstraintDate',

    /**
     * @cfg {String} draggableField The name of the field specifying if the event should be draggable in the timeline
     */
    draggableField          : 'Draggable',

    /**
     * @cfg {String} resizableField The name of the field specifying if/how the event should be resizable.
     */
    resizableField          : 'Resizable',

    /**
     * @cfg {String} nameField The name of the field that holds the task name. Defaults to "Name".
     */
    nameField               : 'Name',

    /**
     * @cfg {String} durationField The name of the field holding the task duration.
     */
    durationField           : 'Duration',

    /**
     * @cfg {String} durationUnitField The name of the field holding the task duration unit.
     */
    durationUnitField       : 'DurationUnit',

    /**
     * @cfg {String} effortField The name of the field holding the value of task effort.
     */
    effortField             : 'Effort',

    /**
     * @cfg {String} effortUnitField The name of the field holding the task effort unit.
     */
    effortUnitField         : 'EffortUnit',


    /**
     * @cfg {String} percentDoneField The name of the field specifying the level of completion.
     */
    percentDoneField        : 'PercentDone',

    /**
     * @cfg {String} manuallyScheduledField The name of the field defining if a task is manually scheduled or not.
     */
    manuallyScheduledField  : 'ManuallyScheduled',

    /**
     * @cfg {String} schedulingModeField The name of the field defining the scheduling mode of the task. Should be one of the
     * following strings:
     *
     * - `Normal` is the default (and backward compatible) mode. It means the task will be scheduled based on information
     * about its start/end dates, task own calendar (project calendar if there's no one) and calendars of the assigned resources.
     *
     * - `FixedDuration` mode means, that task has fixed start and end dates, but its effort will be computed dynamically,
     * based on the assigned resources information. Typical example of such task is - meeting. Meetings typically have
     * pre-defined start and end dates and the more people are participating in the meeting, the more effort is spent on the task.
     * When duration of such task increases, its effort is increased too (and vice-versa). Note: fixed start and end dates
     * here doesn't mean that a user can't update them via GUI, the only field which won't be editable in GUI is the effort field,
     * it will be calculated according to duration and resources assigned to the task.
     *
     * - `EffortDriven` mode means, that task has fixed effort and computed duration. The more resources will be assigned
     * to this task, the less the duration will be. The typical example will be a "paint the walls" task -
     * several painters will complete it faster.
     *
     * - `DynamicAssignment` mode can be used when both duration and effort of the task are fixed. The computed value in this
     * case will be - the assignment units of the resources assigned. In this mode, the assignment level of all assigned resources
     * will be updated to evenly distribute the task's workload among them.
     *
     * - `Manual` mode is equivalent of the setting "ManuallyScheduled" field to `true`. This mode is deprecated.
     */
    schedulingModeField     : 'SchedulingMode',


    /**
     * @cfg {String} rollupField The name of the field specifying if the task should rollup to its parent task.
     */
    rollupField           : 'Rollup',

    /**
     * @cfg {String} calendarIdField The name of the field defining the id of the calendar for this specific task. Task calendar has the highest priority.
     */
    calendarIdField         : 'CalendarId',

    /**
     * @cfg {String} baselineStartDateField The name of the field that holds the task baseline start date.
     */
    baselineStartDateField  : 'BaselineStartDate',

    /**
     * @cfg {String} baselineEndDateField The name of the field that holds the task baseline end date.
     */
    baselineEndDateField    : 'BaselineEndDate',

    /**
     * @cfg {String} baselinePercentDoneField The name of the field specifying the baseline level of completion.
     */
    baselinePercentDoneField    : 'BaselinePercentDone',

    /**
     * @cfg {String} noteField The name of the field specifying the task note.
     */
    noteField               : 'Note',

    segmentsField           : 'Segments',

    /**
     * @cfg {Gnt.data.Calendar} calendar
     * Optional. An explicitly provided {@link Gnt.data.Calendar calendar} instance. Usually will be retrieved by the task from the {@link Gnt.data.TaskStore task store}.
     */
    calendar                : null,

    /**
     * @cfg {Gnt.data.DependencyStore} dependencyStore
     * Optional. An explicitly provided {@link Gnt.data.DependencyStore} with dependencies information. Usually will be retrieved by the task from the {@link Gnt.data.TaskStore task store}.
     */
    dependencyStore         : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore
     * Optional. An explicitly provided Gnt.data.TaskStore with tasks information. Usually will be set by the {@link Gnt.data.TaskStore task store}.
     */
    taskStore               : null,

    /**
     * @cfg {String} phantomIdField The name of the field specifying the phantom id when this task is being 'realized' by the server.
     */
    phantomIdField          : 'PhantomId',

    /**
     * @cfg {String} phantomParentIdField The name of the field specifying the parent task phantom id when this task is being 'realized' by the server.
     */
    phantomParentIdField    : 'PhantomParentId',

    normalized              : false,

    recognizedSchedulingModes   : [ 'Normal', 'Manual', 'FixedDuration', 'EffortDriven', 'DynamicAssignment' ],

    /**
     * @cfg {Boolean} convertEmptyParentToLeaf
     *
     * This configuration option allows you to control whether an empty parent task should be converted into a leaf. Note, that
     * it's not a new field, but a regular configuration property of this class.
     *
     * Usually you will want to enable/disable it for the whole class:
     *

    Ext.define('MyApp.model.Task', {
        extend                      : 'Gnt.model.Task',

        convertEmptyParentToLeaf    : false
    })

     */
    convertEmptyParentToLeaf    : true,

    /**
     * @cfg {Boolean} autoCalculateEffortForParentTask
     *
     * This configuration option enables auto-calculation of the effort value for the parent task. When this option is enabled,
     * effort value of the parent tasks becomes not editable.
     *
     * Usually you will want to enable/disable it for the whole class:
     *

    Ext.define('MyApp.model.Task', {
        extend                              : 'Gnt.model.Task',

        autoCalculateEffortForParentTask    : false
    })

     *
     */
    autoCalculateEffortForParentTask        : true,

    /**
     * @cfg {Boolean} autoCalculatePercentDoneForParentTask
     *
     * This configuration option enables auto-calculation of the percent done value for the parent task. When this option is enabled,
     * percent done value of the parent tasks becomes not editable.
     *
     * Usually you will want to enable/disable it for the whole class:
     *

    Ext.define('MyApp.model.Task', {
        extend                                  : 'Gnt.model.Task',

        autoCalculatePercentDoneForParentTask   : false
    })

     *
     */
    autoCalculatePercentDoneForParentTask   : true,



    isHighlighted               : false,

    calendarWaitingListener     : null,

    childTasksDuration          : null,
    completedChildTasksDuration : null,

    totalCount                  : null,

    /**
     * @property {Gnt.model.Dependency[]} predecessors An array of dependencies, which are predecessors for this task.
     * To access this property safely you can use {@link #getIncomingDependencies} method.
     */
    predecessors                : null,

    /**
     * @property {Gnt.model.Dependency[]} successors An array of dependencies, which are successors for this task.
     * To access this property safely you can use {@link #getOutgoingDependencies} method.
     */
    successors                  : null,

    /**
     * @property {Gnt.model.Assignment[]} assignments An array of assignments for this task.
     * To access this property safely you can use {@link #getAssignments} method.
     */
    assignments                 : null,

    // special flag, that prevents parent from being converted into leafs when using "replaceChild" method
    // see `data_components/077_task_replace_child.t.js`
    removeChildIsCalledFromReplaceChild     : false,

    // see comments in `endEdit` override
    savedDirty                  : null,

    useOwnCalendarAsConverter   : false,

    constructor : function () {
        this._singleProp = {};

        this.initProjectable();

        this.callParent(arguments);


        if (this.phantom) {
            this.data[ this.phantomIdField ]    = this.getInternalId();

            // @BW-COMPAT
            this._phantomId                     = this.getInternalId();
        }

        this.predecessors   = [];
        this.successors     = [];
        this.assignments    = [];
    },


    // should be called once after initial loading - will convert the "EndDate" field to "Duration"
    // the model should have the link to calendar
    normalize: function () {
        var durationUnit    = this.getDurationUnit(),
            startDate       = this.getStartDate(),
            endDate         = this.getEndDate(),
            schedulingMode  = this.getSchedulingMode(),
            data            = this.data,
            taskStore       = this.getTaskStore(true);

        this.assignments    = taskStore && taskStore.cachedAssignments && taskStore.cachedAssignments[ this.getId() ] || this.assignments;

        var endDateField    = this.endDateField;

        // normalize segments if required
        if (taskStore && this.isSegmented()) {
            this.normalizeSegments();

            var last;
            // if task is still segmented after segments normalization
            // let's set the task end to the last segment finish
            if (last = this.getLastSegment()) {
                endDate = data[ endDateField ] = last.getEndDate();
            }
        }

        var duration        = this.getDuration();
        var effortField     = this.effortField;

        if (endDate && this.inclusiveEndDate) {
            // End date supplied, if end dates are inclusive we need to adjust them -
            // but only IF:
            //      * The end-date dateFormat does not contain any hour info, OR
            //      * The end-date dateFormat does contain any hour info AND it has no hours/minutes/seconds/ms

            var format = this.getField(endDateField).dateFormat;

            var doAdjust = (format && !Ext.Date.formatContainsHourInfo(format)) ||
                (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0 && endDate.getMilliseconds() === 0);

            if (doAdjust) {
                if (Ext.isNumber(duration)) {
                    // Recalculate end date based on duration
                    endDate = data[ endDateField ] = this.calculateEndDate(startDate, duration, durationUnit);
                } else {
                    // Simply add 1 day to end date
                    endDate = data[ endDateField ] = Ext.Date.add(endDate, Ext.Date.DAY, 1);
                }
            }
        }

        // for all scheduling modes
        if (duration == null && startDate && endDate) {
            duration    = data[ this.durationField ] = this.calculateDuration(startDate, endDate, durationUnit);
        }

        if ((schedulingMode == 'Normal' || this.isManuallyScheduled()) && endDate == null && startDate && Ext.isNumber(duration)) {
            endDate     = data[ endDateField ] = this.calculateEndDate(startDate, duration, durationUnit);
        }

        // accessing the field value directly here, since we are interested in "raw" value
        // `getEffort` now returns 0 for empty effort values
        var effort          = this.get(effortField),
            effortUnit      = this.getEffortUnit();

        if (schedulingMode == 'FixedDuration') {
            if (endDate == null && startDate && Ext.isNumber(duration)) endDate = data[ endDateField ] = this.calculateEndDate(startDate, duration, durationUnit);

            if (effort == null && startDate && endDate) {
                data[ effortField ] = this.calculateEffort(startDate, endDate, effortUnit);
            }
        } else if (schedulingMode == 'EffortDriven') {
            if (effort == null && startDate && endDate) {
                data[ effortField ] = this.calculateEffort(startDate, endDate, effortUnit);
            }

            if (endDate == null && startDate && effort) {
                data[ endDateField ]  = this.calculateEffortDrivenEndDate(startDate, effort, effortUnit);

                // for "effortDriven" task, user can only provide StartDate and Effort - that's all we need
                if (duration == null) {
                    data[ this.durationField ] = this.calculateDuration(startDate, data[ endDateField ], durationUnit);
                }
            }
        } else {
            if (endDate == null && startDate && Ext.isNumber(duration)) endDate = data[ endDateField ] = this.calculateEndDate(startDate, duration, durationUnit);
        }

        var calendarId      = this.getCalendarId();

        if (calendarId) this.setCalendarId(calendarId, true);

        this.normalized = true;
    },


    getUnitConverter : function () {
        return this.useOwnCalendarAsConverter && this.getCalendar() || this.getProjectCalendar();
    },


    // recursive task
    normalizeParent : function () {
        var childNodes              = this.childNodes;

        var totalEffortInMS         = 0;
        var totalDurationInMS       = 0;
        var completedDurationInMS   = 0;

        var autoCalculatePercentDoneForParentTask   = this.autoCalculatePercentDoneForParentTask;
        var autoCalculateEffortForParentTask        = this.autoCalculateEffortForParentTask;

        for (var i = 0; i < childNodes.length; i++) {
            var child               = childNodes[ i ];
            var isLeaf              = child.isLeaf();

            if (!isLeaf) child.normalizeParent();

            if (autoCalculateEffortForParentTask) {
                totalEffortInMS         += child.getEffort('MILLI');
            }

            if (autoCalculatePercentDoneForParentTask) {
                var durationInMS        = isLeaf ? child.getDuration('MILLI') || 0 : child.childTasksDuration;

                totalDurationInMS       += durationInMS;
                completedDurationInMS   += isLeaf ? durationInMS * (child.getPercentDone() || 0) : child.completedChildTasksDuration;
            }
        }

        if (autoCalculatePercentDoneForParentTask) {
            this.childTasksDuration             = totalDurationInMS;
            this.completedChildTasksDuration    = completedDurationInMS;

            var newPercentDone          = totalDurationInMS ? completedDurationInMS / totalDurationInMS : 0;

            if (this.getPercentDone() != newPercentDone)    this.data[ this.percentDoneField ] = newPercentDone;
        }

        if (autoCalculateEffortForParentTask) {
            if (this.getEffort('MILLI') != totalEffortInMS) this.data[ this.effortField ] = this.getUnitConverter().convertMSDurationToUnit(totalEffortInMS, this.getEffortUnit());
        }
    },


    // We'll be using `internalId` for Id substitution when dealing with phantom records
    getInternalId: function(){
        return this.getId() || this.internalId;
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance, associated with this task. If task has no own calendar, it will be recursively looked up
     * starting from task's parent. If no one from parents have own calendar then project calendar will be returned.
     * See also `ownCalendarOnly` parameter and {@link #getOwnCalendar}, {@link #getProjectCalendar} methods.
     *
     * @param {Boolean} ownCalendarOnly When set to true, return only own calendar of this task and `null` if task has no calendar
     *
     * @return {Gnt.data.Calendar} calendar
     */
    getCalendar: function (ownCalendarOnly) {
        return ownCalendarOnly ? this.getOwnCalendar() : this.getOwnCalendar() || this.parentNode && this.parentNode.getCalendar() || this.getProjectCalendar();
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance, associated with this task (if any). See also {@link #calendarIdField}.
     *
     * @return {Gnt.data.Calendar} calendar
     */
    getOwnCalendar : function () {
        var calendarId    = this.get(this.calendarIdField);

        return calendarId ? Gnt.data.Calendar.getCalendar(calendarId) : this.calendar;
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance, associated with the project of this task (with the TaskStore instance
     * this task belongs to).
     *
     * @return {Gnt.data.Calendar} calendar
     */
    getProjectCalendar: function () {
        var store       = this.getTaskStore(true);
        var calendar    = store && store.getCalendar() || this.parentNode && this.parentNode.getProjectCalendar() || this.isRoot() && this.calendar;

        if (!calendar) {
            Ext.Error.raise("Can't find a project calendar in `getProjectCalendar`");
        }

        return calendar;
    },


    /**
     * Sets the {@link Gnt.data.Calendar calendar}, associated with this task. Calendar must have a {@link Gnt.data.Calendar#calendarId calendarId} property
     * defined, which will be saved in the `CalendarId` field of this task.
     *
     * @param {Gnt.data.Calendar/String} calendar A calendar instance or string with calendar id
     * @param {Function} [callback] Callback function to call after task calendar has been changed and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setCalendar: function (calendar, callback) {
        var me = this,
            isCalendarInstance  = calendar instanceof Gnt.data.Calendar;

        if (isCalendarInstance && !calendar.calendarId) {
            throw new Error("Can't set calendar w/o `calendarId` property");
        }

        return me.setCalendarId(isCalendarInstance ? calendar.calendarId : calendar, false, callback);
    },


    setCalendarId : function(calendarId, isInitial, callback) {
        var me = this;

        if (!isInitial) {
            me.propagateChanges(
                function() {
                    return me.setCalendarIdWithoutPropagation(calendarId, isInitial);
                },
                callback
            );
        }
        else {
            me.setCalendarIdWithoutPropagation(calendarId, isInitial);
        }
    },


    setCalendarIdWithoutPropagation : function(calendarId, isInitial) {
        var propagate = false;

        if (calendarId instanceof Gnt.data.Calendar) calendarId = calendarId.calendarId;

        var prevCalendarId  = this.getCalendarId();

        if (prevCalendarId != calendarId || isInitial) {

            propagate = true;

            if (this.calendarWaitingListener) {
                this.calendarWaitingListener.destroy();
                this.calendarWaitingListener = null;
            }

            var listeners       = {
                calendarchange  : this.adjustToCalendarWithoutPropagation,
                scope           : this
            };

            var prevInstance        = this.calendar || Gnt.data.Calendar.getCalendar(prevCalendarId);

            // null-ifying the "explicit" property - it should not be used at all generally, only "calendarId"
            this.calendar   = null;

            prevInstance && prevInstance.un(listeners);

            this.set(this.calendarIdField, calendarId);

            var calendarInstance    = Gnt.data.Calendar.getCalendar(calendarId);

            if (calendarInstance) {
                calendarInstance.on(listeners);

                if (!isInitial) this.adjustToCalendarWithoutPropagation();
            } else {
                this.calendarWaitingListener = Ext.data.StoreManager.on('add', function (index, item, key) {
                    calendarInstance    = Gnt.data.Calendar.getCalendar(calendarId);

                    if (calendarInstance) {
                        this.calendarWaitingListener.destroy();
                        this.calendarWaitingListener = null;

                        calendarInstance.on(listeners);

                        this.adjustToCalendarWithoutPropagation();
                    }
                }, this, { destroyable : true });
            }
        }

        return propagate;
    },


    /**
     * Returns the dependency store, associated with this task.
     *
     * @return {Gnt.data.DependencyStore} The dependency store instance
     */
    getDependencyStore: function () {
        var dependencyStore = this.dependencyStore || this.getTaskStore().dependencyStore;

        if (!dependencyStore) {
            Ext.Error.raise("Can't find a dependencyStore in `getDependencyStore`");
        }

        return dependencyStore;
    },


    /**
     * Returns the resource store, associated with this task.
     *
     * @return {Gnt.data.Resource} The resource store instance
     */
    getResourceStore : function () {
        return this.getTaskStore().getResourceStore();
    },


    /**
     * Returns the assignment store, associated with this task.
     *
     * @return {Gnt.data.AssignmentStore} The assignment store instance
     */
    getAssignmentStore : function () {
        return this.getTaskStore().getAssignmentStore();
    },


    /**
     * Returns the {@link Gnt.data.TaskStore task store} instance, associated with this task
     *
     * @return {Gnt.data.TaskStore} task store
     */
    getTaskStore: function (ignoreAbsense) {
        if (this.taskStore) return this.taskStore;

        var taskStore = this.getTreeStore() || this.parentNode && this.parentNode.getTaskStore(ignoreAbsense);

        if (!taskStore && !ignoreAbsense) {
            Ext.Error.raise("Can't find a taskStore in `getTaskStore`");
        }

        this.taskStore = taskStore;

        return taskStore;
    },

    /**
     * Provides a reference to a {@link Gnt.data.TaskStore task store} instance, which the task will use to access the global
     * {@link Gnt.data.Calendar calendar}. Calling this does *not* add the model to the task store. Call this method if you want to use
     * methods like {@link #setStartDate} or {@link #setEndDate} that should take the store calendar into account.
     *
     * @param {Gnt.data.TaskStore} the task store
     */
    setTaskStore: function (taskStore) {
        this.taskStore = taskStore;
    },


    /**
     * Returns true if the task is manually scheduled. Manually scheduled task is not affected by incoming dependencies or
     * constraints. Also, the manually scheduled parent task is not affected by its child tasks positions and behaves like any other normal task.
     *
     * @return {Boolean} The value of the ManuallyScheduled field
     */
    isManuallyScheduled: function () {
        return this.get(this.schedulingModeField) === 'Manual' || this.get(this.manuallyScheduledField);
    },

    /*
     * Sets the task manually scheduled status.
     * If that field was set to "Manual", calling this method with false value will set the scheduling mode to "Normal".
     *
     * @param {Boolean} value The new value of the SchedulingMode field
     */
//    setManuallyScheduled: function (value) {
//        if (value) {
//            this.set(this.schedulingModeField, 'Manual');
//        } else {
//            if (this.get(this.schedulingModeField) == 'Manual') {
//                this.set(this.schedulingModeField, 'Normal');
//            }
//        }
//
//        return this.set(this.manuallyScheduledField, value);
//    },


    /**
     * @method getSchedulingMode
     *
     * Returns the scheduling mode of this task
     *
     * @return {String} scheduling mode string
     */


    /**
     * Sets the scheduling mode for this task.
     *
     * @param {String} value Name of the scheduling mode. See {@link #schedulingModeField} for details.
     * @param {Function} [callback] Callback function to call after task's scheduling mode has been changed and possible
     *  changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setSchedulingMode : function(value, callback) {
        var me = this;

        me.propagateChanges(
            function () {
                return me.setSchedulingModeWithoutPropagation(value);
            },
            callback
        );
    },


    setSchedulingModeWithoutPropagation : function(value) {
        var me = this,
            propagationSource;

        // <debug>
        Ext.Array.contains(me.recognizedSchedulingModes, value) ||
           Ext.Error.raise("Unrecognized scheduling mode: " + value);
        // </debug>

        if (me.getSchedulingMode() != value) {

            me.set(this.schedulingModeField, value);

            switch (value) {
                case 'FixedDuration'    : me.updateEffortBasedOnDuration(); break;
                case 'EffortDriven'     : me.updateSpanBasedOnEffort(); break;
            }

            var predecessors = me.getPredecessors();

            if (predecessors.length > 0) {
                propagationSource = predecessors[0];
            }
            else {
                propagationSource = me;
            }
        }

        return propagationSource;
    },

    /**
     * @method getSegments
     * Gets the segments for this task
     * @return {[Gnt.model.TaskSegment]}
     */

    skipWorkingTime : function (date, duration, isForward, segments) {
        var result;
        var durationLeft;

        isForward   = isForward !== false;

        var cfg             = {
            isForward   : isForward,
            segments    : segments || false,
            // take resources into account if any
            resources   : this.hasResources(),
            fn          : function (from, to) {
                var diff            = to - from,
                    dstDiff         = new Date(from).getTimezoneOffset() - new Date(to).getTimezoneOffset();

                if (diff >= durationLeft) {
                    result          = new Date((isForward ? from : to) - 0 + (isForward ? 1 : -1) * durationLeft);

                    return false;
                } else {
                    durationLeft    -= diff + dstDiff * 60 * 1000;
                }
            }
        };

        if (Ext.isObject(date)) {
            Ext.apply(cfg, date);
        } else {
            if (isForward) {
                cfg.startDate   = date;
            } else {
                cfg.endDate     = date;
            }
        }

        durationLeft    = duration || cfg.duration;

        if (!durationLeft) return date;

        this.forEachAvailabilityInterval(cfg);

        return result;
    },

    /**
     * @ignore
     */
    skipNonWorkingTime : function (date, isForward, segments) {
        var skipped     = false;

        isForward       = isForward !== false;

        var cfg             = {
            isForward   : isForward,
            segments    : segments || false,
            // take resources into account if any
            resources   : this.hasResources(),
            fn          : function (from, to) {
                // if found interval has zero time length then nothing to skip so we just ignore it.
                // TODO: need to review a possibility to move this condition right into forEachAvailabilityInterval() body
                if (from !== to) {
                    date        = isForward ? from : to;
                    skipped     = true;

                    return false;
                }
            }
        };

        if (Ext.isObject(date)) {
            Ext.apply(cfg, date);
        } else {
            if (isForward) {
                cfg.startDate   = date;
            } else {
                cfg.endDate     = date;
            }
        }

        // resetting the date to the earliest availability interval
        this.forEachAvailabilityInterval(cfg);

        return skipped ? new Date(date) : this.getCalendar().skipNonWorkingTime(date, isForward);
    },


    /**
     * @method getStartDate
     *
     * Returns the start date of this task
     *
     * @return {Date} start date
     */


    /**
     * Depending from the arguments, set either `StartDate + EndDate` fields of this task, or `StartDate + Duration`
     * considering the weekends/holidays rules. The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * @param {Date} date Start date to set
     * @param {Boolean} [keepDuration=true] Pass `true` to keep the duration of the task ("move" the task), `false` to change the duration ("resize" the task).
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the start date to the earliest available working time (if it falls on non-working time).
     * @param {Function} [callback] Callback function to call after start date has been set and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setStartDate : function (date, keepDuration, skipNonWorkingTime, callback) {
        var me  = this;

        me.propagateChanges(
            function () {
                return me.setStartDateWithoutPropagation(date, keepDuration, skipNonWorkingTime);
            },
            function (canceled, affectedTasks) {
                if (canceled) {
                    me.rejectSegmentsProjection();
                }
                else {
                    me.commitSegmentsProjection();
                }

                callback && callback.apply(this, arguments);
            }
        );
    },


    // TODO: refactor this
    setStartDateWithoutPropagation : function (date, keepDuration, skipNonWorkingTime) {
        var me = this,
            taskStore = me.getTaskStore(true),
            duration, endDate;

        // {{{ Parameters normalization
        keepDuration = keepDuration !== false;

        if (taskStore && skipNonWorkingTime !== true && skipNonWorkingTime !== false) {
            skipNonWorkingTime = taskStore.skipWeekendsDuringDragDrop;
        }
        else if (skipNonWorkingTime !== true && skipNonWorkingTime !== false) {
            skipNonWorkingTime = false;
        }
        // }}}

        me.beginEdit();

        if (!date) {
            me.set(me.durationField, null);
            me.set(me.startDateField, null);
            me.setSegments(null);

        } else {
            if (skipNonWorkingTime) {
                // for milestones we skip non-working backwards, for normal tasks - forward
                date = me.skipNonWorkingTime(date, !me.isMilestone());
            }

            var currentStartDate    = me.getStartDate();

            me.set(me.startDateField, date);

            // recalculate split dates after start date is moved
            if (taskStore && me.isSegmented() && (date - currentStartDate)) {
                me.updateSegmentsDates();
            }

            if (keepDuration !== false) {
                me.set(me.endDateField, me.recalculateEndDate(date));
            } else {
                endDate  = this.getEndDate();

                if (endDate) {
                    // truncate segments that don't fit into master task range and shrink/expand last segment
                    this.constrainSegments();

                    me.set(me.durationField, me.calculateDuration(date, endDate, me.getDurationUnit()));
                }
            }
        }
        // eof "has `date`" branch

        duration            = me.getDuration();
        endDate             = me.getEndDate();

        if (date && endDate && (duration === undefined || duration === null)) {
            me.set(me.durationField, me.calculateDuration(date, endDate, me.getDurationUnit()));
        }

        me.onPotentialEffortChange();

        me.endEdit();

        return true;
    },


    /**
     * @method getEndDate
     *
     * Returns the end date of this task
     *
     * @return {Date} end date
     */


    /**
     * Depending from the arguments, set either `StartDate + EndDate` fields of this task, or `EndDate + Duration`
     * considering the weekends/holidays rules. The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * @param {Date} date End date to set
     * @param {Boolean} [keepDuration=true] Pass `true` to keep the duration of the task ("move" the task), `false` to change the duration ("resize" the task).
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the end date to the previous working day (if it falls on weekend/holiday).
     * @param {Function} [callback] Callback function to call after end date has been set and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setEndDate : function (date, keepDuration, skipNonWorkingTime, callback) {
        var me  = this;

        me.propagateChanges(
            function() {
                return me.setEndDateWithoutPropagation(date, keepDuration, skipNonWorkingTime);
            },
            function (canceled, affectedTasks) {
                if (canceled) {
                    me.rejectSegmentsProjection();
                }
                else {
                    me.commitSegmentsProjection();
                }

                callback && callback.apply(this, arguments);
            }
        );
    },

    // TODO: refactor this
    setEndDateWithoutPropagation : function (date, keepDuration, skipNonWorkingTime) {
        var me = this,
            taskStore = me.getTaskStore(true),
            duration, startDate;

        // {{{ Parameters normalization
        keepDuration = keepDuration !== false;

        if (skipNonWorkingTime !== true && skipNonWorkingTime !== false && taskStore) {
            skipNonWorkingTime = taskStore.skipWeekendsDuringDragDrop;
        }
        else if (skipNonWorkingTime !== true && skipNonWorkingTime !== false) {
            skipNonWorkingTime = false;
        }
        // }}}

        me.beginEdit();

        var currentEndDate    = me.getEndDate();

        if (!date) {
            me.set(me.durationField, null);
            me.set(me.endDateField, null);
            me.setSegments(null);
        } else {
            startDate       = me.getStartDate();
            // task end date cannot be less than its start date
            if (date < startDate && keepDuration === false) {
                date        = startDate;
            }

            if (skipNonWorkingTime) {
                date        = me.skipNonWorkingTime(date, false);
            }

            if (keepDuration !== false) {
                duration    = me.getDuration();

                if (Ext.isNumber(duration)) {

                    // recalculate segments dates (we need this to calculate the task start date properly)
                    if (taskStore && me.isSegmented() && (date - currentEndDate)) {
                        me.updateSegmentsDates({
                            isForward   : false,
                            endDate     : date
                        });
                    }

                    me.set(me.startDateField, me.calculateStartDate(date, duration, me.getDurationUnit()));
                    me.set(me.endDateField, date);
                } else {
                    me.set(me.endDateField, date);
                }
            } else {
                var wasMilestone    = me.isMilestone();

                // if end date after adjusting to calendar is less than start date
                // then it's going to be a milestone and we set start date equal to adjusted end date
                if (date < startDate) {
                    me.set(me.startDateField, date);
                }

                me.set(me.endDateField, date);

                me.constrainSegments();

                if (startDate) {
                    me.set(me.durationField, me.calculateDuration(startDate, date, me.getDurationUnit()));

                    // if we converted to regular task from milestone
                    // let's make sure that task start is adjusted to the calendar
                    if (wasMilestone && !me.isMilestone()) {
                        var properStartDate = me.skipNonWorkingTime(startDate, true);
                        if (properStartDate - startDate !== 0) {
                            // set start date adjusted to the calendar
                            me.set(me.startDateField, properStartDate);
                        }
                    }
                }
            }
        }

        duration            = me.getDuration();
        startDate           = me.getStartDate();

        if (date && startDate && (duration === undefined || duration === null)) {
            me.set(me.durationField, me.calculateDuration(startDate, date, me.getDurationUnit()));
        }

        me.onPotentialEffortChange();

        me.endEdit();

        return true;
    },

    /**
     * Sets the `StartDate / EndDate / Duration` fields of this task, considering the availability/holidays information.
     * The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * @param {Date} startDate Start date to set
     * @param {Date} endDate End date to set
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the start/end dates to the next/previous working day (if they falls on weekend/holiday).
     * @param {Function} [callback] Callback function to call after start/end date has been set and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setStartEndDate : function (startDate, endDate, skipNonWorkingTime, callback) {
        var me  = this;

        // This is required to have Data components tests green
        skipNonWorkingTime = skipNonWorkingTime || false;

        me.propagateChanges(
            function() {
                return me.setStartEndDateWithoutPropagation(startDate, endDate, skipNonWorkingTime);
            },
            function (canceled, affectedTasks) {
                if (canceled) {
                    me.rejectSegmentsProjection();
                }
                else {
                    me.commitSegmentsProjection();
                }

                callback && callback.apply(this, arguments);
            }
        );
    },

    setStartEndDateWithoutPropagation : function(startDate, endDate, skipNonWorkingTime) {
        var me = this,
            taskStore = me.getTaskStore(true);

        // {{{ Parameters normalization
        if (skipNonWorkingTime !== true && skipNonWorkingTime !== false && taskStore) {
            skipNonWorkingTime = taskStore.skipWeekendsDuringDragDrop;
        }
        else if (skipNonWorkingTime !== true && skipNonWorkingTime !== false) {
            skipNonWorkingTime = false;
        }
        // }}}

        if (skipNonWorkingTime) {
            startDate = startDate && me.skipNonWorkingTime(startDate, true);
            endDate   = endDate && me.skipNonWorkingTime(endDate, false);

            if (endDate < startDate) {
                startDate = endDate;
            }
        }

        var currentStartDate    = me.getStartDate(),
            currentEndDate      = me.getEndDate();

        me.beginEdit();

        me.set(me.startDateField, startDate);
        me.set(me.endDateField,   endDate);

        // recalculate split dates
        if (me.getTaskStore(true) && me.isSegmented() && ((startDate - currentStartDate) || (endDate - currentEndDate))) {
            me.updateSegmentsDates();
        }

        if (endDate - currentEndDate) {
            me.constrainSegments();
        }

        me.set(me.durationField, me.calculateDuration(startDate, endDate, me.getDurationUnit()));

        me.onPotentialEffortChange();

        me.endEdit();

        return true;
    },


    /**
     * Shift the dates for the date range by the passed amount and unit
     * @param {String} unit The unit to shift by (e.g. range.shift(Sch.util.Date.DAY, 2); ) to bump the range 2 days forward
     * @param {Number} amount The amount to shift
     * @param {Function} [callback] Callback function to call after task has been shifted and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    shift : function(unit, amount, callback) {
        var me = this;

        me.setStartEndDate(
            Sch.util.Date.add(me.getStartDate(), unit, amount),
            Sch.util.Date.add(me.getEndDate(), unit, amount),
            undefined,
            callback
        );
    },


    /**
     * Returns the duration of the task expressed in the unit passed as the only parameter (or as specified by the DurationUnit for the task).
     *
     * @param {String} unit Unit to return the duration in. Defaults to the `DurationUnit` field of this task
     *
     * @return {Number} duration
     */
    getDuration: function (unit) {
        if (!unit) return this.get(this.durationField);

        var converter       = this.getUnitConverter(),
            durationInMS    = converter.convertDurationToMs(this.get(this.durationField), this.get(this.durationUnitField));

        return converter.convertMSDurationToUnit(durationInMS, unit);
    },


    /**
     * Returns the effort of the task expressed in the unit passed as the only parameter (or as specified by the EffortUnit for the task).
     *
     * @param {String} unit Unit to return the effort in. Defaults to the `EffortUnit` field of this task
     *
     * @return {Number} effort
     */
    getEffort: function (unit) {
        var fieldValue      = this.get(this.effortField) || 0;

        if (!unit) return fieldValue;

        var converter       = this.getUnitConverter(),
            durationInMS    = converter.convertDurationToMs(fieldValue, this.getEffortUnit());

        return converter.convertMSDurationToUnit(durationInMS, unit);
    },


    /**
     * Sets the `Effort + EffortUnit` fields of this task. In case the task has the `EffortDriven`
     * {@link #schedulingModeField scheduling mode} will also update the duration of the task accordingly.
     * In case of `DynamicAssignment` mode - will update the assignments.
     *
     * The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * @param {Number} number The number of duration units
     * @param {String} [unit=task.getEffortUnit()] The unit of the effort.
     * @param {Function} [callback] Callback function to call after effort has been set and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setEffort: function (number, unit, callback) {
        var me  = this;

        me.propagateChanges(
            function() {
                return me.setEffortWithoutPropagation(number, unit);
            },
            function (canceled) {
                if (canceled) me.rejectSegmentsProjection(); else me.commitSegmentsProjection();

                callback && callback.apply(this, arguments);
            }
        );
    },


    setEffortWithoutPropagation : function(number, unit) {
        var me = this;

        // {{{ Parameters normalization
        unit = unit || me.getEffortUnit();
        // }}}

        me.beginEdit();

        me.set(me.effortField, number);
        me.set(me.effortUnitField, unit);

        switch (me.getSchedulingMode()) {
            case 'EffortDriven'         : me.updateSpanBasedOnEffort(); break;
            case 'DynamicAssignment'    : me.updateAssignments();       break;
        }

        me.endEdit();

        return true;
    },


    /**
     * Returns the "raw" calendar duration (difference between end and start date) of this task in the given units.
     *
     * Please refer to the "Task durations" section for additional important details about duration units.
     *
     * @param {String} unit Unit to return return the duration in. Defaults to the `DurationUnit` field of this task
     *
     * @return {Number} duration
     */
    getCalendarDuration: function (unit) {
        return this.getUnitConverter().convertMSDurationToUnit(this.getEndDate() - this.getStartDate(), unit || this.get(this.durationUnitField));
    },


    /**
     * Sets the `Duration + DurationUnit + EndDate` fields of this task, considering the weekends/holidays rules.
     * The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * May also update additional fields, depending from the {@link #schedulingModeField scheduling mode}.
     *
     * @param {Number} number The number of duration units
     * @param {String} [unit=task.getDurationUnit()] The unit of the duration.
     * @param {Function} [callback] Callback function to call after duration has been set and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setDuration : function(number, unit, callback) {
        var me  = this;

        me.propagateChanges(
            function() {
                return me.setDurationWithoutPropagation(number, unit);
            },
            function (canceled) {
                if (canceled) me.rejectSegmentsProjection(); else me.commitSegmentsProjection();

                callback && callback.apply(this, arguments);
            }
        );
    },


    setDurationWithoutPropagation: function(number, unit) {
        var me = this;

        // {{{ Parameters normalization
        unit = unit || me.getDurationUnit();
        // }}}

        var wasMilestone = me.isMilestone();

        me.beginEdit();

        // Provide project start date (if any) or now as start date if it isn't already set
        if (Ext.isNumber(number) && !me.getStartDate()) {
            var taskStore       = me.getTaskStore(true);
            var newStartDate    = (taskStore && taskStore.getProjectStartDate()) || Ext.Date.clearTime(new Date());
            me.setStartDateWithoutPropagation(newStartDate);
        }

        var newEndDate = null;

        this.constrainSegments({ duration : number, unit : unit });

        if (Ext.isNumber(number)) {
            newEndDate = me.calculateEndDate(me.getStartDate(), number, unit);
        }

        me.set(me.endDateField, newEndDate);
        me.set(me.durationField, number);
        me.set(me.durationUnitField, unit);

        // if task is switched to/from milestone then we also need
        // to check if start/end dates are adjusted to the calendar
        if (me.isMilestone() != wasMilestone) {
            // if it's not a milestone now
            if (wasMilestone) {
                // check if start date is adjusted to calendar
                var startDate       = me.getStartDate();
                if (startDate) {
                    var properStartDate = me.skipNonWorkingTime(startDate, true);
                    if (properStartDate - startDate !== 0) {
                        // set start date adjusted to the calendar
                        me.set(me.startDateField, properStartDate);
                    }
                }
            // if it's a milestone
            } else if (newEndDate) {
                // skip non-working time backward
                var properEndDate   = me.skipNonWorkingTime(newEndDate, false);
                if (properEndDate - newEndDate !== 0) {
                    // set start/end dates adjusted to the calendar
                    me.set(me.startDateField, properEndDate);
                    me.set(me.endDateField, properEndDate);
                }
            }
        }

        me.onPotentialEffortChange();

        me.endEdit();

        return true;
    },


    calculateStartDate : function (endDate, duration, unit) {
        unit = unit || this.getDurationUnit();

        if (!duration) return endDate;

        // if there are any assignments, need to take them into account when calculating the duration
        if (this.getTaskStore(true)) {

            var remainingDurationInMS   = this.getUnitConverter().convertDurationToMs(duration, unit || this.getDurationUnit());

            var startDate;

                this.forEachAvailabilityInterval(
                    {
                        endDate     : endDate,
                        isForward   : false,
                        // if there are any assignments, need to take them into account when calculating the duration
                        resources   : this.hasResources()
                    },
                    function (intervalStartDate, intervalEndDate, currentResources) {
                        var intervalDuration    = intervalEndDate - intervalStartDate;

                if (intervalDuration >= remainingDurationInMS) {

                    startDate             = new Date(intervalEndDate - remainingDurationInMS);

                    return false;

                } else {
                    remainingDurationInMS   -= intervalDuration;
                }
            });

            return startDate;

        } else {
            // otherwise just consult the calendar
            return this.getCalendar().calculateStartDate(endDate, duration, unit);
        }
    },



     //Recalculates a task end date based on a new startdate (use task start date if omitted)
    recalculateEndDate : function (startDate) {
        var me = this,
            result,
            duration;

        startDate = startDate || me.getStartDate();

        if (startDate && me.getSchedulingMode() == 'EffortDriven') {
            result = me.calculateEffortDrivenEndDate(startDate, me.getEffort());
        }
        else {
            duration = me.getDuration();

            if (startDate && Ext.isNumber(duration)) {
                result = me.calculateEndDate(startDate, duration, me.getDurationUnit());
            }
            else {
                result = me.getEndDate();
            }
        }

        return result;
    },


    calculateEndDate : function (startDate, duration, unit) {
        unit = unit || this.getDurationUnit();

        if (!duration) return startDate;

        var schedulingMode  = this.getSchedulingMode(),
            options         = { startDate : startDate },
            endDate;

        // if there are any assignments, need to take them into account when calculating the duration
        // but only for "normal" scheduling mode
        // for "EffortDriven" one should use "calculateEffortDrivenEndDate"
        // for "FixedDuration/DynamicAssignment" assignments should not affect the end date of the task
        if (
            this.getTaskStore(true) &&
            schedulingMode != 'FixedDuration' &&
            schedulingMode != 'DynamicAssignment' &&
            schedulingMode != 'EffortDriven'
        ) {
            var leftDuration    = this.getUnitConverter().convertDurationToMs(duration, unit);

            options.resources   = this.hasResources();

            this.forEachAvailabilityInterval(options, function (from, till) {
                var intervalDuration    = till - from;

                if (intervalDuration >= leftDuration) {

                    endDate             = new Date(from + leftDuration);

                    return false;

                } else {
                    var dstDiff     = new Date(from).getTimezoneOffset() - new Date(till).getTimezoneOffset();
                    leftDuration    -= intervalDuration + dstDiff * 60 * 1000;
                }
            });

        } else {
            // otherwise just consult the calendar
            return this.getCalendar().calculateEndDate(startDate, duration, unit);
        }

        return endDate;
    },


    calculateDuration : function (startDate, endDate, unit) {
        unit = unit || this.getDurationUnit();

        if (!startDate || !endDate) {
            return 0;
        }

        // if there are any assignments, need to take them into account when calculating the duration
        if (this.getTaskStore(true)) {
            var durationInMS    = 0;

            this.forEachAvailabilityInterval(
                {
                    startDate   : startDate,
                    endDate     : endDate,
                    resources   : this.hasResources()
                }, function (from, till) {
                    var dstDiff     = new Date(from).getTimezoneOffset() - new Date(till).getTimezoneOffset();
                    durationInMS    += till - from + dstDiff * 60 * 1000;
                }
            );

            return this.getUnitConverter().convertMSDurationToUnit(durationInMS, unit);
        } else {
            // otherwise just consult the calendar
            return this.getCalendar().calculateDuration(startDate, endDate, unit);
        }
    },


    isCalendarApplicable : function (calendarId) {
        var startDate   = this.getStartDate();

        if (!startDate) return true;

        var taskStore   = this.getTaskStore(true);
        if (!taskStore) return true;

        var endDate     = Sch.util.Date.add(startDate, 'd', (taskStore && taskStore.availabilitySearchLimit) || 5*365);

        var assignments         = this.getAssignments();
        var resourcesCalendars  = [];

        Ext.each(assignments, function (assignment) {
            var resource    = assignment.getResource();

            if (resource) {
                resourcesCalendars.push(resource.getCalendar());
            }
        });

        if (!resourcesCalendars.length) return true;

        var calendar = Gnt.data.Calendar.getCalendar(calendarId);

        for (var i = 0, l = resourcesCalendars.length; i < l; i++) {
            if (calendar.isAvailabilityIntersected(resourcesCalendars[i], startDate, endDate)) return true;
        }

        return false;
    },


    forEachAvailabilityInterval : function (options, func, scope) {
        func                        = func || options.fn;
        scope                       = scope || options.scope || this;

        var me                      = this,
            startDate               = options.startDate,
            endDate                 = options.endDate,
            includeEmptyIntervals   = options.includeEmptyIntervals,
            needResources           = options.resources,
            useSegments             = options.segments || (options.segments !== false),
            // isForward enabled by default
            isForward               = options.isForward !== false,
            DATE                    = Sch.util.Date,
            cursorDate, segments;

        // need taskStore to get default `availabilitySearchLimit` value
        var store                   = this.getTaskStore(true);

        if (isForward) {
            if (!startDate) throw new Error("forEachAvailabilityInterval: `startDate` is required when `isForward` is true");

            // if no boundary we still have to specify some limit
            if (!endDate) endDate = DATE.add(startDate, 'd', options.availabilitySearchLimit || (store && store.availabilitySearchLimit) || 5*365);

            cursorDate  = new Date(startDate);
        } else {
            if (!endDate) throw new Error("forEachAvailabilityInterval: `endDate` is required when `isForward` is false");

            // if no boundary we still have to specify some limit
            if (!startDate) startDate = DATE.add(endDate, 'd', - (options.availabilitySearchLimit || (store && store.availabilitySearchLimit) || 5*365));

            cursorDate  = new Date(endDate);
        }

        var taskCalendar                = this.getOwnCalendar(),
            projectCalendar             = this.getProjectCalendar(),

            resourceByCalendar          = {},
            calendars                   = [];

        // if we take resources into account
        if (needResources) {

            var resourceFound   = false;
            // we can provide list of assignments as well
            var assignments     = options.assignments;

            // helper function to prepare resources data
            var handleResource  = function (resource) {
                var resourceId  = resource.getInternalId(),
                    assignment  = assignments && Ext.Array.findBy(assignments, function (a) { return a.getResourceId() == resource.getInternalId(); }) || me.getAssignmentFor(resource),
                    calendar    = resource.getCalendar(),
                    id          = calendar.getCalendarId();

                if (!resourceByCalendar[id]) {
                    resourceByCalendar[id]  = [];

                    calendars.push(calendar);
                }

                resourceByCalendar[id].push({
                    assignment      : assignment,
                    resourceId      : resourceId,
                    units           : assignment && assignment.getUnits()
                });

                resourceFound   = true;
            };

            // user has provided the resources to use for iteration
            if (needResources !== true) {

                Ext.each(needResources, handleResource);

                // otherwise retrieve all assigned resources
            } else {
                Ext.each(this.getAssignments(), function (assignment) {
                    var resource    = assignment.getResource();

                    if (resource) handleResource(resource);
                });
            }

            // if there are no resources - then iterator should not be called by contract, just return
            if (!resourceFound) return;

            // if we don't use resource calendars for calculation then we gonna use the task/project calendar
        } else {
            taskCalendar    = taskCalendar || projectCalendar;
        }

        if (useSegments) {
            if (!Ext.isArray(useSegments)) {
                segments  = this.getSegments();
            } else {
                segments  = useSegments;
            }
        }

        var i, k, l, interval, intervalStartDate, intervalEndDate;

        while (isForward ? cursorDate < endDate : cursorDate > startDate) {
            var pointsByTime        = {};
            var pointTimes          = [];
            var cursorDT            = cursorDate - (isForward ? 0 : 1);

            // if a task has a custom calendar
            if (taskCalendar) {
                var taskIntervals       = taskCalendar.getAvailabilityIntervalsFor(cursorDT);

                // the order of intervals processing doesn't matter here, since we are just collecting the "points of interest"
                for (k = 0, l = taskIntervals.length; k < l; k++) {
                    interval            = taskIntervals[ k ];
                    intervalStartDate   = interval.startDate - 0;
                    intervalEndDate     = interval.endDate - 0;

                    if (!pointsByTime[ intervalStartDate ]) {
                        pointsByTime[ intervalStartDate ] = [];

                        pointTimes.push(intervalStartDate);
                    }
                    pointsByTime[ intervalStartDate ].push({
                        type            : '00-taskAvailailabilityStart',
                        typeBackward    : '01-taskAvailailabilityStart'
                    });

                    pointTimes.push(intervalEndDate);

                    pointsByTime[ intervalEndDate ] = pointsByTime[ intervalEndDate ] || [];
                    pointsByTime[ intervalEndDate ].push({
                        type            : '01-taskAvailailabilityEnd',
                        typeBackward    : '00-taskAvailailabilityEnd'
                    });
                }
            }

            // if we take segmentation into account
            if (segments) {

                var from, till;

                if (isForward) {
                    from    = cursorDate;
                    till    = DATE.getStartOfNextDay(cursorDate);
                } else {
                    from    = DATE.getEndOfPreviousDay(cursorDate);
                    till    = cursorDate;
                }

                var intervals   = this.getSegmentIntervalsForRange(from, till, segments);

                if (intervals) {
                    for (i = 0, l = intervals.length; i < l; i++) {
                        intervalStartDate   = intervals[i][0];
                        intervalEndDate     = intervals[i][1];

                        if (!pointsByTime[ intervalStartDate ]) {
                            pointsByTime[ intervalStartDate ] = [];

                            pointTimes.push(intervalStartDate);
                        }

                        pointsByTime[ intervalStartDate ].push({
                            type            : '04-taskSegmentStart',
                            typeBackward    : '05-taskSegmentStart'
                        });

                        pointTimes.push(intervalEndDate);

                        pointsByTime[ intervalEndDate ] = pointsByTime[ intervalEndDate ] || [];

                        pointsByTime[ intervalEndDate ].push({
                            type            : '05-taskSegmentEnd',
                            typeBackward    : '04-taskSegmentEnd'
                        });
                    }
                }
            }

            var resourceList;

            // loop over resources having custom calendars
            for (i = 0, l = calendars.length; i < l; i++) {
                var cal                 = calendars[ i ],
                    resourceIntervals   = cal.getAvailabilityIntervalsFor(cursorDT);

                resourceList        = resourceByCalendar[ cal.getCalendarId() ];

                // using "for" instead of "each" should be blazing fast! :)
                // the order of intervals processing doesn't matter here, since we are just collecting the "points of interest"
                for (k = 0; k < resourceIntervals.length; k++) {
                    interval            = resourceIntervals[ k ];
                    intervalStartDate   = interval.startDate - 0;
                    intervalEndDate     = interval.endDate - 0;

                    if (!pointsByTime[ intervalStartDate ]) {
                        pointsByTime[ intervalStartDate ] = [];

                        pointTimes.push(intervalStartDate);
                    }
                    pointsByTime[ intervalStartDate ].push({
                        type            : '02-resourceAvailailabilityStart',
                        typeBackward    : '03-resourceAvailailabilityStart',
                        resources       : resourceList
                    });

                    if (!pointsByTime[ intervalEndDate ]) {
                        pointsByTime[ intervalEndDate ] = [];

                        pointTimes.push(intervalEndDate);
                    }
                    pointsByTime[ intervalEndDate ].push({
                        type            : '03-resourceAvailailabilityEnd',
                        typeBackward    : '02-resourceAvailailabilityEnd',
                        resources       : resourceList
                    });
                }
            }

            pointTimes.sort();

            var inTask              = false,
                inSegment           = false,
                currentResources    = {},
                resourceCounter     = 0,
                points, point, m, n;

            if (isForward) {
                for (i = 0, l = pointTimes.length; i < l; i++) {
                    points          = pointsByTime[ pointTimes[ i ] ];

                    points.sort(function (a, b) { return a.type < b.type ? 1 : -1; });

                    for (k = 0; k < points.length; k++) {
                        point           = points[ k ];

                        switch (point.type) {
                            case '00-taskAvailailabilityStart' : inTask  = true; break;

                            case '01-taskAvailailabilityEnd' : inTask  = false; break;

                            case '02-resourceAvailailabilityStart' :
                                resourceList    = point.resources;
                                for (m = 0, n = resourceList.length; m < n; m++) {
                                    currentResources[resourceList[m].resourceId]    = resourceList[m];
                                    resourceCounter++;
                                }
                                break;

                            case '03-resourceAvailailabilityEnd' :
                                resourceList    = point.resources;
                                for (m = 0, n = resourceList.length; m < n; m++) {
                                    delete currentResources[resourceList[m].resourceId];
                                    resourceCounter--;
                                }
                                break;

                            case '04-taskSegmentStart' : inSegment = true; break;

                            case '05-taskSegmentEnd' : inSegment = false; break;
                        }
                    }

                    if ((inTask || !taskCalendar) && (!segments || inSegment) && (!needResources || resourceCounter || includeEmptyIntervals)) {
                        intervalStartDate       = pointTimes[ i ];
                        intervalEndDate         = pointTimes[ i + 1 ];

                        // availability interval is out of [ startDate, endDate )
                        if (intervalStartDate >= endDate || intervalEndDate <= startDate) continue;

                        if (intervalStartDate < startDate) intervalStartDate = startDate - 0;
                        if (intervalEndDate > endDate) intervalEndDate = endDate - 0;

                        if (func.call(scope, intervalStartDate, intervalEndDate, currentResources) === false) return false;
                    }
                }
            } else {
                for (i = pointTimes.length - 1; i >= 0; i--) {
                    points          = pointsByTime[ pointTimes[ i ] ];

                    points.sort(function (a, b) { return a.typeBackward < b.typeBackward ? 1 : -1; });

                    for (k = 0; k < points.length; k++) {
                        point           = points[ k ];

                        switch (point.typeBackward) {
                            case '00-taskAvailailabilityEnd' : inTask  = true; break;

                            case '01-taskAvailailabilityStart' : inTask  = false; break;

                            case '02-resourceAvailailabilityEnd' :
                                resourceList    = point.resources;
                                for (m = 0, n = resourceList.length; m < n; m++) {
                                    currentResources[resourceList[m].resourceId]    = resourceList[m];
                                    resourceCounter++;
                                }
                                break;

                            case '03-resourceAvailailabilityStart' :
                                resourceList    = point.resources;
                                for (m = 0, n = resourceList.length; m < n; m++) {
                                    delete currentResources[resourceList[m].resourceId];
                                    resourceCounter--;
                                }
                                break;

                            case '04-taskSegmentEnd' : inSegment = true; break;

                            case '05-taskSegmentStart' : inSegment = false; break;
                        }
                    }

                    if ((inTask || !taskCalendar) && (!segments || inSegment) && (!needResources || resourceCounter || includeEmptyIntervals)) {
                        intervalStartDate       = pointTimes[ i - 1 ];
                        intervalEndDate         = pointTimes[ i ];

                        // availability interval is out of [ startDate, endDate )
                        if (intervalStartDate > endDate || intervalEndDate <= startDate) continue;

                        if (intervalStartDate < startDate) intervalStartDate = startDate - 0;
                        if (intervalEndDate > endDate) intervalEndDate = endDate - 0;

                        if (func.call(scope, intervalStartDate, intervalEndDate, currentResources) === false) return false;
                    }
                }
            }
            // eof backward branch

            // does not perform cloning internally!
            cursorDate       = isForward ? DATE.getStartOfNextDay(cursorDate) : DATE.getEndOfPreviousDay(cursorDate);
        }
        // eof while
    },

    // iterates over the common availability intervals for tasks and resources in between `startDate/endDate`
    // note, that function will receive start/end dates as number, not dates (for optimization purposes)
    // this method is not "normalized" intentionally because of performance considerations
    forEachAvailabilityIntervalWithResources : function (options, func, scope) {
        if (!options.resources) options.resources = true;

        this.forEachAvailabilityInterval.apply(this, arguments);
    },


    calculateEffortDrivenEndDate : function (startDate, effort, unit) {
        var effortInMS      = this.getUnitConverter().convertDurationToMs(effort, unit || this.getEffortUnit());

        var endDate         = new Date(startDate);

        this.forEachAvailabilityIntervalWithResources({ startDate : startDate }, function (intervalStartDate, intervalEndDate, currentResources) {
            var totalUnits          = 0;

            for (var i in currentResources) totalUnits += currentResources[ i ].units;

            var intervalDuration    = intervalEndDate - intervalStartDate;
            var availableEffort     = totalUnits * intervalDuration / 100;

            if (availableEffort >= effortInMS) {

                endDate             = new Date(intervalStartDate + effortInMS / availableEffort * intervalDuration);

                return false;

            } else {
                effortInMS          -= availableEffort;
            }
        });

        return endDate;
    },


    // this method has a contract that all child parents should already have refeshed data, so it should be called
    // in the "bubbling" order - starting from deeper nodes to closer to root
    refreshCalculatedParentNodeData : function () {
        var autoCalculatePercentDoneForParentTask   = this.autoCalculatePercentDoneForParentTask;
        var autoCalculateEffortForParentTask        = this.autoCalculateEffortForParentTask;

        var childNodes                  = this.childNodes;
        var length                      = childNodes.length;
        var changedFields               = {};

        if (length > 0 && (autoCalculateEffortForParentTask || autoCalculatePercentDoneForParentTask)) {
            var totalEffortInMS         = 0;
            var totalDurationInMS       = 0;
            var completedDurationInMS   = 0;

            for (var k = 0; k < length; k++) {
                var childNode           = childNodes[ k ];
                var isLeaf              = childNode.isLeaf();

                if (autoCalculateEffortForParentTask) totalEffortInMS += childNode.getEffort('MILLI');

                if (autoCalculatePercentDoneForParentTask) {
                    var durationInMS        = isLeaf ? childNode.getDuration('MILLI') || 0 : childNode.childTasksDuration;

                    totalDurationInMS       += durationInMS;
                    completedDurationInMS   += isLeaf ? durationInMS * (childNode.getPercentDone() || 0) : childNode.completedChildTasksDuration;
                }
            }

            if (autoCalculateEffortForParentTask && this.getEffort('MILLI') != totalEffortInMS) {
                changedFields.Effort        = true;
                this.setEffortWithoutPropagation(this.getUnitConverter().convertMSDurationToUnit(totalEffortInMS, this.getEffortUnit()));
            }

            if (autoCalculatePercentDoneForParentTask) {
                this.childTasksDuration             = totalDurationInMS;
                this.completedChildTasksDuration    = completedDurationInMS;

                var newPercentDone          = totalDurationInMS ? completedDurationInMS / totalDurationInMS : 0;

                if (this.getPercentDone() != newPercentDone) {
                    changedFields.PercentDone       = true;
                    this.setPercentDone(newPercentDone);
                }
            }
        }


        var startChanged, endChanged;

        if (!this.isRoot() && length > 0 && !this.isManuallyScheduled()) {

            var minDate  = new Date(-8640000000000000),
                maxDate  = new Date(+8640000000000000),
                earliest = new Date(+8640000000000000), //new Date(maxDate)
                latest   = new Date(-8640000000000000); //new Date(minDate) - this works incorrect in FF

            for (var i = 0; i < length; i++) {
                var r       = childNodes[i];

                earliest    = Sch.util.Date.min(earliest, r.getStartDate() || earliest);
                latest      = Sch.util.Date.max(latest, r.getEndDate() || latest);
            }

            // This could happen if a parent task has two children, one having just start date and another having just an end date
            if (latest < earliest && earliest < maxDate && latest > minDate) {
                var tmp;

                tmp         = latest;
                latest      = earliest;
                earliest    = tmp;
            }

            startChanged    = changedFields.StartDate = earliest - maxDate !== 0 && this.getStartDate() - earliest !== 0;
            endChanged      = changedFields.EndDate = latest - minDate !== 0 && this.getEndDate() - latest !== 0;

            // special case to only trigger 1 update event and avoid extra "recalculateParents" calls
            // wrapping with `beginEdit / endEdit` is not an option, because they do not nest (one "endEdit" will "finalize" all previous "beginEdit")
            if (startChanged && endChanged) {
                this.setStartEndDateWithoutPropagation(earliest, latest, false);
            } else if (startChanged) {
                this.setStartDateWithoutPropagation(earliest, false, false);
            } else if (endChanged) {
                this.setEndDateWithoutPropagation(latest, false, false);
            }
        }

        return changedFields;
    },


    // This function is mostly used for backward compatibility as it does not trigger the changes propagation
    recalculateParents: function () {
        var parent = this.parentNode;

        parent && (
            parent.refreshCalculatedParentNodeData(),
            !this.getTaskStore().cascading && parent.recalculateParents()
        );
        /*
        var parent = this.parentNode;

        if (parent) {
            var changedFields   = parent.refreshCalculatedParentNodeData();
            var startChanged    = changedFields.StartDate;
            var endChanged      = changedFields.EndDate;

            // if `startChanged` or `endChanged` is true, then propagation to parent task has alreday happened in the
            // `onTaskUpdated` method of the TaskStore (during setStart/EndDate call), otherwise need to propagate it manually
            //
            // In the case of cascading, the store listeners are temporarily disabled so we should bubble up if there's a change
            if ((this.getTaskStore().cascading && (startChanged || endChanged)) || (!startChanged && !endChanged)) {
                if (!parent.isRoot()) parent.recalculateParents();
            }
        }
        */
    },


    // TODO: check if it's needed and remove it if it's not
    recalculateAllParents : function () {
        var parent           = this.parentNode,
            hasChangedFields = false,
            changedFields;

        if (parent) {
            changedFields = parent.refreshCalculatedParentNodeData();

            for (var i in changedFields) {
                if (changedFields[ i ]) {
                    hasChangedFields = true;
                    break;
                }
            }

            hasChangedFields && parent.recalculateAllParents();
        }
    },


    /**
     * Returns true if this task is a milestone (has the same start and end dates).
     *
     * @param {Boolean} isBaseline Whether to check for baseline dates instead of "normal" dates. If this argument is provided with
     * "true" value, this method returns the result from the {@link #isBaselineMilestone} method.
     *
     * @return {Boolean}
     */
    isMilestone: function (isBaseline) {
        return isBaseline ? this.isBaselineMilestone() : this.getDuration() === 0;
    },

    /**
     * Converts this task to a milestone (start date will match the end date).
     *
     * @param {Function} [callback] Callback function to call after task has been converted and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    convertToMilestone : function(callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.convertToMilestoneWithoutPropagation();
            },
            callback
        );
    },


    convertToMilestoneWithoutPropagation: function() {
        var me = this,
            propagate = false;

        if (!me.isMilestone()) {
            me.setStartDateWithoutPropagation(me.getEndDate(), false);
            me.setDurationWithoutPropagation(0);
            propagate = true;
        }

        return propagate;
    },

    /**
     * Converts a milestone task to a regular task with a duration of 1 [durationUnit].
     *
     * @param {Function} [callback] Callback function to call after task has been converted and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    convertToRegular : function(callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.convertToRegularWithoutPropagation();
            },
            callback
        );
    },


    convertToRegularWithoutPropagation : function() {
        var me = this,
            propagate = false,
            unit,
            newStart;

        if (me.isMilestone()) {
            unit = me.get(me.durationUnitField);
            newStart = me.calculateStartDate(me.getStartDate(), 1, unit);

            me.setDurationWithoutPropagation(1, unit);
            // we set the `moveParentAsGroup` flag to false, because in me case we don't want/need to
            // change any of child tasks
            me.setStartDateWithoutPropagation(newStart, true, false, false);

            propagate = true;
        }

        return propagate;
    },

    /**
     * Returns true if this task is a "baseline" milestone (has the same start and end baseline dates) or false if it's not or the dates are wrong.
     *
     * @return {Boolean}
     */
    isBaselineMilestone: function() {
        var baseStart = this.getBaselineStartDate(),
            baseEnd   = this.getBaselineEndDate();

        if (baseStart && baseEnd){
            return baseEnd - baseStart === 0;
        }
        return false;
    },


    markAsParent : function() {
        var me = this;

        me.isSegmented() && me.setSegmentsWithoutPropagation(null); // Parent task should never be split
        me.set('leaf', false);
    },


    // Tested in 064_model_binding_to_taskstore.t.js
    // @OVERRIDE
    // TODO remove "isFillingRoot" from task store
    /*afterEdit: function (modifiedFieldNames) {
        // see comment in the `endEdit` method
        // need to restore the `dirty` flag value asap, before the parent method implementation
        if (this.savedDirty != null) {
            this.dirty          = this.savedDirty;
            this.savedDirty     = null;
        }

        // If a node is bound to a store, 'update' will be fired from the task store.
        // Required because of the Ext lazy loading of tree nodes.
        // See http://www.sencha.com/forum/showthread.php?180406-4.1B2-TreeStore-inconsistent-firing-of-update
        if (this.stores.length > 0 || !this.normalized) {
            this.callParent(arguments);
        } else {
            var taskStore = this.taskStore || this.getTaskStore(true);

            if (taskStore && !taskStore.isFillingRoot) {
                taskStore.afterEdit(this, modifiedFieldNames);
            }
            this.callParent(arguments);
        }
    },*/

    /**
     * Returns the duration unit of the task.
     * @return {String} the duration unit
     */
    getDurationUnit: function () {
        return this.get(this.durationUnitField) || 'd';
    },

    /**
     * @method setDurationUnit
     *
     * Updates the duration unit of the task.
     *
     * @param {String} unit New duration unit
     * @return {String} the duration unit
     */


    /**
     * Returns the effort unit of the task.
     * @return {String} the effort unit
     */
    getEffortUnit: function () {
        return this.get(this.effortUnitField) || 'h';
    },

    /**
     * @method setEffortUnit
     *
     * Updates the effort unit of the task.
     *
     * @param {String} unit New effort unit
     * @return {String} the effort unit
     */



    /**
     * @method setPercentDone
     *
     * Sets the percent complete value of the task
     *
     * @param {Number} value The new value
     */

    /**
     * @method getPercentDone
     *
     * Gets the percent complete value of the task
     * @return {Number} The percent complete value of the task
     */

    /**
     * @method getCls
     *
     * Returns the name of field holding the CSS class for each rendered task element
     *
     * @return {String} cls The cls field
     */

    /**
     * @method getBaselineStartDate
     *
     * Returns the baseline start date of this task
     *
     * @return {Date} The baseline start date
     */

    /**
     * @method setBaselineStartDate
     *
     * Sets the baseline start date of this task
     *
     * @param {Date} date
     */

    /**
     * @method getBaselineEndDate
     *
     * Returns the baseline end date of this task
     *
     * @return {Date} The baseline end date
     */

    /**
     * @method setBaselineEndDate
     *
     * Sets the baseline end date of this task
     *
     * @param {Date} date
     */

    /**
     * @method setBaselinePercentDone
     *
     * Sets the baseline percent complete value
     *
     * @param {Number} value The new value
     */

    /**
     * Gets the baseline percent complete value
     * @return {Number} The percent done level of the task
     */
    getBaselinePercentDone : function() {
        return this.get(this.baselinePercentDoneField) || 0;
    },

    /**
     * Returns true if the Task can be persisted (e.g. task and resource are not 'phantoms')
     *
     * @return {Boolean} true if this model can be persisted to server.
     */
    isPersistable : function() {
        var parent = this.parentNode;

        return !parent.phantom;
    },

    /**
     * Returns an array of Gnt.model.Resource instances assigned to this Task.
     *
     * @return {Gnt.model.Resource[]} resources
     */
    getResources : function () {
        var resources = [];

        Ext.each(this.assignments, function (assignment) {
            resources.push(assignment.getResource());
        });

        return resources;
    },


    /**
     * Returns an array of Gnt.model.Assignment instances associated with this Task.
     *
     * @return {Gnt.model.Assignment[]} resources
     */
    getAssignments : function () {
        return this.assignments;
    },


    /**
     * Returns true if this task has any assignments. **Note**, that this function returns `true` even if all assignment records are invalid
     * (ie pointing to non-existing resource in the resource store).
     *
     * @return {Boolean}
     */
    hasAssignments : function () {
        return this.assignments.length > 0;
    },


    /**
     * Returns true if this task has any assignments with valid resources. Returns `true` only if at least one assignment record is valid -
     * pointing to existed resource record in the resource store.
     *
     * @return {Boolean}
     */
    hasResources : function () {
        var hasResources    = false;

        Ext.each(this.assignments, function (assignment) {
            if (assignment.getResource()) {
                hasResources    = true;
                return false;
            }
        });

        return hasResources;
    },


    /**
     * If given resource is assigned to this task, returns a Gnt.model.Assignment record.
     * Otherwise returns `null`
     *
     * @param {Gnt.model.Resource/Number} resourceOrId The instance of {@link Gnt.model.Resource} or resource id
     *
     * @return {Gnt.model.Assignment} resource
     */
    getAssignmentFor : function (resource) {
        var found = null,
            resourceId      = resource instanceof Gnt.model.Resource ? resource.getInternalId() : resource;

        Ext.each(this.assignments, function (assignment) {
            if (assignment.getResourceId() == resourceId) {
                found = assignment;

                return false;
            }
        });

        return found;
    },

    /**
     * @method isAssignedTo
     * Returns true if the task is assigned to a certain resource.
     *
     * @param {Sch.model.Resource} resource The resource to query for
     * @return {Boolean}
     */
    isAssignedTo: function (resource) {
        return !!this.getAssignmentFor(resource);
    },


    /**
     * Assigns this task to the passed Resource or Resource Id.
     *
     * @param {Gnt.model.Resource/Mixed} resourceOrId The instance of a {@link Gnt.model.Resource resource} or its id.
     * @param {Number} units The integer value for the {@link Gnt.model.Assignment#unitsField Units field} of the assignment record.
     * @param {Function} [callback] Callback function to call after resource has been assigned and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    assign : function(resource, units, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.assignWithoutPropagation(resource, units, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },

    assignWithoutPropagation : function (resource, units, cancelAndResultFeedback) {
        var me              = this,
            taskId          = me.getInternalId(),
            cancelActions   = [],
            taskStore       = me.getTaskStore(),
            assignmentStore = taskStore.getAssignmentStore(),
            resourceStore   = taskStore.getResourceStore(),
            assignments     = me.assignments,
            assignment,
            resourceId;

        // {{{ Parameter normalization
        units = units || 100;
        // }}}

        assignment = me.getAssignmentFor(resource);

        // Preconditions:
        // TODO: wrap it into <debug/>
        !assignment ||
            Ext.Error.raise("Resource can't be assigned twice to the same task");

        // If we have a resource model instance but it's not in the resource store then adding it,
        // the resource is proably a phantom record
        if (resource instanceof Gnt.model.Resource && resourceStore.indexOf(resource) == -1) {
            resourceId = resource.getInternalId();
            resourceStore.add(resource);
            cancelActions.push(function() {
                resourceStore.remove(resource);
            });
        }
        // If we have a resource model already in the store then just getting it's id
        else if (resource instanceof Gnt.model.Resource) {
            resourceId = resource.getInternalId();
        }
        // If we don't have a resource model then we must have a resource id, and if a resource with the given id
        // is present in the store then we can proceed
        else if (resourceStore.indexOfId(resource) >= 0) {
            resourceId = resource;
        }
        // Otherwise we have nothing to assign to the task, raising an error
        // TODO: wrap it into <debug/>
        else {
            Ext.Error.raise("Can't assign resource to a task, task's resource store doesn't contain resource id given");
        }

        assignment = new assignmentStore.model();
        assignment.setTaskId(taskId);
        assignment.setResourceId(resourceId);
        assignment.setUnits(units);
        assignmentStore.add(assignment);

        cancelActions.push(function() {
            assignmentStore.remove(assignment);
        });

        // EDGE CASE: If calling Model#assign before a task is added to a store, we need to manually add it to the
        // assignments cache
        if (!me.getTreeStore() && !Ext.Array.contains(assignments, assignment)) {
            assignments.push(assignment);

            // Make sure we remove this added assignment if a constraint operation is rolled back
            cancelActions.push(function() {
                Ext.Array.remove(assignments, assignment);
            });
        }

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            Ext.Array.forEach(cancelActions, function(action) {
                action();
            });
        }, assignment);

        return true;
    },


    /**
     * Un-assign a resource from this task
     *
     * @param {Gnt.model.Resource/Number} resource An instance of the {@link Gnt.model.Resource} class or a resource id
     * @param {Function} [callback] Callback function to call after resource has been unassigned and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    unAssign : function(resource, callback) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.unassignWithoutPropagation(resource, function cancelFeedback(fn) {
                    cancelFn = fn;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },


    unassignWithoutPropagation : function (resource, cancelFeedback) {
        var me               = this,
            taskId           = me.getInternalId(),
            resourceId       = resource instanceof Gnt.model.Resource ? resource.getInternalId() : resource,
            assignmentStore  = me.getAssignmentStore(),
            assignments      = me.assignments,
            assignment       = me.getAssignmentFor(resourceId),
            indexOfAssignment;

        // <debug>
        assignment ||
            Ext.Error.raise("Can't unassign resource `" + resourceId + "` from task `" + me.getInternalId() + "` resource is not assigned to the task!");
        // </debug>

        indexOfAssignment = assignmentStore.indexOf(assignment);
        assignmentStore.remove(assignment);
        // EDGE CASE: If calling Model#unassign before a task is added to a store, we need to manually remove it from the
        // assignments cache
        Ext.Array.remove(assignments, assignment);

        cancelFeedback && cancelFeedback(function() {
            assignmentStore.insert(indexOfAssignment, assignment);
            Ext.Array.insert(assignments, indexOfAssignment, [assignment]);
        });

        return true;
    },


    unassign : function () {
        return this.unAssign.apply(this, arguments);
    },



    // TODO: interceptor is needed only for Gnt.view.Dependency, ask Nick if it can be removed
    /**
     * Links a task to another one given in `toId` with typed dependency given in `type`.
     *
     * @param {Gnt.model.Task|Number} toId
     * @param {Integer} [type=Gnt.model.Dependency.Type.EndToStart] dependency type see {@link Gnt.model.Dependency#Type}.
     * @param {Function} [callback] Callback function to call after tasks has been linked and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    linkTo : function(toId, type, callback, /* private */interceptor) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.linkToWithoutPropagation(toId, type, function cancelFeedback(fn) {
                    cancelFn = fn;
                }, interceptor);
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },


    linkToWithoutPropagation : function(toId, type, cancelFeedback, /* deprecated */interceptor) {
        var me              = this,
            fromId          = me.getInternalId(),
            taskStore       = me.getTaskStore(),
            dependencyStore = me.getDependencyStore(),
            newDependency;

        // {{{ Parameters normalization
        toId   = toId instanceof Gnt.model.Task ? toId.getInternalId() : toId;
        type   = ((type === null || type === undefined) && Gnt.model.Dependency.Type.EndToStart) || type;
        // }}}

        // <debug>
        // Preconditions:
        taskStore.getNodeById(toId instanceof Gnt.model.Task ? toId.getId() : toId) != -1 ||
            Ext.Error.raise("Can't link task `" + fromId + "` to task with id `" + toId + "` the task is not present in the task store!");
        // </debug>

        newDependency = new dependencyStore.model();
        newDependency.setSourceId(fromId);
        newDependency.setTargetId(toId);
        newDependency.setType(type);

        if (dependencyStore.isValidDependency(newDependency) && (!interceptor || interceptor(newDependency) !== false)) {
            dependencyStore.add(newDependency);
        }

        cancelFeedback && cancelFeedback(function() {
            dependencyStore.remove(newDependency);
        });

        return me;
    },


    /**
     * Unlinks a task from another one given in `fromId`.
     *
     * @param {Gnt.model.Task|Number} fromId
     * @param {Function} [callback] Callback function to call after tasks has been unlinked and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    unlinkFrom : function(fromId, callback) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.unlinkFromWithoutPropagation(fromId, function cancelFeedback(fn) {
                    cancelFn = fn;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },


    unlinkFromWithoutPropagation : function(fromId, cancelFeedback) {
        var me                 = this,
            toId               = me.getInternalId(),
            dependencyStore    = me.getDependencyStore(),
            dependency,
            indexOfDependency;

        // {{{ Parameters normalization
        fromId = fromId instanceof Gnt.model.Task ? fromId.getInternalId() : fromId;
        // }}}

        dependency = dependencyStore.getByTaskIds(fromId, toId);

        // <debug>
        // Preconditions:
        dependency ||
            Ext.Error.raise("Can't unlink task '" + toId + "' from task '" + fromId + ", tasks are not linked!");
        // </debug>

        indexOfDependency = dependencyStore.indexOf(dependency);

        dependencyStore.remove(dependency);

        cancelFeedback && cancelFeedback(function() {
            dependencyStore.insert(indexOfDependency, dependency);
        });

        return me;
    },


    // side-effects free method - suitable for use in "normalization" stage
    // calculates the effort based on the assignments information
    calculateEffort : function (startDate, endDate, unit) {
        // effort calculation requires both dates
        if (!startDate || !endDate) return 0;

        var totalEffort     = 0;

        this.forEachAvailabilityIntervalWithResources({ startDate : startDate, endDate : endDate }, function (intervalStartDate, intervalEndDate, currentAssignments) {
            var totalUnits          = 0;

            for (var i in currentAssignments) totalUnits += currentAssignments[ i ].units;

            totalEffort             += (intervalEndDate - intervalStartDate) * totalUnits / 100;
        });

        return this.getUnitConverter().convertMSDurationToUnit(totalEffort, unit || this.getEffortUnit());
    },


    updateAssignments : function () {
        var totalDurationByResource     = {};

        var startDate                   = this.getStartDate();
        var endDate                     = this.getEndDate();

        // do nothing if task is not scheduled
        if (!startDate || !endDate) return;

        var totalTime                   = 0;

        this.forEachAvailabilityIntervalWithResources({ startDate : startDate, endDate : endDate }, function (intervalStartDate, intervalEndDate, currentAssignments) {

            for (var resourceId in currentAssignments) {
                totalTime               += intervalEndDate - intervalStartDate;
            }
        });

        // no available resources?
        if (!totalTime) {
            return;
        }

        var effortInMS      = this.getEffort(Sch.util.Date.MILLI);

        Ext.Array.each(this.getAssignments(), function (assignment) {
            assignment.setUnits(effortInMS / totalTime * 100);
        });
    },


    updateEffortBasedOnDuration : function () {
        this.setEffortWithoutPropagation(this.calculateEffort(this.getStartDate(), this.getEndDate()));
    },


    // Alias for updateEffortBasedOnDuration(). Added to have symmetry with updateSpanBasedOnEffort.
    updateEffortBasedOnSpan : function () {
        this.updateEffortBasedOnDuration();
    },


    updateSpanBasedOnEffort : function () {
        // we have to update startDate because duration change can turn the task into a milestone
        // and for milestones we should set startDate to the end of last working period
        this.setStartEndDateWithoutPropagation(this.getStartDate(), this.recalculateEndDate());
    },


    onPotentialEffortChange : function () {
        switch (this.getSchedulingMode()) {
            case 'FixedDuration'        : this.updateEffortBasedOnDuration(); break;
            case 'DynamicAssignment'    : this.updateAssignments(); break;
        }
    },


    onAssignmentMutation : function () {
        switch (this.getSchedulingMode()) {
            case 'FixedDuration'    : this.updateEffortBasedOnDuration(); break;
            case 'EffortDriven'     : this.updateSpanBasedOnEffort(); break;
            case 'DynamicAssignment'    : this.updateAssignments(); break;
        }
    },


    onAssignmentStructureMutation : function () {
        switch (this.getSchedulingMode()) {
            case 'FixedDuration'        : this.updateEffortBasedOnDuration(); break;
            case 'EffortDriven'         : this.updateSpanBasedOnEffort(); break;
            case 'DynamicAssignment'    : this.updateAssignments(); break;
        }
    },


    adjustToCalendar : function(callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.adjustToCalendarWithoutPropagation();
            },
            callback
        );
    },


    adjustToCalendarWithoutPropagation : function() {
        var taskStore = this.getTaskStore(true),
            propagate = false;

        if (this.get('leaf') && !this.isManuallyScheduled() && taskStore) {
            this.setStartDateWithoutPropagation(this.getStartDate(), true, taskStore.skipWeekendsDuringDragDrop);
            this.constrainWithoutPropagation(taskStore, null);
            propagate = this;
        }

        return propagate;
    },


    /**
     * Checks if the given task field is editable. You can subclass this class and override this method to provide your own logic.
     *
     * It takes the scheduling mode of the task into account. For example for "FixedDuration" mode, the "Effort"
     * field is calculated and should not be updated by user directly.
     *
     * @param {String} fieldName Name of the field
     * @return {Boolean} Boolean value, indicating whether the given field is editable
     */
    isEditable : function (fieldName) {
        if (!this.isLeaf()) {
            if (fieldName === this.effortField && this.autoCalculateEffortForParentTask) return false;
            if (fieldName === this.percentDoneField && this.autoCalculatePercentDoneForParentTask) return false;
        }

        if ((fieldName === this.durationField || fieldName === this.endDateField) && this.getSchedulingMode() === 'EffortDriven') {
            return false;
        }

        if (fieldName === this.effortField && this.getSchedulingMode() === 'FixedDuration') {
            return false;
        }

        return true;
    },


    /**
     * @method isDraggable
     *
     * Returns true if event can be drag and dropped
     * @return {Mixed} The draggable state for the event.
     */
    isDraggable: function () {
        return this.getDraggable();
    },

    /**
     * @method setDraggable
     *
     * Sets the new draggable state for the event
     * @param {Boolean} draggable true if this event should be draggable
     */

    /**
     * @method isResizable
     *
     * Returns true if event can be resized, but can additionally return 'start' or 'end' indicating how this event can be resized.
     * @return {Mixed} The resource Id
     */
    isResizable: function () {
        return this.getResizable();
    },

    /**
     * @method getWBSCode
     *
     * Returns WBS code of task.
     * @return {String} The WBS code string
     */
    getWBSCode: function () {
        var indexes     = [],
            task        = this;

        while (task.parentNode) {
            indexes.push(task.data.index + 1);
            task        = task.parentNode;
        }

        return indexes.reverse().join('.');
    },


    resetTotalCount : function (preventCaching) {
        var task            = this;

        while (task) {
            task.totalCount = preventCaching ? -1 : null;
            task            = task.parentNode;
        }
    },

    /**
     * Returns total count of child nodes and their children.
     *
     * @return {Number} Total count of child nodes
     */
    getTotalCount : function () {
        var totalCount          = this.totalCount;
        var cachingPrevented    = totalCount == -1;

        // `cachingPrevented` (totalCount == -1) will cause the value to be always recalculated
        if (totalCount == null || cachingPrevented) {
            var childNodes  = this.childNodes;

            totalCount      = childNodes.length;

            for (var i = 0, l = childNodes.length; i < l; i++) {
                totalCount  += childNodes[ i ].getTotalCount();
            }

            if (cachingPrevented)
                return totalCount;
            else
                this.totalCount = totalCount;
        }

        return totalCount;
    },

    /**
     * Returns count of all predecessors nodes (including their children).
     *
     * @return {Number}
     */
    getPredecessorsCount : function() {
        var task    = this.previousSibling,
            count   = this.data.index;

        while (task) {
            count   += task.getTotalCount();
            task    = task.previousSibling;
        }

        return count;
    },


    /**
     * @method getSequenceNumber
     *
     * Returns the sequential number of the task. A sequential number means the ordinal position of the task in the total dataset, regardless
     * of its nesting level and collapse/expand state of any parent tasks. The root node has a sequential number equal to 0.
     *
     * For example, in the following tree data sample sequential numbers are specified in the comments:

        root : {
            children : [
                {   // 1
                    leaf : true
                },
                {       // 2
                    children : [
                        {   // 3
                            children : [
                                {   // 4
                                    leaf : true
                                },
                                {   // 5
                                    leaf : true
                                }
                            ]
                        }]
                },
                {   // 6
                    leaf : true
                }
            ]
        }

     * If we will collapse some of the parent tasks, sequential number of collapsed tasks won't change.
     *
     * See also {@link Gnt.data.TaskStore#getBySequenceNumber}.
     *
     * @return {Number} The code
     */
    getSequenceNumber: function () {
        var code    = 0,
            task    = this;

        while (task.parentNode) {
            code    += task.getPredecessorsCount() + 1;
            task    = task.parentNode;
        }

        return code;
    },

    // generally should be called on root node only
    getBySequenceNumber : function (number) {
        var resultNode = null,
            childNode, totalCount;

        if (number === 0) {
            resultNode = this;
        } else if (number > 0 && number <= this.getTotalCount()) {
            number--;

            for (var i = 0, l = this.childNodes.length; i < l; i++) {
                childNode       = this.childNodes[i];
                totalCount      = childNode.getTotalCount();

                if (number > totalCount)
                    number      -= totalCount + 1;
                else {
                    childNode   = this.childNodes[i];
                    resultNode  = childNode.getBySequenceNumber(number);
                    break;
                }
            }
        }

        return resultNode;
    },

    /**
     * @method getDisplayStartDate
     *
     * Returns the formatted start date value to be used in the UI.
     * @param {String} format Date format.
     * @param {Boolean} [adjustMilestones=true] If true, milestones will display one day earlier than the actual raw date.
     * @param {Date} [value=this.getStartDate()] Start date value. If not specified, the Task start date will be used.
     * @return {String} Formatted start date value.
     */
    getDisplayStartDate : function (format, adjustMilestones, value, returnDate, isBaseline) {
        format = format || Ext.Date.defaultFormat;

        // if no value specified then we'll take task start date
        if (arguments.length < 3) {
            value       = this.getStartDate();
            // by default we consider adjustMilestones enabled
            if (arguments.length < 2) adjustMilestones = true;
        }

        if (value && adjustMilestones && this.isMilestone(isBaseline) && value - Ext.Date.clearTime(value, true) === 0 && !Ext.Date.formatContainsHourInfo(format)) {
            value       = Sch.util.Date.add(value, Sch.util.Date.MILLI, -1);
        }

        return returnDate ? value : (value ? Ext.util.Format.date(value, format) : '');
    },

    /**
     * @method getDisplayEndDate
     *
     * Returns the formatted end date value to be used in the UI.
     * **Note** that the end date of tasks in the Gantt chart is not inclusive, however this method will compensate the value.
     * For example, if you have a 1 day task which starts at **2011-07-20T00:00:00** and ends at **2011-07-21T00:00:00** (remember the end date is not inclusive),
     * this method will return **2011-07-20** if called with 'Y-m-d'.

            var task = new Gnt.model.Task({
                StartDate : new Date(2011, 6, 20),
                EndDate   : new Date(2011, 6, 21)
            });

            // below code will display "2011/07/20"
            alert(task.getDisplayEndDate("Y/m/d"));

     * @param {String} format Date format (required).
     * @param {Boolean} [adjustMilestones=true] If true, milestones will display one day earlier than the actual raw date.
     * @param {Date} [value=this.getEndDate()] End date value. If not specified, the Task end date will be used.
     * @return {String} The formatted end date value.
     */
    getDisplayEndDate : function (format, adjustMilestones, value, returnDate, isBaseline) {
        format = format || Ext.Date.defaultFormat;

        if (arguments.length < 3) {
            value       = this.getEndDate();
            if (arguments.length < 2) adjustMilestones = true;
        }

        if (value && (!this.isMilestone(isBaseline) || adjustMilestones) && value - Ext.Date.clearTime(value, true) === 0 && !Ext.Date.formatContainsHourInfo(format)) {
            value       = Sch.util.Date.add(value, Sch.util.Date.MILLI, -1);
        }

        return returnDate ? value : (value ? Ext.util.Format.date(value, format) : '');
    },

    /**
     * @method setResizable
     *
     * Sets the new resizable state for the event. You can specify true/false, or 'start'/'end' to only allow resizing one end of an event.
     * @param {Boolean} resizable true if this event should be resizable
     */


    // Does a regular copy but also copies references to the model taskStore etc
    // Intended to be used when copying a task that will be added to the same taskStore
    fullCopy : function(model) {
        var cp = this.callParent(arguments);

        cp.taskStore = this.getTaskStore();

        return cp;
    },


    commit: function () {
        this.callParent(arguments);

        this.commitSegments();
    },


    reject: function () {
        this.callParent(arguments);

        this.rejectSegments();
    },

    isUnscheduled : function () {
        return !this.getStartDate() || !this.getEndDate();
                        }
}, function () {
    // Do this first to be able to override NodeInterface methods
    Ext.data.NodeInterface.decorate(this);

    this.override({

        // @OVERRIDE
        remove : function () {
            var me        = this,
                parent    = me.parentNode,
                taskStore = me.getTaskStore(true),
                result;

            result = me.callParent(arguments);

            // If the parent has no other children, change it to a leaf task if required
            if (parent && taskStore && taskStore.recalculateParents && parent.convertEmptyParentToLeaf && !parent.isRoot() && parent.childNodes.length === 0) {
                parent.set('leaf', true);
            }
            // If the parent has some children left then recalculate it's start/end dates if required
            else if (parent && taskStore && taskStore.recalculateParents && !taskStore.suspendAutoRecalculateParents && !parent.isRoot() && parent.childNodes.length > 0) {
                parent.refreshCalculatedParentNodeData();
                parent.recalculateParents();
            }

            return result;
        },

        // @OVERRIDE
        insertBefore : function (node) {
            // this will surprisingly change the value of the 1st argument in the `arguments`, try
            //      var aa = function (a) { a = 'zz'; console_log(arguments) }
            //      aa(1, 2)
            node    = this.createNode(node);

            if (this.phantom) {
                this.data[ this.phantomIdField ] = node.data[ this.phantomParentIdField ] = this.getInternalId();
            }

            var needToSuspendCaching    = node.parentNode;

            this.resetTotalCount(needToSuspendCaching);

            var res                     = this.callParent(arguments);

            if (needToSuspendCaching) this.resetTotalCount();

            return res;
        },

        // @OVERRIDE
        appendChild : function (nodes, suppressEvents, commit) {
            var needToSuspendCaching    = false;

            nodes                       = nodes instanceof Array ? nodes : [ nodes ];

            for (var i = 0; i < nodes.length; i++) {
                nodes[ i ]              = this.createNode(nodes[ i ]);

                // appending child that is already in the same tree, will first remove it from previous parent.
                // Removing is hidden inside of the `appendChild` implementation and causes various side effects
                // which re-fills the `totalCount` cache with wrong value. Need to suspend caching during parent
                // "appendChild" implementation
                if (nodes[ i ].parentNode) needToSuspendCaching = true;

                if (this.phantom) {
                    nodes[ i ].data[ this.phantomParentIdField ] = this.getInternalId();
                }
            }

            if (this.phantom) {
                this.data[ this.phantomIdField ]    = this.getInternalId();
            }

            this.resetTotalCount(needToSuspendCaching);

            // convert a single element array back to just element, to avoid extra function call
            var res     = this.callParent([ nodes.length > 1 ? nodes : nodes[ 0 ], suppressEvents, commit ]);

            if (needToSuspendCaching) this.resetTotalCount();


            this.beginEdit();
            // Bugfix ticket #1401
            this.set('leaf', false);
            // since the task became a parent we switch its scheduling mode to 'Normal' (ticket #1441)
            this.set(this.schedulingModeField, 'Normal');
            this.endEdit();

            return res;
        },

        // @OVERRIDE
        removeChild : function (node, destroy, suppressEvents, isMove) {
            var me                  = this,
                needToConvertToLeaf = !me.removeChildIsCalledFromReplaceChild && me.convertEmptyParentToLeaf && me.childNodes.length == 1,
                taskStore           = me.getTaskStore(true),
                result;

            me.resetTotalCount();

            // need to reset the flag early, because the removal operation may cause some side effects (event listeners)
            // flag should be already reset in those listeners
            me.removeChildIsCalledFromReplaceChild    = false;

            // Calling parent
            result = me.callParent(arguments);

            // In case of node move we need to reset the total count cache one more time here.
            // This is for the case, when we append/insert some existing node to a different position
            // in its parent node. In this case, the total count cache will be originally reset in our
            // overrides for `insertBefore` or `appendChild`. This is supposed to be enough, but its not,
            // because before doing actuall append, not first will be removed from the parent ("removeChild" call
            // is part of the `appendChild/insertBefore` methods. The listeners of `remove` event may call
            // `getTotalCount` and fill the cache. Then, we continue to actual node insertion, but cache is already filled
            // with wrong data.
            if (isMove) {
                me.resetTotalCount();
            }

            // If the parent has no other children, change it to a leaf task
            if (taskStore && taskStore.recalculateParents && !taskStore.suspendAutoRecalculateParents) {
                me.refreshCalculatedParentNodeData();
            }

            needToConvertToLeaf && !me.isRoot() && me.set('leaf', true);

            return result;
        },

        replaceChild : function () {
            // flag will be reset in the `removeChild` override
            this.removeChildIsCalledFromReplaceChild    = true;

            this.callParent(arguments);
        },

        removeAll : function () {
            this.resetTotalCount();
            this.callParent(arguments);
        },

        // @OVERRIDE
        createNode : function(node) {
            var store = this.getTaskStore(true),
                needsNormalization = store && store.autoNormalizeNodes && !node.normalized && !node.normalizeScheduled;

            node = this.callParent(arguments);

            if (needsNormalization) {

                var prevUpdateInfo  = node.updateInfo;

                node.updateInfo = function () {

                    prevUpdateInfo.apply(this, arguments);
                    delete node.updateInfo;

                    // normalization needs to fully set up node, this happens after 1) createNode 2) updateNodeInfo
                    node.normalize();
                };

                //createNode is called multiple times before the node is normalized.
                //For preventing a chain of calls to updateInfo and normalize is created we set a property to schedule normalization only once
                node.normalizeScheduled = true;

            }

            return node;
        }
    });
});

