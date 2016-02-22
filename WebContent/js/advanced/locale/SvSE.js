Ext.define('Gnt.examples.advanced.locale.SvSE', {
    extend    : 'Sch.locale.Locale',
    requires  : 'Gnt.locale.SvSE',
    singleton : true,

    l10n : {
        'Gnt.examples.advanced.Application' : {
            error           : 'Error',
            requestError    : 'Request error'
        },

        'Gnt.examples.advanced.view.ControlHeader' : {
            previousTimespan        : 'Föregående period',
            nextTimespan            : 'Nästa period',
            collapseAll             : 'Fäll ihop alla',
            expandAll               : 'Expandera alla',
            zoomOut                 : 'Zooma ut',
            zoomIn                  : 'Zooma in',
            zoomToFit               : 'Zooma för att passa',
            viewFullScreen          : 'Full skärm',
            highlightCriticalPath   : 'Visa kritisk linje',
            addNewTask              : 'Lägg till uppgift',
            newTask                 : 'Ny uppgift',
            removeSelectedTasks     : 'Ta bort valda uppgifter',
            indent                  : 'Indrag',
            outdent                 : 'Minska indrag',
            manageCalendars         : 'Hantera kalendrar',
            saveChanges             : 'Spara ändringar',
            language                : 'Språk: ',
            selectLanguage          : 'Välj språk...',
            tryMore                 : 'Prova mer funktioner...'
        },

        'Gnt.examples.advanced.plugin.TaskContextMenu' : {
            changeTaskColor         : 'Ändra färg'
        },

        'Gnt.examples.advanced.view.GanttSecondaryToolbar' : {
            toggleChildTasksGrouping        : 'Växla uppgiftsgruppering',
            toggleRollupTasks               : 'Växla summeringsuppgifter',
            highlightTasksLonger8           : 'Markera uppgifter längre än 8 dagar',
            filterTasksWithProgressLess30   : 'Filter: Uppgifter som är mindre än < 30% klara',
            clearFilter                     : 'Ta bort filter',
            scrollToLastTask                : 'Scrolla till sista uppgiften'
        }
    },

    apply : function (classNames) {
        Gnt.locale.SvSE.apply(classNames);
        this.callParent(arguments);
    }

});
