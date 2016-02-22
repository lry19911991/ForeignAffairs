/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.data.CrudManager
@extends Sch.data.CrudManager

A class implementing a central collection of all data stores related to the Gantt chart.
It allows you to load all stores in a single server request and persist all of their changes in one request as well. This
 helps you use a transactional 'all-or-nothing' approach to saving your data.
This class uses AJAX as a transport mechanism and JSON as the encoding format.

# Gantt stores

The class supports all the Gantt specific stores: resources, assignments, dependencies, calendars and tasks).
For these stores, the class has separate configs ({@link #resourceStore}, {@link #assignmentStore}, {@link #dependencyStore}, {@link #taskStore})
to register them. The class can also grab them from the task store (this behavior can be changed using {@link #addRelatedStores} config).

    var taskStore = Ext.create('Gnt.data.TaskStore', {
        calendarManager : calendarManager,
        resourceStore   : resourceStore,
        dependencyStore : dependencyStore,
        assignmentStore : assignmentStore
    });

    var crudManager = Ext.create('Gnt.data.CrudManager', {
        autoLoad        : true,
        // We specify TaskStore only. The rest stores will be taken from it.
        taskStore       : taskStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

# Loading order

The class is aware of the proper loading order for Gantt specific stores so you don't need to worry about it.
And if you provide any extra stores (using {@link #stores} config) on a construction step
they will get to the start of collection before the gantt specific stores.
So if you need to change that loading order you should use {@link #addStore} method to register your store:

    var crudManager = Ext.create('Gnt.data.CrudManager', {
        // these stores will be loaded before gantt specific stores
        stores          : [ store1, store2 ],
        taskStore       : taskStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });

    // append store3 to the end so it will be loaded last
    crudManager.addStore(store3);

    // now when we registered all the stores let's load them
    crudManager.load();

# Calendars

Additionally the CrudManager class supports bulk loading of project calendars.
To do this, the {@link #calendarManager} config has to be specified or it can be specified on a {@link Gnt.data.TaskStore#calendarManager task store}
(while having {@link #addRelatedStores} is enabled).

    var calendarManager   = Ext.create('Gnt.data.CalendarManager', {
        calendarClass   : 'Gnt.data.calendar.BusinessTime'
    });

    ...

    var taskStore     = Ext.create('MyTaskStore', {
        // taskStore calendar will automatically be set when calendarManager gets loaded
        calendarManager : calendarManager,
        resourceStore   : resourceStore,
        dependencyStore : dependencyStore,
        assignmentStore : assignmentStore
    });

    var crudManager   = Ext.create('Gnt.data.CrudManager', {
        autoLoad        : true,
        taskStore       : taskStore,
        transport       : {
            load    : {
                url     : 'php/read.php'
            },
            sync    : {
                url     : 'php/save.php'
            }
        }
    });


*/
Ext.define('Gnt.data.CrudManager', {
    extend              : 'Sch.data.CrudManager',

    /**
     * @cfg {Gnt.data.CalendarManager/Object} calendarManager A calendar manager instance or its descriptor.
     */
    calendarManager     : null,
    /**
     * @cfg {Gnt.data.TaskStore/Object} taskStore A store with tasks or its descriptor.
     */
    taskStore           : null,
    /**
     * @cfg {Gnt.data.DependencyStore/Object} dependencyStore A store with dependencies or its descriptor.
     */
    dependencyStore     : null,
    /**
     * @cfg {Gnt.data.ResourceStore/Object} resourceStore A store with resources or its descriptor.
     */
    resourceStore       : null,
    /**
     * @cfg {Gnt.data.AssignmentStore/Object} assignmentStore A store with assignments or its descriptor.
     */
    assignmentStore     : null,

    /**
     * @cfg {Boolean} addRelatedStores
     * When set to `true` this class will try to get {@link #dependencyStore}, {@link #resourceStore} and {@link #assignmentStore} from
     * the specified {@link #taskStore} instance.
     */
    addRelatedStores    : true,

    constructor : function (config) {
    	
    	console.dir(config.taskStore);
        config  = config || {};

        var calendarManager = config.calendarManager,
            taskStore       = config.taskStore,
            assignmentStore = config.assignmentStore,
            resourceStore   = config.resourceStore,
            dependencyStore = config.dependencyStore,
            // list of stores to add
            stores          = [];

        if (config.addRelatedStores !== false) {

            if (!calendarManager && taskStore) {
                calendarManager     = taskStore instanceof Ext.data.AbstractStore ? taskStore.calendarManager : taskStore.store.calendarManager;
            }

            if (!assignmentStore && taskStore) {
                assignmentStore     = taskStore instanceof Ext.data.AbstractStore ? taskStore.getAssignmentStore() : taskStore.store.getAssignmentStore();
            }

            if (!resourceStore && taskStore) {
                resourceStore       = taskStore instanceof Ext.data.AbstractStore ? taskStore.getResourceStore() : taskStore.store.getResourceStore();
            }

            if (!dependencyStore && taskStore) {
                dependencyStore     = taskStore instanceof Ext.data.AbstractStore ? taskStore.getDependencyStore() : taskStore.store.getDependencyStore();
            }
        }

        // calendars will go first in loading queue
        if (calendarManager) {
            if (calendarManager instanceof Ext.data.AbstractStore) {
                calendarManager     = { store : calendarManager, storeId : calendarManager.storeId || 'calendars', phantomIdField : 'PhantomId' };
            }

            // register calendar manager sub-stores being kept in Days field
            if (!calendarManager.stores) calendarManager.stores  = { storeId : 'Days', idProperty : 'Id' };

            // Call this early manually to be able to add listeners before calling the superclass constructor
            this.mixins.observable.constructor.call(this);

            var cm      = calendarManager.store;

            // on calendar manager "load" we set the project calendar
            cm.on({
                load    : function (store) {
                    var projectCalendar     = cm.getProjectCalendar(),
                        oldCalendarId       = projectCalendar && projectCalendar.getCalendarId(),
                        newCalendarId       = cm.metaData && cm.metaData.projectCalendar;
                    // if project calendar has changed
                    if (oldCalendarId != newCalendarId) {
                        cm.setProjectCalendar(newCalendarId);
                    }
                }
            });

            // let's ignore calendars events during data loading since we don't want tasks to get moved after stores loading
            this.on({
                beforeloadapply : function () { cm.suspendCalendarsEvents(); },
                load            : function () { cm.resumeCalendarsEvents(); }
            });

            delete config.calendarManager;
            this.calendarManager    = calendarManager;
            stores.push(calendarManager);
        }

        // then will go resources
        if (resourceStore) {
            if (resourceStore instanceof Ext.data.AbstractStore) {
                resourceStore   = { store : resourceStore, storeId : resourceStore.storeId || 'resources' };
            }

            delete config.resourceStore;
            this.resourceStore  = resourceStore;
            stores.push(resourceStore);
        }
        // ...
        if (assignmentStore) {
            if (assignmentStore instanceof Ext.data.AbstractStore) {
                assignmentStore     = { store : assignmentStore, storeId : assignmentStore.storeId || 'assignments' };
            }

            delete config.assignmentStore;
            this.assignmentStore    = assignmentStore;
            stores.push(assignmentStore);
        }
        // ...
        if (dependencyStore) {
            if (dependencyStore instanceof Ext.data.AbstractStore) {
                dependencyStore     = { store : dependencyStore, storeId : dependencyStore.storeId || 'dependencies' };
            }

            delete config.dependencyStore;
            this.dependencyStore    = dependencyStore;
            stores.push(dependencyStore);
        }
        // and tasks we set as last in the loading queue
        if (taskStore) {
            if (taskStore instanceof Ext.data.AbstractStore) {
                taskStore   = { store : taskStore, storeId : taskStore.storeId || 'tasks', phantomIdField : 'PhantomId' };
            }

            delete config.taskStore;
            this.taskStore    = taskStore;
            stores.push(taskStore);
        }

        // all the Gantt related stores will go after the user defined stores from the config.stores
        if (stores.length) {
            var syncSequence   = [];
            if (this.calendarManager) syncSequence.push(this.calendarManager);
            if (resourceStore) syncSequence.push(this.resourceStore);
            if (taskStore) syncSequence.push(this.taskStore);
            if (assignmentStore) syncSequence.push(this.assignmentStore);
            if (dependencyStore) syncSequence.push(this.dependencyStore);

            if (syncSequence.length) {
                config.syncApplySequence    = (config.syncApplySequence || config.stores || []).concat(syncSequence);
            }

            config.stores = (config.stores || []).concat(stores);
        }


        this.callParent([ config ]);
    },

    /**
     * Returns the calendar manager bound to the crud manager.
     * @return {Gnt.data.CalendarManager} The calendar manager bound to the crud manager.
     */
    getCalendarManager : function () {
        return this.calendarManager && this.calendarManager.store;
    },

    /**
     * Returns the resource store bound to the crud manager.
     * @return {Gnt.data.ResourceStore} The resource store bound to the crud manager.
     */
    getResourceStore : function () {
        return this.resourceStore && this.resourceStore.store;
    },

    /**
     * Returns the dependency store bound to the crud manager.
     * @return {Gnt.data.DependencyStore} The dependency store bound to the crud manager.
     */
    getDependencyStore : function () {
        return this.dependencyStore && this.dependencyStore.store;
    },

    /**
     * Returns the assignment store bound to the crud manager.
     * @return {Gnt.data.AssignmentStore} The assignment store bound to the crud manager.
     */
    getAssignmentStore : function () {
        return this.assignmentStore && this.assignmentStore.store;
    },

    /**
     * Returns the task store bound to the crud manager.
     * @return {Gnt.data.TaskStore} The task store bound to the crud manager.
     */
    getTaskStore : function () {
    	console.dir(this.taskStore);
        return this.taskStore && this.taskStore.store;
    },


    prepareUpdated : function (list, stores) {
        if (list[0] instanceof Gnt.model.Task) {
            // Root should not be updated since the gantt doesn't modify this (though Ext JS might)
            list = Ext.Array.filter(list, function(node) { return !node.isRoot(); });

            var result  = this.callParent([list, stores]);

            // if resetIdsBeforeSync mode is enabled and we deal with tasks
            // we need to reset ids for tasks segments as well
            if (this.resetIdsBeforeSync) {
                var segmentsField   = list[0].segmentsField,
                    proto           = Ext.ClassManager.get(list[0].segmentClassName).prototype,
                    idProperty      = proto.idProperty,
                    phantomIdField  = proto.phantomIdField;

                for (var i = 0; i < result.length; i++) {
                    var segmentsData    = result[i][segmentsField];
                    if (segmentsData) {
                        for (var j = 0; j < segmentsData.length; j++) {
                            var segment = segmentsData[j];
                            if (segment[phantomIdField]) delete segment[idProperty];
                        }
                    }
                }
            }

            return result;
        }

        return this.callParent([list, stores]);
    },

    prepareAdded : function (list) {
        var result  = this.callParent(arguments);

        // if resetIdsBeforeSync mode is enabled and we deal with tasks
        // we need to reset ids for tasks segments as well
        if (this.resetIdsBeforeSync && list[0] instanceof Gnt.model.Task) {
            var segmentsField   = list[0].segmentsField,
                idProperty      = Ext.ClassManager.get(list[0].segmentClassName).prototype.idProperty;

            for (var i = 0; i < result.length; i++) {
                var segmentsData    = result[i][segmentsField];
                if (segmentsData) {
                    for (var j = 0; j < segmentsData.length; j++) {
                        delete segmentsData[j][idProperty];
                    }
                }
            }
        }

        return result;
    },

    applyChangesToTask : function (record, changes) {
        // apply changes to segments
        if (changes.hasOwnProperty(record.segmentsField)) {

            var segments        = record.getSegments(),
                segmentsField   = record.segmentsField,
                phantomIdField  = segments && segments[0].phantomIdField,
                idProperty      = segments && segments[0].idProperty,
                segmentsChanges = changes[segmentsField];

            // loop over transferred segments if any
            if (segmentsChanges && segmentsChanges.length) {

                for (var i = segmentsChanges.length - 1; i >= 0; i--) {
                    // get transferred segment change
                    var segmentChange   = segmentsChanges[i],
                        phantomId       = segmentChange[phantomIdField],
                        id              = segmentChange[idProperty],
                        segment         = null;

                    // let's find corresponding segment to update
                    for (var j = 0; j < segments.length; j++) {
                        segment     = segments[j];

                        // we detect it using either phantom or real id
                        if ((segment.get(phantomIdField) == phantomId) || (segment.getId() == id)) {
                            // let's apply transferred changes to found segment
                            this.applyChangesToRecord(segment, segmentChange);
                            break;
                        }
                    }
                }

                // need to get rid of "Segments" field since we already loaded segments changes
                // (otherwise the task will do a simple setSegments() call)
                delete changes[segmentsField];
            }
        }
    },

    applyChangesToRecord : function (record, changes, stores) {
        // if we deal with a task let's call special applyChangesToTask method before
        // it will apply changes to the task segments (if they passed)
        if (record instanceof Gnt.model.Task) {
            this.ignoreUpdates++;

            this.applyChangesToTask.apply(this, arguments);

            this.ignoreUpdates--;
        }

        this.callParent(arguments);
    }

});
