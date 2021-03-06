Ext.define('GanttApp.GanttPanel', {
    extend : 'Gnt.panel.Gantt',
    xtype  : 'advanced-gantt',

    requires : [
        'Ext.form.field.Text',
        'Sch.plugin.TreeCellEditing',
        'Sch.plugin.Pan',
        'Gnt.plugin.TaskEditor',
        'Gnt.column.Sequence',
        'Gnt.column.Name',
        'Gnt.column.StartDate',
        'Gnt.column.EndDate',
        'Gnt.column.Duration',
        'Gnt.column.ConstraintType',
        'Gnt.column.ConstraintDate',
        'Gnt.column.PercentDone',
        'Gnt.column.Predecessor',
        'Gnt.column.AddNew',
        // @cut-if-gantt->
        // <-@
        'GanttApp.TaskArea',
        'GanttApp.TaskContextMenu',
        'GanttApp.Filter'
    ],

    showTodayLine           : true,
    loadMask                : true,
    enableProgressBarResize : true,
    showRollupTasks         : true,
    eventBorderWidth        : 0,
    rowHeight               : 32,
    viewPreset              : 'weekAndDayLetter',

    projectLinesConfig : {
        // Configure the gantt to mark project start dates w/ lines.
        // Options are:
        // 'start' - to show lines for start dates,
        // 'end' - to show lines for end dates,
        // 'both' - to show lines for both start and end dates.
        linesFor : 'start'
    },

    allowDeselect : true,

    selModel : {
        ignoreRightMouseSelection : false,
        mode                      : 'MULTI'
    },

    // Define properties for the left 'locked' and scrollable tree grid
    lockedGridConfig : {
        width : 400,
        bind  : {
            selection : '{selectedTask}'
        }
    },

    // Define properties for the left 'locked' and scrollable tree view
    lockedViewConfig : {
        // Adds a CSS class returned to each row element
        getRowClass : function (rec) {
            return rec.isRoot() ? 'root-row' : '';
        }
    },

    // Define a custom HTML template for regular tasks
    taskBodyTemplate : '<div class="sch-gantt-progress-bar" style="width:{progressBarWidth}px;{progressBarStyle}" unselectable="on">' +
    '<span class="sch-gantt-progress-bar-label">{[Math.round(values.percentDone)]}%</span>' +
    '</div>',

    // Define an HTML template for the tooltip
    tooltipTpl : '<strong class="tipHeader">{Name}</strong>' +
    '<table class="taskTip">' +
    '<tr><td>Start:</td> <td align="right">{[values._record.getDisplayStartDate("y-m-d")]}</td></tr>' +
    '<tr><td>End:</td> <td align="right">{[values._record.getDisplayEndDate("y-m-d")]}</td></tr>' +
    '<tr><td>Progress:</td><td align="right">{[ Math.round(values.PercentDone)]}%</td></tr>' +
    '</table>',

    // Define what should be shown in the left label field, along with the type of editor
    leftLabelField : {
        dataIndex : 'Name',
        editor    : { xtype : 'textfield' }
    },

    plugins : [
        'advanced_taskcontextmenu',
        'scheduler_pan',
        'gantt_taskeditor',
        'gantt_projecteditor',
        {
            pluginId : 'taskarea',
            ptype    : 'taskarea'
        },
        {
            ptype        : 'scheduler_treecellediting',
            clicksToEdit : 2,
            pluginId     : 'editingInterface'
        }
    ],

    // Define the static columns
    // Any regular Ext JS columns are ok too
    columns : [
        {
            xtype : 'sequencecolumn',
            width : 40,
            // This CSS class is added to each cell of this column
            tdCls : 'id'
        },
        {
            xtype : 'namecolumn',
            width : 200,
            items : {
                xtype : 'gantt-filter-field'
            }
        },
        {
            xtype : 'startdatecolumn'
        },
        {
            xtype : 'enddatecolumn'
        },
        {
            xtype : 'durationcolumn'
        },
        {
            xtype : 'constrainttypecolumn'
        },
        {
            xtype : 'constraintdatecolumn'
        },
        {
            xtype : 'percentdonecolumn',
            width : 100
        },
        {
            xtype             : 'predecessorcolumn',
            useSequenceNumber : true
        },
        {
            xtype : 'addnewcolumn'
        }
    ],

    eventRenderer : function (task, tplData) {
        var style,
            segments, i,
            result;

        if (task.get('Color')) {
            style = Ext.String.format('background-color: #{0};border-color:#{0}', task.get('Color'));

            if (!tplData.segments) {
                result = {
                    // Here you can add custom per-task styles
                    style : style
                };
            }
            // if task is segmented we cannot use above code
            // since it will set color of background visible between segments
            // in this case instead we need to provide "style" for each individual segment
            else {
                segments = tplData.segments;
                for (i = 0; i < segments.length; i++) {
                    segments[i].style = style;
                }
            }
        }

        return result;
    }
});
