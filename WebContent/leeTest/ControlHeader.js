Ext.define('Gnt.examples.advanced.view.ControlHeader', {
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
                tooltip   : this.L('previousTimespan'),
                reference : 'shiftPrevious',
                cls       : 'icon-previous'
            },
            {
                tooltip   : this.L('nextTimespan'),
                reference : 'shiftNext',
                cls       : 'icon-next'
            },
            {
                tooltip   : this.L('collapseAll'),
                reference : 'collapseAll',
                cls       : 'icon-collapse-all',
                bind      : {
                    disabled : '{filterSet}'
                }
            },
            {
                tooltip   : this.L('expandAll'),
                reference : 'expandAll',
                cls       : 'icon-expand-all',
                bind      : {
                    disabled : '{filterSet}'
                }
            },
            {
                tooltip   : this.L('zoomOut'),
                reference : 'zoomOut',
                cls       : 'icon-zoom-out'
            },
            {
                tooltip   : this.L('zoomIn'),
                reference : 'zoomIn',
                cls       : 'icon-zoom-in'
            },
            {
                tooltip   : this.L('zoomToFit'),
                reference : 'zoomToFit',
                cls       : 'icon-zoom-to-fit'
            },
            {
                tooltip   : this.L('undo'),
                reference : 'undo',
                cls       : 'icon-undo',
                bind      : {
                    disabled : '{!canUndo}'
                }
            },
            {
                tooltip   : this.L('redo'),
                reference : 'redo',
                cls       : 'icon-redo',
                bind      : {
                    disabled : '{!canRedo}'
                }
            },
            {
                tooltip   : this.L('viewFullScreen'),
                reference : 'viewFullScreen',
                cls       : 'icon-fullscreen',
                bind      : {
                    hidden : '{!fullscreenEnabled}'
                }
            },
            {
                tooltip   : this.L('highlightCriticalPath'),
                reference : 'criticalPath',
                cls       : 'icon-critical-path'
            },
            {
                tooltip   : this.L('addNewTask'),
                reference : 'addTask',
                cls       : 'icon-add-task',
                bind      : {
                    disabled : '{!hasSelection}'
                }
            },
            {
                tooltip   : this.L('removeSelectedTasks'),
                reference : 'removeSelected',
                cls       : 'icon-remove-task',
                bind      : {
                    disabled : '{!hasSelection}'
                }
            },
            {
                tooltip   : this.L('indent'),
                reference : 'indentTask',
                cls       : 'icon-indent',
                bind      : {
                    disabled : '{!hasSelection}'
                }
            },
            {
                tooltip   : this.L('outdent'),
                reference : 'outdentTask',
                cls       : 'icon-outdent',
                bind      : {
                    disabled : '{!hasSelection}'
                }
            },
            {
                tooltip   : this.L('manageCalendars'),
                reference : 'manageCalendars',
                cls       : 'icon-calendar',
                bind      : {
                    hidden : '{!calendarManager}'
                }
            },
            {
                tooltip   : this.L('saveChanges'),
                reference : 'saveChanges',
                cls       : 'icon-save',
                bind      : {
                    hidden   : '{!crud}',
                    disabled : '{!hasChanges}'
                }
            },
            {
                tooltip   : this.L('tryMore'),
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
                emptyText     : this.L('selectLanguage'),
                selectOnFocus : true
            }
        ];

        Ext.Array.forEach(this.tools, function (cmp) {
            if (cmp.reference) cmp.itemId = cmp.reference;
        });

        this.callParent(arguments);
    }
});
