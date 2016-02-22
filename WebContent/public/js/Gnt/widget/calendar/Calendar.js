/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.widget.calendar.Calendar
@extends Ext.form.Panel
@aside guide gantt_calendars

{@img gantt/images/calendar.png}

This widget can be used to edit the calendar content. As the input it should receive an instance of the {@link Gnt.data.Calendar} class.
Once the editing is done and user is happy with the result the {@link #applyChanges} method should be called. It will apply
all the changes user made in UI to the calendar.

Note, this widget does not have the "Ok", "Apply changes" etc button intentionally, as you might want to combine it with your widgets.
See {@link Gnt.widget.calendar.CalendarWindow} for this widget embedded in the Ext.window.Window instance.


*/
Ext.define('Gnt.widget.calendar.Calendar', {
    extend                      : 'Ext.form.Panel',

    requires                    : [
        'Ext.XTemplate',
        'Ext.data.Store',
        'Ext.grid.Panel',
        'Ext.grid.plugin.CellEditing',
        'Gnt.data.Calendar',
        'Gnt.model.CalendarDay',
        'Gnt.model.Week',
        'Gnt.widget.calendar.DayEditor',
        'Gnt.widget.calendar.WeekEditor',
        'Gnt.widget.calendar.DatePicker'
    ],

    mixins                      : ['Gnt.mixin.Localizable'],

    alias                       : 'widget.calendar',

    defaults                    : { padding: 10, border: false },

    /**
     * @cfg {String} workingDayCls class will be applied to all working days at legend block and datepicker
     */
    workingDayCls               : 'gnt-datepicker-workingday',

    /**
     * @cfg {string} nonWorkingDayCls class will be applied to all non-working days at legend block and datepicker
     */
    nonWorkingDayCls            : 'gnt-datepicker-nonworkingday',

    /**
     * @cfg {String} overriddenDayCls class will be applied to all overridden days at legend block and datepicker
     */
    overriddenDayCls            : 'gnt-datepicker-overriddenday',

    /**
     * @cfg {String} overriddenWeekDayCls class will be applied to all overridden days inside overridden week at legend block and date picker
     */
    overriddenWeekDayCls        : 'gnt-datepicker-overriddenweekday',

    /**
     * @cfg {Gnt.data.Calendar} calendar An instance of the {@link Gnt.data.Calendar} to read/change the holidays from/in.
     */
    calendar                    : null,
    
    calendarManager             : null,
    
    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

        - dayOverrideNameHeaderText : 'Name',
        - overrideName        : 'Name',
        - startDate           : 'Start Date',
        - endDate             : 'End Date',
        - error               : 'Error',
        - dateText            : 'Date',
        - addText             : 'Add',
        - editText            : 'Edit',
        - removeText          : 'Remove',
        - workingDayText      : 'Working day',
        - weekendsText        : 'Weekends',
        - overriddenDayText   : 'Overridden day',
        - overriddenWeekText  : 'Overridden week',
        - workingTimeText     : 'Working time',
        - nonworkingTimeText  : 'Non-working time',
        - dayOverridesText    : 'Day overrides',
        - weekOverridesText   : 'Week overrides',
        - okText              : 'OK',
        - cancelText          : 'Cancel',
        - parentCalendarText  : 'Parent calendar',
        - noParentText        : 'No parent',
        - selectParentText    : 'Select parent',
        - newDayName          : '[Without name]',
        - calendarNameText    : 'Calendar name',
        - tplTexts            : {
            - tplWorkingHours : 'Working hours for',
            - tplIsNonWorking : 'is non-working',
            - tplOverride     : 'override',
            - tplInCalendar   : 'in calendar',
            - tplDayInCalendar: 'standard day in calendar'
        },
        - overrideErrorText   : 'There is already an override for this day',
        - overrideDateError   : 'There is already week override on this date: {0}',
        - startAfterEndError  : 'Start date should be less than end date',
        - weeksIntersectError : 'Week overrides should not intersect'
     */

    /**
     * @cfg {Object} dayGridConfig A custom config object to use when configuring the Gnt.widget.calendar.DayGrid instance.
     */
    dayGridConfig               : null,

    /**
     * @cfg {Object} weekGridConfig A custom config object to use when configuring the Gnt.widget.calendar.WeekGrid instance.
     */
    weekGridConfig              : null,

    /**
     * @cfg {Object} datePickerConfig A custom config object to use when configuring the Gnt.widget.calendar.DatePicker instance.
     */
    datePickerConfig            : null,

    /**
     * @cfg {String} overrideErrorText Text for error shown when an attempt to override
     * an already overridden day is being made.
     */

    dayGrid                     : null,
    weekGrid                    : null,
    datePicker                  : null,

    legendTpl                   : '<ul class="gnt-calendar-legend">' +
            '<li class="gnt-calendar-legend-item">' +
                '<div class="gnt-calendar-legend-itemstyle {workingDayCls}"></div>' +
                '<span class="gnt-calendar-legend-itemname">{workingDayText}</span>' +
                '<div style="clear: both"></div>' +
            '</li>' +
            '<li>' +
                '<div class="gnt-calendar-legend-itemstyle {nonWorkingDayCls}"></div>' +
                '<span class="gnt-calendar-legend-itemname">{weekendsText}</span>' +
                '<div style="clear: both"></div>' +
            '</li>' +
            '<li class="gnt-calendar-legend-override">' +
                '<div class="gnt-calendar-legend-itemstyle {overriddenDayCls}">31</div>' +
                '<span class="gnt-calendar-legend-itemname">{overriddenDayText}</span>' +
                '<div style="clear: both"></div>' +
            '</li>' +
            '<li class="gnt-calendar-legend-override">' +
                '<div class="gnt-calendar-legend-itemstyle {overriddenWeekDayCls}">31</div>' +
                '<span class="gnt-calendar-legend-itemname">{overriddenWeekText}</span>' +
                '<div style="clear: both"></div>' +
            '</li>' +
        '</ul>',

    dateInfoTpl                 : null,

    dayOverridesCalendar        : null,
    weekOverridesStore          : null,

    copiesIndexByOriginalId     : null,
    
    // reference to a window with day override editor used only in tests for now
    currentDayOverrideEditor    : null,
    

    getDayGrid : function() {
        if (!this.dayGrid) {
            var calendarDayModel        = this.calendar.model.prototype;

            // create day overrides grid
            this.dayGrid = new Ext.grid.Panel(Ext.apply({
                title       : this.L('dayOverridesText'),
                tbar        : [
                    { text: this.L('addText'), itemId: 'btnAdd', action: 'add', iconCls: 'gnt-action-add', handler: this.addDay, scope: this },
                    { text: this.L('editText'), itemId: 'btnEdit', action: 'edit', iconCls: 'gnt-action-edit', handler: this.editDay, scope: this },
                    { text: this.L('removeText'), itemId: 'btnRemove', action: 'remove', iconCls: 'gnt-action-remove', handler: this.removeDay, scope: this }
                ],
                store       : new Gnt.data.Calendar(),
                plugins     : [ new Ext.grid.plugin.CellEditing({ clicksToEdit : 2 }) ],
                columns     : [
                    {
                        header      : this.L('dayOverrideNameHeaderText'),
                        dataIndex   : calendarDayModel.nameField,
                        flex        : 1,
                        editor      : { allowBlank : false }
                    },
                    {
                        header      : this.L('dateText'),
                        dataIndex   : calendarDayModel.dateField,
                        width       : 100,
                        xtype       : 'datecolumn',
                        editor      : { xtype : 'datefield' }
                    }
                ]
            }, this.dayGridConfig || {}));
            
            this.dayOverridesCalendar   = this.dayGrid.store;
        }

        return this.dayGrid;
    },
    
    updateGrids: function(){
        if (this.dayGrid && this.weekGrid){
            
            this.dayGrid.reconfigure(Ext.create('Gnt.data.Calendar'));
            this.fillDaysStore();
            
            this.weekGrid.reconfigure(Ext.create('Gnt.data.Calendar'));
            this.fillWeeksStore();
        }
    },


    getWeekGrid : function() {
        if (!this.weekGrid) {
            // create week overrides grid
            this.weekGrid = new Ext.grid.Panel(Ext.apply({
                title       : this.L('weekOverridesText'),
                border      : true,

                plugins     : [ new Ext.grid.plugin.CellEditing({ clicksToEdit : 2 }) ],

                store       : new Ext.data.Store({
                    model       : 'Gnt.model.Week'
                    //fields      : [ 'name', 'startDate', 'endDate', 'weekAvailability', 'mainDay' ]
                }),

                tbar        : [
                    { text: this.L('addText'), itemId: 'btnAdd', action: 'add', iconCls: 'gnt-action-add', handler: this.addWeek, scope: this },
                    { text: this.L('editText'), itemId: 'btnEdit', action: 'edit', iconCls: 'gnt-action-edit', handler: this.editWeek, scope: this },
                    { text: this.L('removeText'), itemId: 'btnRemove', action: 'remove', iconCls: 'gnt-action-remove', handler: this.removeWeek, scope: this }
                ],

                columns     : [
                    {
                        header      : this.L('overrideName'),
                        dataIndex   : 'name',
                        flex        : 1,
                        editor      : { allowBlank : false }
                    },
                    {
                        xtype       : 'datecolumn',
                        header      : this.L('startDate'),
                        dataIndex   : 'startDate',
                        width       : 100,
                        editor      : { xtype : 'datefield' }
                    },
                    {
                        xtype       : 'datecolumn',
                        header      : this.L('endDate'),
                        dataIndex   : 'endDate',
                        width       : 100,
                        editor      : { xtype : 'datefield' }
                    }
                ]

            }, this.weekGridConfig || {}));

            this.weekOverridesStore     = this.weekGrid.store;
        }

        return this.weekGrid;
    },


    getDatePicker : function() {
        if (!this.datePicker) {
            this.datePicker = new Gnt.widget.calendar.DatePicker(Ext.apply({
                dayOverridesCalendar    : this.getDayGrid().store,
                weekOverridesStore      : this.getWeekGrid().store
            }, this.datePickerConfig));
        }

        return this.datePicker;
    },
    
    
    onCalendarSet: function (calendar) {
        // data is an array of objects and store is considered as containing a modified records
        this.weekOverridesStore.commitChanges();
    },


    initComponent : function() {
        var me = this;
        
        me.on('calendarset', me.onCalendarSet);
        me.on('afterrender', me.onCalendarSet);
        
        me.copiesIndexByOriginalId        = {};

        me.setupTemplates();

        var calendar        = this.calendar;

        if (!calendar) {
            Ext.Error.raise('Required attribute "calendar" is missed during initialization of `Gnt.widget.Calendar`');
        }
        
        this.mon(this.calendar, {
            load    : this.onCalendarChange,
            add     : this.onCalendarChange,
            remove  : this.onCalendarChange,
            update  : this.onCalendarChange,
            scope   : this
        });

        var weekGrid        = this.getWeekGrid(),
            dayGrid         = this.getDayGrid(),
            datePicker      = this.getDatePicker();

        dayGrid.on({
            selectionchange : this.onDayGridSelectionChange,
            validateedit    : this.onDayGridValidateEdit,
            edit            : this.onDayGridEdit,
            scope           : this
        });

        dayGrid.store.on({
            update          : this.refreshView,
            remove          : this.refreshView,
            add             : this.refreshView,
            scope           : this
        });

        weekGrid.on({
            selectionchange : this.onWeekGridSelectionChange,
            validateedit    : this.onWeekGridValidateEdit,
            edit            : this.onWeekGridEdit,
            scope           : this
        });

        weekGrid.store.on({
            update          : this.refreshView,
            remove          : this.refreshView,
            add             : this.refreshView,
            scope           : this
        });

        datePicker.on({
            select          : this.onDateSelect,
            scope           : this
        });

        this.fillDaysStore();
        this.fillWeeksStore();

        this.dateInfoPanel = new Ext.Panel({
            cls             : 'gnt-calendar-dateinfo',
            columnWidth     : 0.33,
            border          : false,
            height          : 200
        });
        
        this.items = [
            {
                xtype       : 'container',
                layout      : 'hbox',
                pack        : 'start',
                align       : 'stretch',
                items       : [
                    {
                        xtype           : 'textfield',
                        itemId          : 'calendarName',
                        fieldLabel      : this.L('calendarNameText'),
                        margin          : '0 10 0 0',
                        value           : calendar.name,
                        flex            : 1
                    },
                    this.cmbParentCalendar = Ext.create('Ext.form.field.ComboBox', {
                        xtype           : 'combobox',
                        name            : 'cmb_parentCalendar',
                        fieldLabel      : this.L('parentCalendarText'),

                        store           : new Ext.data.Store({
                            fields  : [ 'Id', 'Name' ],
                            data    : [ { Id : -1, Name : this.L('noParentText') } ].concat(calendar.getParentableCalendars())
                        }),

                        queryMode       : 'local',
                        displayField    : 'Name',
                        valueField      : 'Id',

                        editable        : false,
                        emptyText       : this.L('selectParentText'),

                        value           : calendar.parent ? calendar.parent.calendarId : -1,
                        flex            : 1
                    })
                ]
            },
            {
                layout      : 'column',
                defaults    : { border : false },
                items       : [
                    {
                        margin          : '0 15px 0 0',
                        columnWidth     : 0.3,
                        html            : this.legendTpl.apply({
                            workingDayText          : this.L('workingDayText'),
                            weekendsText            : this.L('weekendsText'),
                            overriddenDayText       : this.L('overriddenDayText'),
                            overriddenWeekText      : this.L('overriddenWeekText'),
                            workingDayCls           : this.workingDayCls,
                            nonWorkingDayCls        : this.nonWorkingDayCls,
                            overriddenDayCls        : this.overriddenDayCls,
                            overriddenWeekDayCls    : this.overriddenWeekDayCls
                        })
                    },
                    {
                        columnWidth     : 0.37,
                        margin          : '0 5px 0 0',
                        items           : [ datePicker ]
                    },
                    this.dateInfoPanel
                ]
            },
            {
                xtype       : 'tabpanel',
                height      : 220,
                items       : [ dayGrid, weekGrid ]
            }
        ];

        this.callParent(arguments);
    },
    
    setCalendar: function (calendar){
        if (this.calendar){
            this.mun(this.calendar, {
                load    : this.onCalendarChange,
                add     : this.onCalendarChange,
                remove  : this.onCalendarChange,
                update  : this.onCalendarChange,
                scope   : this
            });    
        }
        
        this.calendar = calendar;
        
        this.mon(this.calendar, {
            load    : this.onCalendarChange,
            add     : this.onCalendarChange,
            remove  : this.onCalendarChange,
            update  : this.onCalendarChange,
            scope   : this
        });
        
        this.updateComboBox();
        this.fillDaysStore();
        this.fillWeeksStore();
        this.refreshView();
        this.fireEvent('calendarset', calendar);
    },
    
    updateComboBox: function() {
        var me = this,
            stores = [];
            
        if (this.calendarManager){
            var root = this.calendarManager.getRootNode();
        
            root.cascadeBy(function(item){
                if (item != root && item.calendar.calendarId != me.calendar.calendarId){
                    stores.push({Id: item.calendar.calendarId, Name: item.getName() || item.calendar.calendarId});
                }
            });
        } else {
            Ext.each(Gnt.data.Calendar.getAllCalendars(), function(item){
                if (item.calendarId != me.calendar.calendarId){
                    stores.push({Id: item.calendarId, Name: item.name || item.calendarId});
                }
            });
        }
        
        var store = Ext.create('Ext.data.Store', {
            fields  : [ 'Id', 'Name' ],
            data    : [ { Id : -1, Name : this.L('noParentText') } ].concat(stores)
        });

        this.cmbParentCalendar.bindStore(store);
        
        this.cmbParentCalendar.setValue(this.calendar.parent == null ? -1 :this.calendar.parent.calendarId);
        // HACK: this ie IE10+ setting value to combo will open dropdown list 
        // http://www.sencha.com/forum/showthread.php?296468
        Ext.isIE10p && this.cmbParentCalendar.doQueryTask.cancel();
    },

    onCalendarChange : function() {
        this.fillDaysStore();
        this.fillWeeksStore();
        this.refreshView();
    },

    setupTemplates : function () {
        var tplTexts    = this.L('tplTexts');

        this.dateInfoTpl = this.dateInfoTpl || Ext.String.format(
            '<div class="gnt-calendar-overridedate">' +
                '<tpl if="isWorkingDay">' + tplTexts.tplWorkingHours + ' {date}:<tpl else>{date} ' + tplTexts.tplIsNonWorking + '</tpl>' +
            '</div>' +
            '<ul class="gnt-calendar-availabilities">' +
                '<tpl for="availability">' +
                    '<li>{.}</li>' +
                '</tpl>' +
            '</ul>' +
            '<span class="gnt-calendar-overridesource">' + tplTexts.tplBasedOn +': ' +
                '<tpl if="override">' + tplTexts.tplOverride + ' "{name}" ' + tplTexts.tplInCalendar + ' "{calendarName}"<tpl else>' + tplTexts.tplDayInCalendar + ' "{calendarName}"</tpl>' +
            '</span>'
        );

        if (!(this.dateInfoTpl instanceof Ext.Template))    this.dateInfoTpl    = new Ext.XTemplate(this.dateInfoTpl);
        if (!(this.legendTpl instanceof Ext.Template))      this.legendTpl      = new Ext.XTemplate(this.legendTpl);
    },

    afterRender : function() {
        this.callParent(arguments);

        this.onDateSelect(this.getDatePicker(), new Date());
    },


    fillDaysStore : function() {
        // only filter days with type "DAY" that has "Date" set
        var dataTemp        = Gnt.util.Data.cloneModelSet(this.calendar, function (calendarDay) {
            return (calendarDay.getType() == 'DAY' && calendarDay.getDate());
        });

        this.dayOverridesCalendar.loadData(dataTemp);
    },


    copyCalendarDay : function (calendarDay) {
        var copy            = calendarDay.copy(null);

        copy.__COPYOF__     = calendarDay.getId();

        this.copiesIndexByOriginalId[ calendarDay.getId() ]   = copy.getId();

        return copy;
    },


    fillWeeksStore : function () {
        var me              = this;
        var data            = [];

        this.calendar.forEachNonStandardWeek(function (nonStandardWeek) {
            var week                = Ext.apply({}, nonStandardWeek);

            week.weekAvailability   = Ext.Array.map(week.weekAvailability, function (day) {
                return day && me.copyCalendarDay(day) || null;
            });

            week.mainDay            = me.copyCalendarDay(week.mainDay);

            data.push(week);
        });

        this.weekOverridesStore.loadData(data);
    },


    addDay : function(){
        var date        = this.getDatePicker().getValue();
        // do not allow duplicate day overrides
        if (this.dayOverridesCalendar.getOwnCalendarDay(date)) {
            this.alert({ msg : this.L('overrideErrorText') });
            return;
        }

        var newDay      = new this.calendar.model ({
            Name            : this.L('newDayName'),
            Type            : 'DAY',
            Date            : date,
            IsWorkingDay    : false
        });

        //this.dayOverridesCalendar.insert(0, newDay);
        this.getDayGrid().getStore().insert(0, newDay);
        this.getDayGrid().getSelectionModel().select([ newDay ], false, false);
    },


    editDay : function(){
        var me          = this,
            selection   = this.getDayGrid().getSelectionModel().getSelection();

        if (selection.length === 0) return;

        var day         = selection[ 0 ];

        var editor      = this.currentDayOverrideEditor = new Gnt.widget.calendar.DayEditor({
            addText             : this.L('addText'),
            removeText          : this.L('removeText'),
            workingTimeText     : this.L('workingTimeText'),
            nonworkingTimeText  : this.L('nonworkingTimeText'),

            calendarDay         : day
        });

        var editorWindow      = Ext.create('Ext.window.Window', {
            title           : this.L('dayOverridesText'),
            modal           : true,

            width           : 280,
            height          : 260,

            layout          : 'fit',
            items           : editor,

            buttons         : [
                {
                    text        : this.L('okText'),
                    handler     : function () {
                        if (editor.isValid()) {
                            var calendarDay = editor.calendarDay;

                            calendarDay.setIsWorkingDay(editor.isWorkingDay());
                            calendarDay.setAvailability(editor.getIntervals());

                            me.applyCalendarDay(calendarDay, day);

                            me.refreshView();

                            editorWindow.close();
                        }
                    }
                },
                {
                    text        : this.L('cancelText'),
                    handler     : function () {
                        editorWindow.close();
                    }
                }
            ]
        });

        editorWindow.show();
    },


    removeDay : function () {
        var grid        = this.getDayGrid(),
            selection   = grid.getSelectionModel().getSelection();

        if (!selection.length) return;

        grid.getStore().remove(selection[0]);

        this.refreshView();
    },


    refreshView : function () {
        var date        = this.getDatePicker().getValue(),
            day         = this.getCalendarDay(date),
            weekGrid    = this.getWeekGrid(),
            dayGrid     = this.getDayGrid(),
            dayOverride = this.dayOverridesCalendar.getOwnCalendarDay(date),
            weekOverride;

        var name;

        // First check if there is an override on day level
        if (dayOverride) {
            dayGrid.getSelectionModel().select([ dayOverride ], false, true);
            name        = dayOverride.getName();
        } else {
            // Now check if there is an override on week level
            weekOverride = this.getWeekOverrideByDate(date);
            if (weekOverride) {
                weekGrid.getSelectionModel().select([ weekOverride ], false, true);
                name    = weekOverride.get('name');
            }
        }

        var dayData = {
            name            : name || day.getName(),
            date            : Ext.Date.format(date, 'M j, Y'),
            calendarName    : this.calendar.name || this.calendar.calendarId,
            availability    : day.getAvailability(true),
            override        : Boolean(dayOverride || weekOverride),
            isWorkingDay    : day.getIsWorkingDay()
        };

        this.dateInfoPanel.update(this.dateInfoTpl.apply(dayData));
        
        this.down('#calendarName').setValue(this.calendar.name);

        this.datePicker.refreshCssClasses();
    },


    onDayGridSelectionChange : function (selection) {
        if (selection.getSelection().length === 0) return;

        var day     = selection.getSelection()[ 0 ];

        this.getDatePicker().setValue(day.getDate());
        this.refreshView();
    },


    onDayGridEdit : function (editor, context){
        if (context.field === 'Date') {
            context.grid.getStore().clearCache();
            this.getDatePicker().setValue(context.value);
        }

        this.refreshView();
    },


    onDayGridValidateEdit : function (editor, context){
        var calendar = this.getDayGrid().store;

        if (context.field === calendar.model.prototype.dateField && calendar.getOwnCalendarDay(context.value) && context.value !== context.originalValue) {
            this.alert({ msg : this.L('overrideErrorText') });
            return false;
        }
    },


    onDateSelect : function (picker, date) {
        this.refreshView();
    },


    getCalendarDay: function (date) {
        var day     = this.dayOverridesCalendar.getOwnCalendarDay(date);

        if (day) return day;

        day         = this.getWeekOverrideDay(date);

        if (day) return day;

        return this.calendar.weekAvailability[ date.getDay() ] || this.calendar.defaultWeekAvailability[ date.getDay() ];
    },


    getWeekOverrideDay : function (date) {
        var dateTime            = new Date(date),
            internalWeekModel   = this.getWeekOverrideByDate(date),
            index               = dateTime.getDay();

        if (internalWeekModel == null) return null;

        var weekAvailability = internalWeekModel.get('weekAvailability');

        if (!weekAvailability) return null;

        return weekAvailability[ index ];
    },


    getWeekOverrideByDate: function(date) {
        var week = null;

        this.weekOverridesStore.each(function (internalWeekModel) {
            if (Ext.Date.between(date, internalWeekModel.get('startDate'), internalWeekModel.get('endDate'))) {
                week = internalWeekModel;
                return false;
            }
        });

        return week;
    },


    intersectsWithCurrentWeeks : function (startDate, endDate, except) {
        var result                          = false;

        this.weekOverridesStore.each(function (internalWeekModel) {
            if (internalWeekModel == except) return;

            var weekStartDate       = internalWeekModel.get('startDate');
            var weekEndDate         = internalWeekModel.get('endDate');

            if (weekStartDate <= startDate && startDate < weekEndDate || weekStartDate < endDate && endDate <= weekEndDate) {
                result      = true;

                // stop the iteration
                return false;
            }
        });

        return result;
    },


    addWeek : function () {
        var weekOverridesStore      = this.weekOverridesStore;
        var startDate               = this.getDatePicker().getValue();
        var endDate;

        // we are about to create a week override and we need to make sure it does not
        // intersect with already created week overrides. Also we'd like to make it 1w long initially
        // but in case there will be an intersection with current overrides we are ok to shorten it
        for (var duration = 7; duration > 0; duration--) {
            endDate     = Sch.util.Date.add(startDate, Sch.util.Date.DAY, duration);

            if (!this.intersectsWithCurrentWeeks(startDate, endDate)) break;
        }

        if (!duration) {
            this.alert({ msg : Ext.String.format(this.L('overrideDateError'), Ext.Date.format(startDate, 'Y/m/d')) });
            return;
        }

        var mainDay     = new this.calendar.model();

        mainDay.setType('WEEKDAYOVERRIDE');
        mainDay.setName(this.L('newDayName'));
        mainDay.setOverrideStartDate(startDate);
        mainDay.setOverrideEndDate(endDate);
        mainDay.setWeekday(-1);

        var newWeek                 = weekOverridesStore.insert(0, {
            name                : this.L('newDayName'),
            startDate           : startDate,
            endDate             : endDate,

            weekAvailability    : [],
            mainDay             : mainDay
        })[ 0 ];

        this.getWeekGrid().getSelectionModel().select([ newWeek ], false, false);
    },


    editWeek : function(){
        var selection   = this.getWeekGrid().getSelectionModel().getSelection(),
            me          = this;

        if (selection.length === 0) return;

        var weekModel   = selection[ 0 ];

        var editor      = new Gnt.widget.calendar.WeekEditor({
            startDate                   : weekModel.get('startDate'),
            endDate                     : weekModel.get('endDate'),
            weekName                    : weekModel.get('name'),
            calendarDayModel            : this.calendar.model,
            // keep the "weekModel" private and pass individual fields to the editor
            weekAvailability            : weekModel.get('weekAvailability'),
            calendarWeekAvailability    : this.calendar.weekAvailability,
            defaultWeekAvailability     : this.calendar.defaultWeekAvailability
        });

        var editorWindow    = Ext.create('Ext.window.Window', {
            title       : this.L('weekOverridesText'),
            modal       : true,
            width       : 370,
            defaults    : { border : false },

            layout      : 'fit',
            items       : editor,

            buttons     : [
                {
                    // this property will be used in test to locate the button
                    action      : 'ok',

                    text        : this.L('okText'),
                    handler     : function () {
                        if (editor.applyChanges(weekModel.get('weekAvailability'))) {
                            me.refreshView();
                            editorWindow.close();
                        }
                    }
                },
                {
                    text        : this.L('cancelText'),
                    handler     : function() {
                        editorWindow.close();
                    }
                }
            ]
        });

        editorWindow.show();
    },


    removeWeek: function () {
        var selection   = this.getWeekGrid().getSelectionModel().getSelection(),
            me          = this;

        if (selection.length === 0) return;

        this.weekOverridesStore.remove(selection[ 0 ]);

        this.refreshView();
    },


    onWeekGridSelectionChange : function (selModel){
        var selection       = selModel.getSelection();

        if (selection.length === 0) return;

        this.getDatePicker().setValue(selection[ 0 ].get('startDate'));
    },


    onWeekGridEdit : function (editor, context){
        var weekModel       = context.record,
            startDate       = weekModel.get('startDate'),
            endDate         = weekModel.get('endDate');

        if (context.field == 'startDate' || context.field == 'endDate') {
            Ext.Array.each(weekModel.get('weekAvailability').concat(weekModel.get('mainDay')), function (weekDay) {
                if (weekDay) {
                    weekDay.setOverrideStartDate(startDate);
                    weekDay.setOverrideEndDate(endDate);
                }
            });

            this.getDatePicker().setValue(startDate);
        }

//        if (context.field == 'name') {
//            weekModel.setName(weekModel.getName());
//            Ext.Array.each(weekModel.get('weekAvailability').concat(weekModel.get('mainDay')), function (weekDay) {
//                if (weekDay) {
//                    weekDay.setName(weekModel.get('name'));
//                }
//            });
//        }

        this.refreshView();
    },

    alert : function (config) {
        config = config || {};

        Ext.MessageBox.show(Ext.applyIf(config, {
            title       : this.L('error'),
            icon        : Ext.MessageBox.WARNING,
            buttons     : Ext.MessageBox.OK
        }));
    },

    onWeekGridValidateEdit : function (editor, context) {
        var weekModel            = context.record,
            startDate            = context.field == 'startDate' ? context.value : weekModel.get('startDate'),
            endDate              = context.field == 'endDate' ? context.value : weekModel.get('endDate');

        if (startDate > endDate) {
            this.alert({ msg : this.L('startAfterEndError') });
            return false;
        }

        if (this.intersectsWithCurrentWeeks(startDate, endDate, weekModel)) {
            this.alert({ msg : this.L('weeksIntersectError') });
            return false;
        }
    },


    applyCalendarDay : function (from, to){
        to.beginEdit();

        to.setName(from.getName());
        to.setIsWorkingDay(from.getIsWorkingDay());
        to.setDate(from.getDate());
        to.setOverrideStartDate(from.getOverrideStartDate());
        to.setOverrideEndDate(from.getOverrideEndDate());

        var fromAvailability    = from.getAvailability(true);
        var toAvailability      = to.getAvailability(true);

        if (fromAvailability + '' != toAvailability + '') to.setAvailability(from.getAvailability());

        to.endEdit();
    },


    applySingleDay : function (copyDay, toAdd) {
        if (copyDay.__COPYOF__)
            this.applyCalendarDay(copyDay, this.calendar.getByInternalId(copyDay.__COPYOF__));
        else {
            if (copyDay.joined) {
                copyDay.unjoin(copyDay.joined[ 0 ]);
            }
            toAdd.push(copyDay);
        }
    },


    /**
     * Call this method when user is satisfied with the current state of the calendar in the UI. It will apply all the changes made in the UI
     * to the original calendar.
     *
     */
    applyChanges : function () {
        var me              = this;
        var calendar        = this.calendar;
        var parent          = this.down('combobox[name="cmb_parentCalendar"]').getValue(),
            newName         = this.down('#calendarName').getValue();
            
        if (this.calendarManager){
            var node = this.calendarManager.getNodeById(calendar.calendarId);
            if (node) {
                node.setName(newName);
            }
        }

        calendar.suspendEvents(true);
        calendar.suspendCacheUpdate++;
        
        calendar.name = newName;

        calendar.setParent(parent ? Gnt.data.Calendar.getCalendar(parent) : null);

        if (calendar.proxy.extraParams) {
            calendar.proxy.extraParams.calendarId   = calendar.calendarId;
        }

        // days part
        Gnt.util.Data.applyCloneChanges(this.dayOverridesCalendar, calendar);

        var daysToAdd               = [];
        var daysToRemove            = [];
        var remainingWeekDays       = {};

        // weeks part
        this.weekOverridesStore.each(function (weekModel) {
            Ext.Array.each(weekModel.get('weekAvailability').concat(weekModel.get('mainDay')), function (weekDay) {
                if (weekDay) {
                    if (weekDay.__COPYOF__) remainingWeekDays[ weekDay.__COPYOF__ ] = true;

                    me.applySingleDay(weekDay, daysToAdd);
                }
            });
        });

        calendar.forEachNonStandardWeek(function (originalWeek) {
            Ext.Array.each(originalWeek.weekAvailability.concat(originalWeek.mainDay), function (originalWeekDay) {
                if (originalWeekDay && !remainingWeekDays[ originalWeekDay.getId() ]) daysToRemove.push(originalWeekDay);
            });
        });

        calendar.add(daysToAdd);
        calendar.remove(daysToRemove);

        calendar.suspendCacheUpdate--;
        calendar.clearCache();
        
        calendar.resumeEvents();
        this.fireEvent('calendarset', calendar);
    },
    
    checkChanges    : function () {
        var dayChanges      = this.dayOverridesCalendar.getModifiedRecords().length > 0 || this.dayOverridesCalendar.getRemovedRecords().length > 0,
            weekChanges     = this.weekOverridesStore.getModifiedRecords().length > 0 || this.weekOverridesStore.getRemovedRecords().length > 0,
            // isDirty on field wouldn't work correct, so we are going to check it differently
            nameChanged     = this.down('#calendarName').getValue() != this.calendar.name,
            parentId        = this.calendar.parent == null ? -1 : this.calendar.parent.calendarId,
            parentChanged   = this.cmbParentCalendar.getValue() != parentId;
        
        return dayChanges || weekChanges || nameChanged || parentChanged;
    }
});
