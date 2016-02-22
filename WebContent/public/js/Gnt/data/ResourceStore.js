/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.data.ResourceStore
@extends Sch.data.ResourceStore

A class representing the collection of the resources - {@link Gnt.model.Resource} records.

*/

Ext.define('Gnt.data.ResourceStore', {

    requires    : [
        'Gnt.model.Resource'
    ],

    extend      : 'Sch.data.ResourceStore',


    model       : 'Gnt.model.Resource',
    alias       : 'store.gantt_resourcestore',


    /**
     * @property {Gnt.data.TaskStore} taskStore The task store to which this resource store is associated.
     * Usually is configured automatically, by the task store itself.
     */
    taskStore   : null,

    proxy       : 'memory',

    constructor : function (config) {

        this.callParent([config]);

        this.on({
            load            : this.normalizeResources,
            remove          : this.onResourceRemoved,
            write           : this.onResourceStoreWrite,

            // Our internal listeners should be ran before any client listeners
            priority        : 100
        });
    },


    normalizeResources : function () {
        // scan through all resources and re-assign the "calendarId" property to get the listeners in place
        this.each(function (resource) {
            if (!resource.normalized) {
                var calendarId      = resource.getCalendarId();

                if (calendarId) resource.setCalendarId(calendarId, true);

                resource.normalized     = true;
            }
        });
    },

    // Performance optimization possibility: Assignment store datachange will cause a full refresh
    // so removing a resource will currently cause 2 refreshes. Not critical since this is not a very common use case
    onResourceRemoved : function(store, resources) {
        var assignmentStore = this.getAssignmentStore();

        Ext.Array.each(resources, function(resource) {
            assignmentStore.removeAssignmentsForResource(resource);
        });
    },

    /**
     * Returns the associated task store instance.
     *
     * @return {Gnt.data.TaskStore}
     */
    getTaskStore: function(){
        return this.taskStore || null;
    },


    /**
     * Returns the associated assignment store instance.
     *
     * @return {Gnt.data.AssignmentStore}
     */
    getAssignmentStore: function(){
        return this.assignmentStore = (this.assignmentStore || this.getTaskStore().getAssignmentStore());
    },


    getByInternalId : function (id) {
        return this.data.getByKey(id) || this.getById(id);
    },

    onResourceStoreWrite : function(store, operation) {
        if (operation.action !== 'create') {
            return;
        }

        var records = operation.getRecords(),
            newAssignments = this.getAssignmentStore().getNewRecords(),
            resourceId;

        Ext.each(records, function(resource) {
            resourceId = resource.getId();

            if (!resource.phantom && resourceId !== resource._phantomId) {

                // Iterate all assignments to see if they should be updated with a 'real' task id
                Ext.each(newAssignments, function (as) {
                    var asResourceId = as.getResourceId();

                    if (asResourceId === resource._phantomId) {
                        as.setResourceId(resourceId);
                    }
                });

                delete resource._phantomId;
            }
        });
    }
});
