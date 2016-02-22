Ext.require([
    'Gnt.panel.Gantt',
    'Gnt.column.PercentDone',
    'Gnt.column.StartDate',
    'Gnt.column.EndDate',
    'Gnt.plugin.Export'
]);

Ext.onReady(function () {
    Ext.QuickTips.init();

    var start = new Date(2009, 11, 26),
        end = Sch.util.Date.add(start, Sch.util.Date.MONTH, 8);

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        model : 'Gnt.model.Task',

        proxy : {
            type   : 'ajax',
            method : 'GET',
            url    : 'tasks.js',
            reader : {
                type : 'json'
            }
        }
    });

    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        autoLoad : true,
        proxy    : {
            type   : 'ajax',
            url    : 'dependencies.js',
            method : 'GET',
            reader : {
                type : 'json'
            }
        }
    });

    var exportPlugin = new Gnt.plugin.Export({
        printServer : 'server.php'
    });

    var g = Ext.create('Gnt.panel.Gantt', {
        height   : ExampleDefaults.height,
        width    : ExampleDefaults.width,

        //Comment this line if you want to test exporting when the Gantt panel is wrapped by another (smaller) component.
        renderTo : 'example-container',

        leftLabelField    : 'Name',
        highlightWeekends : false,
        loadMask          : true,
        viewPreset        : 'monthAndYear',
        startDate         : start,
        endDate           : end,
        rowHeight         : 26,

        columns           : [
            {
                xtype     : 'namecolumn',
                width     : 250
            }
        ],

        //Add export button to top toolbar
        tbar              : [
            'This example shows you how you can export the chart to PDF and PNG.',
            '->',
            {
                iconCls : 'icon-pdf',
                scale   : 'large',
                text    : 'Export to PDF',
                handler : function () {
                    exportPlugin.setFileFormat('pdf');
                    g.showExportDialog();
                }
            },
            {
                iconCls : 'icon-png',
                scale   : 'large',
                text    : 'Export to PNG',
                handler : function () {
                    exportPlugin.setFileFormat('png');
                    g.showExportDialog();
                }
            }
        ],
        taskStore         : taskStore,
        dependencyStore   : dependencyStore,
        plugins           : exportPlugin
    });
});
