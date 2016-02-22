/*

Ext Gantt 3.0.0
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Gnt.locale.Zh', {
    extend    : 'Sch.locale.Locale',
    requires  : 'Sch.locale.zh',
    singleton : true,

    constructor : function (config) {

        Ext.apply(this, {
            l10n : {
                'Gnt.util.DurationParser' : {
                    unitsRegex : {
                        MILLI   : /^ms$|^mil/i,
                        SECOND  : /^s$|^sec/i,
                        MINUTE  : /^m$|^min/i,
                        HOUR    : /^h$|^hr$|^hour/i,
                        DAY     : /^d$|^day/i,
                        WEEK    : /^w$|^wk|^week/i,
                        MONTH   : /^mo|^mnt/i,
                        QUARTER : /^q$|^quar|^qrt/i,
                        YEAR    : /^y$|^yr|^year/i
                    }
                },

                'Gnt.util.DependencyParser' : {
                    typeText : {
                        SS : 'SS',
                        SF : 'SF',
                        FS : 'FS',
                        FF : 'FF'
                    }
                },

                'Gnt.field.ConstraintType' : {
                    none : '空'
                },

                'Gnt.field.Duration' : {
                    invalidText : '无效值'
                },

                'Gnt.field.Effort' : {
                    invalidText : '无效值'
                },

                'Gnt.field.Percent' : {
                    invalidText : '无效值'
                },

                'Gnt.feature.DependencyDragDrop' : {
                    fromText  : '从',
                    toText    : '到',
                    startText : '开始',
                    endText   : '结束'
                },

                'Gnt.Tooltip' : {
                    startText    : '开始: ',
                    endText      : '结束: ',
                    durationText : '持续: '
                },

                'Gnt.plugin.TaskContextMenu' : {
                    taskInformation    : '任务信息...',
                    newTaskText        : '新任务',
                    deleteTask         : '删除信息',
                    editLeftLabel      : '编辑左边标题',
                    editRightLabel     : '编辑右边标题',
                    add                : '新增...',
                    deleteDependency   : '删除依赖...',
                    addTaskAbove       : '上方',
                    addTaskBelow       : '下方',
                    addMilestone       : '里程碑',
                    addSubtask         : '子任务',
                    addSuccessor       : '替代任务',
                    addPredecessor     : '前置任务',
                    convertToMilestone : '设置为里程碑',
                    convertToRegular   : '设置为任务',
                    splitTask          : '拆分任务'
                },

                'Gnt.plugin.DependencyEditor' : {
                    fromText         : '从',
                    toText           : '到',
                    typeText         : '类别',
                    lagText          : '延期',
                    endToStartText   : '完成-开始',
                    startToStartText : '开始-开始',
                    endToEndText     : '完成-完成',
                    startToEndText   : '开始-完成'
                },

                'Gnt.widget.calendar.Calendar' : {
                    dayOverrideNameHeaderText : '名称',
                    overrideName              : '名称',
                    startDate                 : '开始日期',
                    endDate                   : '结束日期',
                    error                     : '错误',
                    dateText                  : '日期',
                    addText                   : '新增',
                    editText                  : '编辑',
                    removeText                : '移除',
                    workingDayText            : '工作日',
                    weekendsText              : '周末',
                    overriddenDayText         : 'Overridden day',
                    overriddenWeekText        : 'Overridden week',
                    workingTimeText           : '工作时间',
                    nonworkingTimeText        : '非工作时间',
                    dayOverridesText          : 'Day overrides',
                    weekOverridesText         : 'Week overrides',
                    okText                    : '确定',
                    cancelText                : '取消',
                    parentCalendarText        : 'Parent calendar',
                    noParentText              : '没有父任务',
                    selectParentText          : '选择父任务',
                    newDayName                : '[Without name]',
                    calendarNameText          : 'Calendar name',
                    tplTexts                  : {
                        tplWorkingHours  : 'Working hours for',
                        tplIsNonWorking  : 'is non-working',
                        tplOverride      : 'override',
                        tplInCalendar    : 'in calendar',
                        tplDayInCalendar : 'standard day in calendar',
                        tplBasedOn       : 'Based on'
                    },
                    overrideErrorText         : 'There is already an override for this day',
                    overrideDateError         : 'There is already a week override on this date: {0}',
                    startAfterEndError        : 'Start date should be less than end date',
                    weeksIntersectError       : 'Week overrides should not intersect'
                },

                'Gnt.widget.calendar.AvailabilityGrid' : {
                    startText  : '开始',
                    endText    : '结束',
                    addText    : '新境',
                    removeText : '删除',
                    error      : '错误'
                },

                'Gnt.widget.calendar.DayEditor' : {
                    workingTimeText    : '工作时间',
                    nonworkingTimeText : '非工作时间'
                },

                'Gnt.widget.calendar.WeekEditor' : {
                    defaultTimeText    : '默认时间',
                    workingTimeText    : '工作时间',
                    nonworkingTimeText : '非工作时间',
                    error              : '错误',
                    noOverrideError    : "Week override contains only 'default' days - can't save it"
                },

                'Gnt.widget.calendar.ResourceCalendarGrid' : {
                    name     : '名称',
                    calendar : '日历'
                },

                'Gnt.widget.calendar.CalendarWindow' : {
                    ok     : '确定',
                    cancel : '取消'
                },

                'Gnt.widget.calendar.CalendarManager' : {
                    addText         : 'Add',
                    removeText      : 'Remove',
                    add_child       : 'Add child',
                    add_node        : 'Add calendar',
                    add_sibling     : 'Add sibling',
                    remove          : 'Remove',
                    calendarName    : 'Calendar',
                    confirm_action  : 'Confirm action',
                    confirm_message : 'Calendar has unsaved changes. Would you like to save your changes?'
                },

                'Gnt.widget.calendar.CalendarManagerWindow' : {
                    ok     : 'Apply changes',
                    cancel : 'Close'
                },

                'Gnt.field.Assignment' : {
                    cancelText : '取消',
                    closeText  : '保存并关闭'
                },

                'Gnt.column.AssignmentUnits' : {
                    text : '单位'
                },

                'Gnt.column.Duration' : {
                    text : '持续'
                },

                'Gnt.column.Effort' : {
                    text : 'Effort'
                },

                'Gnt.column.EndDate' : {
                    text : '完成时间'
                },

                'Gnt.column.PercentDone' : {
                    text : '完成率(%)'
                },

                'Gnt.column.ResourceAssignment' : {
                    text : '分配资源'
                },

                'Gnt.column.ResourceName' : {
                    text : '资源名称'
                },

                'Gnt.column.Rollup' : {
                    text : 'Rollup task',
                    no   : '否',
                    yes  : '是'
                },

                'Gnt.column.SchedulingMode' : {
                    text : '模式'
                },

                'Gnt.column.Predecessor' : {
                    text : '前置任务'
                },

                'Gnt.column.Successor' : {
                    text : '后续任务'
                },

                'Gnt.column.StartDate' : {
                    text : '开始时间'
                },

                'Gnt.column.WBS' : {
                    text : 'WBS'
                },

                'Gnt.column.Sequence' : {
                    text : '#'
                },

                'Gnt.column.Calendar' : {
                    text : '日历'
                },

                'Gnt.widget.taskeditor.TaskForm' : {
                    taskNameText            : '名称',
                    durationText            : '持续',
                    datesText               : '日期',
                    baselineText            : '基线',
                    startText               : '开始',
                    finishText              : '结束',
                    percentDoneText         : '完成率',
                    baselineStartText       : '开始',
                    baselineFinishText      : '结束',
                    baselinePercentDoneText : '完成率',
                    effortText              : 'Effort',
                    invalidEffortText       : '无效值',
                    calendarText            : '日历',
                    schedulingModeText      : '排程模式',
                    rollupText              : 'Rollup',
                    wbsCodeText             : 'WBS code',
                    "Constraint Type"       : "约束类别",
                    "Constraint Date"       : "约束日期"
                },

                'Gnt.widget.DependencyGrid' : {
                    idText                    : 'ID',
                    snText                    : 'SN',
                    taskText                  : '任务名称',
                    blankTaskText             : 'Please select task',
                    invalidDependencyText     : 'Invalid dependency',
                    parentChildDependencyText : 'Dependency between child and parent found',
                    duplicatingDependencyText : 'Duplicate dependency found',
                    transitiveDependencyText  : 'Transitive dependency',
                    cyclicDependencyText      : 'Cyclic dependency',
                    typeText                  : 'Type',
                    lagText                   : 'Lag',
                    clsText                   : 'CSS class',
                    endToStartText            : 'Finish-To-Start',
                    startToStartText          : 'Start-To-Start',
                    endToEndText              : 'Finish-To-Finish',
                    startToEndText            : 'Start-To-Finish'
                },

                'Gnt.widget.AssignmentEditGrid' : {
                    confirmAddResourceTitle : 'Confirm',
                    confirmAddResourceText  : 'Resource &quot;{0}&quot; not found in list. Would you like to add it?',
                    noValueText             : 'Please select resource to assign',
                    noResourceText          : 'No resource &quot;{0}&quot; found in the list'
                },

                'Gnt.widget.taskeditor.TaskEditor' : {
                    generalText        : 'General',
                    resourcesText      : 'Resources',
                    dependencyText     : 'Predecessors',
                    addDependencyText  : 'Add new',
                    dropDependencyText : 'Remove',
                    notesText          : 'Notes',
                    advancedText       : 'Advanced',
                    addAssignmentText  : 'Add new',
                    dropAssignmentText : 'Remove'
                },

                'Gnt.plugin.TaskEditor' : {
                    title        : 'Task Information',
                    alertCaption : 'Information',
                    alertText    : 'Please correct marked errors to save changes',
                    okText       : 'Ok',
                    cancelText   : 'Cancel'
                },

                'Gnt.field.EndDate' : {
                    endBeforeStartText : 'End date is before start date'
                },

                'Gnt.column.Note' : {
                    text : 'Note'
                },

                'Gnt.column.AddNew' : {
                    text : 'Add new column...'
                },

                'Gnt.column.EarlyStartDate' : {
                    text : 'Early Start'
                },

                'Gnt.column.EarlyEndDate' : {
                    text : 'Early Finish'
                },

                'Gnt.column.LateStartDate' : {
                    text : 'Late Start'
                },

                'Gnt.column.LateEndDate' : {
                    text : 'Late Finish'
                },

                'Gnt.field.Calendar' : {
                    calendarNotApplicable : 'Task calendar has no overlapping with assigned resources calendars'
                },

                'Gnt.column.Slack' : {
                    text : 'Slack'
                },

                'Gnt.column.Name' : {
                    text : 'Task Name'
                },

                'Gnt.column.BaselineStartDate' : {
                    text : 'Baseline Start Date'
                },

                'Gnt.column.BaselineEndDate' : {
                    text : 'Baseline End Date'
                },

                'Gnt.column.Milestone' : {
                    text : 'Milestone'
                },

                'Gnt.field.Milestone' : {
                    yes : 'Yes',
                    no  : 'No'
                },

                'Gnt.field.Dependency' : {
                    invalidFormatText     : 'Invalid dependency format',
                    invalidDependencyText : 'Invalid dependency found, please make sure you have no cyclic paths between your tasks',
                    invalidDependencyType : 'Invalid dependency type {0}. Allowed values are: {1}.'
                },

                'Gnt.constraint.Base' : {
                    name                               : "A constraint",
                    "Remove the constraint"            : "Remove the constraint",
                    "Cancel the change and do nothing" : "Cancel the change and do nothing"
                },

                'Gnt.constraint.FinishNoEarlierThan' : {
                    name                             : "Finish no earlier than",
                    // {0} constraint date
                    "Move the task to finish on {0}" : "Move the task to finish on {0}"
                },

                "Gnt.constraint.FinishNoLaterThan" : {
                    name                             : "Finish no later than",
                    // {0} constraint date
                    "Move the task to finish on {0}" : "Move the task to finish on {0}"
                },

                "Gnt.constraint.MustFinishOn" : {
                    name                             : "Must finish on",
                    // {0} constraint date
                    "Move the task to finish on {0}" : "Move the task to finish on {0}"
                },

                "Gnt.constraint.MustStartOn" : {
                    name                            : "Must start on",
                    // {0} constraint date
                    "Move the task to start at {0}" : "Move the task to start at {0}"
                },

                "Gnt.constraint.StartNoEarlierThan" : {
                    name                            : "Start no earlier than",
                    // {0} constraint date
                    "Move the task to start at {0}" : "Move the task to start at {0}"
                },

                "Gnt.constraint.StartNoLaterThan" : {
                    name                            : "Start no later than",
                    // {0} constraint date
                    "Move the task to start at {0}" : "Move the task to start at {0}"
                },

                "Gnt.column.ConstraintDate" : {
                    text : "Constraint date"
                },

                "Gnt.column.ConstraintType" : {
                    text : "Constraint"
                },

                "Gnt.widget.ConstraintResolutionForm" : {
                    dateFormat                             : "m/d/Y",
                    "OK"                                   : 'OK',
                    "Cancel"                               : 'Cancel',
                    "Resolution options"                   : "Resolution options",
                    "Don't ask again"                      : "Don't ask again",
                    // {0} task name, {1} constraint name
                    "Task {0} violates constraint {1}"     : "Task \"{0}\" violates constraint {1}",
                    // {0} task name, {1} constraint name, {2} constraint date
                    "Task {0} violates constraint {1} {2}" : "Task \"{0}\" violates constraint {1} {2}"
                },

                "Gnt.widget.ConstraintResolutionWindow" : {
                    "Constraint violation" : "Constraint violation"
                }
            }
        });
        
        this.callParent(arguments);
    }
});
