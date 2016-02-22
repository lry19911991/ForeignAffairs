Ext.define("Gnt.examples.advanced.view.MainViewport", {
    extend      : 'Ext.Viewport',
    alias       : 'widget.advanced-viewport',

    requires    : [
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
    	
        var taskStore = Ext.create('Gnt.data.TaskStore', {
            autoLoad    : true,
            proxy       : {
                type    : 'memory',
                reader  : {
                    type : 'json'
                },

                data    : [
                    { 
                        "StartDate" : "2010-01-18",
                        "EndDate"   : "2010-02-02",
                        "Id"        : 1,
                        "Name"      : "Planning",
                        "expanded"  : true,
                        "children"  : [
                            { 
                                "StartDate" : "2010-01-18",
                                "EndDate"   : "2010-01-26",
                                "Id"        : 2,
                                "leaf"      : true,
                                "Name"      : "Investigate",
                                "parentId"  : 1
                            },
                            { 
                                "StartDate" : "2010-01-22",
                                "EndDate"   : "2010-01-25",
                                "Id"        : 3,
                                "leaf"      : true,
                                "Name"      : "Investigate2",
                                "parentId"  : 1
                            },
                            { 
                                "StartDate" : "2010-01-28",
                                "EndDate"   : "2010-01-28",
                                "Id"        : 4,
                                "leaf"      : true,
                                "Name"      : "Investigate3",
                                "parentId"  : 1
                            }
                        ]
                    }
                ]
                // eof data
            }
            // eof proxy
        });
        this.items = [
            // @cut-if-gantt->
            {
                xtype       : 'advanced-timeline',
                height      : 180,
                region      : 'north',
                taskStore   : taskStore
            },
            // <-@
            {
                xtype       : 'advanced-gantt',
                region      : 'center',
                reference   : 'gantt',
                taskStore :  taskStore,
                startDate   : this.startDate,
                endDate     : this.endDate,
                header      : Gnt.panel.Timeline ? null : { xtype : 'controlheader' },
                bbar        : {
                    xtype   : 'gantt-secondary-toolbar'
                }
            }
        ];

        this.callParent(arguments);
    }
});
