Ext.define('Gnt.examples.advanced.view.MainViewportModel', {
    extend  : 'Ext.app.ViewModel',
    alias   : 'viewmodel.advanced-viewport',

    data    : {
        gantt                   : null,
        crud                    : null,
        taskStore               : null,
        selectedTask            : null,
        fullscreenEnabled       : false,
        filterSet               : false,
        availableLocales        : null,
        currentLocale           : null,
        calendarManager         : null,
        hasChanges              : false
    }

});
