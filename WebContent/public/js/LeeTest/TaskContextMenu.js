//extended context menu, color picker added
Ext.define('GanttApp.TaskContextMenu', {
    extend          : 'Gnt.plugin.TaskContextMenu',
    mixins          : ['Gnt.mixin.Localizable'],
    alias           : 'plugin.advanced_taskcontextmenu',

    createMenuItems : function () {
        var items = this.callParent(arguments);

        return [
            {
                text         : this.L('changeTaskColor'),
                requiresTask : true,
                isColorMenu  : true,
                menu         : {
                    showSeparator : false,
                    items         : [
                        Ext.create('Ext.ColorPalette', {
                            allowReselect : true,
                            listeners     : {
                                select : function (cp, color) {
                                    this.rec.set('Color', color);
                                    this.hide();
                                },
                                scope  : this
                            }
                        })
                    ]
                }
            }
        ].concat(items);
    },


    configureMenuItems : function () {

        this.down('#addTaskAbove').isValidAction = this.isNotProject;
        this.down('#addTaskBelow').isValidAction = this.isNotProject;
        this.down('#addMilestone').isValidAction = this.isNotProject;

        this.callParent(arguments);

        var rec = this.rec;

        // there might be no record when clicked on the empty space
        if (!rec) return;

        var colorMenu   = this.query('[isColorMenu]')[0].menu.items.first(),
            val         = colorMenu.getValue(),
            recVal      = rec.get('Color');

        if (colorMenu.el) {
            if (val && recVal && recVal !== val) {

                colorMenu.el.down('a.color-' + val).removeCls(colorMenu.selectedCls);

                if (colorMenu.el.down('a.color-' + recVal)) {
                    colorMenu.select(recVal.toUpperCase());
                }
            } else if (val && !recVal) {
                colorMenu.el.down('a.color-' + val).removeCls(colorMenu.selectedCls);
            }
        }
    }
});
