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
                text         : this.L('toggleChildTasksGrouping'),
                reference    : 'toggleGrouping',
                enableToggle : true
            },
            {
                text         : this.L('toggleRollupTasks'),
                reference    : 'toggleRollup',
                enableToggle : true
            },
            {
                text      : this.L('highlightTasksLonger8'),
                reference : 'highlightLong'
            },
            {
                text      : this.L('filterTasksWithProgressLess30'),
                reference : 'filterTasks'
            },
            {
                text      : this.L('clearFilter'),
                reference : 'clearTasksFilter'
            },
            {
                text      : this.L('scrollToLastTask'),
                reference : 'scrollToLast'
            }
        ];

        this.callParent(arguments);

        // For testing
        this.items.each(function (cmp) {
            if (cmp.reference) cmp.itemId = cmp.reference;
        });
    }
});
