//extended context menu, color picker added
Ext.define('GanttApp.TaskContextMenu', {
    extend : 'Gnt.plugin.TaskContextMenu',
    Render: function (){
    	alert('onRender');
    },
    createMenuItems : function () {
        var items = this.callParent(arguments);
    	alert('createMenuItems');
        if(Window.globalVar)
        	alert(Window.globalVar);
        //items=items.concat(Window.globalVar);
        return [
            {
                text         : 'Change task color',
                requiresTask : true,
                isColorMenu  : true,
                menu         : {
                    showSeparator : false,
                    items         : [
                        Ext.create('Ext.ColorPalette', {
                            listeners : {
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
//            ,
//            {
//                text        : 'My handler',
//
//                handler     : this.onMyHandler,
//                scope       : this
//            }
        ].concat(items);

        this.on('beforeshow', this.onMyBeforeShow, this);
    },

    configureMenuItems : function () {
        this.callParent(arguments);

        var rec = this.rec;

        // there can be no record when clicked on the empty space in the schedule
        if (!rec) return;

        var colorMenu   = this.query('[isColorMenu]')[0].menu.items.first(),
            val         = colorMenu.getValue(),
            recVal      = rec.get('Color'),
            selectedEl  = null;

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
    },
    onMyHandler : function () {
        // the task on which the right click have occured
       console.log('!');
        var task        = this.rec;
        console.dir(task);

       
    },

    onMyBeforeShow : function() {
    	alert('onMyBeforeShow');
        // Allow delete only based on some condition
        var isDeleteAllowed = this.rec.get('AllowDelete');

        this.down('deleteTask').setVisible(isDeleteAllowed);
    }
});
