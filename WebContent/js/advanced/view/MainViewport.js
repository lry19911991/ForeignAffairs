Ext.define("Gnt.examples.advanced.view.MainViewport", {
    extend      : 'Ext.Viewport',
    alias       : 'widget.advanced-viewport',

    requires    : [
        'Gnt.examples.advanced.view.MainViewportController',
        'Gnt.examples.advanced.view.MainViewportModel',
        'Gnt.examples.advanced.view.GanttSecondaryToolbar',
        'Gnt.examples.advanced.view.ControlHeader',
        // @cut-if-gantt->
        'Gnt.examples.advanced.view.Timeline',
        // <-@
        'Gnt.examples.advanced.view.Gantt'
    ],

    viewModel   : 'advanced-viewport',
    controller  : 'advanced-viewport',

    layout      : 'border',

    initComponent : function () {
        this.items = [
            // @cut-if-gantt->
            {
                xtype       : 'advanced-timeline',
                region      : 'north',
                taskStore   : this.crudManager.getTaskStore()
            },
            // <-@
            {
                xtype       : 'advanced-gantt',
                region      : 'center',
                reference   : 'gantt',
                crudManager : this.crudManager,
                startDate   : this.startDate,
                endDate     : this.endDate,
                header      : Gnt.panel.Timeline ? null : { xtype : 'controlheader' },
                bbar        : {
                    xtype   : 'gantt-secondary-toolbar'
                }
            }
        ];

        this.callParent(arguments);

        // track CRUD manager changes
        this.mon(this.crudManager, {
            haschanges : function () {
                this.getViewModel().set('hasChanges', true);
            },
            nochanges : function () {
                this.getViewModel().set('hasChanges', false);
            },
            scope : this
        });
    }
});
