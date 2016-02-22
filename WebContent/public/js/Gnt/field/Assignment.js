/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.field.Assignment
@extends Ext.form.field.Picker

A specialized field to be used for editing in the {@link Gnt.column.ResourceAssignment} column.

*/

Ext.define('Gnt.field.Assignment', {
    extend              : 'Ext.form.field.Picker',

    alias               : ['widget.assignmentfield', 'widget.assignmenteditor'],
    alternateClassName  : 'Gnt.widget.AssignmentField',

    requires            : ['Gnt.widget.AssignmentGrid'],

    mixins              : ['Gnt.mixin.Localizable'],

    matchFieldWidth     : false,
    editable            : false,
    task                : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - cancelText : 'Cancel',
            - closeText  : 'Save and Close'
     */

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore A store with assignments
     */
    assignmentStore     : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore A store with resources
     */
    resourceStore       : null,

    /**
     * @cfg {Object} gridConfig A custom config object used to configure the Gnt.widget.AssignmentGrid instance
     */
    gridConfig          : null,

    /**
     * @cfg {String} formatString A string defining how an assignment should be rendered. Defaults to '{0} [{1}%]'
     */
    formatString        : '{0} [{1}%]',

    /**
     * @cfg {Boolean} expandPickerOnFocus true to show the grid picker when this field receives focus.
     */
    expandPickerOnFocus : false,

    afterRender : function() {
        this.callParent(arguments);
        this.on('expand', this.onPickerExpand, this);

        if (this.expandPickerOnFocus) {
            this.on('focus', function() {
                this.expand();
            }, this, { delay : 1}); // Without delay, Ext JS messes up the positioning
        }
    },

    createPicker: function() {
        var grid = new Gnt.widget.AssignmentGrid(Ext.apply({
            frame       : true,
            floating    : true,

            height      : 200,
            width       : 300,

            resourceStore       : this.task.getResourceStore(),
            assignmentStore     : this.task.getAssignmentStore(),

            fbar                : this.buildButtons()
        }, this.gridConfig || {}));

        return grid;
    },


    buildButtons : function() {
        return [
            '->',
            {
                text        : this.L('closeText'),

                handler     : function () {
                    // when clicking on "close" button with editor visible
                    // grid will be destroyed right away and seems in IE there will be no
                    // "blur" event for editor
                    // this is also sporadically reproducable in FF
                    // doing a defer to let the editor to process the "blur" first (will take 1 + 10 ms delay)
                    // only then close the editor window
                    Ext.Function.defer(this.onSaveClick, Ext.isIE && !Ext.isIE9 ? 60 : 30, this);
                },
                scope       : this
            },
            {
                text        : this.L('cancelText'),

                handler     : function() {
                    this.collapse();
                },
                scope       : this
            }
        ];
    },

    setTask : function(task){
        this.task = task;
        this.setRawValue(this.getDisplayValue(task));
    },

    onPickerExpand: function() {
        // Select the assigned resource in the grid
        this.picker.loadTaskAssignments(this.task.getInternalId());
    },


    onSaveClick : function() {
        // Update the assignment store with the assigned resource data
        var sm = this.picker.getSelectionModel(),
            selections = sm.selected;

        this.collapse();

        this.fireEvent('select', this, selections);

        this.picker.saveTaskAssignments();
    },

    isDirty : function (task) {
        task            = task || this.task;
        if (!task) return false;

        var assignmentStore = this.picker && this.picker.assignmentStore || task.getAssignmentStore(),
            assignments     = task.getAssignments();

        // check if some of task assignments are dirty
        for (var i = 0, l = assignments.length; i < l; i++) {
            if (assignments[i].dirty || assignments[i].phantom) return true;
        }

        if (assignmentStore) {
            assignments = assignmentStore.getRemovedRecords();
            // check if there are some unsaved assignments removed from the task
            for (i = 0, l = assignments.length; i < l; i++) {
                if (assignments[i].getTaskId() == task.getInternalId()) return true;
            }
        }

        return false;
    },

    getDisplayValue : function(task) {
        task = task || this.task;

        var names               = [],
            assignments         = task.getAssignments();

        for (var i = 0, l = assignments.length; i < l; i++) {
            var assignment  = assignments[i];

            if (assignment.getUnits() > 0) {
                names.push(Ext.String.format(this.formatString, assignment.getResourceName(), assignment.getUnits()));
            }
        }
        return names.join(', ');
    }
});
