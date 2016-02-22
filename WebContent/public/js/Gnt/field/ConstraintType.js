/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * A specialized field, allowing a user to specify task constraint type.
 * This class inherits from the standard Ext JS "combo" field, so any usual `Ext.form.field.ComboBox` configs can be used.
 * 
 * In default setup the value of this field can be one of the following strings:
 * - aslateaspossible
 * - assoonaspossible
 * - finishnoearlythan
 * - finishnolaterthan
 * - mustfinishon
 * - muststarton
 * - startnoearlierthan
 * - startnolaterthan
 * but if one has created a new constraint class (see {@link Gnt.constraint.Base}) then this field value 
 * might be that new class alias part after the 'gntconstraint.' prefix.
 *
 * @class Gnt.field.ConstraintType
 * @extends Ext.form.field.ComboBox
 */
Ext.define('Gnt.field.ConstraintType', {
    extend                  : 'Ext.form.field.ComboBox',

    mixins                  : [
        'Gnt.field.mixin.TaskField', 
        'Gnt.mixin.Localizable'
    ],

    uses : [
        'Gnt.constraint.Base'
    ],

    alias                   : 'widget.constrainttypefield',

    alternateClassName      : 'Gnt.widget.ConstraintType.Field',

    taskField               : 'constraintTypeField',

    /**
     * @cfg {String} pickerAlign The align for combo-box's picker.
     */
    pickerAlign             : 'tl-bl?',

    /**
     * @cfg {Boolean} matchFieldWidth Whether the picker dropdown's width should be explicitly set to match the width of the field. Defaults to true.
     */
    matchFieldWidth         : false,

    editable                : false,

    forceSelection          : true,

    triggerAction           : 'all',

    /**
     * Localication object
     */
    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - none : 'None'
     */

    constructor : function(config) {
        var me = this;

        me.setSuppressTaskUpdate(true);
        me.callParent(arguments);
        me.setSuppressTaskUpdate(false);

        me.task && me.setTask(me.task);
    },

    initComponent : function() {
        var me = this;

        me.store = me.store || Gnt.field.ConstraintType.buildDefaultConstraintTypeList(me.L('none'));
        me.callParent(arguments);

        this.on('change', this.onFieldChange, this);
    },

    destroy : function () {
        this.destroyTaskListener();

        this.callParent();
    },


    onSetTask : function () {
        this.setValue(this.task.getConstraintType());
    },


    // will be used in the column's renderer
    valueToVisible : function (value, task) {
        var me              = this,
            displayTplData  = [];

        var record = this.findRecordByValue(!Ext.isEmpty(value) ? value : null);

        if (record) {
            displayTplData.push(record.data);
        } else if (Ext.isDefined(me.valueNotFoundText)) {
            displayTplData.push(me.valueNotFoundText);
        }

        return me.displayTpl.apply(displayTplData);
    },

    applyChanges : function (task) {
        var me = this,
            constraintClass,
            value = me.getValue();

        task            = task || me.task;
        constraintClass = Gnt.constraint.Base.getConstraintClass(value);

        task.setConstraint(value, constraintClass && constraintClass.getInitialConstraintDate(task) || null);
    },

    onFieldChange : function (value) {
        var me = this;

        if (!me.getSuppressTaskUpdate() && me.task && value) {
            // apply changes to task
            me.applyChanges();
            me.task.fireEvent('taskupdated', me.task, me);
        }
    },

    statics : {
        /**
         * Builds default constraint type list by scanning Gnt.constraint namespace for suitable constraint classes
         *
         * @param {String} [noneText] Text to use for no constraint item, no constraint will be prepended to the list
         *  if text is given.
         */
        buildDefaultConstraintTypeList : function(noneText) {
            var result = [];

            Ext.Array.each(Ext.ClassManager.getNamesByExpression('gntconstraint.*'), function(name) {
                var singleton = Ext.ClassManager.get(name),
                    alias     = singleton.alias[0],
                    id        = alias.split('.').pop();

                singleton && (result.push([ id, singleton.L('name') ]));
            });
            
            result = Ext.Array.sort(result, function(a, b) { return a[1] > b[1] ? 1 : -1; });
            noneText && result.unshift( [ null, noneText ] );

            return result;
        }
    }

});
