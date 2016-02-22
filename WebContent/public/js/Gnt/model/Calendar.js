/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.model.Calendar
@extends Sch.model.Customizable

A model representing a single calendar.
Every model instance will be also decorated with the {@link Gnt.data.Calendar} instance, created based on the model field values.
The fields of the model correspond to the properties of {@link Gnt.data.Calendar} class.

Fields
------

- `Id` - record identifier (corresponds to {@link Gnt.data.Calendar#calendarId})
- `Name` - corresponds to {@link Gnt.data.Calendar#name}
- `DaysPerMonth` - corresponds to {@link Gnt.data.Calendar#daysPerMonth}
- `DaysPerWeek` - corresponds to {@link Gnt.data.Calendar#daysPerWeek}
- `HoursPerDay` - corresponds to {@link Gnt.data.Calendar#hoursPerDay}
- `WeekendsAreWorkdays` - corresponds to {@link Gnt.data.Calendar#weekendsAreWorkdays}
- `WeekendFirstDay` - corresponds to {@link Gnt.data.Calendar#weekendFirstDay}
- `WeekendSecondDay` - corresponds to {@link Gnt.data.Calendar#weekendSecondDay}
- `DefaultAvailability` - corresponds to {@link Gnt.data.Calendar#defaultAvailability}
- `Days` - stores reference to the {@link Gnt.data.Calendar} instance
- `CalendarClass` - calendar class that should be used to create {@link Gnt.data.Calendar} instance
- `PhantomId` - phantom record identifier
- `PhantomParentId` - phantom parent record identifier

A collection of this models is supposed to be provided for the {@link Gnt.data.CalendarManager calendar manager}.
*/
Ext.define('Gnt.model.Calendar', {
    extend                  : 'Sch.model.Customizable',

    requires                : ['Ext.data.NodeInterface'],

    idProperty              : 'Id',

    calendar                : null,

    /**
     * @cfg {String} phantomIdField The name of the field specifying the phantom id when this record is being 'realized' by the server.
     */
    phantomIdField          : 'PhantomId',

    /**
     * @cfg {String} phantomParentIdField The name of the field specifying the parent calendar phantom id when this record is being 'realized' by the server.
     */
    phantomParentIdField    : 'PhantomParentId',

    daysField               : 'Days',

    customizableFields      : [
        { name : 'Name' },
        { name : 'DaysPerMonth' },
        { name : 'DaysPerWeek' },
        { name : 'HoursPerDay' },
        { name : 'WeekendsAreWorkdays' },
        { name : 'WeekendFirstDay' },
        { name : 'WeekendSecondDay' },
        { name : 'DefaultAvailability' },
        { name : 'Days' },
        { name : 'CalendarClass' },
        { name : 'PhantomId',          type: 'string' },
        { name : 'PhantomParentId',    type: 'string' }
    ],

    constructor : function (config, id, node) {
        var cfg         = config || node || {};

        var days        = cfg.calendar || cfg.Days;

        config && delete config.calendar;
        node && delete node.calendar;

        this.callParent(arguments);

        this.setDays(days);

        this.data[this.phantomIdField]  = this.getId();
    },

    get : function (field) {
        if (field === 'Days') {
            return this.getCalendar() || this.data[this.daysField];
        } else {
            return this.callParent(arguments);
        }
    },

    set : function (field, value) {
        if (field === 'Days') {
            if (value instanceof Gnt.data.Calendar) {
                this.setCalendar(value);
            } else {
                this.data[this.daysField]   = value;
            }
        } else {
            return this.callParent(arguments);
        }
    },

    /**
     * Gets a calendar assigned to the record.
     */
    getCalendar : function () {
        return this.calendar;
    },

    /**
     * @private
     * Assign a calendar to the record.
     * @param {Gnt.data.Calendar} calendar The calendar to assign.
     */
    setCalendar : function (calendar) {
        this.calendar   = calendar;
    },

    getCalendarConfig : function () {
        return {
            calendarId          : this.getId() || this.internalId,
            daysPerMonth        : this.getDaysPerMonth(),
            daysPerWeek         : this.getDaysPerWeek(),
            defaultAvailability : this.getDefaultAvailability(),
            hoursPerDay         : this.getHoursPerDay(),
            name                : this.getName(),
            parent              : this.parentNode && this.parentNode.getCalendar(),
            weekendFirstDay     : this.getWeekendFirstDay(),
            weekendSecondDay    : this.getWeekendSecondDay(),
            weekendsAreWorkdays : this.getWeekendsAreWorkdays()
        };
    },

    getModelConfig : function (calendar) {
        return {
            DaysPerMonth        : calendar.daysPerMonth,
            DaysPerWeek         : calendar.daysPerWeek,
            DefaultAvailability : calendar.defaultAvailability,
            HoursPerDay         : calendar.hoursPerDay,
            Name                : calendar.name,
            parentId            : calendar.parent && calendar.parent.calendarId,
            WeekendFirstDay     : calendar.weekendFirstDay,
            WeekendSecondDay    : calendar.weekendSecondDay,
            WeekendsAreWorkdays : calendar.weekendsAreWorkdays,
            ClassName           : Ext.getClassName(calendar),
            Days                : calendar
        };
    },

    setCalendarManager : function (calendarManager) {
        this.calendarManager    = calendarManager;
    },

    getCalendarManager : function () {
        return this.calendarManager;
    },

    getInternalId : function () {
        return this.getId() || this.internalId;
    }

}, function () {
    // Do this first to be able to override NodeInterface methods
    Ext.data.NodeInterface.decorate(this);

    this.override({
        // @OVERRIDE
        insertBefore : function(node) {
            if (node instanceof Gnt.data.Calendar) {
                node    = this.getModelConfig(node);
            }

            if (this.phantom) {
                (node.data || node)[this.phantomParentIdField] = this.getInternalId();
            }

            return this.callParent(arguments);
        },

        // @OVERRIDE
        appendChild : function(node) {
            if (node instanceof Gnt.data.Calendar) {
                node    = this.getModelConfig(node);
            }

            if (this.phantom) {
                var nodes = node instanceof Array ? node : [node];

                for (var i = 0; i < nodes.length; i++) {
                    var data    = nodes[i].data || nodes[i];
                    data[this.phantomParentIdField] = this.getInternalId();
                }
            }

            return this.callParent(arguments);
        }
    });
});
