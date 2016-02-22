Ext.define('Gnt.examples.advanced.store.Tasks', {
    extend          : 'Gnt.data.TaskStore',

    requires        : ['Gnt.examples.advanced.model.Project'],

    storeId         : 'Tasks',

    storeIdProperty : 'crudStoreId',
    crudStoreId     : 'tasks',
    alias           : 'store.advanced-task-store',
    model           : 'Gnt.examples.advanced.model.Task',

    calendarManager : 'Calendars'
});
