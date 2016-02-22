/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Sch.data.ResourceStore
@mixin Sch.data.mixin.ResourceStore

This is a class holding the collection the {@link Sch.model.Resource resources} to be rendered into a {@link Sch.panel.SchedulerGrid scheduler panel}.
It is a subclass of {@link Ext.data.Store} - a store with linear data presentation.

*/
Ext.define("Sch.data.ResourceStore", {
    extend      : 'Ext.data.Store',
    model       : 'Sch.model.Resource',
    config      : { model : 'Sch.model.Resource' },
    alias       : 'store.resourcestore',

    requires    : [
        'Sch.patches.OperationDestroy'
    ],

    mixins      : [
        'Sch.data.mixin.UniversalModelGetter',
        'Sch.data.mixin.CacheHintHelper',
        'Sch.data.mixin.ResourceStore',
        'Sch.data.undoredo.mixin.StoreHint'
    ],

    storeId     : 'resources',

    constructor : function() {
        this.callParent(arguments);

        if (this.getModel() !== Sch.model.Resource && !(this.getModel().prototype instanceof Sch.model.Resource)) {
            throw 'The model for the ResourceStore must subclass Sch.model.Resource';
        }
    }
});
