Ext.define('MyApp.SecondaryToolbar', {
    extend      : 'Ext.Toolbar',
    mixins      : ['Gnt.mixin.Localizable'],
    xtype       : 'gantt-secondary-toolbar',
    cls         : 'gantt-secondary-toolbar',
    reference   : 'secondaryToolbar',

    hidden      : true,
    gantt     : null,
    defaults    : { scale : 'medium', margin : '0 3 0 3' },

    initComponent : function () {
    	  var gantt = this.gantt;

          var taskStore = gantt.taskStore || gantt.crudManager && gantt.crudManager.getTaskStore();
        Ext.apply(this, {
            defaults : { scale : 'medium' },

            items : [
                {
                    text         : 'Toggle child tasks grouping on/off',
                    enableToggle : true,
                    handler      : function () {
                        gantt.el.toggleCls("enable-taskarea");
                    }
                },
                {
                    text    : 'Toggle rollup tasks',
                    handler : function (btn) {
                        var showRollup = !gantt.showRollupTasks;
                        gantt.setShowRollupTasks(showRollup);
                    }
                },
                {
                    text    : 'Highlight tasks longer than 8 days',
                    handler : function (btn) {
                        gantt.taskStore.queryBy(function (task) {
                            if (task.data.leaf && task.getDuration() > 8) {
                                var el = gantt.getSchedulingView().getElementFromEventRecord(task);
                                el && el.frame('lime');
                            }
                        }, this);
                    }
                },
                {
                    text    : 'Filter: Tasks with progress < 30%',
                    handler : function (btn) {
              
                        gantt.taskStore.filterTreeBy(function (task) {
                        	console.log(task.getPercentDone()+"----");
                            return task.getPercentDone() <30;
                        });
                    }
                },
                {
                    text    : 'Clear Filter',
                    handler : function (btn) {
                        gantt.taskStore.clearTreeFilter();
                    }
                },
                {
                    text    : 'Scroll to last task',
                    handler : function (btn) {
                        var latestEndDate = new Date(0),
                            latest;
                        gantt.taskStore.getRootNode().cascadeBy(function (task) {
                            if (task.get('EndDate') >= latestEndDate) {
                                latestEndDate = task.get('EndDate');
                                latest = task;
                            }
                        });
                        gantt.getSchedulingView().scrollEventIntoView(latest, true);
                    }
                }
            ]
        });

//        // For testing
//        Ext.Array.forEach(this.items, function (cmp) {
//            if (cmp.reference) cmp.itemId = cmp.reference;
//        });

        this.callParent(arguments);
    }
});
