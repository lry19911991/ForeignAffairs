Ext.define('Gnt.examples.advanced.view.MainViewportModel', {
    extend  : 'Ext.app.ViewModel',
    alias   : 'viewmodel.advanced-viewport',

    data    : {
        crud                    : null,
        undoManager             : null,
        taskStore               : null,
        hasSelection            : false,
        fullscreenEnabled       : false,
        filterSet               : false,
        availableLocales        : null,
        currentLocale           : null,
        calendarManager         : null,
        hasChanges              : false,
        canUndo                 : false,
        canRedo                 : false
    }
});
