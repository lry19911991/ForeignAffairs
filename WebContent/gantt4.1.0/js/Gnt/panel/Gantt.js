/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

 @class Gnt.panel.Gantt
 @extends Sch.panel.TimelineTreePanel

 A gantt panel, which allows you to visualize and manage tasks and their dependencies.

 Please refer to the <a href="#!/guide/gantt_getting_started">getting started guide</a> for a detailed introduction.

 {@img gantt/images/gantt-panel.png}

 */
Ext.define("Gnt.panel.Gantt", {
    extend              : "Sch.panel.TimelineTreePanel",

    alias               : ['widget.ganttpanel'],
    alternateClassName  : ['Sch.gantt.GanttPanel'],

    requires            : [
        'Ext.layout.container.Border',
        'Ext.tree.plugin.TreeViewDragDrop',

        'Gnt.patches.CellEditor',
        'Gnt.patches.CellEditing',
        'Gnt.patches.TreeViewDragDrop',
        'Gnt.patches.SpreadsheetModel',
        'Gnt.data.ResourceStore',
        'Gnt.data.AssignmentStore',
        'Gnt.feature.WorkingTime',
        'Gnt.data.Calendar',
        'Gnt.data.TaskStore',
        'Gnt.data.DependencyStore',
        'Gnt.view.Gantt',
        'Gnt.patches.RightClick',
        'Gnt.plugin.ConstraintResolutionGui',
        'Gnt.plugin.ProjectLines',
        'Gnt.plugin.Replicator'
    ],

    uses                : [
        'Sch.plugin.CurrentTimeLine'
    ],

    viewType            : 'ganttview',
    layout              : 'border',
    rowLines            : true,
    syncRowHeight       : false,
    rowHeight           : 24,

    /**
     * @cfg {String/Object} topLabelField
     * A configuration used to show/edit the field to the top of the task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `editor` : Ext.form.Field - The field used to edit the value inline
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    topLabelField       : null,

    /**
     * @cfg {String/Object} leftLabelField
     * A configuration used to show/edit the field to the left of the task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `editor` : Ext.form.Field - The field used to edit the value inline
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    leftLabelField      : null,

    /**
     * @cfg {String/Object} bottomLabelField
     * A configuration used to show/edit the field to the bottom of the task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `editor` : Ext.form.Field - The field used to edit the value inline
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    bottomLabelField    : null,

    /**
     * @cfg {String/Object} rightLabelField
     * A configuration used to show/edit the field to the right of the task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `editor` : Ext.form.Field - The field used to edit the value inline
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    rightLabelField     : null,

    /**
     * @cfg {Boolean} highlightWeekends
     * True (default) to highlight weekends and holidays, using the {@link Gnt.feature.WorkingTime} plugin.
     */
    highlightWeekends   : true,

    /**
     * @cfg {Boolean} weekendsAreWorkdays
     * Set to `true` to treat *all* days as working, effectively removing the concept of non-working time from gantt. Defaults to `false`.
     * This option just will be translated to the {@link Gnt.data.Calendar#weekendsAreWorkdays corresponding option} of the calendar
     */
    weekendsAreWorkdays : false,

    /**
     * @cfg {Boolean} skipWeekendsDuringDragDrop
     * True to skip the weekends/holidays during drag&drop operations (moving/resizing) and also during cascading. Default value is `true`.
     *
     * Note, that holidays will still be excluded from the duration of the tasks. If you need to completely disable holiday skipping you
     * can do that on the gantt level with the {@link #weekendsAreWorkdays} option, or on the task level with the `SchedulingMode` field.
     *
     *
     * This option just will be translated to the {@link Gnt.data.TaskStore#skipWeekendsDuringDragDrop corresponding option} of the task store
     */
    skipWeekendsDuringDragDrop  : true,

    /**
     * @cfg {Boolean} enableTaskDragDrop
     * True to allow drag drop of tasks (defaults to `true`). To customize the behavior of drag and drop, you can use {@link #dragDropConfig} option
     */
    enableTaskDragDrop          : true,

    /**
     * @cfg {Boolean} enableDependencyDragDrop
     * True to allow creation of dependencies by using drag and drop between task terminals (defaults to `true`)
     */
    enableDependencyDragDrop    : true,

    /**
     * @cfg {Boolean} enableProgressBarResize
     * True to allow resizing of the progress bar indicator inside tasks (defaults to `false`)
     */
    enableProgressBarResize     : false,


    /**
     * @cfg {Boolean} toggleParentTasksOnClick
     * True to toggle the collapsed/expanded state when clicking a parent task bar (defaults to `true`)
     */
    toggleParentTasksOnClick    : true,

    /**
     * @cfg {Boolean} addRowOnTab
     * True to automatically insert a new row when tabbing out of the last cell of the last row. Defaults to true.
     */
    addRowOnTab                 : true,

    /**
     * @cfg {Boolean} recalculateParents
     * True to update parent start/end dates after a task has been updated (defaults to `true`). This option just will be translated
     * to the {@link Gnt.data.TaskStore#recalculateParents corresponding option} of the task store
     */
    recalculateParents          : true,

    /**
     * @cfg {Boolean} cascadeChanges
     * True to cascade changes to dependent tasks (defaults to `false`). This option just will be translated
     * to the {@link Gnt.data.TaskStore#cascadeChanges corresponding option} of the task store
     */
    cascadeChanges              : false,

    /**
     * @cfg {Boolean} showTodayLine
     * True to show a line indicating current time. Default value is `false`.
     */
    showTodayLine               : false,


    /**
     * @cfg {Boolean} enableBaseline
     * True to enable showing a base lines for tasks. Baseline information should be provided as the `BaselineStartDate`, `BaselineEndDate` and `BaselinePercentDone` fields.
     * Default value is `false`.
     */
    enableBaseline              : false,

    /**
     * @cfg {Boolean} baselineVisible
     * True to show the baseline in the initial rendering. You can show and hide the baseline programmatically via {@link #showBaseline} and {@link #hideBaseline}.
     * Default value is `false`.
     */
    baselineVisible             : false,

    enableAnimations            : false,
    animate                     : false,

    /**
     * If the {@link #highlightWeekends} option is set to true, you can access the created zones plugin through this property.
     * @property {Sch.plugin.Zones} workingTimePlugin
     */
    workingTimePlugin           : null,
    todayLinePlugin             : null,

    /**
     * @cfg {Boolean} allowParentTaskMove True to allow moving parent tasks. Please note, that when moving a parent task, the
     * {@link Gnt.data.TaskStore#cascadeDelay cascadeDelay} option will not be used and cascading will happen synchronously (if enabled).
     *
     * Also, its possible to move the parent task as a group (along with its child tasks) or as individual task. This can be controlled with
     * {@link Gnt.data.TaskStore#moveParentAsGroup} option.
     */
    allowParentTaskMove         : true,

    /**
     * @cfg {Boolean} allowParentTaskDependencies Set to `false` to exclude parent tasks from the list of possible predecessors/successors.
     */
    allowParentTaskDependencies : true,

    /**
     * @cfg {Boolean} enableDragCreation
     * True to allow dragging to set start and end dates
     */
    enableDragCreation          : true,

    /**
     * @cfg {Function} eventRenderer
     * An empty function by default, but provided so that you can override it. This function is called each time a task
     * is rendered into the gantt grid. The function should return an object with properties that will be applied to the relevant task template.
     * By default, the task templates include placeholders for :
     *
     * - `cls` - CSS class which will be added to the task bar element
     * - `ctcls` - CSS class which will be added to the 'root' element containing the task bar and labels
     * - `style` - inline style declaration for the task bar element
     * - `progressBarStyle` - an inline CSS style to be applied to the progress bar of this task
     * - `leftLabel` - the content for the left label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#leftLabelField leftLabelField} option.
     *   You still need to provide some value for the `leftLabelField` to activate the label rendering
     * - `rightLabel` - the content for the right label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#rightLabelField rightLabelField} option
     *   You still need to provide a value for the `rightLabelField` to activate the label rendering
     * - `topLabel` - the content for the top label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#topLabelField topLabelField} option
     *   You still need to provide a value for the `topLabelField` to activate the label rendering
     * - `bottomLabel` - the content for the bottom label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#bottomLabelField bottomLabelField} option
     *   You still need to provide some value for the `bottomLabelField` to activate the label rendering
     * - `basecls` - a CSS class to be add to the baseline DOM element, only applicable when the {@link Gnt.panel.Gantt#showBaseline showBaseline} option is true and the task contains baseline information
     * - `baseProgressBarStyle` - an inline CSS style to be applied to the baseline progress bar element
     *
     * Here is a sample usage of eventRenderer:

     eventRenderer : function (taskRec) {
            return {
                style : 'background-color:white',        // You can use inline styles too.
                cls   : taskRec.get('Priority'),         // Read a property from the task record, used as a CSS class to style the event
                foo   : 'some value'                     // Some custom value in your own template
            };
        }
     *
     * @param {Gnt.model.Task} taskRecord The task about to be rendered
     * @param {Gnt.data.TaskStore} ds The task store
     * @return {Object} The data which will be applied to the task template, creating the actual HTML
     */
    eventRenderer               : Ext.emptyFn,

    /**
     * @cfg {Object} eventRendererScope The scope (the "this" object)to use for the `eventRenderer` function
     */
    eventRendererScope          : null,

    /**
     * @cfg {Ext.XTemplate} eventTemplate The template used to render leaf tasks in the gantt view.
     * See {@link Ext.XTemplate} for more information, see also {@link Gnt.template.Task} for the definition.
     */
    eventTemplate               : null,

    /**
     * @cfg {Ext.XTemplate} parentEventTemplate The template used to render parent tasks in the gantt view. See {@link Ext.XTemplate} for more information, see also {@link Gnt.template.ParentTask} for the definition
     */
    parentEventTemplate         : null,

    /**
     * @cfg {Ext.XTemplate} rollupTemplate The template used to rollup tasks to the parent in the gantt view. See {@link Ext.XTemplate} for more information, see also {@link Gnt.template.RollupTask} for the definition
     */
    rollupTemplate              : null,

    /**
     * @cfg {Ext.XTemplate} milestoneTemplate The template used to render milestone tasks in the gantt view.
     * See {@link Ext.XTemplate} for more information, see also {@link Gnt.template.Milestone} for the definition.
     */
    milestoneTemplate           : null,

    /**
     * @cfg {String} taskBodyTemplate The markup making up the body of leaf tasks in the gantt view. See also {@link Gnt.template.Task#innerTpl} for the definition.
     */
    taskBodyTemplate            : null,

    /**
     * @cfg {String} parentTaskBodyTemplate The markup making up the body of parent tasks in the gantt view. See also {@link Gnt.template.ParentTask#innerTpl} for the definition.
     */
    parentTaskBodyTemplate      : null,

    /**
     * @cfg {String} milestoneBodyTemplate The markup making up the body of milestone tasks in the gantt view. See also {@link Gnt.template.Milestone#innerTpl} for the definition.
     */
    milestoneBodyTemplate       : null,

    /**
     * @cfg {Boolean} autoHeight Always hardcoded to null, the `true` value is not yet supported (by Ext JS).
     */
    autoHeight                  : null,

    /**
     * @cfg {Gnt.data.Calendar} calendar a {@link Gnt.data.Calendar calendar} instance for this gantt panel. Can be also provided
     * as a {@link Gnt.data.TaskStore#calendar configuration option} of the `taskStore`.
     */
    calendar                    : null,

    /**
     * @cfg {Gnt.data.CrudManager} crudManager The CRUD manager instance controling all the gantt related stores
     *
        var taskStore   = new Gnt.data.TaskStore({
            ...
        });

        var crudManager = new Gnt.data.CrudManager({
            autoLoad    : true,
            taskStore   : taskStore,
            transport   : {
                load    : {
                    url     : 'load.php'
                },
                sync    : {
                    url     : 'save.php'
                }
            }
        });

        var gantt       = new Gnt.panel.Gantt({
            // CRUD manager instance having references to all the related stores
            crudManager : crudManager

            height      : 300,
            width       : 500,
            renderTo    : Ext.getBody(),
            columns     : [
                {
                    xtype : 'namecolumn'
                },
                {
                    xtype : 'startdatecolumn'
                },
                {
                    xtype : 'enddatecolumn'
                }
            ]
        });

     */
    crudManager                 : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore The {@link Gnt.data.TaskStore store} holding the tasks to be rendered into the gantt chart (required).
     */
    taskStore                   : null,

    /**
     * @cfg {Gnt.data.DependencyStore} dependencyStore The {@link Gnt.data.DependencyStore store} holding the dependency information (optional).
     * See also {@link Gnt.model.Dependency}
     */
    dependencyStore             : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore The {@link Gnt.data.ResourceStore store} holding the resources that can be assigned to the tasks in the task store(optional).
     * See also {@link Gnt.model.Resource}
     */
    resourceStore               : null,

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore The {@link Gnt.data.AssignmentStore store} holding the assignments information (optional).
     * See also {@link Gnt.model.Assignment}
     */
    assignmentStore             : null,

    columnLines                 : false,

    /**
     * @cfg {Function} dndValidatorFn
     * An empty function by default, but provided so that you can perform custom validation on
     * the task being dragged. This function is called during the drag and drop process and also after the drop is made.
     *
     * @param {Gnt.model.Task} taskRecord The task record being dragged
     * @param {Date} date The new start date
     * @param {Number} duration The duration of the item being dragged, in minutes
     * @param {Ext.EventObject} e The event object
     *
     * @return {Boolean} true if the drop position is valid, else false to prevent a drop
     */
    dndValidatorFn                      : Ext.emptyFn,

    /**
     * @cfg {Function} createValidatorFn
     * An empty function by default, but provided so that you can perform custom validation when a new task is being scheduled using drag and drop.
     * To indicate the newly scheduled dates of a task are invalid, simply return false from this method.
     *
     * @param {Gnt.model.Task} taskRecord the task
     * @param {Date} startDate The start date
     * @param {Date} endDate The end date
     * @param {Event} e The browser event object
     * @return {Boolean} true if the creation event is valid, else false
     */
    createValidatorFn                   : Ext.emptyFn,

    /**
     * @cfg {String} resizeHandles A string containing one of the following values
     *
     * - `none` - to disable resizing of tasks
     * - `left` - to enable changing of start date only
     * - `right` - to enable changing of end date only
     * - `both` - to enable changing of both start and end dates
     *
     * Default value is `both`. Resizing is performed with the {@link Gnt.feature.TaskResize} plugin.
     * You can customize it with the {@link #resizeConfig} and {@link #resizeValidatorFn} options
     */
    resizeHandles                       : 'both',

    /**
     * @cfg {Function} resizeValidatorFn
     * An empty function by default, but provided so that you can perform custom validation on
     * a task being resized. Simply return false from your function to indicate that the new duration is invalid.
     *
     * @param {Gnt.model.Task} taskRecord The task being resized
     * @param {Date} startDate The new start date
     * @param {Date} endDate The new end date
     * @param {Ext.EventObject} e The event object
     *
     * @return {Boolean} true if the resize state is valid, else false to cancel
     */
    resizeValidatorFn                   : Ext.emptyFn,

    /**
     *  @cfg {Object} resizeConfig A custom config object to pass to the {@link Gnt.feature.TaskResize} feature.
     */
    resizeConfig                        : null,

    /**
     *  @cfg {Object} progressBarResizeConfig A custom config object to pass to the {@link Gnt.feature.ProgressBarResize} feature.
     */
    progressBarResizeConfig             : null,

    /**
     *  @cfg {Object} dragDropConfig A custom config object to pass to the {@link Gnt.feature.TaskDragDrop} feature.
     */
    dragDropConfig                      : null,

    /**
     *  @cfg {Object} createConfig A custom config to pass to the {@link Gnt.feature.DragCreator} instance
     */
    createConfig                        : null,

    /**
     *  @cfg {Boolean} autoFitOnLoad True to change the timeframe of the gantt to fit all the tasks in it after every task store load.
     *
     * See also {@link #zoomToFit}.
     */

    autoFitOnLoad                       : false,

    /**
     *  @cfg {Boolean} showRollupTasks True to rollup information of tasks to their parent task bar.
     *  Only tasks with the `Rollup` field set to true will rollup.
     */
    showRollupTasks                     : false,

    /**
     * @cfg {Boolean} enableConstraintsResolutionGui `true` to enable the plugin, providing the constraint resolution popup window.
     * Enabled by default.
     */
    enableConstraintsResolutionGui      : true,

    /**
     * @cfg {Boolean}
     * `True` to mark project start/end dates with vertical lines using {@link Gnt.plugin.ProjectLines} plugin.
     * Use {@link #projectLinesConfig} to configure the plugin.
     */
    showProjectLines                    : true,

    /**
     * @cfg {Object} projectLinesConfig
     * Config to use for {@link Gnt.plugin.ProjectLines} plugin.
     */
    projectLinesConfig                  : null,

    /**
     * @cfg {Object} constraintResolutionGuiConfig Config to use for {@link Gnt.plugin.ConstraintResolutionGui} plugin.
     */
    constraintResolutionGuiConfig       : null,

    /**
     * @cfg {Boolean}
     * `True` to scroll tasks horizontally into view when clicking a task row.
     */
    scrollTaskIntoViewOnClick           : false,

    /**
     * @cfg {Boolean/Object}
     * `True` to scroll tasks to be reordered in the left table section of the Gantt chart. Adds a Ext.tree.plugin.TreeViewDragDrop plugin
     * to the Gantt chart. You can configure this plugin by passing an Object instead of a boolean.
     *
     */
    enableTaskReordering                : true,

    refreshLockedTreeOnDependencyUpdate : false,
    _lockedDependencyListeners          : null,

    earlyStartColumn                    : null,
    earlyEndColumn                      : null,
    lateStartColumn                     : null,
    lateEndColumn                       : null,

    earlyDatesListeners                 : null,
    lateDatesListeners                  : null,
    slackListeners                      : null,

    refreshTimeout                      : 100,

    //A reference to the editing plugin, if it exists
    ganttEditingPlugin                  : null,

    //If number of affected tasks is below this number, do a per-row update instead of a full refresh
    simpleCascadeThreshold              : 30,

    forceDefineTimeSpanByStore          : true,


    /**
     * This method shows or hides the visual presentation of task's rollups in the view.
     *
     * @param {Boolean} show A boolean value indicating whether the visual presentation of task's rollups should be visible or not.
     */
    setShowRollupTasks : function (show) {
        this.showRollupTasks = show;

        this.getSchedulingView().setShowRollupTasks(show);
    },

    onCalendarSet : function (store, calendar) {
        if (this.needToTranslateOption('weekendsAreWorkdays')) {
            // may trigger a renormalization of all tasks - need all stores to be defined
            calendar.setWeekendsAreWorkDays(this.weekendsAreWorkdays);
        }

        if (this.workingTimePlugin) {
            this.workingTimePlugin.bindCalendar(calendar);
            this.workingTimePlugin.refresh();
        }

        this.calendar = calendar;
    },

    initStores : function () {

        // if we have CrudManager instance assigned we can grab stores from it
        if (this.crudManager) {
            if (this.crudManager && !(this.crudManager instanceof Gnt.data.CrudManager)) {
                this.crudManager = new Gnt.data.CrudManager(this.crudManager);
            }

            if (!this.taskStore) this.taskStore = this.crudManager.getTaskStore();
            if (!this.dependencyStore) this.dependencyStore = this.crudManager.getDependencyStore();
            if (!this.resourceStore) this.resourceStore = this.crudManager.getResourceStore();
            if (!this.assignmentStore) this.assignmentStore = this.crudManager.getAssignmentStore();
        }

        if (!this.taskStore) {
            Ext.Error.raise("You must specify a taskStore config.");
        }

        var taskStore = Ext.StoreMgr.lookup(this.taskStore);

        if (!taskStore) {
            Ext.Error.raise("You have provided an incorrect taskStore identifier");
        }

        if (!(taskStore instanceof Gnt.data.TaskStore)) {
            Ext.Error.raise("A `taskStore` should be an instance of `Gnt.data.TaskStore` (or of a subclass)");
        }

        this.mon(taskStore, {
            calendarset             : this.onCalendarSet,
            scope                   : this
        });

        this.mon(taskStore, {
            beforeindentationchange : this.onBeforeBatchStoreUpdate,
            indentationchange       : this.onBatchStoreUpdate,

            beforebatchremove       : this.onBeforeBatchStoreUpdate,
            batchremove             : this.onBatchStoreUpdate,
            scope                   : this
        });

        Ext.apply(this, {
            store     : taskStore,          // For the grid panel API
            taskStore : taskStore
        });

        var calendar = this.calendar = taskStore.calendar;

        if (this.dependencyStore) {
            this.dependencyStore = Ext.StoreMgr.lookup(this.dependencyStore);
            taskStore.setDependencyStore(this.dependencyStore);
        } else {
            this.dependencyStore = taskStore.dependencyStore;
        }

        this.dependencyStore.allowParentTaskDependencies = this.allowParentTaskDependencies;

        if (!(this.dependencyStore instanceof Gnt.data.DependencyStore)) {
            Ext.Error.raise("The Gantt dependency store should be a Gnt.data.DependencyStore, or a subclass thereof.");
        }

        // this resource store will be assigned to the task store in the "bindResourceStore" method
        var resourceStore = this.resourceStore ? Ext.StoreMgr.lookup(this.resourceStore) : taskStore.getResourceStore();

        if (!(resourceStore instanceof Gnt.data.ResourceStore)) {
            Ext.Error.raise("A `ResourceStore` should be an instance of `Gnt.data.ResourceStore` (or of a subclass)");
        }

        // this assignment store will be assigned to the task store in the "bindAssignmentStore" method
        var assignmentStore = this.assignmentStore ? Ext.StoreMgr.lookup(this.assignmentStore) : taskStore.getAssignmentStore();

        if (!(assignmentStore instanceof Gnt.data.AssignmentStore)) {
            Ext.Error.raise("An `assignmentStore` should be an instance of `Gnt.data.AssignmentStore` (or of a subclass)");
        }

        this.bindAssignmentStore(assignmentStore, true);
        this.bindResourceStore(resourceStore, true);

        if (this.needToTranslateOption('weekendsAreWorkdays')) {
            // may trigger a renormalization of all tasks - need all stores to be defined
            calendar.setWeekendsAreWorkDays(this.weekendsAreWorkdays);
        }
    },

    // For buffered rendering, we need to avoid each indent/outdent operation causing a full view refresh + layouts + re-filtering
    // Tested in /#view/213_indent.t.js
    onBeforeBatchStoreUpdate : function () {
        this.taskStore.suspendEvent('refresh', 'add', 'insert', 'remove');

        this.taskStore.filterUpdateSuspended = true;

        if (this.bufferedRenderer) {
            this.suspendLayouts();
        }
    },

    onBatchStoreUpdate : function () {
        this.taskStore.resumeEvent('refresh', 'add', 'insert', 'remove');

        this.taskStore.filterUpdateSuspended = false;

        this.getView().relayFn('refreshView');

        if (this.bufferedRenderer) {
            this.resumeLayouts(true);

            this.taskStore.reApplyFilter();
        }
    },

    initComponent : function () {
        // @BackwardsCompat, remove in Gantt 3.0
        if (Ext.isBoolean(this.showBaseline)) {
            this.enableBaseline = this.baselineVisible = this.showBaseline;
            this.showBaseline = Gnt.panel.Gantt.prototype.showBaseline;
        }

        this.autoHeight = false;

        this.initStores();

        if (this.needToTranslateOption('cascadeChanges')) {
            this.setCascadeChanges(this.cascadeChanges);
        }

        if (this.needToTranslateOption('recalculateParents')) {
            this.setRecalculateParents(this.recalculateParents);
        }

        if (this.needToTranslateOption('skipWeekendsDuringDragDrop')) {
            this.setSkipWeekendsDuringDragDrop(this.skipWeekendsDuringDragDrop);
        }

        this.normalViewConfig = this.normalViewConfig || {};

        // Copy some properties to the view instance
        Ext.apply(this.normalViewConfig, {
            taskStore                    : this.taskStore,
            dependencyStore              : this.dependencyStore,
            snapRelativeToEventStartDate : this.snapRelativeToEventStartDate,

            enableDependencyDragDrop     : this.enableDependencyDragDrop,
            enableTaskDragDrop           : this.enableTaskDragDrop,
            enableProgressBarResize      : this.enableProgressBarResize,
            enableDragCreation           : this.enableDragCreation,

            allowParentTaskMove          : this.allowParentTaskMove,
            allowParentTaskDependencies  : this.allowParentTaskDependencies,
            toggleParentTasksOnClick     : this.toggleParentTasksOnClick,

            resizeHandles                : this.resizeHandles,
            enableBaseline               : this.baselineVisible || this.enableBaseline,

            leftLabelField               : this.leftLabelField,
            rightLabelField              : this.rightLabelField,
            topLabelField                : this.topLabelField,
            bottomLabelField             : this.bottomLabelField,

            eventTemplate                : this.eventTemplate,
            parentEventTemplate          : this.parentEventTemplate,
            milestoneTemplate            : this.milestoneTemplate,
            rollupTemplate               : this.rollupTemplate,

            taskBodyTemplate             : this.taskBodyTemplate,
            parentTaskBodyTemplate       : this.parentTaskBodyTemplate,
            milestoneBodyTemplate        : this.milestoneBodyTemplate,

            resizeConfig                 : this.resizeConfig,
            dragDropConfig               : this.dragDropConfig,
            showRollupTasks              : this.showRollupTasks
        });


        if (this.topLabelField || this.bottomLabelField) {
            this.addCls('sch-gantt-topbottom-labels ' + (this.topLabelField ? 'sch-gantt-top-label' : ''));
            this.normalViewConfig.rowHeight = 52;
        }

        this.configureFunctionality();

        this.mon(this.taskStore, {
            beforecascade : this.onBeforeCascade,
            cascade       : this.onAfterCascade,

            scope : this
        });

        this.callParent(arguments);

        var sm = this.getSelectionModel();

        // if gantt is set with spreadsheet model ...
        if (Ext.grid.selection.SpreadsheetModel && sm instanceof Ext.grid.selection.SpreadsheetModel) {
            // disable treeviewdragdrop plugin
            // https://www.sencha.com/forum/showthread.php?305681-Spreadsheet-tree-dragdrop-plugin
            this.lockedGrid.view.on('render', function (view) {
                Ext.Array.each(view.plugins, function (plugin) {
                    if (Ext.tree.plugin.TreeViewDragDrop && plugin instanceof Ext.tree.plugin.TreeViewDragDrop) {
                        plugin.disable();
                    }
                });
            });

            // HACK - move the drag handle into locked grid since it should not live in the 'top' grid
            var lockedGrid  = this.lockedGrid;
            var old         = sm.applyExtensible;

            sm.applyExtensible = function (extensible) {
                var selExt = old.apply(this, arguments);

                lockedGrid.body.appendChild(selExt.handle);

                this.applyExtensible = old;

                return selExt;
            };
        }

        if (this.autoFitOnLoad) {
            // in order to make zoomToFit work ok, normal view should have some width
            this.normalGrid.on('afterlayout', function () {
                // if store already loaded
                if (this.store.getCount()) {
                    this.zoomToFit();
                }

                // append listener now to make sure we do not fit twice during initial rendering
                this.mon(this.store, 'load', function () {
                    this.zoomToFit();
                }, this);
            }, this, { single : true });
        }

        this.bodyCls = (this.bodyCls || '') + " sch-ganttpanel-container-body";

        var ganttView = this.getSchedulingView();

        this.relayEvents(ganttView, [
            /**
             * @event taskclick
             * Fires when a task is clicked
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task record
             * @param {Ext.EventObject} e The event object
             */
            'taskclick',

            /**
             * @event taskdblclick
             * Fires when a task is double clicked
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task record
             * @param {Ext.EventObject} e The event object
             */
            'taskdblclick',

            /**
             * @event taskcontextmenu
             * Fires when contextmenu is activated on a task
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task record
             * @param {Ext.EventObject} e The event object
             */
            'taskcontextmenu',

            // Resizing events start --------------------------
            /**
             * @event beforetaskresize
             * Fires before a resize starts, return false to stop the execution
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task about to be resized
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskresize',

            /**
             * @event taskresizestart
             * Fires when resize starts
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task about to be resized
             */
            'taskresizestart',

            /**
             * @event partialtaskresize
             * Fires during a resize operation and provides information about the current start and end of the resized event
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task being resized
             * @param {Date} startDate The start date of the task
             * @param {Date} endDate The end date of the task
             * @param {Ext.Element} element The element being resized
             */
            'partialtaskresize',

            /**
             * @event beforetaskresizefinalize
             * Fires before a succesful resize operation is finalized. Return false to finalize the resize at a later time.
             * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
             * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
             * @param {Mixed} view The gantt view instance
             * @param {Object} resizeContext An object containing 'record', 'start', 'end', 'finalize' properties.
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskresizefinalize',

            /**
             * @event aftertaskresize
             * Fires after a succesful resize operation
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task that has been resized
             */
            'aftertaskresize',
            // Resizing events end --------------------------

            // Task progress bar resizing events start --------------------------
            /**
             * @event beforeprogressbarresize
             * Fires before a progress bar resize starts, return false to stop the execution
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The record about to be have its progress bar resized
             */
            'beforeprogressbarresize',

            /**
             * @event progressbarresizestart
             * Fires when a progress bar resize starts
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The record about to be have its progress bar resized
             */
            'progressbarresizestart',

            /**
             * @event afterprogressbarresize
             * Fires after a succesful progress bar resize operation
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord record The updated record
             */
            'afterprogressbarresize',
            // Task progressbar resizing events end --------------------------

            // Dnd events start --------------------------
            /**
             * @event beforetaskdrag
             * Fires before a task drag drop is initiated, return false to cancel it
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task record that's about to be dragged
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskdrag',

            /**
             * @event taskdragstart
             * Fires when a dnd operation starts
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The record being dragged
             */
            'taskdragstart',

            /**
             * @event beforetaskdropfinalize
             * Fires before a succesful drop operation is finalized. Return false to finalize the drop at a later time.
             * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
             * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
             * @param {Mixed} view The gantt view instance
             * @param {Object} dragContext An object containing 'record', 'start', 'duration' (in minutes), 'finalize' properties.
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskdropfinalize',

            /**
             * @event beforedragcreate
             * Fires before a drag create operation starts, return false to prevent the operation
             * @param {Gnt.view.Gantt} gantt The gantt view
             * @param {Gnt.model.Task} task The task record being updated
             * @param {Date} date The date of the drag start point
             * @param {Ext.EventObject} e The event object
             */
            'beforedragcreate',

            /**
             * @event dragcreatestart
             * Fires before a drag starts, return false to stop the operation
             * @param {Gnt.view.Gantt} view The gantt view
             */
            'dragcreatestart',

            /**
             * @event beforedragcreatefinalize
             * Fires before a succesful create operation is finalized. Return false to finalize creating at a later time.
             * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
             * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
             * @param {Mixed} view The gantt view instance
             * @param {Object} createContext An object containing 'record', 'start', 'end', 'finalize' properties.
             * @param {Ext.EventObject} e The event object
             */
            'beforedragcreatefinalize',

            /**
             * @event dragcreateend
             * Fires after a successful drag-create operation
             * @param {Gnt.view.Gantt} view The gantt view
             * @param {Gnt.model.Task} task The updated task record
             * @param {Ext.EventObject} e The event object
             */
            'dragcreateend',

            /**
             * @event afterdragcreate
             * Always fires after a drag-create operation
             * @param {Gnt.view.Gantt} view The gantt view
             */
            'afterdragcreate',

            /**
             * @event taskdrop
             * Fires after a succesful drag and drop operation
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The dropped record
             */
            'taskdrop',

            /**
             * @event aftertaskdrop
             * Fires after a drag and drop operation, regardless if the drop valid or invalid
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             */
            'aftertaskdrop',
            // Dnd events end --------------------------

            /**
             * @event labeledit_beforestartedit
             * Fires before editing is started for a field
             * @param {Gnt.view.Gantt} gantt The gantt view instance
             * @param {Gnt.model.Task} taskRecord The task record
             * @param {Mixed} value The field value being set
             * @param {Gnt.feature.LabelEditor} editor The editor instance
             */
            'labeledit_beforestartedit',

            /**
             * @event labeledit_beforecomplete
             * Fires after a change has been made to a label field, but before the change is reflected in the underlying field.
             * @param {Gnt.view.Gantt} gantt The gantt view instance
             * @param {Mixed} value The current field value
             * @param {Mixed} startValue The original field value
             * @param {Gnt.model.Task} taskRecord The affected record
             * @param {Gnt.feature.LabelEditor} editor The editor instance
             */
            'labeledit_beforecomplete',

            /**
             * @event labeledit_complete
             * Fires after editing is complete and any changed value has been written to the underlying field.
             * @param {Gnt.view.Gantt} gantt The gantt view instance
             * @param {Mixed} value The current field value
             * @param {Mixed} startValue The original field value
             * @param {Gnt.model.Task} taskRecord The affected record
             * @param {Gnt.feature.LabelEditor} editor The editor instance
             */
            'labeledit_complete',

            // Dependency drag drop events --------------------------
            /**
             * @event beforedependencydrag
             * Fires before a dependency drag operation starts (from a "task terminal"). Return false to prevent this operation from starting.
             * @param {Gnt.view.Dependency} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The source task record
             */
            'beforedependencydrag',

            /**
             * @event dependencydragstart
             * Fires when a dependency drag operation starts
             * @param {Gnt.view.Dependency} gantt The gantt panel instance
             */
            'dependencydragstart',

            /**
             * @event dependencydrop
             * Fires when a dependency drag drop operation has completed successfully and a new dependency has been created.
             * @param {Gnt.view.Dependency} gantt The gantt panel instance
             * @param {Gnt.model.Task} fromRecord The source task record
             * @param {Gnt.model.Task} toRecord The destination task record
             * @param {Number} type The dependency type
             */
            'dependencydrop',

            /**
             * @event afterdependencydragdrop
             * Always fires after a dependency drag-drop operation
             * @param {Gnt.view.Dependency} gantt The gantt panel instance
             */
            'afterdependencydragdrop',

            /**
             * @event dependencyclick
             * Fires after clicking on a dependency line/arrow
             * @param {Gnt.view.Dependency} g The dependency view instance
             * @param {Gnt.model.Dependency} record The dependency record
             * @param {Ext.EventObject} event The event object
             * @param {HTMLElement} target The target of this event
             */
            'dependencyclick',

            /**
             * @event dependencycontextmenu
             * Fires after right clicking on a dependency line/arrow
             * @param {Gnt.view.Dependency} g The dependency view instance
             * @param {Gnt.model.Dependency} record The dependency record
             * @param {Ext.EventObject} event The event object
             * @param {HTMLElement} target The target of this event
             */
            'dependencycontextmenu',

            /**
             * @event dependencydblclick
             * Fires after double clicking on a dependency line/arrow
             * @param {Gnt.view.Dependency} g The dependency view instance
             * @param {Gnt.model.Dependency} record The dependency record
             * @param {Ext.EventObject} event The event object
             * @param {HTMLElement} target The target of this event
             */
            'dependencydblclick',
            // EOF Dependency drag drop events --------------------------

            /**
             * @event scheduleclick
             * Fires after a click on the schedule area
             * @param {Gnt.panel.Gantt} gantt The gantt panel object
             * @param {Date} clickedDate The clicked date
             * @param {Number} rowIndex The row index
             * @param {Ext.EventObject} e The event object
             */
            'scheduleclick',

            /**
             * @event scheduledblclick
             * Fires after a doubleclick on the schedule area
             * @param {Gnt.panel.Gantt} gantt The gantt panel object
             * @param {Date} clickedDate The clicked date
             * @param {Number} rowIndex The row index
             * @param {Ext.EventObject} e The event object
             */
            'scheduledblclick',

            /**
             * @event schedulecontextmenu
             * Fires after a context menu click on the schedule area
             * @param {Gnt.panel.Gantt} gantt The gantt panel object
             * @param {Date} clickedDate The clicked date
             * @param {Number} rowIndex The row index
             * @param {Ext.EventObject} e The event object
             */
            'schedulecontextmenu',

            // Not supported in gridview as of Ext 6.0.1
            // https://www.sencha.com/forum/showthread.php?307978-GridPanel-should-fire-rowlongpress-celllongpress-etc&p=1124914#post1124914
            'rowlongpress',
            'containerlongpress'
        ]);

        if (this.addRowOnTab) {
            var lockedView = this.lockedGrid.getView();
            lockedView.onRowExit = Ext.Function.createInterceptor(lockedView.onRowExit, this.beforeRowExit, this);
        }

        this.registerRenderer(ganttView.columnRenderer, ganttView);

        var cls = ' sch-ganttpanel sch-horizontal ';

        if (this.highlightWeekends) {
            cls += ' sch-ganttpanel-highlightweekends ';
        }

        this.addCls(cls);

        if (this.eventBorderWidth < 1) {
            this.addCls('sch-gantt-no-task-border');
        }

        if (this.baselineVisible) {
            this.showBaseline();
        }

        // HACK: Editors belong in the locked grid, otherwise they float visibly on top of the normal grid when scrolling the locked grid
        this.on('add', function (me, cmp) {
            if (cmp instanceof Ext.Editor) {
                me.lockedGrid.suspendLayouts();
                me.suspendLayouts();
                me.lockedGrid.add(cmp);
                me.resumeLayouts();
                me.lockedGrid.resumeLayouts();
            }
        });

        this.on('viewready', this.onMyViewReady, this);

        // Prevent the Pan plugin from interfering with a dragcreate action
        this.on({
            dragcreatestart : function() {
                var panPlug = this.findPlugin('scheduler_pan');

                if (panPlug){
                    panPlug.disable();
                }
            },

            afterdragcreate : function() {
                var panPlug = this.findPlugin('scheduler_pan');

                if (panPlug){
                    panPlug.enable();
                }
            },

            scope : this
        });

        if (this.scrollTaskIntoViewOnClick) {
            this.lockedGrid.on('itemclick', this.onRowClicked, this);
        }
    },


    setReadOnly : function (readOnly) {
        this.callParent(arguments);

        // notify other parts of readOnly mode switching
        this.fireEvent('setreadonly', this, readOnly);
    },


    getTimeSpanDefiningStore : function () {
        return this.taskStore;
    },


    bindAutoTimeSpanListeners : function () {
        if (!this.autoFitOnLoad) {
            this.callParent(arguments);
        }
    },


    // Make sure views doesn't react to store changes during cascading
    onBeforeCascade           : function () {
        // HACK no easy way to disable grid view from reacting to the store
        this.lockedGrid.view.onUpdate = this.normalGrid.view.onUpdate = Ext.emptyFn;

        this.suspendLayouts();
    },


    // Re-activate view->store listeners and update views if needed
    onAfterCascade            : function (treeStore, context) {
        var me = this;

        this.lockedGrid.view.onUpdate = this.lockedGrid.view.self.prototype.onUpdate;
        this.normalGrid.view.onUpdate = this.normalGrid.view.self.prototype.onUpdate;

        me.resumeLayouts();

        if (context.nbrAffected > 0) {
            var lockedView = this.lockedGrid.getView();

            // Manual refresh of a few row nodes is way faster in large DOM scenarios where the
            // refresh operation takes too long (read/set scroll position, gridview refreshSize etc)
            if (context.nbrAffected <= me.simpleCascadeThreshold) {
                var view = this.getView();
                var ganttView = this.getSchedulingView();

                // let the view finish redrawing all the rows before we are trying to repaint dependencies
                ganttView.suspendEvents(true);

                // "context.affected" will contain parent affected parent tasks as well
                for (var id in context.affected) {
                    var task = context.affected[id];
                    var index = lockedView.store.indexOf(task);

                    // The target task may be inside a collapsed parent, in which case we should ignore updating it
                    if (index >= 0) {
                        view.refreshNode(index);
                    }

                }

                ganttView.resumeEvents();

                return;
            }

            var normalView = this.normalGrid.getView();

            normalView.refreshKeepingScroll(true);

            me.suspendLayouts();

            lockedView.refresh();

            me.resumeLayouts();
        }
    },

    bindFullRefreshListeners : function (column) {
        var me = this;
        var refreshTimeout;

        var refreshColumn = function () {
            if (refreshTimeout) return;

            refreshTimeout = setTimeout(function () {
                refreshTimeout = null;

                me.redrawColumns([ column ]);

            }, me.refreshTimeout);
        };

        column.mon(this.taskStore, {
            nodeappend : refreshColumn,
            nodeinsert : refreshColumn,
            noderemove : refreshColumn,

            scope : this
        });
    },

    bindSequentialDataListeners : function (column) {
        var lockedView = this.lockedGrid.view;
        var taskStore = this.taskStore;

        // the combination of buffered renderer + tree will perform a full refresh on any CRUD,
        // no need to update only some of the cells
        // Update: Seems unreliable
        //if (lockedView.bufferedRenderer) return;

        column.mon(taskStore, {
            nodeappend : function (store, node, index) {
                if (!taskStore.fillCount) {
                    // We refresh all nodes following the inserted node parent (since at this point, node is not yet part of the store)
                    this.updateAutoGeneratedCells(column, lockedView.store.indexOf(node.parentNode));
                }
            },

            nodeinsert : function (store, node, insertedBefore) {
                this.updateAutoGeneratedCells(column, lockedView.store.indexOf(insertedBefore));
            },

            noderemove  : function(store, node, isMove) {
                if (!isMove) {
                    this.updateAutoGeneratedCells(column, lockedView.store.indexOf(node));
                }
            },

            nodemove  : function(store, oldParent) {
                this.updateAutoGeneratedCells(column, lockedView.store.indexOf(oldParent));
            },

            scope       : this
        });
    },


    bindSlackListeners : function () {
        var updateSlackColumns = Ext.Function.createBuffered(this.updateSlackColumns, this.refreshTimeout, this, []);

        this.slackListeners = this.mon(this.taskStore, {
            resetearlydates : updateSlackColumns,
            resetlatedates  : updateSlackColumns,
            scope           : this,
            destroyable     : true
        });
    },

    bindEarlyDatesListeners : function () {
        var updateEarlyDateColumns = Ext.Function.createBuffered(this.updateEarlyDateColumns, this.refreshTimeout, this, []);

        this.earlyDatesListeners = this.mon(this.taskStore, {
            resetearlydates : updateEarlyDateColumns,
            scope           : this,
            destroyable     : true
        });
    },

    bindLateDatesListeners : function () {
        var updateLateDateColumns = Ext.Function.createBuffered(this.updateLateDateColumns, this.refreshTimeout, this, []);

        this.lateDatesListeners = this.mon(this.taskStore, {
            resetlatedates : updateLateDateColumns,
            scope          : this,
            destroyable    : true
        });
    },

    startEditScrollToEditor : function (record) {
        var editingPlugin = this.ganttEditingPlugin;

        // HACK: Need to do an extra 'realign' call since the Ext call to show the editor messes up the scrollposition
        // See test 1002_tabbing.t.js
        !Sch.disableOverrides && editingPlugin && editingPlugin.on('beforeedit', function(plug, context) {
            context.column.getEl().scrollIntoView(this.lockedGrid.getHeaderContainer().getEl());
        }, this, { single : true });
    },

    beforeRowExit      : function (prevRow, newRow, forward) {
        if (forward && !newRow) {
            var view = this.lockedGrid.getView();
            var record = view.getRecord(prevRow);
            var newRec = record.addTaskBelow({ leaf : true });

            this.startEditScrollToEditor(newRec);
        }
    },

    // this function checks whether the configuration option should be translated to task store or calendar
    // idea is that some configuration option (`cascadeChanges` for example) actually belongs to TaskStore
    // so they are not persisted in the gantt panel (panel only provides accessors which reads/write from/to TaskStore)
    // however the values for those options could also be specified in the prototype of the Gnt.panel.Gantt subclass
    // see #172
    needToTranslateOption : function (optionName) {
        return this.hasOwnProperty(optionName) || this.self.prototype.hasOwnProperty(optionName) && this.self != Gnt.panel.Gantt;
    },

    /**
     * Returns the dependency view instance
     * @return {Gnt.view.Dependency} The dependency view instance
     */
    getDependencyView : function () {
        return this.getSchedulingView().getDependencyView();
    },

    /**
     * Toggles the weekend highlighting on or off
     * @param {Boolean} disabled
     */
    disableWeekendHighlighting : function (disabled) {
        this.workingTimePlugin.setDisabled(disabled);
    },

    /**
     * <p>Returns the task record for a DOM node</p>
     * @param {Ext.Element/HTMLElement} el The DOM node or Ext Element to lookup
     * @return {Gnt.model.Task} The task record
     */
    resolveTaskRecord : function (el) {
        return this.getSchedulingView().resolveTaskRecord(el);
    },

    /**
     * Tries to fit the time columns to the available view width
     */
    fitTimeColumns : function () {
        this.getSchedulingView().fitColumns();
    },

    /**
     * Returns the resource store associated with the Gantt panel instance
     * @return {Gnt.data.ResourceStore}
     */
    getResourceStore : function () {
        return this.getTaskStore().getResourceStore();
    },

    /**
     * Returns the assignment store associated with the Gantt panel instance
     * @return {Gnt.data.AssignmentStore}
     */
    getAssignmentStore : function () {
        return this.getTaskStore().getAssignmentStore();
    },

    /**
     * Returns the associated CRUD manager
     * @return {Gnt.data.CrudManager}
     */
    getCrudManager : function () {
        return this.crudManager;
    },

    /**
     * Returns the associated task store
     * @return {Gnt.data.TaskStore}
     */
    getTaskStore : function () {
        return this.taskStore;
    },

    /**
     * Returns the task store instance
     * @return {Gnt.data.TaskStore}
     */
    getEventStore : function () {
        return this.taskStore;
    },

    /**
     * Returns the associated dependency store
     * @return {Gnt.data.DependencyStore}
     */
    getDependencyStore     : function () {
        return this.dependencyStore;
    },


    // private
    onDragDropStart        : function () {
        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }
    },

    // private
    onDragDropEnd          : function () {
        if (this.tip) {
            this.tip.enable();
        }
    },


    // private
    configureFunctionality : function () {
        // Normalize to array
        var plugins = this.plugins = [].concat(this.plugins || []);

        if (this.highlightWeekends) {

            this.workingTimePlugin = Ext.create("Gnt.feature.WorkingTime", {
                calendar : this.calendar
            });

            plugins.push(this.workingTimePlugin);
        }

        if (this.showTodayLine) {
            this.todayLinePlugin = new Sch.plugin.CurrentTimeLine();
            plugins.push(this.todayLinePlugin);
        }

        if (this.enableConstraintsResolutionGui && !Ext.Array.findBy(plugins, function (item) {
                return (item instanceof Gnt.plugin.ConstraintResolutionGui) ||
                       (item.ptype == 'constraintresolutiongui');
            })) {

            plugins.push(Ext.apply(this.constraintResolutionGuiConfig || {}, {
                pluginId : "constraintresolutiongui",
                ptype    : "constraintresolutiongui"
            }));
        }

        if (this.showProjectLines) {
            plugins.push(Ext.apply({
                pluginId    : 'gantt_projectlines',
                ptype       : 'gantt_projectlines'
            }, this.projectLinesConfig));
        }

        // Either object or boolean
        if (this.enableTaskReordering) {
            this.lockedViewConfig           = this.lockedViewConfig || {};
            this.lockedViewConfig.plugins   = [].concat(this.lockedViewConfig.plugins || []);

            // HACK - remove post v4.0
            // Users may have added their own drag drop plugin, in such case we should not add our owns
            var lockedViewPlugins           = this.lockedViewConfig.plugins;
            var userAddedOwnDragDropPlugin;

            Ext.Array.each(lockedViewPlugins, function(plug) {
                if (plug === 'treeviewdragdrop' || plug.ptype === 'treeviewdragdrop') {
                    userAddedOwnDragDropPlugin = true;
                }
            });

            if (!userAddedOwnDragDropPlugin) {
                var pluginConfig        = typeof this.enableTaskReordering !== 'boolean' ? this.enableTaskReordering : {
                    ptype           : 'treeviewdragdrop',
                    pluginId        : 'bryntum_treedragdrop',
                    containerScroll : true,
                    dragZone        : {
                        onBeforeDrag   : Ext.Function.bind(this.onBeforeTaskReorder, this),
                        beforeDragOver : Ext.Function.bind(this.onBeforeTaskReorderOver, this)
                    }
                };

                lockedViewPlugins.push(pluginConfig);
            }
        }
    },

    /**
     * If configured to highlight non-working time, this method returns the {@link Gnt.feature.WorkingTime workingTime} feature
     * responsible for providing this functionality.
     * @return {Gnt.feature.WorkingTime} workingTime
     */
    getWorkingTimePlugin : function () {
        return this.workingTimePlugin;
    },

    registerLockedDependencyListeners : function () {
        var me = this;
        var depStore = this.getDependencyStore();

        // Need to save these to be able to deregister them properly.
        this._lockedDependencyListeners = this._lockedDependencyListeners || {
            load : function () {
                var taskStore = me.getTaskStore();

                // reset cached early/late dates
                taskStore.resetEarlyDates();
                taskStore.resetLateDates();

                me.lockedGrid.getView().refresh();
            },

            clear : function () {
                var taskStore = me.getTaskStore();

                // reset cached early/late dates
                taskStore.resetEarlyDates();
                taskStore.resetLateDates();

                me.lockedGrid.getView().refresh();
            },

            add : function (depStore, records) {
                me.updateDependenciesTasks(records);
            },

            update : function (depStore, record, operation) {
                if (operation != Ext.data.Model.COMMIT) {
                    var view = me.lockedGrid.view;

                    if (record.previous[record.fromField]) {
                        var prevFromTask = me.taskStore.getModelById(record.previous[record.fromField]);

                        if (prevFromTask) {
                            view.refreshNode(prevFromTask);
                        }
                    }

                    if (record.previous[record.toField]) {
                        var prevToTask = me.taskStore.getModelById(record.previous[record.toField]);

                        if (prevToTask) {
                            view.refreshNode(prevToTask);
                        }
                    }

                }

                // we update the record related tasks not for EDIT operation only
                // since we need to react on record COMMIT as well
                me.updateDependenciesTasks([ record ]);
            },

            remove : function (depStore, records) {
                me.updateDependenciesTasks(records);
            }
        };

        // This could be called multiple times, if both predecessor and successor columns are used
        this.mun(depStore, this._lockedDependencyListeners);
        this.mon(depStore, this._lockedDependencyListeners);
    },


    getDependencyTasks : function (depRecord) {
        var sourceTask = depRecord.getSourceTask(this.taskStore),
            targetTask = depRecord.getTargetTask(this.taskStore),
            result     = [];

        // we should not refresh node which is being removed
        if (sourceTask && sourceTask.getTreeStore()) {
            result.push(sourceTask);
        }
        if (targetTask && targetTask.getTreeStore()) {
            result.push(targetTask);
        }

        return result;
    },


    updateTasks : function (tasks) {
        var lockedView = this.lockedGrid.view,
            normalView = this.normalGrid.view;

        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];

            lockedView.refreshNode(task);
            normalView.refreshNode(task);
        }
    },


    updateDependenciesTasks : function (dependencies) {
        var me         = this,
            addedTasks = {},
            toRefresh  = [];

        Ext.Array.each(dependencies, function (dependency) {
            // get dependency related tasks
            var tasks = me.getDependencyTasks(dependency);

            for (var i = 0; i < tasks.length; i++) {
                // put them into toRefresh array if they aren't there already
                if (!addedTasks[tasks[i].getId()]) {
                    addedTasks[tasks[i].getId()] = 1;
                    toRefresh.push(tasks[i]);
                }
            }

            // refresh nodes of the tasks enumarated in toRefresh
            me.updateTasks(toRefresh);
        });
    },


    /**
     * Shows the baseline tasks
     */
    showBaseline : function () {
        this.addCls('sch-ganttpanel-showbaseline');
    },

    /**
     * Hides the baseline tasks
     */
    hideBaseline : function () {
        this.removeCls('sch-ganttpanel-showbaseline');
    },

    /**
     * Toggles the display of the baseline
     */
    toggleBaseline : function () {
        this.toggleCls('sch-ganttpanel-showbaseline');
    },

    /**
     * Changes the timeframe of the gantt chart to fit all the tasks in it. Provide left/right margin if you want to fit also
     * labels.
     * @param {Gnt.model.Task/Gnt.model.Task[]} [tasks] A list of tasks to zoom to. If not specified then the gantt will
     * try to fit all the tasks in the {@link #taskStore task store}.
     * @param {Object} [options] Options object for zooming.
     * @param {Integer} [options.leftMargin] Defines margin in pixel between the first task start date and first visible date
     * @param {Integer} [options.rightMargin] Defines margin in pixel between the last task end date and last visible date
     */
    zoomToFit : function (tasks, options) {
        options = Ext.apply({
            adjustStart : 1,
            adjustEnd   : 1
        }, options);
        // If view is being filtered, only considered the matching results when zooming
        if (!tasks && this.taskStore.isTreeFiltered()) {
            tasks = this.getSchedulingView().store.getRange();
        }

        var span = tasks ? this.taskStore.getTimeSpanForTasks(tasks) : this.taskStore.getTotalTimeSpan();

        if (this.zoomToSpan(span, options) === null) {
            // if no zooming was performed - fit columns to view space
            if (!tasks) this.fitTimeColumns();
        }
    },


    /**
     * "Get" accessor for the `cascadeChanges` option
     */
    getCascadeChanges : function () {
        return this.taskStore.cascadeChanges;
    },


    /**
     * "Set" accessor for the `cascadeChanges` option
     */
    setCascadeChanges : function (value) {
        this.taskStore.cascadeChanges = value;
    },


    /**
     * "Get" accessor for the `recalculateParents` option
     */
    getRecalculateParents : function () {
        return this.taskStore.recalculateParents;
    },


    /**
     * "Set" accessor for the `recalculateParents` option
     */
    setRecalculateParents : function (value) {
        this.taskStore.recalculateParents = value;
    },


    /**
     * "Set" accessor for the `skipWeekendsDuringDragDrop` option
     */
    setSkipWeekendsDuringDragDrop : function (value) {
        this.taskStore.skipWeekendsDuringDragDrop = this.skipWeekendsDuringDragDrop = value;
    },


    /**
     * "Get" accessor for the `skipWeekendsDuringDragDrop` option
     */
    getSkipWeekendsDuringDragDrop : function () {
        return this.taskStore.skipWeekendsDuringDragDrop;
    },

    bindResourceStore : function (resourceStore, initial) {
        var me = this;
        var listeners = {
            scope       : me,
            update      : me.onResourceStoreUpdate,
            datachanged : me.onResourceStoreDataChanged
        };

        if (!initial && me.resourceStore) {
            if (resourceStore !== me.resourceStore && me.resourceStore.autoDestroy) {
                me.resourceStore.destroy();
            }
            else {
                me.mun(me.resourceStore, listeners);
            }
            if (!resourceStore) {
                me.resourceStore = null;
            }
        }
        if (resourceStore) {
            resourceStore = Ext.data.StoreManager.lookup(resourceStore);
            me.mon(resourceStore, listeners);
            this.taskStore.setResourceStore(resourceStore);
        }

        me.resourceStore = resourceStore;

        if (resourceStore && !initial) {
            me.refreshViews();
        }
    },

    refreshViews : function () {
        if (!this.rendered) return;

        var lockedView = this.lockedGrid.getView(),
            scroll = {
                left : lockedView.getScrollX(),
                top  : lockedView.getScrollY()
            };

        lockedView.refresh();

        this.getSchedulingView().refreshKeepingScroll();
        lockedView.setScrollX(scroll.left);
        lockedView.setScrollY(scroll.top);
    },

    bindAssignmentStore   : function (assignmentStore, initial) {
        var me = this;
        var listeners = {
            scope : me,

            beforetaskassignmentschange : me.onBeforeSingleTaskAssignmentChange,
            taskassignmentschanged      : me.onSingleTaskAssignmentChange,

            update      : me.onAssignmentStoreUpdate,
            datachanged : me.onAssignmentStoreDataChanged
        };

        if (!initial && me.assignmentStore) {
            if (assignmentStore !== me.assignmentStore && me.assignmentStore.autoDestroy) {
                me.assignmentStore.destroy();
            }
            else {
                me.mun(me.assignmentStore, listeners);
            }
            if (!assignmentStore) {
                me.assignmentStore = null;
            }
        }
        if (assignmentStore) {
            assignmentStore = Ext.data.StoreManager.lookup(assignmentStore);
            me.mon(assignmentStore, listeners);
            this.taskStore.setAssignmentStore(assignmentStore);
        }

        me.assignmentStore = assignmentStore;

        if (assignmentStore && !initial) {
            me.refreshViews();
        }
    },

    // BEGIN RESOURCE STORE LISTENERS
    onResourceStoreUpdate : function (store, resource) {

        Ext.Array.each(resource.getTasks(), function (task) {
            var index = this.lockedGrid.view.store.indexOf(task);

            if (index >= 0) {
                this.getView().refreshNode(index);
            }
        }, this);
    },

    onResourceStoreDataChanged   : function () {
        if (this.taskStore.getRootNode().childNodes.length > 0) {
            this.refreshViews();
        }
    },
    // EOF RESOURCE STORE LISTENERS

    // BEGIN ASSIGNMENT STORE LISTENERS
    onAssignmentStoreDataChanged : function () {
        if (this.taskStore.getRootNode().childNodes.length > 0) {
            this.refreshViews();
        }
    },

    onAssignmentStoreUpdate            : function (store, assignment) {
        var task = assignment.getTask();

        if (task) {
            var index = this.lockedGrid.view.store.indexOf(task);

            if (index >= 0) {
                this.getView().refreshNode(index);
            }
        }
    },

    // We should not react to changes in the assignment store when it is happening for a single resource
    // We rely on the "taskassignmentschanged" event for updating the UI
    onBeforeSingleTaskAssignmentChange : function () {
        this.assignmentStore.un('datachanged', this.onAssignmentStoreDataChanged, this);
    },

    onSingleTaskAssignmentChange : function (assignmentStore, taskId) {

        this.assignmentStore.on('datachanged', this.onAssignmentStoreDataChanged, this);

        if (this.rendered) {

            var task = this.taskStore.getModelById(taskId);

            // Make sure task is part of the tree and wasn't just removed
            if (task && task.parentNode) {
                var index = this.taskStore.indexOf(task);

                if (index >= 0) {
                    this.getView().refreshNode(index);
                }
            }
        }
    },
    // EOF ASSIGNMENT STORE LISTENERS

    updateAutoGeneratedCells : function (column, recordIndex) {
        var view = this.lockedGrid.view;
        var startIndex = view.all.startIndex;
        var endIndex = view.all.endIndex;

        if (recordIndex < 0 || recordIndex > endIndex) return;

        for (var i = Math.max(startIndex, recordIndex); i <= endIndex; i++) {
            var rec = view.store.getAt(i);
            var cell = this.getCellDom(view, rec, column);

            if (cell) {
                cell.firstChild.innerHTML = column.renderer(null, null, rec);
            }
        }
    },


    getCellDom : function (view, record, column) {
        var row = view.getNode(record, true);

        return row && Ext.fly(row).down(column.getCellSelector(), true);
    },


    redrawColumns : function (cols) {
        // this method is called a lot from various buffered listeners, need to check
        // if component has not been destroyed
        if (cols.length && !this.isDestroyed) {
            var view = this.lockedGrid.view;

            for (var i = view.all.startIndex; i <= view.all.endIndex; i++) {
                var rec = view.store.getAt(i);

                for (var j = 0, ll = cols.length; j < ll; j++) {

                    var cell = this.getCellDom(view, rec, cols[j]);

                    // cell might be null for a hidden column
                    if (cell) {
                        var out = [];

                        view.renderCell(cols[j], rec, i, cols[j].getIndex(), i, out);

                        cell.innerHTML = out.join('');
                    }
                }
            }
        }
    },

    updateSlackColumns : function () {
        if (this.slackColumn) this.redrawColumns([ this.slackColumn ]);
    },

    updateEarlyDateColumns : function () {
        var cols = [];
        if (this.earlyStartColumn) cols.push(this.earlyStartColumn);
        if (this.earlyEndColumn) cols.push(this.earlyEndColumn);

        if (cols.length) this.redrawColumns(cols);
    },

    updateLateDateColumns : function () {
        var cols = [];
        if (this.lateStartColumn) cols.push(this.lateStartColumn);
        if (this.lateEndColumn) cols.push(this.lateEndColumn);

        if (cols.length) this.redrawColumns(cols);
    },

    onMyViewReady : function () {

        // Prevent editing of non-editable fields
        this.on('beforeedit', this.onBeforeEdit, this);

        this.setupColumnListeners();


        /* For clients using the Row Expand plugin */
        var depView = this.getDependencyView();

        this.getView().on({
            expandbody   : depView.renderAllDependencies,
            collapsebody : depView.renderAllDependencies,
            scope        : depView
        });

        var plugs = this.lockedGrid.plugins || [];

        Ext.Array.each(plugs, function (plug) {
            if (Sch.plugin && Sch.plugin.TreeCellEditing && plug instanceof Sch.plugin.TreeCellEditing) {
                this.ganttEditingPlugin = plug;

                return false;
            }
        }, this);

        this.mon(this.taskStore, {
            'nodestore-datachange-start' : this.onFilterChange,
            'filter-clear'               : this.onFilterChange,
            scope                        : this
        });

        var splitter = this.down('splitter');

        if (splitter) {
            // Since Ext JS doesn't handle locked grid sizing, we do this ourselves.
            splitter.on('dragend', function() {
                this.saveState();
            }, this, { delay : 10 });
        }

        if (this.ganttEditingPlugin) {
            this.ganttEditingPlugin.on({
                editingstart : this.onEditingStart,
                edit         : this.onAfterEdit,
                canceledit   : this.onAfterEdit
            });
        }
    },

    onBeforeEdit : function (editor, o) {
        var column  = o.column;

        return !this.isReadOnly() && o.record.isEditable(o.field) &&
            (!column.isEditable || column.isEditable(o.record));
    },

    onEditingStart : function(plug, editor) {
        var field = editor.field;

        // Set instant update enabled only after editing has started
        if (field.originalInstantUpdate) {
            field.setInstantUpdate(true);
        }
    },

    onAfterEdit : function(editor, context) {
        var field = context.column.getEditor();

        if (field.setInstantUpdate) {
            field.setInstantUpdate(false);
        }
    },

    onFilterChange : function () {
        this.getSelectionModel().deselectAll();
    },

    setupColumnListeners : function () {
        var me = this;
        var lockedHeader = this.lockedGrid.getHeaderContainer();

        lockedHeader.on('add', this.onLockedColumnAdded, this);

        lockedHeader.items.each(function (col) {
            me.onLockedColumnAdded(lockedHeader, col);
        });
    },

    onLockedColumnAdded : function (ct, col) {
        var GntCol = Gnt.column;

        // Gnt.column can be null if no class from that namespace was used/required. We don't require that, so better check
        if (GntCol) {
            if (
                (GntCol.WBS && col instanceof GntCol.WBS) ||
                (GntCol.Sequence && col instanceof GntCol.Sequence)
                ) {
                this.bindSequentialDataListeners(col);
            } else if (GntCol.Dependency && col instanceof GntCol.Dependency && col.useSequenceNumber) {
                this.bindFullRefreshListeners(col);
            } else if (GntCol.EarlyStartDate && col instanceof GntCol.EarlyStartDate) this.earlyStartColumn = col;
            else if (GntCol.EarlyEndDate && col instanceof GntCol.EarlyEndDate) this.earlyEndColumn = col;
            else if (GntCol.LateStartDate && col instanceof GntCol.LateStartDate) this.lateStartColumn = col;
            else if (GntCol.LateEndDate && col instanceof GntCol.LateEndDate) this.lateEndColumn = col;
            else if (GntCol.Slack && col instanceof GntCol.Slack) this.slackColumn = col;
        }

        if (!this.slackListeners && this.slackColumn) {
            this.bindSlackListeners();
        }

        if (!this.earlyDatesListeners && (this.earlyStartColumn || this.earlyEndColumn)) {
            this.bindEarlyDatesListeners();
        }

        if (!this.lateDatesListeners && (this.lateStartColumn || this.lateEndColumn)) {
            this.bindLateDatesListeners();
        }
    },

    getState : function () {
        var me = this,
            state = me.callParent(arguments);

        state.lockedWidth = me.lockedGrid.getWidth();

        return state;
    },

    applyState : function (state) {
        var me = this;

        me.callParent(arguments);

        if (state && state.lockedWidth) {
            me.lockedGrid.setWidth(state.lockedWidth);
        }
    },

    completeEdit : function () {
        this.ganttEditingPlugin && this.ganttEditingPlugin.completeEdit();
    },

    cancelEdit : function () {
        this.ganttEditingPlugin && this.ganttEditingPlugin.cancelEdit();
    },

    setRowHeight : function (height) {
        var rowHeightSelector = '#' + this.getId() + ' .' + Ext.baseCSSPrefix + 'grid-cell';

        if (!Ext.util.CSS.getRule(rowHeightSelector)) {
            // Create panel specific row height rule
            Ext.util.CSS.createStyleSheet(rowHeightSelector + '{ height:' + height + 'px; }');
        } else {
            Ext.util.CSS.updateRule(rowHeightSelector, 'height', height + 'px');
        }

        // Let view know about this too
        this.getSchedulingView().setRowHeight(height);
    },

    // If task is provided returns a proper task editor plugin instance that can be used for editing.
    // Return any task editor instance available when no task is provided.
    getTaskEditor : function (task) {
        var plugins = this.plugins;

        for (var i = 0, l = plugins.length; i < l; i++) {
            var plugin  = plugins[i];

            if (plugin.isTaskEditor && (!task || plugin.matchFilters(task))) return plugin;
        }
    },

    onRowClicked : function (panel, task) {
        this.getSchedulingView().scrollEventIntoView(task, false, false);
    },

    // Prevents a readonly task reordering or any task reordering if the gantt is in readonly mode.
    onBeforeTaskReorder : function (data, ev) {
        var task = ev.record;

        // remember task being reordered
        this._reorderingTask = task;

        // reorder if the panel and the task being drag are not readonly
        return !this.isReadOnly() && task && !task.isReadOnly();
    },

    // Prevents dropping a task being reordered into another readonly task
    onBeforeTaskReorderOver : function (dropZone, ev) {
        var target = dropZone.getTargetFromEvent(ev);

        if (target) {
            var targetTask = dropZone.view.getRecord(target);
            return targetTask !== this._reorderingTask && !targetTask.isReadOnly();
        }
    },

    /**
    * Returns an array of the currently selected rows
    *
    * @return {[Gnt.model.Task]}
    * */
    getSelectedRows : function() {
        var selected = this.getSelectionModel().getSelected();
        var tasks    = [];

        if (Ext.grid.selection.Cells && selected instanceof Ext.grid.selection.Cells) {
            selected.eachRow(function (task) {
                tasks.push(task);
            });
        } else {
            // Rows are being selected
            tasks = this.getSelectionModel().getSelection();
        }

        return tasks;
    },

    destroy : function() {
        if (this.destroyStores) {
            var calendarManager = this.taskStore.calendarManager;

            this.assignmentStore && this.assignmentStore.destroy();
            this.assignmentStore = null;

            this.resourceStore && this.resourceStore.destroy();
            this.resourceStore = null;

            this.taskStore && this.taskStore.destroy();
            this.taskStore = null;

            this.dependencyStore && this.dependencyStore.destroy();
            this.dependencyStore = null;

            this.dependencyStore && this.dependencyStore.destroy();
            this.dependencyStore = null;

            calendarManager && calendarManager.destroy();
        }

        this.callParent(arguments);
    }
});
