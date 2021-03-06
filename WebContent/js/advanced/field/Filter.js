Ext.define("Gnt.examples.advanced.field.Filter", {
    extend          : "Ext.form.TextField",
    xtype           : 'gantt-filter-field',
    enableKeyEvents : true,

    margin          : 0,
    border          : 0,
    cls             : 'filterfield',
    width           : '100%',
    hideLabel       : true,

    listeners : {
        'keyup' : {
            fn : function (field, e) {
                var value = field.getValue();
                var regexp = new RegExp(Ext.String.escapeRegex(value), 'i');

                if (value) {
                    field.store.filterTreeBy(function (task) {
                        return regexp.test(task.get('Name'));
                    });
                } else {
                    field.store.clearTreeFilter();
                }
            },
            buffer : 200
        },
        'keydown'    : function (field, e) {
            // prevent opening menu on this field
            if (e.getKey() === e.DOWN) {
                e.stopEvent();
            }
        },
        'specialkey' : {
            fn : function (field, e) {
                if (e.getKey() === e.ESC) {
                    field.reset();
                    field.store.clearTreeFilter();
                }
            }
        },
        'render'  : function () {
            this.store = this.up('ganttpanel').taskStore;
        }
    }
});
