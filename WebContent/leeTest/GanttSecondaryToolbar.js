Ext.define('Gnt.examples.advanced.view.GanttSecondaryToolbar', {
    extend      : 'Ext.Toolbar',
    mixins      : ['Gnt.mixin.Localizable'],
    xtype       : 'gantt-secondary-toolbar',
    cls         : 'gantt-secondary-toolbar',
    reference   : 'secondaryToolbar',

    hidden      : true,

    defaults    : { scale : 'medium', margin : '0 3 0 3' },

    initComponent : function () {

        this.items  = [
            {
                text         : 'toggleChildTasksGrouping',
                reference    : 'toggleGrouping',
                enableToggle : true
            },
            {
                text         : 'toggleRollupTasks',
                reference    : 'toggleRollup',
                enableToggle : true
            },
            {
                text      : 'highlightTasksLonger8',
                reference : 'highlightLong'
            },
            {
                text      : 'filterTasksWithProgressLess30',
                reference : 'filterTasks'
            },
            {
                text      : 'clearFilter',
                reference : 'clearTasksFilter'
            },
            {
                text      : 'scrollToLastTask',
                reference : 'scrollToLast'
            }
        ];

        // For testing
        Ext.Array.forEach(this.items, function (cmp) {
            if (cmp.reference) cmp.itemId = cmp.reference;
        });

        this.callParent(arguments);
    }
});
