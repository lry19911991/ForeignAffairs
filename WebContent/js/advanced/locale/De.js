Ext.define('Gnt.examples.advanced.locale.De', {
    extend    : 'Sch.locale.Locale',
    requires  : 'Gnt.locale.De',
    singleton : true,

    l10n : {
        'Gnt.examples.advanced.Application' : {
            error           : 'Error',
            requestError    : 'Request error'
        },

        'Gnt.examples.advanced.view.ControlHeader' : {
            previousTimespan        : 'Previous timespan',
            nextTimespan            : 'Next timespan',
            collapseAll             : 'Collapse all',
            expandAll               : 'Expand all',
            zoomOut                 : 'Verkleinern',
            zoomIn                  : 'Vergrößern',
            zoomToFit               : 'Zoom to fit',
            viewFullScreen          : 'Vollbildmodus',
            highlightCriticalPath   : 'Highlight critical path',
            addNewTask              : 'Add new task',
            newTask                 : 'New Task',
            removeSelectedTasks     : 'Remove selected task(s)',
            indent                  : 'Herunterstufen',
            outdent                 : 'Heraufstufen',
            manageCalendars         : 'Manage calendars',
            saveChanges             : 'Save changes',
            language                : 'Sprache: ',
            selectLanguage          : 'Sprache wählen...',
            tryMore                 : 'Try more features...'
        },

        'Gnt.examples.advanced.plugin.TaskContextMenu' : {
            changeTaskColor         : 'Change task color'
        },

        'Gnt.examples.advanced.view.GanttSecondaryToolbar' : {
            toggleChildTasksGrouping        : 'Toggle child tasks grouping on/off',
            toggleRollupTasks               : 'Toggle rollup tasks',
            highlightTasksLonger8           : 'Highlight tasks longer than 8 days',
            filterTasksWithProgressLess30   : 'Filter: Tasks with progress < 30%',
            clearFilter                     : 'Clear Filter',
            scrollToLastTask                : 'Scroll to last task'
        }
    },

    apply : function (classNames) {
        Gnt.locale.De.apply(classNames);
        this.callParent(arguments);
    }

});
