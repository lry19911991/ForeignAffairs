/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.plugin.taskeditor.BaseEditor
*/
Ext.define('Gnt.plugin.taskeditor.BaseEditor', {
    extend                      : 'Ext.window.Window',

    requires                    : ['Ext.window.MessageBox'],
    mixins                      : ['Ext.AbstractPlugin', 'Gnt.mixin.Localizable'],

    lockableScope               : 'top',

    closeOnBlur                 : true,

    /**
    * @cfg {Object} taskEditorCls Class for the {@link Gnt.widget.taskeditor.TaskEditor} instance.
    */
    taskEditorCls               : 'Gnt.widget.taskeditor.TaskEditor',

    /**
     * @property {Boolean} isTaskEditor
     * @readonly
     * Indicates that the class extends {@link Gnt.plugin.taskeditor.BaseEditor} class.
     */
    isTaskEditor                : true,

    /**
     * @property {Gnt.widget.taskeditor.BaseEditor} taskEditor The task editor widget contained by the plugin.
     */
    taskEditor                  : null,

    /**
     * @cfg {Object} panelConfig Configuration for {@link Gnt.widget.taskeditor.BaseEditor} instance.
     */
    panelConfig                 : null,

    height                      : 340,
    width                       : 600,
    layout                      : 'card',
    constrain                   : true,

    /**
     * @cfg {String} triggerEvent
     * The event upon which the editor shall be shown. Defaults to 'taskdblclick'.
     */
    triggerEvent                : 'taskdblclick',

    closeAction                 : 'hide',

    modal                       : true,

    gantt                       : null,

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore A store with assignments.
     * If this config is not provided plugin will try to retrieve assignments store from {@link Gnt.panel.Gantt} instance.
     */
    assignmentStore             : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore A store with resources.
     * If this config is not provided plugin will try to retrieve resources store from {@link Gnt.panel.Gantt} instance.
     */
    resourceStore               : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore A store with tasks.
     * If this config is not provided plugin will try to retrieve tasks store from {@link Gnt.panel.Gantt} instance.
     * **Note:** Task store is required if task doesn't belong to any task store yet.
     */
    taskStore                   : null,

    /**
     * @cfg {Gnt.model.Task} task The task to show in the task editor.
     */

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - title               : 'Task Information',
            - alertCaption        : 'Information',
            - alertText           : 'Please correct marked errors to save changes',
            - okText              : 'Ok',
            - cancelText          : 'Cancel',
     */

    /**
     * @cfg {Boolean} [monitorDataUpdates=false]
     *
     * Whether to actively monitor data updates or not, if set to true then Ok button (if present) will be enabled
     * only if there're data changes introduced in the Task Editor and those changes are valid.
     */
    monitorDataUpdates          : false,

    /**
     * @cfg {Integer} monitorDataUpdatesInterval
     *
     * Timeout to use to monitor data updates.
     */
    monitorDataUpdatesInterval  : 500,

    taskEditorConfigs           : 'l10n,task,taskStore,assignmentStore,resourceStore',

    taskFilters                 : null,


    constructor : function (config) {
        config              = config || {};

        this.taskFilters    = [];

        // we need to apply config to let locale()
        // know about legacy locales since it will check them in 'this'
        Ext.apply(this, config);

        this.title          = this.L('title');

        // by default we make 'Ok', 'Cancel' buttons
        if (!config.buttons) {
            this.buttons    = ['->',
                {
                    itemId  : 'teOkBtn',
                    text    : this.L('okText'),
                    handler : function() {
                        this.completeEditing() || Ext.Msg.alert(this.L('alertCaption'), this.L('alertText'));
                    },
                    scope   : this
                },
                {
                    text    : this.L('cancelText'),
                    handler : this.close,
                    scope   : this
                }
            ];
        }

        this.callParent([config]);
        this.addCls('gnt-taskeditor-window');

        if (this.closeOnBlur) {
            this.on('show', this.onFirstShow, this, { single : true});
        }
    },

    getState : function () {
        if (this.rendered) {
            return this.callParent(arguments);
        }
    },

    init : function (cmp) {
        // if assignmentStore or resourceStore wasn't defined as configuration options
        // during plugin constructing we get them from Gnt.panel.Gantt instance
        this.assignmentStore    = this.assignmentStore || cmp.getAssignmentStore();
        this.resourceStore      = this.resourceStore || cmp.getResourceStore();
        this.taskStore          = this.taskStore || cmp.getTaskStore();

        // let's map some configuration options from plugin to taskEditor
        var cfg     = {
            width   : null,
            height  : null,
            border  : false
        };

        // some configs are mapped from this instance to task editor widget
        Ext.copyTo(cfg, this, this.taskEditorConfigs);

        cfg.showBaseline    = cmp.enableBaseline;

        cfg.showRollup      = cmp.showRollupTasks;

        cfg.allowParentTaskDependencies = cmp.allowParentTaskDependencies;

        this.buildTaskEditor(Ext.apply(cfg, this.panelConfig));

        this.add(this.taskEditor);

        this.mon(cmp, this.triggerEvent, this.onTriggerEvent, this);

        this.gantt          = cmp;
    },


    /**
     * @protected
     * Builds the task editor widget instance being used by the plugin.
     * By default this method creates {@link Gnt.widget.taskeditor.TaskEditor} instance and puts a reference to the instance to {@link #taskEditor} property.
     * Override this if you want to instantiate your custom class instead.
     * @param  {Object} cfg Configuration of the task editor widget being instantiated
     */
    buildTaskEditor : function (cfg) {
        this.taskEditor = Ext.create(this.taskEditorCls, cfg);
        this.relayEvents(this.taskEditor, ['loadtask', 'validate', 'beforeupdatetask', 'afterupdatetask']);
    },


    onTriggerEvent : function (gantt, task) {
        this.showTask(task);
    },

    /**
     * Shows window and loads task into the task editor.
     * @param {Gnt.model.Task} task Task to load.
     */
    showTask : function (task) {
        if (this.taskEditor && task && this.matchFilters(task)) {
            var readOnly = this.gantt.isReadOnly() || task.isReadOnly();

            this.taskEditor.loadTask(task);
            this.taskEditor.setReadOnly(readOnly);

            this.down('#teOkBtn').setVisible(!readOnly);

            this.show();
        }
    },


    matchFilters : function (task) {
        if (!task) return;

        for (var i = 0; i < this.taskFilters.length; i++) {
            var filter  = this.taskFilters[i];
            if (!filter.fn.call(filter.scope, task)) return false;
        }

        return true;
    },


    addFilter : function (fn, scope) {
        this.taskFilters.push({
            fn      : fn,
            scope   : scope || this
        });
    },


    validate : function () {
        if (this.taskEditor) {
            return this.taskEditor.validate();
        }
    },

    /**
     * This function is a shorthand for the following typical steps:
     *
     *      if (!taskEditor.validate()) {
     *          Ext.MessageBox.alert('Information', 'Please correct marked errors to save changes');
     *      } else {
     *          if (taskEditor.updateTask()) taskEditor.hide();
     *      }
     *
     * Instead of above code you can write:
     *
     *      if (!taskEditor.completeEditing()) {
     *          Ext.MessageBox.alert('Information', 'Please correct marked errors to save changes');
     *      }
     *
     * @return {Boolean} true if validation successfully passed and record was successfully updated as well.
     */
    completeEditing : function () {

        if (this.taskEditor) {
            var activeTab = this.taskEditor.getActiveTab();

            // Force any active editing to complete first
            if (activeTab.editingPlugin && activeTab.editingPlugin.completeEdit) {
                activeTab.editingPlugin.completeEdit();
            }

            if (!this.taskEditor.validate()) return false;

            if (this.taskEditor.updateTask()) {
                this.hide();
                return true;
            }

            return false;
        }
    },

    /**
     * Persists the values in this task editor into corresponding {@link Gnt.model.Task}
     * object provided to {@link #showTask}.
     * Internally just calls {@link Gnt.widget.taskeditor.TaskEditor#updateTask updateTask} method of task editor panel.
     */
    updateTask : function () {
        if (this.taskEditor) {
            return this.taskEditor.updateTask();
        }
    },


    afterRender : function() {
        var me = this;
        me.callParent(arguments);
        me.startDataUpdatesMonitoring();
    },

    onFirstShow : function() {

        if (this.zIndexManager.mask) {
            this.mon(this.zIndexManager.mask, 'click', function() {
                if (this.isVisible()) {
                    this.hide();
                }
            }, this);
        }

    },

    startDataUpdatesMonitoring : function() {
        var me = this,
            okBtn = me.down('#teOkBtn'),
            timerId = true;

        function monitor() {
            if (timerId && okBtn && me.taskEditor) {
                okBtn.setDisabled(!me.taskEditor.isDataChanged() || !me.taskEditor.isDataValid());
                timerId = Ext.Function.defer(monitor, me.monitorDataUpdatesInterval);
            }
        }

        function unmonitor() {
            timerId !== true && clearTimeout(timerId);
            timerId = true;
        }

        if (me.monitorDataUpdates && okBtn) {
            me.on({
                'show'    : monitor,
                'hide'    : unmonitor,
                'destroy' : unmonitor
            });
        }
    }
});
