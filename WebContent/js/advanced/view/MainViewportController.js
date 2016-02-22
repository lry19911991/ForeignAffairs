Ext.define('Gnt.examples.advanced.view.MainViewportController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.advanced-viewport',

    requires : ['Gnt.widget.calendar.CalendarManagerWindow'],

    control : {
        '#'                             : { afterrender : 'onAfterRender' },
        '[reference=shiftPrevious]'     : { click : 'onShiftPrevious' },
        '[reference=shiftNext]'         : { click : 'onShiftNext' },
        '[reference=collapseAll]'       : { click : 'onCollapseAll' },
        '[reference=expandAll]'         : { click : 'onExpandAll' },
        '[reference=zoomOut]'           : { click : 'onZoomOut' },
        '[reference=zoomIn]'            : { click : 'onZoomIn' },
        '[reference=zoomToFit]'         : { click : 'onZoomToFit' },
        '[reference=viewFullScreen]'    : { click : 'onFullScreen' },
        '[reference=criticalPath]'      : { click : 'onHighlightCriticalPath' },
        '[reference=addTask]'           : { click : 'onAddTask' },
        '[reference=removeSelected]'    : { click : 'onRemoveSelectedTasks' },
        '[reference=indentTask]'        : { click : 'onIndent' },
        '[reference=outdentTask]'       : { click : 'onOutdent' },
        '[reference=manageCalendars]'   : { click : 'onManageCalendars' },
        '[reference=saveChanges]'       : { click : 'onSaveChanges' },
        '[reference=toggleGrouping]'    : { click : 'onToggleGrouping' },
        '[reference=toggleRollup]'      : { click : 'onToggleRollup' },
        '[reference=highlightLong]'     : { click : 'onHighlightLongTasks' },
        '[reference=filterTasks]'       : { click : 'onFilterTasks' },
        '[reference=clearTasksFilter]'  : { click : 'onClearTasksFilter' },
        '[reference=scrollToLast]'      : { click : 'onScrollToLast' },
        '[reference=tryMore]'           : { click : 'onTryMore' },
        'combo[reference=langSelector]' : { select : 'onLanguageSelected' }
    },

    getGantt : function () {
        return this.getView().lookupReference('gantt');
    },

    onShiftPrevious : function () {
        this.getGantt().shiftPrevious();
    },

    onShiftNext : function () {
        this.getGantt().shiftNext();
    },

    onCollapseAll : function () {
        this.getGantt().collapseAll();
    },

    onExpandAll : function () {
        this.getGantt().expandAll();
    },

    onZoomOut : function () {
        this.getGantt().zoomOut();
    },

    onZoomIn : function () {
        this.getGantt().zoomIn();
    },

    onZoomToFit : function () {
        this.getGantt().zoomToFit(null, { leftMargin : 100, rightMargin : 100 });
    },

    onFullScreen : function () {
        this.getGantt().getEl().down('.x-panel-body').dom[this.getFullscreenFn()](Element.ALLOW_KEYBOARD_INPUT);
    },

    // Experimental, not X-browser
    getFullscreenFn : function () {
        var docElm = document.documentElement,
            fn;

        if (docElm.requestFullscreen) {
            fn = "requestFullscreen";
        }
        else if (docElm.mozRequestFullScreen) {
            fn = "mozRequestFullScreen";
        }
        else if (docElm.webkitRequestFullScreen) {
            fn = "webkitRequestFullScreen";
        }
        else if (docElm.msRequestFullscreen) {
            fn = "msRequestFullscreen";
        }

        return fn;
    },

    onHighlightCriticalPath : function (btn) {
        var v = this.getGantt().getSchedulingView();

        btn.pressed = !btn.pressed;

        if (btn.pressed) {
            v.highlightCriticalPaths(true);
        } else {
            v.unhighlightCriticalPaths(true);
        }
    },

    onAddTask : function () {
        var gantt        = this.getGantt(),
            viewModel    = this.getViewModel(),
            selectedTask = viewModel.get('selectedTask'),
            node         = selectedTask.isLeaf() ? selectedTask.parentNode : selectedTask;

        var record = node.appendChild({
            Name : 'New Task',
            leaf : true
        });

        gantt.getSchedulingView().scrollEventIntoView(record);
        gantt.getSelectionModel().select(record);
        gantt.lockedGrid.getPlugin('editingInterface').startEdit(record, 1);
    },

    onRemoveSelectedTasks : function () {
        var selected = this.getGantt().getSelection();

        Ext.Array.forEach([].concat(selected), function (task) {
            task.remove();
        });
    },

    onIndent : function () {
        var gantt = this.getGantt();

        gantt.getTaskStore().indent([].concat(gantt.getSelection()));
    },

    onOutdent : function () {
        var gantt = this.getGantt();

        gantt.getTaskStore().outdent([].concat(gantt.getSelection()));
    },

    onSaveChanges : function () {
        this.getGantt().crudManager.sync();
    },

    onLanguageSelected : function (field, record) {
        this.fireEvent('locale-change', record.get('id'), record);
    },

    onToggleGrouping : function () {
        var taPlugin = this.getGantt().getPlugin('taskarea');
        taPlugin.setEnabled(!taPlugin.getEnabled());
    },

    onToggleRollup : function () {
        var gantt = this.getGantt();
        gantt.setShowRollupTasks(!gantt.showRollupTasks);
    },

    onHighlightLongTasks : function () {
        var gantt = this.getGantt();

        gantt.taskStore.queryBy(function (task) {
            if (task.data.leaf && task.getDuration() > 8) {
                var el = gantt.getSchedulingView().getElementFromEventRecord(task);
                el && el.frame('lime');
            }
        });
    },

    onFilterTasks : function () {
        this.getGantt().taskStore.filterTreeBy(function (task) {
            return task.getPercentDone() <= 30;
        });
    },

    onClearTasksFilter : function () {
        this.getGantt().taskStore.clearTreeFilter();
    },

    onScrollToLast : function () {
        var latestEndDate = new Date(0),
            gantt         = this.getGantt(),
            latest;

        gantt.taskStore.getRoot().cascadeBy(function (task) {
            if (task.get('EndDate') >= latestEndDate) {
                latestEndDate = task.get('EndDate');
                latest        = task;
            }
        });
        gantt.getSchedulingView().scrollEventIntoView(latest, true);
    },

    onAfterRender : function () {
        var me        = this,
            viewModel = me.getViewModel(),
            taskStore = viewModel.get('taskStore');

        viewModel.set('fullscreenEnabled', !!this.getFullscreenFn());

        me.mon(taskStore, 'filter-set', function () {
            viewModel.set('filterSet', true);
        });
        me.mon(taskStore, 'filter-clear', function () {
            viewModel.set('filterSet', false);
        });
    },

    onManageCalendars : function () {
        var gantt = this.getGantt();

        this.calendarsWindow = new Gnt.widget.calendar.CalendarManagerWindow({
            calendarManager : gantt.getTaskStore().calendarManager,
            maximized       : true,
            modal           : true
        });

        this.calendarsWindow.show();
    },

    onTryMore : function() {
        var tbar = this.getView().down('gantt-secondary-toolbar');

        tbar.setVisible(!tbar.isVisible());
    }
});
