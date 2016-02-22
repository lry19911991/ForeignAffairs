/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * @class   Gnt.plugin.ConstraintResolutionGui
 * @extends Ext.AbstractPlugin
 */
Ext.define("Gnt.plugin.ConstraintResolutionGui", {
    extend   : "Ext.AbstractPlugin",
    alias    : "plugin.constraintresolutiongui",
    requires : ["Gnt.widget.ConstraintResolutionWindow"],

    config : {
        /**
         * @cfg {String} dateFormat
         *
         * Date format to pass to {@link Gnt.widget.ConstraintResolutionWindow}
         */
        dateFormat : null
    },

    cmpDetacher         : null,
    storeDetacher       : null,
    storedResolutions   : null,

    constructor : function(config) {
        var me = this;

        if (Ext.Version.compare(Ext.versions.extjs, '5.0.0') == -1) {
            me.initConfig(config);
        }

        me.callParent([config]);
    },

    init : function(cmp) {
        var me = this;

        me.callParent(arguments);

        if (!me.disabled) {
            me.enable();
        }
    },

    enable : function() {
        var me = this,
            cmp = me.getCmp();

        me.callParent();

        // This is a GUI class, let's wait for the Gantt view to render first
        if (cmp.rendered) {
            me.attachToTaskStore();
        }
        else {
            me.cmpDetacher = cmp.on('afterrender', function() {
                me.attachToTaskStore();
            }, null, { destroyable : true, single : true });
        }
    },

    disable : function() {
        var me = this,
            cmp = me.getCmp();

        me.callParent();

        if (cmp.rendered) {
            me.detachFromTaskStore();
        }
        else {
            me.cmpDetacher && Ext.destroy(me.cmpDetacher);
            me.cmpDetacher = null;
        }
    },

    attachToTaskStore : function() {
        var me = this,
            cmp, store;

        if (!me.storeDetacher) {
            cmp   = me.getCmp();
            store = cmp.getTaskStore();
            me.storeDetacher = cmp.mon(store, 'constraintconflict', me.onConstraintConflict, me, { destroyable : true });
        }
    },

    detachFromTaskStore : function() {
        var me = this;
        me.storeDetacher && Ext.destroy(me.storeDetacher);
        me.storeDetacher = null;
    },

    onConstraintConflict : function(task, resolutionContext) {
        var me         = this,
            ganttPanel = me.getCmp(),
            lockedView = ganttPanel.lockedGrid.getView(),
            normalView = ganttPanel.normalGrid.getView(),
            depView    = ganttPanel.getDependencyView(),
            taskIdx    = normalView.indexOf(task),
            wnd,
            detacher, detacherWrapper = {
                destroy : function() {
                    Ext.destroy(detacher);
                }
            };

        // Redrawing the conflicting task row and dependencies
        function redrawTask() {
            if (taskIdx != -1) {
                lockedView.refreshNode(taskIdx);
                normalView.refreshNode(taskIdx);
                depView.updateDependencies(task);
            }
        }

        redrawTask();

        if (!me.hasStoredResolutionForContext(resolutionContext)) {
            wnd = new Gnt.widget.ConstraintResolutionWindow({
                dateFormat        : me.getDateFormat(),
                resolutionContext : resolutionContext
            });

            detacher = wnd.on({
                'ok'        : Ext.Function.bind(me.onUserActionOk,     me, [resolutionContext, redrawTask, wnd, detacherWrapper], true),
                'cancel'    : Ext.Function.bind(me.onUserActionCancel, me, [resolutionContext, redrawTask, wnd, detacherWrapper], true),
                'close'     : Ext.Function.bind(me.onUserActionClose,  me, [resolutionContext, redrawTask, detacherWrapper],      true),

                scope       : me,
                destroyable : true
            });

            ganttPanel.completeEdit();

            wnd.show();
        }
        else {
            me.resolveSilently(resolutionContext, redrawTask);
        }
    },

    getStoredResolutions : function() {
        var me = this;

        if (!me.storedResolutions) {
            me.storedResolutions = {};
        }
        return me.storedResolutions;
    },

    getStoredResolutionKeyForContext : function(resolutionContext) {
        // <debug>
        Ext.isObject(resolutionContext) && Ext.isString(resolutionContext.title) && Ext.isArray(resolutionContext.resolutions) ||
            Ext.Error.raise("Can't get stored resolution key for context, invalid context is given!");
        // </debug>

        return resolutionContext.title + resolutionContext.resolutions.length;
    },

    hasStoredResolutionForContext : function(resolutionContext) {
        var me = this,
            key = me.getStoredResolutionKeyForContext(resolutionContext),
            storedResolutions = me.getStoredResolutions();

        return Ext.isDefined(storedResolutions[key]);
    },

    getStoredResolutionForContext : function(resolutionContext) {
        var me = this,
            key = me.getStoredResolutionKeyForContext(resolutionContext),
            storedResolutions = me.getStoredResolutions();

        // <debug>
        Ext.isDefined(storedResolutions[key]) ||
            Ext.Error.raise("Can't get resolution for context, no resolutions has been stored previously!");
        // </debug>

        return storedResolutions[key];
    },

    storeResolutionForContext : function(resolutionContext, optionIndex) {
        var me = this,
            key = me.getStoredResolutionKeyForContext(resolutionContext),
            storedResolutions = me.storedResolutions;

        me.storedResolutions[key] = optionIndex;
    },

    resolveSilently : function(resolutionContext, redrawTaskFn) {
        var me = this,
            optionIndex = me.getStoredResolutionForContext(resolutionContext);

        // <debug>
        Ext.isObject(resolutionContext) && Ext.isArray(resolutionContext.resolutions) && Ext.isDefined(resolutionContext.resolutions[optionIndex]) ||
            Ext.Error.raise("Can't resolve constraint confict silently, stored resolution is inconsistent to the context given!");
        // </debug>

        resolutionContext.resolutions[optionIndex].resolve();

        // Redrawing the conflicting task again after user has decided what to do
        redrawTaskFn();
    },

    onUserActionOk : function(form, userChoise, eOpts, resolutionContext, redrawTaskFn, wnd, detacher) {
        var me = this;

        // <debug>
        Ext.isObject(userChoise) &&
        Ext.isDefined(userChoise.resolutionOption) &&
        Ext.isDefined(userChoise.dontAsk) ||
            Ext.Error.raise("Can't resolve constraint conflict according to user choise, user choise is invalid!");

        Ext.isObject(resolutionContext) &&
        Ext.isArray(resolutionContext.resolutions) &&
        Ext.isDefined(resolutionContext.resolutions[userChoise.resolutionOption]) ||
            Ext.Error.raise("Can't resolve constraint conflict according to user choise, resolution context is inconsistent to user choise!");
        // </debug>

        Ext.destroy(detacher);
        wnd.close();

        if (userChoise.dontAsk) {
            me.storeResolutionForContext(resolutionContext, userChoise.resolutionOption);
        }

        resolutionContext.resolutions[userChoise.resolutionOption].resolve();

        // Redrawing the conflicting task again after user has decided what to do
        redrawTaskFn();
    },

    onUserActionCancel : function(form, eOpts, resolutionContext, redrawTaskFn, wnd, detacher) {
        var me = this;

        // <debug>
        Ext.isObject(resolutionContext) && Ext.isFunction(resolutionContext.cancelAction) ||
            Ext.Error.raise("Invalid resolution context given!");
        // </debug>

        Ext.destroy(detacher);
        wnd.close();

        resolutionContext.cancelAction();

        // Redrawing the conflicting task again after user has decided what to do
        redrawTaskFn();
    },

    onUserActionClose : function(wnd, eOpts, resolutionContext, redrawTaskFn, detacher) {
        var me = this;

        // <debug>
        resolutionContext && Ext.isFunction(resolutionContext.cancelAction) ||
            Ext.Error.raise("Invalid resolution context given!");
        // </debug>

        Ext.destroy(detacher);

        resolutionContext.cancelAction();

        // Redrawing the conflicting task again after user has decided what to do
        redrawTaskFn();
    }
});
