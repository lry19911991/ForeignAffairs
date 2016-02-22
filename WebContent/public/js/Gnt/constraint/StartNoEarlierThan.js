/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Gnt.constraint.StartNoEarlierThan', {
    extend      : 'Gnt.constraint.Base',

    alias       : 'gntconstraint.startnoearlierthan',

    singleton   : true,

    requires    : ['Sch.util.Date'],

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *      - "name" : "Start no earlier than",
     *      - "Move the task to start at {0}" : "Move the task to start at {0}"
     */
    l10n : {
        "name" : "Start no earlier than",
        "Move the task to start at {0}" : "Move the task to start at {0}"
    },


    isSatisfied : function (task, date, precision) {
        var startDate = task.getStartDate();

        date = date || task.getConstraintDate();

        // read the followinig as: !date || !startDate || (startDate >= date)
        return !date || !startDate || (Sch.util.Date.compareWithPrecision(startDate, date, precision) !== -1);
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
            title   : me.L("Move the task to start at {0}"),
            resolve : function () {
                task.setStartDateWithoutPropagation(date, true);
                callback();
            }
        });

        return resolutions;
    },


    getInitialConstraintDate : function(task) {
        return task.getStartDate();
    }
});
