Ext.define('MyApp.ControlHeader', {
    extend   : 'Ext.panel.Header',
    xtype    : 'controlheader',

    mixins   : ['Gnt.mixin.Localizable'],
    requires : [
        'Ext.form.field.ComboBox'
    ],
    title    : 'Advanced Gantt Chart Demo',

    //split  : true,
    border   : '0 0 1 0',

    initComponent : function () {
        this.tools = [
            {
                tooltip   : 'previousTimespan',
                reference : 'shiftPrevious',
                cls       : 'icon-previous'
            },
            {
                tooltip   : 'nextTimespan',
                reference : 'shiftNext',
                cls       : 'icon-next'
            },
            {
                tooltip   : 'collapseAll',
                reference : 'collapseAll',
                cls       : 'icon-collapse-all',
                bind      : {
                    disabled : '{filterSet}'
                }
            },
            {
                tooltip   : 'expandAll',
                reference : 'expandAll',
                cls       : 'icon-expand-all',
                bind      : {
                    disabled : '{filterSet}'
                }
            },
            {
                tooltip   : 'zoomOut',
                reference : 'zoomOut',
                cls       : 'icon-zoom-out'
            },
            {
                tooltip   : 'zoomIn',
                reference : 'zoomIn',
                cls       : 'icon-zoom-in'
            },
            {
                tooltip   : 'zoomToFit',
                reference : 'zoomToFit',
                cls       : 'icon-zoom-to-fit'
            },
            {
                tooltip   : 'undo',
                reference : 'undo',
                cls       : 'icon-undo',
                bind      : {
                    disabled : '{!canUndo}'
                }
            },
            {
                tooltip   : 'redo',
                reference : 'redo',
                cls       : 'icon-redo',
                bind      : {
                    disabled : '{!canRedo}'
                }
            },
            {
                tooltip   : 'viewFullScreen',
                reference : 'viewFullScreen',
                cls       : 'icon-fullscreen',
                bind      : {
                    hidden : '{!fullscreenEnabled}'
                }
            },
            {
                tooltip   : 'highlightCriticalPath',
                reference : 'criticalPath',
                cls       : 'icon-critical-path'
            },
            {
                tooltip   : 'addNewTask',
                reference : 'addTask',
                cls       : 'icon-add-task',
                bind      : {
                    disabled : '{!hasSelection}'
                }
            },
            {
                tooltip   : 'removeSelectedTasks',
                reference : 'removeSelected',
                cls       : 'icon-remove-task',
                bind      : {
                    disabled : '{!hasSelection}'
                }
            },
            {
                tooltip   : 'indent',
                reference : 'indentTask',
                cls       : 'icon-indent',
                bind      : {
                    disabled : '{!hasSelection}'
                }
            },
            {
                tooltip   : 'outdent',
                reference : 'outdentTask',
                cls       : 'icon-outdent',
                bind      : {
                    disabled : '{!hasSelection}'
                }
            },
            {
                tooltip   : 'manageCalendars',
                reference : 'manageCalendars',
                cls       : 'icon-calendar',
                bind      : {
                    hidden : '{!calendarManager}'
                }
            },
            {
                tooltip   : 'saveChanges',
                reference : 'saveChanges',
                cls       : 'icon-save',
                bind      : {
                    hidden   : '{!crud}',
                    disabled : '{!hasChanges}'
                }
            },
            {
                tooltip   : 'tryMore',
                reference : 'tryMore',
                cls       : 'icon-settings'
            },
            {
                xtype         : 'combo',
                reference     : 'langSelector',
                margin        : '0 10',
                bind          : {
                    store : '{availableLocales}',
                    value : '{currentLocale}'
                },
                displayField  : 'title',
                valueField    : 'id',
                mode          : 'local',
                triggerAction : 'all',
                emptyText     : 'selectLanguage',
                selectOnFocus : true
            }
        ];
//          alert('sss');
        Ext.Array.forEach(this.tools, function (cmp) {
            if (cmp.reference) cmp.itemId = cmp.reference;
        });

        this.callParent(arguments);
    }
});
