/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.data.CalendarManager
@extends Ext.data.TreeStore

Class implements a central storage of all project calendars. Technically it's a collection of {@link Gnt.model.Calendar} records.

    var calendarManager = Ext.create('Gnt.data.CalendarManager');

Each record in the store, except the root node, is automatically gets linked to its {@link Gnt.data.Calendar calendar instance}
which can be retrieved by {@link #getCalendar} method.

    // gets calendar instance having calendar Id equal to 'general'
    var calendar = calendarManager.getCalendar('general');

    // and here we do the same using {@link Gnt.model.Calendar} {@link Gnt.model.Calendar#getCalendar getCalendar} method.
    calendar = calendarManager.getById('general').getCalendar();

Please note that root node does not correspond to the project calendar (main calendar of the task store).
Any node can be the project calendar. See {@link #setProjectCalendar} for details.

Automatic calendar building
===========================

When you add a new record to the store a new calendar is automatically gets created:

    var calendarManager = Ext.create('Gnt.data.CalendarManager');

    // append new record to the calendar manager
    var record = calendarManager.getRootNode().appendChild({
        leaf                : true,
        Name                : 'General II',
        DaysPerMonth        : 30,
        DaysPerWeek         : 7,
        HoursPerDay         : 24,
        WeekendsAreWorkdays : true,
        WeekendFirstDay     : 6,
        WeekendSecondDay    : 0,
        DefaultAvailability : [ '00:00-24:00' ]
    });

    // get newly created calendar to calendar2 variable
    var calendar2 = record.getCalendar();

Calendar class customizing
==========================

Class that should be used to instantiating a calendar can be customized by {@link #calendarClass} config:

    var calendarManager = Ext.create('Gnt.data.CalendarManager', {
        // by default we will create BusinessTime calendars
        calendarClass   : 'Gnt.data.calendar.BusinessTime'
    });

Calendars loading
=================

Main thing about this class is its ability to work together with {@link Gnt.data.CrudManager} class to load project calendars by batch along with all other stores:

    var calendarManager = Ext.create('Gnt.data.CalendarManager');

    var taskStore = Ext.create('Gnt.data.TaskStore', {
        // taskStore calendar will automatically be set when calendarManager gets loaded
        calendarManager : calendarManager,
        resourceStore   : resourceStore,
        dependencyStore : dependencyStore,
        assignmentStore : assignmentStore
    });

    var crudManager = Ext.create('Gnt.data.CrudManager', {
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
Ext.define('Gnt.data.CalendarManager', {

    extend              : 'Ext.data.TreeStore',

    requires            : ['Gnt.data.Calendar'],

    model               : 'Gnt.model.Calendar',

    alias               : 'store.calendarmanager',

    /**
     * @cfg {String} calendarClass
     * The name of a class that will be used to create calendar instances.
     * If {@link Gnt.model.Calendar.calendarClass calendarClass} field is specified on a {@link Gnt.model.Calendar record} then it will be used instead.
     */
    calendarClass       : 'Gnt.data.Calendar',

    /**
     * @cfg {Object} calendarConfig An object to be applied to the newly created instance of the {@link Gnt.widget.calendar.Calendar}.
     */
    calendarConfig      : null,

    projectCalendar     : null,

    myListeners         : null,

    constructor : function (config) {
        config  = config || {};

        if (!config.proxy) config.proxy = { type : 'memory' };

        this.callParent([ config ]);

        this.myListeners = this.on({
            idchanged   : this.onChangeId,
            rootchange      : this.onNewRoot,
            nodeappend      : this.onNewNode,
            nodeinsert      : this.onNewNode,
            noderemove      : this.onRemoveNode,

            destroyable     : true,
            scope       : this
        });

        var root = this.getRootNode();

        if (root) {
            this.bindCalendars(root);
        } else {
            this.setRoot({ expanded : true });
        }

    },


    destroy : function () {
        this.myListeners.destroy();
        this.callParent(arguments);
    },


    onChangeId : function (node, oldId, newId, oldInternalId) {
        if (!(node instanceof Gnt.model.Calendar)) return;

        var calendar    = this.getCalendar(oldId || oldInternalId);

        calendar.setCalendarId(newId);
    },


    // @override
    // TODO get rid of this if ext5 will restore support of 'idchanged' event
    onIdChanged: function(node, oldId, newId) {
        this.onChangeId(node, oldId, newId);
        return this.callParent(arguments);
    },


    onNewNode : function (parent, node) {
        // create/bind calendar for the new node (and for the each of its child)
        this.bindCalendars(node);

        node.set && node.set('iconCls', 'gnt-date');

        var me  = this;

        node.cascadeBy(function (node) { node.setCalendarManager(me); });
    },

    onNewRoot : function(root){
        this.onNewNode(null, root);
    },

    onRemoveNode : function (parent, node, isMove) {
        if (!isMove) {
            var calendar    = node.calendar;

            if (calendar) {
                this.unbindCalendarEvents(calendar);

                // if we're not in the middle of calendar manager loading
                // let's destroy the calendar instance
                if (!this.__loading) {
                    calendar.destroy();

                    Ext.data.StoreManager.unregister(calendar);
                }

                node.setCalendarManager(null);
            }
        }
    },


    suspendCalendarsEvents : function (queueSuspended) {
        this.getRootNode().cascadeBy(function (node) {
            var c   = node.getCalendar();
            if (c) c.suspendEvents(queueSuspended);
        }, this);
    },


    resumeCalendarsEvents : function () {
        this.getRootNode().cascadeBy(function (node) {
            var c   = node.getCalendar();
            if (c) c.resumeEvents();
        }, this);
    },


    /**
     * Returns the project calendar.
     * @return {Gnt.data.Calendar} The project calendar.
     */
    getProjectCalendar : function () {
        return this.projectCalendar;
    },


    /**
     * Sets the project calendar.
     * @param {Gnt.data.Calendar/String} calendar The project calendar or its identifier.
     */
    setProjectCalendar : function (calendar) {
        if (typeof calendar !== 'object') {
            calendar    = this.getCalendar(calendar) || Gnt.data.Calendar.getCalendar(calendar);
        }

        if (!calendar) return;

        this.projectCalendar    = calendar;

        /**
         * @event projectcalendarset
         * Fires after {@link #setProjectCalendar} completion.
         * @param {Gnt.data.CalendarManager} calendarManager The calendar manager.
         * @param {Gnt.data.Calendar} calendar The calendar that was set as a project calendar.
         */
        this.fireEvent('projectcalendarset', this, calendar);
    },


    /**
     * Returns the calendar instance by specified identifier.
     * @param {String} calendarId Calendar identified.
     * @return {Gnt.data.Calendar}
     */
    getCalendar : function (calendarId) {
        var record  = this.getNodeById(calendarId);

        return record && record.getCalendar();
    },


    bindCalendarEvents : function (calendar) {
        /**
         * @event calendarload
         * Fires after a calendar instance was loaded.
         * @param {Gnt.data.Calendar} calendar Calendar that was loaded.
         * @param {Gnt.model.CalendarDay[]} days An array of records
         * @param {Boolean} successful True if the operation was successful.
         * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
         */
        this.relayEvents(calendar, ['load'], 'calendar');
        /**
         * @event dayadd
         * Fired when a {@link Gnt.model.CalendarDay} instance has been added to a calendar.
         * @param {Gnt.data.Calendar} calendar Calendar that got new record.
         * @param {Gnt.model.CalendarDay[]} days The days that were added.
         * @param {Number} index The index at which the instances were inserted
         * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
         */
        /**
         * @event dayupdate
         * Fired when a {@link Gnt.model.CalendarDay} instance has been updated.
         * @param {Gnt.data.Calendar} calendar Calendar that holds the modified record.
         * @param {Gnt.model.CalendarDay} day The day record that was added.
         * @param {String} operation The update operation being performed. Value may be one of:
         *
         *  - `Ext.data.Model.EDIT`
         *  - `Ext.data.Model.REJECT`
         *  - `Ext.data.Model.COMMIT`
         * @param {String[]} modifiedFieldNames Array of field names changed during edit.
         * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
         */
        /**
         * @event dayremove
         * Fired when a {@link Gnt.model.CalendarDay} instance has been removed from a calendar.
         *
         * **If many days may be removed in one go, then it is more efficient to listen for the {@link #event-daybulkremove} event
         * and perform any processing for a bulk remove than to listen for this {@link #event-dayremove} event.**
         * @param {Gnt.data.Calendar} calendar The calendar object.
         * @param {Gnt.model.CalendarDay} day The day record that was removed.
         * @param {Number} index The index of the day record that was removed.
         */
        /**
         * @event daybulkremove
         * Fired at the *end* of the {@link Gnt.data.Calendar#method-remove remove} method when all days in the passed array have been removed.
         *
         * If many records may be removed in one go, then it is more efficient to listen for this event
         * and perform any processing for a bulk remove than to listen for many {@link #event-dayremove} events.
         * @param {Gnt.data.Calendar} calendar The calendar object.
         * @param {Gnt.model.CalendarDay[]} days The array of days that were removed (In the order they appear in the calendar).
         * @param {Number[]} indexes The indexes of the days that were removed.
         */
        this.relayEvents(calendar, ['add', 'update', 'remove', 'bulkremove'], 'day');
        /**
         * @event calendarchange
         * Fired after calendar data has been changed (like day add, edit, remove).
         * @param {Gnt.data.Calendar} calendar The calendar object.
         */
        this.relayEvents(calendar, ['calendarchange']);

        calendar.on({
            add     : this.onDayAdd,
            update  : this.onDayUpdate,
            remove  : this.onDayRemove,

            scope   : this
        });
    },


    unbindCalendarEvents : function (calendar) {
        calendar && calendar.un({
            add     : this.onDayAdd,
            update  : this.onDayUpdate,
            remove  : this.onDayRemove,

            scope   : this
        });
    },


    onDayAdd : function (store, record) {
        this.getNodeById(store.getCalendarId()).dirty = true;
    },


    onDayUpdate : function (store, record) {
        this.getNodeById(store.getCalendarId()).dirty = true;
    },


    onDayRemove : function (store, record) {
        this.getNodeById(store.getCalendarId()).dirty = true;
    },


    bindCalendar : function (record) {
        if (!record || this.getRoot() === record) return;

        var calendar    = record.getCalendar();
        var days        = record.getDays();
        var id          = record.getId() || record.internalId;
        days            = Ext.isArray(days) && days;

        // if no calendar specified on the record or provided array of days to build new calendar
        if (!calendar || days) {

            if (!calendar) {
                // let's try to get calendar by record identifier
                calendar    = this.getCalendar(id);
                // if this calendar is already bound to calendar manager
                if (calendar) {
                    // let's set link to it from the record
                    record.setCalendar(calendar);
                    return;
                }

                // last try to find calendar by record Id
                calendar    = Gnt.data.Calendar.getCalendar(id);
            }

            // if we don't have the calendar registered yet
            if (!calendar) {

                // get parent calendar
                var parent          = record.parentNode && record.parentNode.getCalendar();

                var calendarClass   = Ext.ClassManager.get(record.getCalendarClass() || this.calendarClass);

                var calendarConfig  = Ext.applyIf(record.getCalendarConfig(), {
                    data            : days,
                    parent          : parent
                });

                // create calendar instance
                calendar    = Ext.create(calendarClass, Ext.apply(calendarConfig, this.calendarConfig));
            }

            record.setCalendar(calendar);

            this.bindCalendarEvents(calendar);

        // if calendar specified on the record but not registered in the calendar manager
        } else if (!this.getCalendar(calendar.calendarId)) {
            // bind calendar manager listeners to it
            this.bindCalendarEvents(calendar);
        }

        /**
         * @event calendarbound
         * Fires after a calendar instance has been assigned to a record.
         * @param {Gnt.data.CalendarManager} calendarManager Calendar manager instance.
         * @param {Gnt.data.Calendar} calendar Calendar assigned to a record.
         * @param {Gnt.model.Calendar} record Record that was bound to a calendar.
         */
        this.fireEvent('calendarbound', this, calendar, record);
    },


    unbindCalendar : function (record) {
        if (!record || this.getRoot() === record) return;

        var calendar    = record.getCalendar();
        if (!calendar) return;

        this.unbindCalendarEvents(calendar);

        this.fireEvent('calendarunbound', this, calendar, record);
    },


    bindCalendars : function (node) {
        var me  = this;

        if (node) {
            if (Ext.isArray(node)) {
                Ext.each(node, function (n) {
                    n.cascadeBy(me.bindCalendar, me);
                });
            } else {
                node.cascadeBy(me.bindCalendar, me);
            }
        }
    },


    unbindCalendars : function (node) {
        var me  = this;

        if (node) {
            if (Ext.isArray(node)) {
                Ext.each(node, function (n) {
                    n.cascadeBy(me.unbindCalendar, me);
                });
            } else {
                node.cascadeBy(me.unbindCalendar, me);
            }
        }
    }

});
