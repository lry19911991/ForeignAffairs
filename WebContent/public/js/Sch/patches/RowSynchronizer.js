if (!Ext.ClassManager.get("Sch.patches.RowSynchronizer")) {
    if (Ext.versions.extjs.isGreaterThan('5.1.0')) {

        Ext.define('Sch.patches.RowSynchronizer', {
            extend : 'Sch.util.Patch',

            requires : ['Ext.grid.locking.RowSynchronizer'],

            target     : 'Ext.grid.locking.RowSynchronizer',
            minVersion : '5.1.0',

            overrides : {

                finish : function (other) {
                    if (!other) return;

                    return this.callParent(arguments);
                }
            }
        });

    } else {
        Ext.define('Sch.patches.RowSynchronizer', {});
    }
}
