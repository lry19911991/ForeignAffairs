/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Gnt.constraint.MustFinishOn', {
    extend      : 'Gnt.constraint.Base',

    alias       : 'gntconstraint.mustfinishon',

    singleton   : true,

    requires    : ['Sch.util.Date'],

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *      - "name" : "Must finish on",
     *      - "Move the task to finish on {0}" : "Move the task to finish on {0}"
     */
    l10n : {
        "name" : "Must finish on",
        "Move the task to finish on {0}" : "Move the task to finish on {0}"
    },


    isSatisfied : function (task, date, precision) {
        var endDate = task.getEndDate();

        date = date || task.getConstraintDate();

        // read the following as: !date || !endDate || (endDate.valueOf() == date.valueOf())
        return !date || !endDate || (Sch.util.Date.compareWithPrecision(endDate, date, precision) === 0);
    },


    getResolutionOptions : function (callback, task, date, precision) {
        var me          = this,
            resolutions = [];

        date = date || task.getConstraintDate();

        me.hasThisConstraintApplied(task) && resolutions.push({
            id      : 'remove-constraint',
            title   : me.L("Remove the constraint"),
            resolve : function () {
                task.setConstraintType('');
                callback();
            }
        });

        resolutions.push({
            id      : 'move-task',
            title   : me.L("Move the task to finish on {0}"),
            resolve : function () {
                task.setEndDateWithoutPropagation(date, true);
                callback();
            }
        });

        return resolutions;
    },


    getInitialConstraintDate : function(task) {
        return task.getEndDate();
    },


    getDisplayableConstraintDateForFormat : function(date, format, task) {
        if (date && !Ext.Date.formatContainsHourInfo(format) && (date - Ext.Date.clearTime(date, true) === 0)) {
            date = Sch.util.Date.add(date, Sch.util.Date.DAY, -1);
        }
        return date;
    },


    adjustConstraintDateFromDisplayableWithFormat : function(date, format, task) {
        if (date && !Ext.Date.formatContainsHourInfo(format) && (date - Ext.Date.clearTime(date, true) === 0)) {
            date = Sch.util.Date.add(date, Sch.util.Date.DAY, 1);
        }
        return date;
    }
});
