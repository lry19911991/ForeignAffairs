/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Gnt.field.ConstraintDate', {

    extend              : 'Ext.form.field.Date',
    mixins              : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],
    alias               : 'widget.constraintdatefield',

    // This is required to properly handle the field's read only state as designated in task's isEditable() method
    taskField           : 'constraintDateField',

    constructor : function (config) {
        var me = this;

        me.setSuppressTaskUpdate(true);
        me.callParent([ config ]);
        me.setSuppressTaskUpdate(false);
    },

    destroy : function () {
        var me = this;

        me.destroyTaskListener();
        me.callParent();
    },

    initComponent : function() {
        var me = this;

        me.callParent(arguments);
        me.task && me.setTask(me.task);
    },

    // Called each time when new task is set or current task is updated
    onSetTask : function(task) {
        var me              = this,
            date            = task.getConstraintDate(),
            constraintClass = task.getConstraintClass(),
            format          = me.format || Ext.Date.defaultFormat;

        if (constraintClass) {
            me.setValue(constraintClass.getDisplayableConstraintDateForFormat(date, format, task));
        }
        else {
            me.setValue(date);
        }
    },

    setValue : function (value) {
        var me   = this,
            task = me.task;

        me.callParent([ value ]);

        if (!me.getSuppressTaskUpdate() && task && value) {
            me.applyChanges();
            task.fireEvent('taskupdated', task, me);
        }
    },

    onExpand : function() {
        var me = this,
            value = me.getValue();

        me.getPicker().setValue(Ext.isDate(value) ? value : new Date());
    },

    onSelect : function (picker, pickerDate) {
        // if we display the date with hours, then we (probably) want to keep the task constraint date's hour/minutes
        // after selecting the date from the picker. In the same time picker will clear the time portion
        // so we need to restore it from original date
        // see also: http://www.bryntum.com/forum/viewtopic.php?f=9&t=4294
        var me           = this,
            format       = me.format,
            task         = me.task,
            originalDate = task && task.getConstraintDate();

        if (originalDate && Ext.Date.formatContainsHourInfo(format)) {
            pickerDate.setHours(originalDate.getHours());
            pickerDate.setMinutes(originalDate.getMinutes());
            pickerDate.setSeconds(originalDate.getSeconds());
        }

        me.callParent([picker, pickerDate]);
    },

    applyChanges : function (task) {
        var me     = this,
            format = me.format || Ext.Date.defaultFormat,
            constraintClass,
            value;

        task            = task || me.task;
        constraintClass = task.getConstraintClass();
        value           = me.getValue();

        if (constraintClass && !Ext.isEmpty(value)) {
            value = constraintClass.adjustConstraintDateFromDisplayableWithFormat(value, format, task);
        }
        else if (Ext.isEmpty(value)) {
            value = null;
        }

        task.setConstraintDate(value);
    }
});
