/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.plugin.taskeditor.TaskEditor
@extends Gnt.plugin.taskeditor.BaseEditor

{@img gantt/images/taskeditor-general.png}

A plugin (ptype = 'gantt_taskeditor') which shows a {@link Gnt.widget.taskeditor.TaskEditor} in a window when a user double-clicks a task bar in the gantt chart.

You can enable this plugin in your Gantt chart like this:

    var gantt = Ext.create('Gnt.panel.Gantt', {
        ...
        plugins : Ext.create("Gnt.plugin.TaskEditor", {
            // window title
            title : 'Task Editor'
        }),
        ...
    })


{@img gantt/images/taskeditor-general.png}

#Plugin customization
Essentially this widget extends Ext.window.Window so any regular window configs can be used for it.
Also it supports a lot of configs provided by the {@link Gnt.widget.taskeditor.TaskEditor} class.
So if you want to customize the task editor child components (task form, resources grid etc.) you can read
the {@link Gnt.widget.taskeditor.TaskEditor} guide and apply corresponding configs to the plugin.

Another way to customize the task editor panel is {@link #panelConfig} config. With it you can
customize any config of the task editor panel, even the ones not translated by this plugin
(like `title`, `width`, `height` etc). For example:

    var plugin = Ext.create("Gnt.plugin.TaskEditor", {
        title       : 'I am window title',
        // some window elements
        items       : [...],
        panelConfig : {
            title   : 'I am panel title'
            // append some tabs to task editor panel
            items   : [...]
        }
    });

* **Note:** Please see {@link Gnt.widget.taskeditor.TaskEditor} class for details on how to customize the components of the tabs.

#Buttons customization

By default the window has two buttons `Ok` and `Cancel` to apply and rollback changes respectively.
If you want to just rename them you can use {@link #l10n} config. Like this:

    var plugin = Ext.create("Gnt.plugin.TaskEditor", {
        l10n : {
            okText      : 'Apply changes',
            cancelText  : 'Reject changes'
        }
    });

And if you need to implement custom buttons you can easily do it using `buttons` config. Like this:

    var plugin = Ext.create("Gnt.plugin.TaskEditor", {
        buttons : [
            {
                text    : 'Show some alert',
                handler : function() {
                    alert('Some alert');
                }
            }
        ]
    });

And finally if you don't want any buttons at all you can overwrite `buttons` config with an empty array. Like this:

    var plugin = Ext.create("Gnt.plugin.TaskEditor", {
        buttons : []
    });


*/
Ext.define('Gnt.plugin.taskeditor.TaskEditor', {
    extend              : 'Gnt.plugin.taskeditor.BaseEditor',

    alternateClassName  : ['Gnt.plugin.TaskEditor'],

    requires            : [
        'Gnt.widget.taskeditor.TaskEditor'
    ],

    alias               : 'plugin.gantt_taskeditor',
    // ptype isn't filled automatically, because we do not extend AbstractPlugin
    ptype               : 'gantt_taskeditor',

    /**
    * @cfg {Object} taskEditorCls Class for the {@link Gnt.widget.taskeditor.TaskEditor} instance.
    */
    taskEditorCls       : 'Gnt.widget.taskeditor.TaskEditor',

    height              : 420,
    width               : 650,

    /**
     * @cfg {String} taskFormClass Class instance of which will represent form in the `General` tab.
     *
     * This option supposed to be used to implement custom form in the `General` tab content.
     */

    /**
     * @cfg {String} advancedFormClass Class instance of which will represent form in the `Advanced` tab.
     *
     * This option supposed to be used to implement custom form in the `Advanced` tab content.
     */

    /**
     * @cfg {Boolean} showAssignmentGrid `true` to display `Resources` tab.
     */

    /**
     * @cfg {Boolean} showDependencyGrid `true` to display `Predecessors` tab.
     */

    /**
     * @cfg {Boolean} allowParentTaskDependencies `false` to hide a `Predecessors` tab for parent tasks
     * (requires {@link #showDependencyGrid} to be `false` as well) and also exclude parent tasks from the list
     * of possible predecessors. Normally this config is read from the {@link Gnt.panel.Gantt#allowParentTaskDependencies}. Defaults to `true`.
     */

    /**
     * @cfg {Boolean} showNotes `true` to display `Notes` tab.
     */

    /**
     * @cfg {Boolean} showAdvancedForm `true` to display `Advanced` tab.
     */

    /**
     * @cfg {Object} taskFormConfig Configuration of task form placed at `General` tab.
     * For possible options take a look at {@link Gnt.widget.TaskForm}.
     */

    /**
     * @cfg {String} dependencyGridClass Class representing the grid panel in the `Predecessor` tab.
     *
     * Override this to provide your own implementation subclassing the {@link Gnt.widget.DependencyGrid} class.
     */
    /**
     * @cfg {Object} dependencyGridConfig Configuration of grid placed at `Predecessors` tab.
     * For possible options take a look at {@link Gnt.widget.DependencyGrid}.
     *
     * **Note:** This grid may not be created if {@link #showDependencyGrid} set to `false`.
     */

    /**
     * @cfg {String} assignmentGridClass Class representing the grid panel in the `Resources` tab.
     *
     * Override this to provide your own implementation subclassing the {@link Gnt.widget.AssignmentEditGrid} class.
     */
    /**
     * @cfg {Object} assignmentGridConfig Configuration of grid placed at `Resources` tab.
     * For possible options take a look at {@link Gnt.widget.AssignmentEditGrid}.
     *
     * **Note:** This grid may not be created if {@link #showAssignmentGrid} set to `false`
     * or {@link #assignmentStore} or {@link #resourceStore} is not specified.
     */

    /**
     * @cfg {Object} advancedFormConfig Configuration of task form placed at `Advanced` tab.
     * For possible options take a look at {@link Gnt.widget.TaskForm}.
     *
     * **Note:** This form may not be created if {@link #showAdvancedForm} set to `false`.
     */

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - title               : 'Task Information',
            - alertCaption        : 'Information',
            - alertText           : 'Please correct marked errors to save changes',
            - okText              : 'Ok',
            - cancelText          : 'Cancel',
            - generalText         : 'General',
            - resourcesText       : 'Resources',
            - dependencyText      : 'Predecessors',
            - addDependencyText   : 'Add new',
            - dropDependencyText  : 'Remove',
            - notesText           : 'Notes',
            - advancedText        : 'Advanced',
            - wbsCodeText         : 'WBS code',
            - addAssignmentText   : 'Add new',
            - dropAssignmentText  : 'Remove'
     */

    taskEditorConfigs   : 'l10n,task,taskStore,assignmentStore,resourceStore,generalText,resourcesText,dependencyText,addDependencyText,'+
        'dropDependencyText,notesText,advancedText,wbsCodeText,addAssignmentText,dropAssignmentText,showAssignmentGrid,showDependencyGrid,'+
        'allowParentTaskDependencies,showNotes,showStyle,showAdvancedForm,taskFormClass,advancedFormClass,taskFormConfig,dependencyGridConfig,'+
        'assignmentGridConfig,advancedFormConfig,styleFormConfig,dependencyGridClass,assignmentGridClass',

    /**
     * @event loadtask
     * Fires after task loading complete.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor Task editor widget instance used for editing.
     * @param {Gnt.model.Task} task The loaded task.
     *
     *
     * This event can be used to do additional data loading if task editor was extended with some extra fields.
     * Also please take a look at {@link #afterupdatetask} event to have an example of how to implement custom data saving.
     *
     *      // some custom user form
     *      var customForm = new Gnt.widget.taskeditor.TaskForm({
     *          title : 'Custom form panel',
     *          xtype : 'taskform',
     *          items : [
     *              {
     *                  fieldLabel  : 'Foo field',
     *                  name        : 'foo',
     *                  allowBlank  : false
     *              }
     *          ],
     *          taskStore   : taskStore
     *      });
     *
     *      var taskEditor = Ext.create('Gnt.plugin.TaskEditor', {
     *          // register custom form as an additional tab
     *          panelConfig : {
     *              items       : customForm
     *          },
     *          listeners   : {
     *              // populate custom form with task values
     *              loadtask : function (taskeditor, task) {
     *                  customForm.loadRecord(task);
     *              },
     *              ....
     *          }
     *      });
     */

    /**
     * @event validate
     * Fires when task validation occurs. Take a look at example of using this event {@link Gnt.widget.taskeditor.TaskEditor#event-validate here}.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor Task editor widget instance.
     */

    /**
     * @event beforeupdatetask
     * Fires before task updating occurs. Return false to prevent the update.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor Task editor widget instance used for editing.
     * @param {Function} proceedCallback The function which can be called manually to continue task updating. Example:
     *
     *      var taskEditor = Ext.create('Gnt.plugin.TaskEditor', {
     *          listeners   : {
     *              beforeupdatetask    : function (taskeditor, proceedCallback) {
     *                  var me  = this;
     *                  Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?', function (buttonId) {
     *                      if (buttonId == 'yes') {
     *                          // here we continue updating asynchronously after user click "Yes" button
     *                          proceedCallback();
     *                          me.hide();
     *                      }
     *                  });
     *                  // here we return false to stop updating
     *                  return false;
     *              }
     *          }
     *      });
     *
     */

    /**
     * @event afterupdatetask
     * Fires after task updating is finished.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor Task editor widget instance.
     *
     * This event can be used to do some extra processing after task was updated by task editor.
     * For example in case when you have some additional fields you can implement saving of them using this event.
     * Also please take a look at {@link #loadtask} event to have an example of how to implement custom data loading.
     *
     *      // some custom user form
     *      var customForm = new Gnt.widget.taskeditor.TaskForm({
     *          title : 'Custom form panel',
     *          xtype : 'taskform',
     *          items : [
     *              {
     *                  fieldLabel  : 'Foo field',
     *                  // foo - is the name of custom task field
     *                  name        : 'foo',
     *                  allowBlank  : false
     *              }
     *          ],
     *          taskStore   : taskStore
     *      });
     *
     *      var taskEditor = Ext.create('Gnt.plugin.TaskEditor', {
     *          // register custom form as an additional tab
     *          panelConfig : {
     *              items       : customForm
     *          },
     *          listeners   : {
     *              afterupdatetask : function (taskeditor) {
     *                  // update form fields to loaded task
     *                  customForm.updateRecord();
     *              },
     *              ....
     *          }
     *      });
     */

    constructor : function (config) {
        this.callParent(arguments);
        // filter out project records
        this.addFilter(this.isTask);
    },


    init : function (cmp) {
        this.callParent(arguments);
        // decorate the component with a reference to the plugin
        cmp.taskEditor  = this;
    },


    isTask : function (task) {
        return task && !task.isProject;
    }
});
