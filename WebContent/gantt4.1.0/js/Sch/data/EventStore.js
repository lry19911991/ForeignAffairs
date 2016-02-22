/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Sch.data.EventStore
@mixins Sch.data.mixin.EventStore

This is a class holding all the {@link Sch.model.Event events} to be rendered into a {@link Sch.SchedulerPanel scheduler panel}.

*/
Ext.define("Sch.data.EventStore", {
    extend      : 'Ext.data.Store',
    alias       : 'store.eventstore',

    mixins      : [
        'Sch.data.mixin.UniversalModelGetter',
        'Sch.data.mixin.CacheHintHelper',
        'Sch.data.mixin.EventStore',
        'Sch.data.undoredo.mixin.StoreHint'
    ],

    storeId     : 'events',
    model       : 'Sch.model.Event',
    config      : { model : 'Sch.model.Event' },

    constructor : function(config) {
        var me = this;

        me.callParent([config]);

        me.resourceStore   && me.setResourceStore(me.resourceStore);
        me.assignmentStore && me.setAssignmentStore(me.assignmentStore);

        if (me.getModel() !== Sch.model.Event && !(me.getModel().prototype instanceof Sch.model.Event)) {
            throw 'The model for the EventStore must subclass Sch.model.Event';
        }
    },

    /**
     * Appends a new record to the store
     * @param {Sch.model.Event} record The record to append to the store
     */
    append : function(record) {
        this.add(record);
    }
});
