/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.widget.taskeditor.TaskForm
@extends Ext.form.Panel

{@img gantt/images/taskeditor-form.png}

This form is used to edit the task properties.
By default it supports editing of the following fields:

 - the name of the task (task title)
 - the start date of the task
 - the end date of the task
 - the task duration
 - the task effort
 - the current status of a task, expressed as the percentage completed
 - the baseline start date of the task (editing of this field is optional)
 - the baseline end date of the task (editing of this field is optional)
 - the baseline status of a task, expressed as the percentage completed (editing of this field is optional)
 - the calendar assigned to task
 - the scheduling mode for the task

* **Note:** However this standard set of fields can be easily overwritten (for more details check {@link #items}).

## Extending the default field set

The default field set can be overwritten using the {@link #items} config.
In case you want to keep the default fields and add some new custom fields, you can use the code below:

    // Extend the standard TaskForm class
    Ext.define('MyTaskForm', {
        extend : 'Gnt.widget.taskeditor.TaskForm',

        constructor : function(config) {
            this.callParent(arguments);

            // add some custom field
            this.add({
                fieldLabel  : 'Foo',
                name        : 'Name',
                width       : 200
            });
        }
    });

    // create customized form
    var form = new MyTaskForm({...});

*/
Ext.define('Gnt.widget.taskeditor.TaskForm', {
    // This form by default contains various "standard" fields of the task
    // and it "knows" about their "applyChanges" methods (for our fields),
    // and about renamed field names
    // This form can be also used with any other set of fields, provided
    // as the "items" config

    extend                  : 'Ext.form.Panel',

    alias                   : 'widget.taskform',

    requires                : [
        'Gnt.model.Task',
        'Ext.form.FieldSet',
        'Ext.form.FieldContainer',
        'Ext.form.field.Text',
        'Ext.form.field.Date',
        'Gnt.field.Percent',
        'Gnt.field.StartDate',
        'Gnt.field.EndDate',
        'Gnt.field.Duration',
        'Gnt.field.SchedulingMode',
        'Gnt.field.Effort',
        'Gnt.field.ConstraintType',
        'Gnt.field.ConstraintDate'
    ],

    mixins                  : ['Gnt.mixin.Localizable'],

    alternateClassName      : ['Gnt.widget.TaskForm'],

    /**
     * @cfg {Gnt.model.Task} task A task to load to the form.
     */
    /**
     * @property {Gnt.model.Task} task The task loaded in the form.
     */
    task                    : null,
    /**
     * @cfg {Gnt.model.Task} taskBuffer A task used to keep intermediate values of fields implemented by {@link Gnt.field.mixin.TaskField} mixin.
     */
    /**
     * @property {Gnt.model.Task} taskBuffer A task used to keep intermediate values of fields implemented by {@link Gnt.field.mixin.TaskField} mixin.
     */
    taskBuffer              : null,
    /**
     * @cfg {Gnt.data.TaskStore} taskStore A store with tasks.
     *
     * **Note:** This is required option if task being loaded isn't yet belong to any task store.
     */
    taskStore               : null,

    /**
     * @cfg {Boolean} highlightTaskUpdates `true` to highlight fields updates initiated by changes of another fields.
     */
    highlightTaskUpdates    : true,

    /**
     * @cfg {Object/Object[]} items A single item, or an array of child Components to be added to this container.
     *
     * For example:
     *
        var myForm  = new Gnt.widget.taskeditor.TaskForm({
            items       : [
                {
                    xtype       : 'calendarfield',
                    fieldLabel  : 'Calendar',
                    name        : 'CalendarId'
                },
                {
                    xtype       : 'displayfield',
                    fieldLabel  : "WBS",
                    name        : 'wbsCode'
                }
            ],
            task        : myTask,
            taskStore   : myTaskStore
        });


     *
     * **Note:** By default this form provide pre-configured set of fields. Using this option will overwrite that field set.
     */

    /**
     * @cfg {Boolean} [showGeneral=true] `true` to display general fields.
     */
    showGeneral             : true,  
    /**
     * @cfg {Boolean} [showBaseline=true] `true` to display baseline fields.
     */
    showBaseline            : true,
    /**
     * @cfg {Boolean} [editBaseline=false] `true` to allow editing of baseline fields.
     */
    editBaseline            : false,
    /**
     * @cfg {Boolean} [showCalendar=false] `true` to show `Calendar` field.
     */
    showCalendar            : false,
    /**
     * @cfg {Boolean} [showSchedulingMode=false] `true` to show `Scheduling Mode` field.
     */
    showSchedulingMode      : false,
    /**
     * @cfg {Boolean} [showWbsCode=false] `true` to show `WBS code` field.
     */
    showWbsCode             : false,
    /**
     * @cfg {Boolean} [showshowRollup=false] `true` to show `Rollup` field.
     */
    showRollup              : false,
    /**
     * @cfg {Boolean} [showConstraint=false] `true` to show `Constraint Type`, `Constraint Date` fields.
     */
    showConstraint          : false,

    /**
     * @cfg {Object} l10n
     *    A object, purposed for the class localization. Contains the following keys/values:
     *  
     * @cfg {String} l10n.taskNameText            'Name'
     * @cfg {String} l10n.durationText            'Duration'
     * @cfg {String} l10n.datesText               'Dates'
     * @cfg {String} l10n.baselineText            'Baseline'
     * @cfg {String} l10n.startText               'Start'
     * @cfg {String} l10n.finishText              'Finish'
     * @cfg {String} l10n.percentDoneText         'Percent Complete'
     * @cfg {String} l10n.baselineStartText       'Start'
     * @cfg {String} l10n.baselineFinishText      'Finish'
     * @cfg {String} l10n.baselinePercentDoneText 'Percent Complete'
     * @cfg {String} l10n.effortText              'Effort'
     * @cfg {String} l10n.invalidEffortText       'Invalid effort value'
     * @cfg {String} l10n.calendarText            'Calendar'
     * @cfg {String} l10n.schedulingModeText      'Scheduling Mode'
     * @cfg {String} l10n.wbsCodeText             'WBS code'
     * @cfg {String} l10n."Constraint Type"       'Constraint Type'
     * @cfg {String} l10n."Constraint Date"       'Constraint Date'
     */
    l10n : {
        taskNameText            : 'Name',
        durationText            : 'Duration',
        datesText               : 'Dates',
        baselineText            : 'Baseline',
        startText               : 'Start',
        finishText              : 'Finish',
        percentDoneText         : 'Percent Complete',
        baselineStartText       : 'Start',
        baselineFinishText      : 'Finish',
        baselinePercentDoneText : 'Percent Complete',
        effortText              : 'Effort',
        invalidEffortText       : 'Invalid effort value',
        calendarText            : 'Calendar',
        schedulingModeText      : 'Scheduling Mode',
        wbsCodeText             : 'WBS code',
        "Constraint Type"       : 'Constraint Type',
        "Constraint Date"       : 'Constraint Date'
    },

    /**
     * @cfg {Object} taskNameConfig A config object to be applied to the `Name` field.
     */
    taskNameConfig          : null,

    /**
     * @cfg {Object} durationConfig A config object to be applied to the `Duration` field.
     */
    durationConfig          : null,

    /**
     * @cfg {Object} startConfig A config object to be applied to the `Start` field.
     */
    startConfig             : null,

    /**
     * @cfg {Object} finishConfig A config object to be applied to the `Finish` field.
     */
    finishConfig            : null,

    /**
     * @cfg {Object} percentDoneConfig A config object to be applied to the `Percent Complete` field.
     */
    percentDoneConfig       : null,

    /**
     * @cfg {Object} baselineStartConfig A config object to be applied to the `Start` field of the `Baseline` fields container.
     */
    baselineStartConfig     : null,

    /**
     * @cfg {Object} baselineFinishConfig A config object to be applied to the `Finish` field of the `Baseline` fields container.
     */
    baselineFinishConfig    : null,

    /**
     * @cfg {Object} baselinePercentDoneConfig A config object to be applied to the `Percent Complete` field of the `Baseline` fields container.
     */
    baselinePercentDoneConfig   : null,

    /**
     * @cfg {Object} effortConfig A config object to be applied to the `Effort` field.
     */
    effortConfig            : null,

    /**
     * @cfg {Object} calendarConfig A config object to be applied to the `Calendar` field.
     */
    calendarConfig          : null,
    /**
     * @cfg {Object} schedulingModeConfig A config object to be applied to the `Scheduling Mode` field.
     */
    schedulingModeConfig    : null,
    /**
     * @cfg {Object} wbsCodeConfig A config object to be applied to the `WBS code` field.
     */
    wbsCodeConfig           : null,
    /**
     * @cfg {Object} rollupConfig A config object to be applied to the `Rollup` field.
     */
    rollupConfig            : null,
    /**
     * @cfg {Object} constraintTypeConfig A config object to be applied to the `Constraint Type` field.
     */
    constraintTypeConfig : null,
    /**
     * @cfg {Object} constraintDateConfig A config object to be appied to the `Constraint Date` field.
     */
    constraintDateConfig : null,

    autoScroll : true,

    defaults   : {
        labelWidth : 110
    },

    isTaskEditorSubComponent : true,

    constructor : function(config) {
        config = config || {};

        this.showBaseline = config.showBaseline;
        this.editBaseline = config.editBaseline;

        var model =  config.taskStore ? config.taskStore.model.prototype : Gnt.model.Task.prototype;

        // default field names
        this.fieldNames = {
            baselineEndDateField        : model.baselineEndDateField,
            baselinePercentDoneField    : model.baselinePercentDoneField,
            baselineStartDateField      : model.baselineStartDateField,
            calendarIdField             : model.calendarIdField,
            clsField                    : model.clsField,
            draggableField              : model.draggableField,
            durationField               : model.durationField,
            durationUnitField           : model.durationUnitField,
            effortField                 : model.effortField,
            effortUnitField             : model.effortUnitField,
            endDateField                : model.endDateField,
            manuallyScheduledField      : model.manuallyScheduledField,
            nameField                   : model.nameField,
            percentDoneField            : model.percentDoneField,
            resizableField              : model.resizableField,
            rollupField                 : model.rollupField,
            schedulingModeField         : model.schedulingModeField,
            startDateField              : model.startDateField,
            noteField                   : model.noteField,
            constraintTypeField         : model.constraintTypeField,
            constraintDateField         : model.constraintDateField
        };

        Ext.apply(this, config, {
            border      : false,
            layout      : 'anchor',
            defaultType : 'textfield'
        });

        // if task provided on construction step
        if (this.task) {
            // get actual field names from task
            this.fieldNames = this.getFieldNames(this.task);
        }

        // if no fields definition provided we make default fields set
        if (!this.items) {
            this.buildFields();
        }

        this.callParent(arguments);

        if (this.task) {
            this.loadRecord(this.task, this.taskBuffer);
        }

        this.addBodyCls('gnt-taskeditor-taskform');
    },


    getFieldNames : function (task) {
        if (!task) return;

        var result = {};

        for (var i in this.fieldNames) {
            result[i] = task[i];
        }

        return result;
    },


    // Renames form fields according to provided task model.
    renameFields : function (task) {
        var newFields   = this.getFieldNames(task);
        if (!newFields) return;

        var form    = this.getForm(),
            changed = false,
            field;

        for (var i in this.fieldNames) {
            field = form.findField(this.fieldNames[i]);

            // check if field name should be changed
            if (field && newFields[i] && newFields[i] != field.name) {
                changed     = true;
                field.name  = newFields[i];
            }
        }

        // if something was changed
        if (changed) {
            // keep new fields' names dictionary
            this.fieldNames = newFields;
        }
    },

    // Builds default set of form fields.
    buildFields : function () {
        var me      = this,
            f       = this.fieldNames,
            task    = this.task,
            store   = this.taskStore;

        // shorten to get value from task
        var getVal = function (field) {
            return task ? task.get(f[field]) : '';
        };

        // shorthand to apply task, taskStore and highlightTaskUpdates to task fields
        var applyCfg = function (definition, cfg) {

            var commonParams    = {
                taskStore               : me.taskStore,
                task                    : me.task,
                highlightTaskUpdates    : me.highlightTaskUpdates
            };

            // if field isn't already read only then let's take into account Task.isEditable() result
            if (!definition.readOnly && me.task) {
                commonParams.readOnly   = !me.task.isEditable(definition.name);
            }

            return Ext.apply(definition, commonParams, cfg);
        };

        this.items = this.items || [];

        if (this.showGeneral) {
            this.items.push({
                xtype       : 'fieldcontainer',
                layout      : 'hbox',
                defaults    : {
                    allowBlank  : false
                },
                items       : [
                    applyCfg({
                        xtype       : 'textfield',
                        fieldLabel  : this.L('taskNameText'),
                        name        : f.nameField,
                        labelWidth  : 110,
                        flex        : 1,
                        value       : getVal(f.nameField)
                    }, this.taskNameConfig),
                    applyCfg({
                        xtype       : 'durationfield',
                        fieldLabel  : this.L('durationText'),
                        name        : f.durationField,
                        labelWidth  : 90,
                        width       : 170,
                        value       : getVal(f.durationField)
                    }, this.durationConfig)
                ]
            },
            applyCfg({
                xtype       : 'percentfield',
                fieldLabel  : this.L('percentDoneText'),
                name        : f.percentDoneField,
                margin      : '0 0 0 8',
                width       : 200,
                allowBlank  : false,
                value       : getVal(f.percentDoneField)
            }, this.percentDoneConfig),
            {
                xtype               : 'fieldset',
                title               : this.L('datesText'),
                layout              : 'hbox',
                defaults            : {
                    labelWidth  : 110,
                    allowBlank  : false
                },
                items               : [
                    applyCfg({
                        xtype       : 'startdatefield',
                        fieldLabel  : this.L('startText'),
                        width       : 260,
                        name        : f.startDateField,
                        value       : getVal(f.startDateField)
                    }, this.startConfig),
                    applyCfg({
                        xtype       : 'enddatefield',
                        fieldLabel  : this.L('finishText'),
                        flex        : 1,
                        labelWidth  : 110,
                        name        : f.endDateField,
                        value       : getVal(f.endDateField)
                    }, this.finishConfig)
                ]
            },
            applyCfg({
                xtype       : 'effortfield',
                fieldLabel  : this.L('effortText'),
                name        : f.effortField,
                invalidText : this.L('invalidEffortText'),
                width       : 200,
                allowBlank  : true,
                value       : getVal(f.effortField)
            }, this.effortConfig));
        }

        if (this.showBaseline) {

            this.items.push({
                xtype               : 'fieldset',
                title               : this.L('baselineText'),
                layout              : 'hbox',
                defaultType         : 'datefield',
                defaults            : {
                    labelWidth  : 110,
                    width       : 260,
                    cls         : 'gnt-baselinefield'
                },
                items               : [
                    applyCfg({
                        fieldLabel  : this.L('baselineStartText'),
                        name        : f.baselineStartDateField,
                        value       : getVal(f.baselineStartDateField),
                        readOnly    : !this.editBaseline
                    }, this.baselineStartConfig),
                    applyCfg({
                        fieldLabel  : this.L('baselineFinishText'),
                        name        : f.baselineEndDateField,
                        flex        : 1,
                        value       : getVal(f.baselineEndDateField),
                        readOnly    : !this.editBaseline
                    }, this.baselineFinishConfig)
                ]
            },
            applyCfg({
                xtype       : 'percentfield',
                fieldLabel  : this.L('baselinePercentDoneText'),
                name        : f.baselinePercentDoneField,
                labelWidth  : 110,
                width       : 200,
                cls         : 'gnt-baselinefield',
                value       : getVal(f.baselinePercentDoneField),
                readOnly    : !this.editBaseline
            }, this.baselinePercentDoneConfig));
        }

        if (this.showCalendar) {
            this.items.push(applyCfg({
                xtype       : 'calendarfield',
                fieldLabel  : this.L('calendarText'),
                width       : 260,
                name        : f.calendarIdField,
                value       : getVal(f.calendarIdField)
            }, this.calendarConfig));
        }

        if (this.showSchedulingMode) {
            this.items.push(applyCfg({
                xtype       : 'schedulingmodefield',
                fieldLabel  : this.L('schedulingModeText'),
                width       : 260,
                name        : f.schedulingModeField,
                value       : getVal(f.schedulingModeField),
                allowBlank  : false
            }, this.schedulingModeConfig));
        }

        if (this.showWbsCode) {
            this.items.push(applyCfg({
                xtype       : 'textfield',
                fieldLabel  : this.L('wbsCodeText'),
                name        : 'wbsCode',
                width       : 260,
                readOnly    : true,
                value       : this.task && this.task.getWBSCode()
            }, this.wbsCodeConfig));
        }

        if (this.showRollup) {
            this.items.push(applyCfg({
                xtype       : 'checkboxfield',
                fieldLabel  : this.L('rollupText'),
                name        : f.rollupField,
                value       : getVal(f.rollupField)
            }, this.rollupConfig));
        }

        if (this.showConstraint) {
            this.items.push(
                applyCfg({
                    xtype      : 'constrainttypefield',
                    fieldLabel : this.L("Constraint Type"),
                    name       : f.constraintTypeField,
                    width       : 260,
                    value      : getVal(f.constraintTypeField)
                }, this.constraintTypeConfig),
                applyCfg({
                    xtype      : 'constraintdatefield',
                    fieldLabel : this.L("Constraint Date"),
                    name       : f.constraintDateField,
                    width       : 260,
                    value      : getVal(f.constraintDateField)
                }, this.constraintDateConfig)
            );
        }

    },

    /**
     * Suppress task updates invoking by form fields. Calls setSuppressTaskUpdate() of each field that supports this method.
     * @param {Boolean} state Suppress or allow task updating.
     */
    setSuppressTaskUpdate : function (state) {
        var fields  = this.getForm().getFields();

        fields.each(function (field) {
            // if field contains setTask() method
            field.setSuppressTaskUpdate && field.setSuppressTaskUpdate(state);
        });
    },

    /**
     * Loads an Gnt.model.Task into this form.
     * @param {Gnt.model.Task} task The record to edit.
     * @param {Gnt.model.Task} [taskBuffer] The record to be used as a buffer to keep changed values of fields which implement {@link Gnt.field.mixin.TaskField}
     * mixin interface. This parameter can be used in case when you want to implement two form instances instantly
     * reflecting changes of each other:
     *
     *      // create 1st TaskForm instance
     *      var taskForm = Ext.create('Gnt.widget.taskeditor.TaskForm');
     *      // load record into 1st form
     *      taskForm.loadRecord(someTask);
     *
     *      // create 2nd TaskForm instance
     *      var anotherForm = Ext.create('Gnt.widget.taskeditor.TaskForm');
     *      // load the same record into 2nd form
     *      // and set to share taskBuffer with 1st form to immediately refect changes of each other
     *      anotherForm.loadRecord(someTask, taskForm.taskBuffer);
     */
    loadRecord : function (task, taskBuffer) {

        // if new or another task loading
        if (task && task !== this.task) {
            // let's rename form fields according to task model
            this.renameFields(task);
        }

        this.task       = task;
        this.taskBuffer = taskBuffer;

        // if no pre-created taskBuffer provided, let`s create it
        if (!this.taskBuffer) {
            this.taskBuffer             = task.copy();
            // since copy() doesn't copy taskStore let`s copy it ourself
            this.taskBuffer.taskStore   = task.taskStore;
        }

        var me      = this,
            form    = me.getForm();

        // following code is modified implementation
        // of Ext.form.Basic setValues() method
        form._record  = task;

        this.suspendLayouts();

        Ext.iterate(task.getData(), function (fieldId, val) {
            var field = form.findField(fieldId);
            if (field) {
                // if field contains setTask() method
                // we gonna use it since setTask() execute setValue()
                if (field.setTask) {
                    // let's suppress task updating on initial
                    // values loading during parent's loadRecord() call
                    field.setSuppressTaskUpdate(true);
                    field.setTask(me.taskBuffer);
                    field.setSuppressTaskUpdate(false);
                } else {
                    field.setValue(val);

                    if (!field.disabled) {

                        // editable = false requires special treatment
                        if (field.editable === false) {
                            // let's take into account Task.isEditable() result
                            if (!me.taskBuffer.isEditable(field.name)) {
                                field.setReadOnly(true);

                            // when editable is false `readOnly` should be set to `true`
                            } else if (field.inputEl) {
                                field.setReadOnly(false);
                                field.inputEl.dom.readOnly = true;
                            }

                        } else {
                            // let's take into account Task.isEditable() result
                            field.setReadOnly(!me.taskBuffer.isEditable(field.name));
                        }
                    }
                }

                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
        });

        this.resumeLayouts(true);

        this.fireEvent('afterloadrecord', this, task);
    },

    /**
     * Applies the values from this form into the passed {@link Gnt.model.Task} object.
     * If the task is not specified, it will attempt to update (if it exists) the record provided to {@link #loadRecord}.
     * @param {Gnt.model.Task} [task] The record to apply change to.
     */
    updateRecord : function (task) {
        var me = this,
            constraintTypeField,
            constraintDateField;

        task = task || this.task;

        var cont    = function () {

            me.setSuppressTaskUpdate(true);

            var fields  = me.getForm().getFields();

            task.beginEdit();

            fields.each(function (field) {
                var modelField = task.getField(field.name);
                // Constraint related fields require different approach
                if (field.name == me.fieldNames.constraintTypeField) {
                    constraintTypeField = field;
                }
                else if (field.name == me.fieldNames.constraintDateField) {
                    constraintDateField = field;
                }
                else if (field.applyChanges) {
                    // if field contains applyChanges() method
                    // we use it to apply changes to task
                    field.applyChanges(task);
                } 
                else if (modelField && modelField.persist) {
                    task.set(field.name, field.getValue());
                }
            });

            task.endEdit();

            // Now we are ready to apply constraints if corresponding fields was shown
            // and task has constraint mixin mixed
            if (constraintTypeField && constraintDateField && task.setConstraint) {
                task.setConstraint(
                    constraintTypeField.getValue(),
                    constraintDateField.getValue()
                );
            }

            me.setSuppressTaskUpdate(false);

            me.fireEvent('afterupdaterecord', me, task);
        };

        if (task && me.fireEvent('beforeupdaterecord', me, task, cont) !== false) {
            cont();
            return true;
        }

        return false;
    },

    isDataChanged : function() {
        return this.isDirty();
    }

});
