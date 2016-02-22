/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.data.Calendar
@extends Ext.data.Store
@aside guide gantt_calendars

A class representing a customizable calendar with weekends, holidays and availability information for any day.
Internally, it's just a subclass of the Ext.data.Store class which should be loaded with a collection
of {@link Gnt.model.CalendarDay} instances. Additionally, calendars may have parent-child relations, allowing "child" calendars to "inherit"
all special dates from its "parent" and add its own. See {@link #parent} property for details.

* **Note, that this calendar class is configured for backward compatibility and sets whole 24 hours of every day except weekends,
as available time. If you are looking for a calendar with regular business hours and availability, use {@link Gnt.data.calendar.BusinessTime}**

A calendar can be instantiated like this:

    var calendar        = new Gnt.data.Calendar({
        data    : [
            {
                Date            : new Date(2010, 0, 13),
                Cls             : 'gnt-national-holiday'
            },
            {
                Date            : new Date(2010, 1, 1),
                Cls             : 'gnt-company-holiday'
            },
            {
                Date            : new Date(2010, 0, 16),
                IsWorkingDay    : true
            }
        ]
    });

It can then be provided as a {@link Gnt.data.TaskStore#calendar configuration option} for the {@link Gnt.data.TaskStore}. Note that the calendar should be
loaded prior to loading the taskStore where it's consumed.

Please refer to the {@link Gnt.model.CalendarDay} class to know with what data calendar can be loaded with.

To edit the data in the calendar visually you can use {@link Gnt.widget.calendar.Calendar}

*/
Ext.define('Gnt.data.Calendar', {
    extend      : 'Ext.data.Store',

    requires    : [
        'Ext.Date',
        'Gnt.model.CalendarDay',
        'Sch.model.Range',
        'Sch.util.Date'
    ],

    model       : 'Gnt.model.CalendarDay',

    proxy       : 'memory',

    /**
     * Number of days per month. Will be used when converting the big duration units like month/year to days.
     *
     * @cfg {Number} daysPerMonth
     */
    daysPerMonth        : 30,

    /**
     * Number of days per week. Will be used when converting the duration in weeks to days.
     *
     * @cfg {Number} daysPerWeek
     */
    daysPerWeek         : 7,

    /**
     * Number of hours per day. Will be used when converting the duration in days to hours.
     *
     * **Please note**, that this config is used for duration convertion and not anything else. If you need to change
     * the number of working hours in the day, update the {@link #defaultAvailability}
     *
     * @cfg {Number} hoursPerDay
     */
    hoursPerDay         : 24,

    unitsInMs           : null,

    defaultNonWorkingTimeCssCls     : 'gnt-holiday',

    /**
     * @cfg {Boolean} weekendsAreWorkdays Setting this option to `true` will treat *all* days as working. Default value is `false`.
     * This option can also be specified as the {@link Gnt.panel.Gantt#weekendsAreWorkdays config} of the gantt panel.
     */
    weekendsAreWorkdays             : false,

    /**
     * @cfg {Number} weekendFirstDay The index of the first day in weekend, 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on.
     * Default value is 6 - Saturday
     */
    weekendFirstDay                 : 6,

    /**
     * @cfg {Number} weekendSecondDay The index of the second day in weekend, 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on.
     * Default value is 0 - Sunday
     */
    weekendSecondDay                : 0,

    holidaysCache                   : null,
    availabilityIntervalsCache      : null,
    daysIndex                       : null,

    // a "cached" array of WEEKDAY days
    weekAvailability                : null,

    // the "very default" availability array, calculated based on `defaultAvailability` property
    defaultWeekAvailability         : null,

    nonStandardWeeksByStartDate     : null,
    nonStandardWeeksStartDates      : null,

    /**
     * @cfg {String} calendarId The unique id for the calendar. Providing the `calendarId` will register thi calendar in the calendars registry
     * and it can be retrieved later with {@link #getCalendar}. Generally only required if want to use {@link #parent parent-child relations} between the calendars,
     * or assign this calendar to a particular task or resource.
     *
     * Note, that when loading the calendar using ExtJS proxy this field will not be set.
     */
    calendarId                      : null,

    /**
     * @cfg {String/Gnt.data.Calendar} parent The parent calendar. Can be provided as the calendar id or calendar instance itself. If this property is provided
     * or set with {@link #setParent} method, this calendar becomes a "child" of the specified calendar. This means that it will "inherit" all day overrides, week days and
     * week day overrides from its "parent". In the same time, special days, defined in this calendar take priority over the ones from the "parent".
     *
     * You can use this feature if you'd like to create a single "main" calendar for the whole project, and then allow some task or resource to
     * have slightly different calendar (with an additional day off for example). You will not have to re-create all special days in the calendar of such task/resource - just
     * set the "main" calendar as a "parent" for it.
     */
    parent                          : null,

    /**
     * @cfg {String[]} defaultAvailability The array of default availability intervals (in the format of the `Availability` field
     * in the {@link Gnt.model.CalendarDay}) for each working weekday (Monday-Friday). Defaults to whole day (00-24) for backward compatibility.
     */
    defaultAvailability             : [ '00:00-24:00' ],

    /**
     * @cfg {String} name The name of this calendar
     */
    name                            : null,


    suspendCacheUpdate              : 0,


    /**
    * @cfg {Number} availabilitySearchLimit Maximum number of days to search for calendar availability intervals.
    * Used in various calculations requiring to respect working time.
    * In these cases system iterate through working time day by day. This option determines a maximum distance iteration will be done.
    * Prevents from infinite loop in case of wrong calendar configuration.
    */
    availabilitySearchLimit     : 1825, //5*365

    statics: {
        /**
         * Returns the registered calendar with the given id.
         *
         * @param {String} id The calendar id
         * @return {Gnt.data.Calendar}
         */
        getCalendar: function (id) {
            if (id instanceof Gnt.data.Calendar) return id;

            return Ext.data.StoreManager.lookup('GNT_CALENDAR:' + id);
        },


        /**
         * Returns an array of all registered calendars.
         *
         * @return {Gnt.data.Calendar[]}
         */
        getAllCalendars : function () {
            var result  = [];

            Ext.data.StoreManager.each(function (store) {
                if (store instanceof Gnt.data.Calendar) {
                    result.push(store);
                }
            });

            return result;
        },

        /**
         * Destroys all registered calendars.
         *
         * @return {Gnt.data.Calendar[]}
         */
        removeAll : function () {
            var sm = Ext.data.StoreManager;

            sm.each(function (store) {
                if (store instanceof Gnt.data.Calendar) {
                    sm.unregister(store);
                    Ext.destroy(store);
                }
            });
        }
    },


    constructor : function (config) {
        config      = config || {};
        
        var parent      = config.parent;
        delete config.parent;

        var calendarId  = config.calendarId;
        delete config.calendarId;

        this.callParent(arguments);

        this.setParent(parent);
        this.setCalendarId(calendarId);

        this.unitsInMs = {
            MILLI       : 1,
            SECOND      : 1000,
            MINUTE      : 60 * 1000,
            HOUR        : 60 * 60 * 1000,
            DAY         : this.hoursPerDay * 60 * 60 * 1000,
            WEEK        : this.daysPerWeek * this.hoursPerDay * 60 * 60 * 1000,
            MONTH       : this.daysPerMonth * this.hoursPerDay * 60 * 60 * 1000,
            QUARTER     : 3 * this.daysPerMonth * 24 * 60 * 60 * 1000,
            YEAR        : 4 * 3 * this.daysPerMonth * 24 * 60 * 60 * 1000
        };

        this.defaultWeekAvailability        = this.getDefaultWeekAvailability();

        // traditional "on-demand" caching seems to be not so efficient for calendar (in theory)
        // calculating any cached property, like, "weekAvailability" or "nonStandardWeeksStartDates" will require full calendar scan each time
        // so we update ALL cached values on any CRUD operations
        this.on({
            // TODO ignore changes of "Name/Cls" field?
            update      : this.clearCache,
            datachanged : this.clearCache,
            clear       : this.clearCache,

            load        : this.clearCache,
            scope       : this
        });

        this.clearCache();
    },


    /**
     * Returns the {@link #calendarId} of the current calendar
     * @return {String}
     */
    getCalendarId : function () {
        return this.calendarId;
    },


    /**
     * Sets the {@link #calendarId} of the current calendar and register it in the calendar registry.
     *
     * @param {String} id
     */
    setCalendarId : function (id) {
        // allow "0" as the calendarId
        if (this.calendarId != null) Ext.data.StoreManager.unregister(this);
        
        this.calendarId     = id;

        if (id != null) {
            this.storeId    = 'GNT_CALENDAR:' + id;
            Ext.data.StoreManager.register(this);
        } else
            this.storeId    = null;

        var proxy           = this.proxy;

        if (proxy && proxy.extraParams) proxy.extraParams.calendarId    = id;
    },


    getDefaultWeekAvailability : function () {
        var availability        = this.defaultAvailability;
        var weekendFirstDay     = this.weekendFirstDay;
        var weekendSecondDay    = this.weekendSecondDay;

        var res                 = [];

        for (var i = 0; i < 7; i++) {
            res.push(
                this.weekendsAreWorkdays || i != weekendFirstDay && i != weekendSecondDay ?
                    new this.model({ Type : 'WEEKDAY', Weekday : i, Availability : availability && Ext.Array.clone(availability) || [], IsWorkingDay : true })
                        :
                    new this.model({ Type : 'WEEKDAY', Weekday : i, Availability : []  })
            );
        }

        return res;
    },


    // will scan through all calendar days in the store and save references to special ones to the properties, for speedup
    clearCache : function () {
        if (this.suspendCacheUpdate > 0) return;

        this.holidaysCache                  = {};
        this.availabilityIntervalsCache     = {};

        var daysIndex                       = this.daysIndex                    = {};

        var weekAvailability                = this.weekAvailability             = [];
        var nonStandardWeeksStartDates      = this.nonStandardWeeksStartDates   = [];
        var nonStandardWeeksByStartDate     = this.nonStandardWeeksByStartDate  = {};

        this.each(function (calendarDay) {
            // backward compat
            var id                  = calendarDay.getId();
            var overrideMatch       = /^(\d)-(\d\d\d\d\/\d\d\/\d\d)-(\d\d\d\d\/\d\d\/\d\d)$/.exec(id);
            var weekDayMatch        = /^WEEKDAY:(\d+)$/.exec(id);

            var type                = calendarDay.getType();

            var weekDay             = calendarDay.getWeekday();

            if (type == 'WEEKDAYOVERRIDE' || overrideMatch) {
                var startDate, endDate;

                if (type == 'WEEKDAYOVERRIDE') {
                    startDate       = calendarDay.getOverrideStartDate();
                    endDate         = calendarDay.getOverrideEndDate();
                }

                // backward compat
                if (overrideMatch) {
                    startDate       = Ext.Date.parse(overrideMatch[ 2 ], 'Y/m/d');
                    endDate         = Ext.Date.parse(overrideMatch[ 3 ], 'Y/m/d');
                    weekDay         = overrideMatch[ 1 ];
                }

                // allow partially defined days - they will not be included in calculations
                if (startDate && endDate && weekDay != null) {
                    var startDateNum            = startDate - 0;

                    if (!nonStandardWeeksByStartDate[ startDateNum ]) {
                        nonStandardWeeksByStartDate[ startDateNum ] = {
                            startDate           : new Date(startDate),
                            endDate             : new Date(endDate),
                            name                : calendarDay.getName(),
                            weekAvailability    : [],
                            // main day representing the week override itself - for example for overrides w/o any re-defined availability
                            mainDay             : null
                        };

                        nonStandardWeeksStartDates.push(startDateNum);
                    }

                    if (weekDay >= 0)
                        nonStandardWeeksByStartDate[ startDateNum ].weekAvailability[ weekDay ] = calendarDay;
                    else
                        nonStandardWeeksByStartDate[ startDateNum ].mainDay = calendarDay;
                }

            } else if (type == 'WEEKDAY' || weekDayMatch) {
                if (weekDayMatch) weekDay = weekDayMatch[ 1 ];

                // again - only fully defined records will be taken into account
                if (weekDay != null) {
                    if (weekDay < 0 || weekDay > 6) { throw new Error("Incorrect week day index"); }

                    weekAvailability[ weekDay ] = calendarDay;
                }
            } else {
                var date            = calendarDay.getDate();

                if (date) daysIndex[ date - 0 ] = calendarDay;
            }
        });

        nonStandardWeeksStartDates.sort();

        this.fireEvent('calendarchange', this);
    },


    /**
     * Returns `true` or `false` depending whether the given time span intersects with one of the defined week day overrides.
     *
     * @param {Date} startDate The start date of the time span
     * @param {Date} endDate The end date of the time span
     *
     * @return {Boolean}
     */
    intersectsWithCurrentWeeks : function (startDate, endDate) {
        var result                          = false;

        this.forEachNonStandardWeek(function (week) {
            var weekStartDate       = week.startDate;
            var weekEndDate         = week.endDate;

            if (weekStartDate <= startDate && startDate < weekEndDate || weekStartDate < endDate && endDate <= weekEndDate) {
                result      = true;

                // stop the iteration
                return false;
            }
        });

        return result;
    },


    /**
     * Adds a week day override ("non-standard" week) to the calendar. As a reminder, week day override consists from up to 7 days,
     * that re-defines the default week days availability only within certain time span.
     *
     * @param {Date} startDate The start date of the time span
     * @param {Date} endDate The end date of the time span
     * @param {Gnt.model.CalendarDay[]/String[][]} weekAvailability The array indexed from 0 to 7, containing items for week days.
     * Index 0 corresponds to Sunday, 1 to Monday, etc. Some items can be not defined or set to `null`, indicating that override does not
     * change this week day. Item can be - an instance of {@link Gnt.model.CalendarDay} (only `Availability` field needs to be set), or
     * an array of strings, defining the availability (see the description of the `Availability` field in the {@link Gnt.model.CalendarDay}).
     * @param {String} name The name of this week day override
     */
    addNonStandardWeek : function (startDate, endDate, weekAvailability, name) {
        startDate       = Ext.Date.clearTime(new Date(startDate));
        endDate         = Ext.Date.clearTime(new Date(endDate));

        if (this.intersectsWithCurrentWeeks(startDate, endDate)) {
            throw new Error("Can not add intersecting week");
        }

        var DayModel    = this.model;
        var days        = [];

        Ext.Array.each(weekAvailability, function (day, index) {
            if (day instanceof Gnt.model.CalendarDay) {
                day.setType('WEEKDAYOVERRIDE');
                day.setOverrideStartDate(startDate);
                day.setOverrideEndDate(endDate);
                day.setWeekday(index);
                day.setName(name || 'Week override');

                days.push(day);
            } else if (Ext.isArray(day)) {
                var newDay = new DayModel();

                newDay.setType('WEEKDAYOVERRIDE');
                newDay.setOverrideStartDate(startDate);
                newDay.setOverrideEndDate(endDate);
                newDay.setWeekday(index);
                newDay.setName(name || 'Week override');
                newDay.setAvailability(day);

                days.push(newDay);
            }
        });

        var mainDay     = new DayModel();

        mainDay.setType('WEEKDAYOVERRIDE');
        mainDay.setOverrideStartDate(startDate);
        mainDay.setOverrideEndDate(endDate);
        mainDay.setWeekday(-1);
        mainDay.setName(name || 'Week override');

        days.push(mainDay);

        this.add(days);
    },


    /**
     * Returns an object describing a week day override ("non-standard" week), that starts at the given date or `null` if there's no any.
     *
     * @param {Date} startDate The start date of the week day override
     *
     * @return {Object} An object with the following properties
     * @return {Object} return.name A "Name" field of the week days in the override
     * @return {Date} return.startDate An "OverrideStartDate" field of the week days in the override
     * @return {Date} return.endDate An "OverrideEndDate" field of the week days in the override
     * @return {Gnt.model.CalendarDay[]} return.weekAvailability An array with the week days, defined by this override. May be filled only partially if
     * week day override does not contain all days.
     * @return {Gnt.model.CalendarDay} return.mainDay A "main" day instance for this override
     */
    getNonStandardWeekByStartDate : function (startDate) {
        return this.nonStandardWeeksByStartDate[ Ext.Date.clearTime(new Date(startDate)) - 0 ] || null;
    },


    /**
     * Returns an object describing a week day override ("non-standard" week), that contains the given date or `null` if there's no any.
     *
     * @param {Date} startDate The date that falls within some of the week day overrides
     *
     * @return {Object} An object describing week day override. See {@link #getNonStandardWeekByStartDate} method for details.
     */
    getNonStandardWeekByDate : function (timeDate) {
        timeDate        = Ext.Date.clearTime(new Date(timeDate)) - 0;

        var nonStandardWeeksStartDates      = this.nonStandardWeeksStartDates;
        var nonStandardWeeksByStartDate     = this.nonStandardWeeksByStartDate;

        for (var i = 0; i < nonStandardWeeksStartDates.length; i++){
            var week                = nonStandardWeeksByStartDate[ nonStandardWeeksStartDates[ i ] ];

            // since `nonStandardWeeksStartDates` are sorted inc and week overrides do not intersect
            // we can shorcut in this case
            if (week.startDate > timeDate) break;

            if (week.startDate <= timeDate && timeDate <= week.endDate) {
                return week;
            }
        }

        return null;
    },


    /**
     * Removes all calendar day instances, that forms a week day override ("non-standard" week) with the given start date.
     *
     * @param {Date} startDate The start date of the week day override
     */
    removeNonStandardWeek : function (startDate) {
        startDate       = Ext.Date.clearTime(new Date(startDate)) - 0;

        var week        = this.getNonStandardWeekByStartDate(startDate);

        if (!week) return;

        this.remove(Ext.Array.clean(week.weekAvailability).concat(week.mainDay));
    },


    /**
     * Iterator for each week day override, defined in this calendar.
     *
     * @param {Function} func The function to call for each override. It will receive a single argument - object, describing the override.
     * See {@link #getNonStandardWeekByStartDate} for details. Returning `false` from the function stops the iterator.
     * @param {Object} scope The scope to execute the `func` with.
     *
     * @return {Boolean} `false` if any of the function calls have returned `false`
     */
    forEachNonStandardWeek : function (func, scope) {
        var me                              = this;
        var nonStandardWeeksStartDates      = this.nonStandardWeeksStartDates;
        var nonStandardWeeksByStartDate     = this.nonStandardWeeksByStartDate;

        for (var i = 0; i < nonStandardWeeksStartDates.length; i++) {
            if (func.call(scope || me, nonStandardWeeksByStartDate[ nonStandardWeeksStartDates[ i ] ]) === false) return false;
        }
    },


    /**
     * Updates the default availability information based on the value provided.
     *
     * @param {Boolean} value true if weekends should be regarded as working time.
     */
    setWeekendsAreWorkDays : function(value) {
        if (value !== this.weekendsAreWorkdays) {
            this.weekendsAreWorkdays = value;

            // Must generate new defaultWeekAvailability
            this.defaultWeekAvailability = this.getDefaultWeekAvailability();

            this.clearCache();
        }
    },

    /**
     * Returns true if weekends are regarded as working time.
     *
     * @return {Boolean} true if weekends should be regarded as working time.
     */
    areWeekendsWorkDays : function() {
        return this.weekendsAreWorkdays;
    },

    /**
     * Returns a corresponding {@link Gnt.model.CalendarDay} instance for the given date. First, this method checks for {@link #getOverrideDay day overrides}
     * (either in this or parent calendars), then for week days (again, in this or parent calendars) and finally fallbacks to the
     * calendar day with the {@link #defaultAvailability} availability.
     *
     * @param {Date} timeDate A date (can contain time portion which will be ignored)
     *
     * @return {Gnt.model.CalendarDay}
     */
    getCalendarDay : function (timeDate) {
        timeDate        = typeof timeDate == 'number' ? new Date(timeDate) : timeDate;

        return this.getOverrideDay(timeDate) || this.getWeekDay(timeDate.getDay(), timeDate) || this.getDefaultCalendarDay(timeDate.getDay());
    },


    /**
     * Returns a day override corresponding to the given date (possibly found in the parent calendars) or `null` if the given date
     * has no overrides in this calendar and all its parents.
     *
     * @param {Date} timeDate The date to check for day overrides for
     * @return {Gnt.model.CalendarDay}
     */
    getOverrideDay : function (timeDate) {
        return this.getOwnCalendarDay(timeDate) || this.parent && this.parent.getOverrideDay(timeDate) || null;
    },


    /**
     * Returns an "own" day override corresponding to the given date. That is - day override defined in the current calendar only.
     *
     * @param {Date} timeDate The date to check for day overrides for
     * @return {Gnt.model.CalendarDay}
     */
    getOwnCalendarDay : function (timeDate) {
        timeDate        = typeof timeDate == 'number' ? new Date(timeDate) : timeDate;

        return this.daysIndex[ Ext.Date.clearTime(timeDate, true) - 0 ];
    },


    /**
     * Returns a "special" week day corresponding to the given date. Under "special" week day we mean a calendar day with the `Type = WEEKDAY` or `WEEKDAYOVERRIDE`.
     * See the {@link Gnt.model.CalendarDay} class for details. If the concrete date is given as 2nd argument, this method will
     * first check for any week overrides passing on it.
     *
     * If not found in current calendar, this method will consult parent. If no "special" week day found neither in this calendar, no parents - it returns `null`.
     *
     * @param {Number} weekDayIndex The index of the week day to retrieve (0-Sunday, 1-Monday, etc)
     * @param {Date} [timeDate] The date for which the week day is being retrieved.
     * @return {Gnt.model.CalendarDay}
     */
    getWeekDay : function (weekDayIndex, timeDate) {
        // if 2nd argument is provided then try to search in non-standard weeks first
        if (timeDate) {
            var week        = this.getNonStandardWeekByDate(timeDate);

            if (week && week.weekAvailability[ weekDayIndex ]) return week.weekAvailability[ weekDayIndex ];
        }

        return this.weekAvailability[ weekDayIndex ] || this.parent && this.parent.getWeekDay(weekDayIndex, timeDate) || null;
    },


    /**
     * Returns a "default" calendar day instance, corresponding to the one, generated from {@link #defaultAvailability}. By default all working days in the week
     * corresponds to the day with {@link #defaultAvailability} set in the `Availability` field and non-working days has empty `Availability`.
     *
     * @param {Number} weekDayIndex The index of the "default" week day to retrieve (0-Sunday, 1-Monday, etc)
     * @return {Gnt.model.CalendarDay}
     */
    getDefaultCalendarDay : function (weekDayIndex) {
        if (!this.hasOwnProperty('defaultAvailability') && !this.hasOwnProperty('weekendsAreWorkdays') && this.parent) {
            return this.parent.getDefaultCalendarDay(weekDayIndex);
        }

        return this.defaultWeekAvailability[ weekDayIndex ];
    },


    /**
     * Returns a boolean indicating whether a passed date falls on the weekend or holiday.
     *
     * @param {Date} timeDate A given date (can contain time portion)
     *
     * @return {Boolean}
     */
    isHoliday : function (timeDate) {
        var secondsSinceEpoch       = timeDate - 0;
        var holidaysCache           = this.holidaysCache;

        if (holidaysCache[ secondsSinceEpoch ] != null) {
            return holidaysCache[ secondsSinceEpoch ];
        }

        timeDate        = typeof timeDate == 'number' ? new Date(timeDate) : timeDate;

        var day         = this.getCalendarDay(timeDate);

        if (!day) throw "Can't find day for " + timeDate;

        return holidaysCache[ secondsSinceEpoch ] = !day.getIsWorkingDay();
    },


    /**
     * Returns `true` if given date passes on the weekend and `false` otherwise. Weekend days can be re-defined with the {@link #weekendFirstDay} and {@link #weekendSecondDay} options.
     *
     * @param {Date} timeDate The date to check
     * @return {Boolean}
     */
    isWeekend : function (timeDate) {
        var dayIndex = timeDate.getDay();
        return dayIndex === this.weekendFirstDay || dayIndex === this.weekendSecondDay;
    },


    /**
     * Returns a boolean indicating whether a passed date is a working day.
     *
     * @param {Date} date A given date (can contain time portion which will be ignored)
     *
     * @return {Boolean}
     */
    isWorkingDay : function (date) {
        return !this.isHoliday(date);
    },


    /**
     * Convert the duration given in milliseconds to a given unit. Uses the {@link #daysPerMonth} configuration option.
     *
     * @param {Number} durationInMs Duration in milliseconds
     * @param {String} unit Duration unit to which the duration should be converted
     *
     * @return {Number} converted value
     */
    convertMSDurationToUnit : function (durationInMs, unit) {
        return durationInMs / this.unitsInMs[ Sch.util.Date.getNameOfUnit(unit) ];
    },


    /**
     * Convert the duration given in some unit to milliseconds. Uses the {@link #daysPerMonth} configuration option.
     *
     * @param {Number} durationInMs
     * @param {String} unit
     *
     * @return {Number} converted value
     */
    convertDurationToMs : function (duration, unit) {
        return duration * this.unitsInMs[ Sch.util.Date.getNameOfUnit(unit) ];
    },


    /**
     * Returns an array of ranges for non-working days between `startDate` and `endDate`. For example normally, given a full month,
     * it will return an array from 4 `Sch.model.Range` instances, containing ranges for the weekends. If some holiday lasts for several days
     * and all {@link Gnt.model.CalendarDay} instances have the same `Cls` value then all days will be combined in single range.
     *
     * @param {Date} startDate - A start date of the timeframe to extract the holidays from
     * @param {Date} endDate - An end date of the timeframe to extract the holidays from
     *
     * @return {Sch.model.Range[]}
     */
    getHolidaysRanges : function (startDate, endDate, includeWeekends) {
        if (startDate > endDate) {
            Ext.Error.raise("startDate can't be bigger than endDate");
        }

        startDate       = Ext.Date.clearTime(startDate, true);
        endDate         = Ext.Date.clearTime(endDate, true);

        var ranges          = [],
            currentRange,
            date;

        for (date = startDate; date < endDate; date = Sch.util.Date.getNext(date, Sch.util.Date.DAY, 1)) {

            if (this.isHoliday(date) || (this.weekendsAreWorkdays && includeWeekends && this.isWeekend(date))) {
                var day         = this.getCalendarDay(date);
                var cssClass    = day && day.getCls() || this.defaultNonWorkingTimeCssCls;

                var nextDate    = Sch.util.Date.getNext(date, Sch.util.Date.DAY, 1);

                // starts new range
                if (!currentRange) {
                    currentRange    = {
                        StartDate   : date,
                        EndDate     : nextDate,
                        Cls         : cssClass
                    };
                } else {
                    // checks if the range is still the same
                    if (currentRange.Cls == cssClass) {
                        currentRange.EndDate    = nextDate;
                    } else {
                        ranges.push(currentRange);

                        currentRange    = {
                            StartDate   : date,
                            EndDate     : nextDate,
                            Cls         : cssClass
                        };
                    }
                }
            } else {
                if (currentRange) {
                    ranges.push(currentRange);
                    currentRange = null;
                }
            }
        }

        if (currentRange) {
            ranges.push(currentRange);
        }

        var models = [];

        Ext.each(ranges, function (range) {
            models.push(Ext.create("Sch.model.Range", {
                StartDate       : range.StartDate,
                EndDate         : range.EndDate,
                Cls             : range.Cls
            }));
        });

        return models;
    },


    /**
     * This an iterator that is monotonically passes through the all availability intervals (working time intervals) in the given date range.
     *
     * For example if the default availability in this calendar is [ '09:00-13:00', '14:00-18:00' ] and this function is called, like this:
     *
     *      calendar.forEachAvailabilityInterval(
     *           //             midnight  Friday                 midnight Tuesday
     *          { startDate : new Date(2013, 1, 8), endDate : new Date(2013, 1, 12) },
     *          function (startDate, endDate) { ... }
     *      )
     * then the provided function will be called 4 times with the following arguments:
     *
     *      startDate : new Date(2013, 1, 8, 9),    endDate : new Date(2013, 1, 8, 13)
     *      startDate : new Date(2013, 1, 8, 14),   endDate : new Date(2013, 1, 8, 18)
     *      startDate : new Date(2013, 1, 11, 9),   endDate : new Date(2013, 1, 11, 13)
     *      startDate : new Date(2013, 1, 11, 14),  endDate : new Date(2013, 1, 11, 18)
     *
     *
     * @param {Object} options An object with the following properties:
     * @param {Date} options.startDate A start date of the date range. Can be omitted, if `isForward` flag is set to `false`. In this case iterator
     * will not stop until the call to `func` will return `false`.
     * @param {Date} options.endDate An end date of the date range. Can be omitted, if `isForward` flag is set to `true`. In this case iterator
     * will not stop until the call to `func` will return `false`.
     * @param {Boolean} [options.isForward=true] A flag, defining the direction, this iterator advances in. If set to `true` iterations
     * will start from the `startDate` option and will advance in date increasing direction. If set to `false` iterations will start from the `endDate`
     * option and will advance in date decreasing direction.
     * @param {Function} func A function to call for each availability interval, in the given date range. It receives 2 arguments - the start date
     * of the availability interval and the end date.
     * @param {Object} scope A scope to execute the `func` with.
     *
     * @return {Boolean} `false` if any of the calls to `func` has returned `false`
     */
    forEachAvailabilityInterval : function (options, func, scope) {
        scope                       = scope || this;
        var me                      = this;

        var startDate               = options.startDate;
        var endDate                 = options.endDate;

        // isForward by default
        var isForward               = options.isForward !== false;

        if (isForward ? !startDate : !endDate) {
            throw new Error("At least `startDate` or `endDate` is required, depending from the `isForward` option");
        }

        var cursorDate              = new Date(isForward ? startDate : endDate);
        var DATE                    = Sch.util.Date;

        // if no boundary we still have to specify some limit
        if (isForward) {
            if (!endDate) {
                endDate             = DATE.add(startDate, 'd', options.availabilitySearchLimit || this.availabilitySearchLimit || 5*365);
            }
        } else {
            if (!startDate) {
                startDate           = DATE.add(endDate, 'd', - (options.availabilitySearchLimit || this.availabilitySearchLimit || 5*365));
            }
        }

        // the Ext.Date.clearTime() method is called a lot during this method (like 200k times for 2k tasks project)
        // sometimes w/o real need for it since we always advance to the next day's boundary
        // this optimization brings it down to ~10k, ~10% speed up in the profiles
        var noNeedToClearTime       = false;

        while (isForward ? cursorDate < endDate : cursorDate > startDate) {
            // - 1 for backward direction ensures that we are checking correct day,
            // since the endDate is not inclusive - 02/10/2012 means the end of 02/09/2012
            // for backward direction we always clear time, because intervals are cached by the beginning of the day
            var intervals           = this.getAvailabilityIntervalsFor(cursorDate - (isForward ? 0 : 1), isForward ? noNeedToClearTime : false);

            // the order of processing is different for forward / backward processing
            for (var i = isForward ? 0 : intervals.length - 1; isForward ? i < intervals.length : i >= 0; isForward ? i++ : i--) {
                var interval                = intervals[ i ];
                var intervalStartDate       = interval.startDate;
                var intervalEndDate         = interval.endDate;

                // availability interval is out of [ startDate, endDate )
                if (intervalStartDate >= endDate || intervalEndDate <= startDate) continue;

                var countingFrom            = intervalStartDate < startDate ? startDate : intervalStartDate;
                var countingTill            = intervalEndDate > endDate ? endDate : intervalEndDate;

                if (func.call(scope, countingFrom, countingTill) === false) return false;
            }

            cursorDate              = isForward ? DATE.getStartOfNextDay(cursorDate, false, noNeedToClearTime) : DATE.getEndOfPreviousDay(cursorDate, noNeedToClearTime);

            noNeedToClearTime       = true;
        }
    },


    /**
     * Calculate the duration in the given `unit` between 2 dates, taking into account the availability/holidays information (non-working time will be excluded from the duration).
     *
     * @param {Date} startDate The start date
     * @param {Date} endDate The end date
     * @param {String} unit One of the units of the {@link Sch.util.Date} class, for example `Sch.util.Date.DAY`.
     *
     * @return {Number} Working time duration between given dates.
     */
    calculateDuration : function (startDate, endDate, unit) {
        var duration        = 0;

        this.forEachAvailabilityInterval({ startDate : startDate, endDate : endDate }, function (intervalStartDate, intervalEndDate) {
            var dstDiff                 = intervalStartDate.getTimezoneOffset() - intervalEndDate.getTimezoneOffset();

            duration                    += intervalEndDate - intervalStartDate + dstDiff * 60 * 1000;
        });

        return this.convertMSDurationToUnit(duration, unit);
    },


    /**
     * Calculate the end date for the given start date and duration, taking into account the availability/holidays information (non-working time will not be counted as duration).
     *
     * @param {Date} startDate The start date
     * @param {Number} duration The "pure" duration (w/o any non-working time).
     * @param {String} unit One of the units of the {@link Sch.util.Date} class, for example `Sch.util.Date.DAY`.
     *
     * @return {Date} The end date
     */
    calculateEndDate : function (startDate, duration, unit) {
        // if duration is 0 - return the same date
        if (!duration) {
            return new Date(startDate);
        }

        var DATE = Sch.util.Date,
            endDate;

        duration        = this.convertDurationToMs(duration, unit);

        var startFrom   =
            // milestone case, which we don't want to re-schedule to the next business days
            // milestones should start/end in the same day as its incoming dependency
            duration === 0 && Ext.Date.clearTime(startDate, true) - startDate === 0 ?

            DATE.add(startDate, Sch.util.Date.DAY, -1)
                :
            startDate;

        this.forEachAvailabilityInterval({ startDate : startFrom }, function (intervalStartDate, intervalEndDate) {
            var diff                    = intervalEndDate - intervalStartDate;
            var dstDiff                 = intervalStartDate.getTimezoneOffset() - intervalEndDate.getTimezoneOffset();

            if (diff >= duration) {
                endDate                 = new Date(intervalStartDate - 0 + duration);

                return false;
            } else {
                duration                -= diff + dstDiff * 60 * 1000;
            }
        });

        return endDate;
    },


    /**
     * Calculate the start date for the given end date and duration, taking into account the availability/holidays information (non-working time will not be counted as duration).
     *
     * @param {Date} endDate The end date
     * @param {Number} duration The "pure" duration (w/o any non-working time).
     * @param {String} unit One of the units of the {@link Sch.util.Date} class, for example `Sch.util.Date.DAY`.
     *
     * @return {Date} The start date
     */
    calculateStartDate : function (endDate, duration, unit) {
        // if duration is 0 - return the same date
        if (!duration) {
            return new Date(endDate);
        }

        var startDate;

        duration        = this.convertDurationToMs(duration, unit);

        this.forEachAvailabilityInterval({ endDate : endDate, isForward : false }, function (intervalStartDate, intervalEndDate) {
            var diff                    = intervalEndDate - intervalStartDate;

            if (diff >= duration) {
                startDate               = new Date(intervalEndDate - duration);

                return false;
            } else
                duration                -= diff;
        });

        return startDate;
    },


    /**
     * This method starts from the given `date` and moves forward/backward in time (depending from the `isForward` flag) skiping the non-working time.
     * It returns the nearest edge of the first working time interval it encounters. If the given `date` falls on the working time, then `date` itself is returned.
     *
     * For example, if this function is called with some Saturday as `date` and `isForward` flag is set, it will return the earliest working hours on following Monday.
     * If `isForward` flag will be set to `false` - it will return the latest working hours on previous Friday.
     *
     * @param {Date} date A date (presumably falling on the non-working time).
     * @param {Boolean} isForward Pass `true` to skip the non-working time in forward direction, `false` - in backward
     *
     * @return {Date} Nearest working date.
     */
    skipNonWorkingTime : function (date, isForward) {
        var found   = false;
        // reseting the date to the earliest availability interval
        this.forEachAvailabilityInterval(
            isForward ? { startDate : date } : { endDate : date, isForward : false },

            function (intervalStartDate, intervalEndDate) {
                date        = isForward ? intervalStartDate : intervalEndDate;
                found       = true;

                return false;
            }
        );

        if (!found) throw 'skipNonWorkingTime: Cannot skip non-working time, please ensure that this calendar has any working period of time specified';

        return new Date(date);
    },


    /**
     * This method starts from the given `date` and moves forward/backward in time (depending from the `duration` argument).
     * It stops as soon as it skips the amount of *working* time defined by the `duration` and `unit` arguments. Skipped non-working time simply will not
     * be counted.
     *
     * **Note** that this method behaves differently from the {@link #skipNonWorkingTime} - that method stops as soon as it encounters the non-working time.
     * This method stops as soon as it accumulate enough skipped working time.
     *
     * @param {Date} date A starting point
     * @param {Number} duration The duration of the working time. To skip working time in backward direction pass a negative value.
     * @param {String} unit One of the units of the {@link Sch.util.Date} class, for example `Sch.util.Date.DAY`.
     *
     * @return {Date}
     */
    skipWorkingTime : function(date, duration, unit) {
        return duration >= 0 ? this.calculateEndDate(date, duration, unit) : this.calculateStartDate(date, -duration, unit);
    },


    /**
     * Returns the availability intervals of the concrete day. Potentially can consult a parent calendar.
     *
     * @param {Date} timeDate
     * @return {Object[]} Array of objects, like:

    {
        startDate       : new Date(...),
        endDate         : new Date(...)
    }
     */
    getAvailabilityIntervalsFor : function (timeDate, noNeedToClearTime) {
        // This is more rubust method of time clearing then direct call to Ext.Date.clearTime
        if (noNeedToClearTime) {
            timeDate = (timeDate).valueOf();
        }
        else if (timeDate instanceof Date) {
            timeDate = (new Date(timeDate.getFullYear(), timeDate.getMonth(), timeDate.getDate())).valueOf();
        }
        else {
            timeDate = Ext.Date.clearTime(new Date(timeDate)).valueOf();
        }

        return this.availabilityIntervalsCache[ timeDate ] = (this.availabilityIntervalsCache[ timeDate ] || this.getCalendarDay(timeDate).getAvailabilityIntervalsFor(timeDate));
    },


    getByInternalId : function (internalId) {
        return this.data.map[ internalId ];
    },


    getParentableCalendars : function() {
        var me          = this,
            result      = [],
            calendars   = Gnt.data.Calendar.getAllCalendars();

        var isChildOfThis = function (calendar) {
            if (!calendar.parent) return false;

            if (calendar.parent == me) return true;

            return isChildOfThis(calendar.parent);
        };

        Ext.Array.each(calendars, function(calendar){
            if (calendar === me) return;

            if (!isChildOfThis(calendar)) result.push({ Id : calendar.calendarId, Name : calendar.name || calendar.calendarId });
        });

        return result;
    },


    /**
     * Sets the {@link #parent} for this calendar. Pass `null` to remove the parent.
     *
     * @param {Null/String/Gnt.data.Calendar} parentOrId String with {@link #calendarId} value or calendar instance itself.
     */
    setParent : function (parentOrId) {
        var parent          = Gnt.data.Calendar.getCalendar(parentOrId);

        if (parentOrId && !parent) throw new Error("Invalid parent specified for the calendar");

        if (this.parent != parent) {
            var proxy       = this.proxy;

            var listeners   = {
                calendarchange          : this.clearCache,
                scope                   : this
            };

            var oldParent   = this.parent;

            if (oldParent) oldParent.un(listeners);

            this.parent     = parent;

            if (parent) parent.on(listeners);

            if (proxy && proxy.extraParams) proxy.extraParams.parentId  = parent ? parent.calendarId : null;

            this.clearCache();

            /**
             * @event parentchange
             *
             * @param {Gnt.data.Calendar} calendar The calendar which parent has changed
             * @param {Gnt.data.Calendar} newParent The new parent of this calendar (can be `null` if parent is being removed)
             * @param {Gnt.data.Calendar} oldParent The old parent of this calendar (can be `null` if there were no parent)
             */
            this.fireEvent('parentchange', this, parent, oldParent);
        }
    },

    isAvailabilityIntersected : function  (withCalendar, startDate, endDate) {
        var ownWeekDay, ownAvailability,
            testWeekDay, testAvailability;

        // first let's try to find overlapping of weeks (check daily intervals)
        // loop over week days
        for (var i = 0; i < 7; i++) {
            ownWeekDay      = this.getWeekDay(i) || this.getDefaultCalendarDay(i);
            testWeekDay     = withCalendar.getWeekDay(i) || withCalendar.getDefaultCalendarDay(i);

            if (!ownWeekDay || !testWeekDay) continue;

            // get daily intervals
            ownAvailability     = ownWeekDay.getAvailability();
            testAvailability    = testWeekDay.getAvailability();

            // loop over intervals to find overlapping
            for (var j = 0, l = ownAvailability.length; j < l; j++) {
                for (var k = 0, ll = testAvailability.length; k < ll; k++) {
                    if (testAvailability[k].startTime < ownAvailability[j].endTime && testAvailability[k].endTime > ownAvailability[j].startTime) {
                        return true;
                    }
                }
            }
        }

        var result = false;

        this.forEachNonStandardWeek(function (week) {
            if (week.startDate >= endDate) return false;

            if (startDate < week.endDate) {
                result      = true;
                // stop the iteration
                return false;
            }
        });

        return result;
    }

});
