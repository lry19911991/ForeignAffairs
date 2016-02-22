/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Sch.data.undoredo.action.flat.Update', {
    extend          : 'Sch.data.undoredo.action.Base',

    uses : [
        'Ext.Array'
    ],

    config : {
        record     : null,
        fieldNames : null
    },

    oldValues       : null,
    newValues       : null,

    constructor : function(config) {
        var me = this;

        me.callParent([config]);
        me.initConfig(config);
        me.saveValues();
    },

    saveValues : function() {
        var me = this,
            record = me.getRecord(),
            fieldNames = me.getFieldNames();

        if (fieldNames) {
            me.oldValues = Ext.Array.map(fieldNames, function (fieldName) {
                return me.processSavingOldValue(fieldName, record);
            });

            me.newValues = Ext.Array.map(fieldNames, function (fieldName) {
                return me.processSavingNewValue(fieldName, record);
            });
        }
    },

    undo : function () {
        var CPM,
            me          = this,
            record      = me.getRecord(),
            fieldNames  = me.getFieldNames(),
            setObj;

        if (fieldNames) {

            CPM = me.self.CUSTOMLY_PROCESSED;

            record.beginEdit();

            setObj = Ext.Array.reduce(fieldNames, function(prev, curr, i) {
                var processedVal;

                // we'll be a bit defensive
                if (curr) {
                    processedVal = me.processRestoringValue(me.oldValues[ i ], curr, record);
                    if (processedVal !== CPM) {
                        prev[ curr ] = processedVal;
                    }
                }

                return prev;
            }, {});

            record.set(setObj);

            record.endEdit();
        }
    },

    redo : function () {
        var CPM,
            me          = this,
            record      = me.getRecord(),
            fieldNames  = me.getFieldNames(),
            setObj;

        if (fieldNames) {

            CPM = me.self.CUSTOMLY_PROCESSED;

            record.beginEdit();

            setObj = Ext.Array.reduce(fieldNames, function(prev, curr, i) {
                var processedVal;

                // we'll be a bit defensive
                if (curr) {
                    processedVal = me.processRestoringValue(me.newValues[ i ], curr, record);
                    if (processedVal !== CPM) {
                        prev[ curr ] = processedVal;
                    }
                }

                return prev;
            }, {});

            record.set(setObj);

            record.endEdit();
        }
    },

    /**
     * @method
     */
    processSavingOldValue : function(fieldName, record) {
        return (record.previous || record.previousValues)[ fieldName ];
    },

    /**
     * @method
     */
    processSavingNewValue : function(fieldName, record) {
        return record.get(fieldName);
    },

    /**
     * @method
     */
    processRestoringValue : Ext.identityFn,

    inheritableStatics : {
        CUSTOMLY_PROCESSED : {}
    }
});
