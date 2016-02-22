/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.widget.calendar.CalendarManager
@extends Ext.panel.Panel
@aside guide gantt_calendars

{@img gantt/images/calendar.png}

This widget can be used to manage calendars. As the input it should receive an instance of the {@link Gnt.data.CalendarManager} class.
Displays hierarchy of calendars attached to this CalendarManager and allows to edit calendar itself using {@link Gnt.data.widget.calendar.Calendar}.
Once the editing is done and user is happy with the result the {@link #applyChanges} method should be called. It will apply
all the changes user made in UI to the calendar.
This widget also checks changes in calendar when user navigates through the tree. In case changes were made widget displays confirmation
window with buttons "yes", "no", "cancel".

Note, this widget does not have the "Ok", "Apply changes" etc button intentionally, as you might want to combine it with your widgets.
See {@link Gnt.widget.calendar.CalendarManagerWindow} for this widget embedded in the Ext.window.Window instance.

calendarManager = Ext.create('Gnt.data.CalendarManager', {});

calendarManagerWidget = new Gnt.widget.calendar.CalendarManager({
    calendarManager : calendarManager
});

*/
Ext.define('Gnt.widget.calendar.CalendarManager', {
    extend          : 'Ext.panel.Panel',

    requires        : [
        'Gnt.widget.calendar.Calendar',
        'Gnt.data.calendar.BusinessTime',
        'Ext.menu.Menu'
    ],

    mixins          : ['Gnt.mixin.Localizable'],

    alias           : 'widget.calendarmanager',



    /**
     * @cfg {Object} calendarConfig An object to be applied to the newly created instance of the {@link Gnt.widget.calendar.Calendar}
     */
    calendarConfig  : null,

    /**
     * @cfg {Gnt.data.CalendarManager} calendarManager An instance of the {@link Gnt.data.CalendarManager}
     */
    calendarManager : null,

    /**
     * @property {Gnt.widget.calendar.Calendar} calendarPanel An underlying calendar widget instance
     */
    calendarPanel   : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - ok         : 'Ok',
            - cancel     : 'Cancel',
     */

    /**
     */
    emptyCalendar   : null,


    initComponent   : function () {
        var me = this;

        Ext.apply(this, {
            layout      : 'border',
            width           : 800,
            height          : 550,
            items       : [
                this.treePanel = new Ext.tree.Panel({
                    split       : true,
                    region      : 'west',
                    width       : 200,
                    store       : this.calendarManager,
                    displayField: 'Name',
                    rootVisible : false,
                    tbar        : [
                        { itemId: 'btnAdd', text: this.L('addText'), action: 'add', iconCls: 'gnt-action-add', handler: this.onAddCalendar, scope: this },
                        { itemId: 'btnRemove', text: this.L('removeText'), action: 'remove', iconCls: 'gnt-action-remove', handler: this.onRemoveCalendar, scope: this }
                    ],
                    viewConfig  : {
                        plugins     : { ptype: 'treeviewdragdrop' },
                        getRowClass: function(record, rowIndex, rowParams, store){
                            if (me.calendarManager.getProjectCalendar() == record.calendar){
                                return 'gnt-project-calendar-row';
                            }
                        },
                        listeners   : {
                            drop        : this.onDrop,
                            scope       : this
                        }
                    },
                    listeners   : {
                        'containercontextmenu'  : this.onContainerContextMenu,
                        'itemcontextmenu'       : this.onItemContextMenu,
                        'selectionchange'       : this.onSelectionChange,
                        scope                   : this
                    }
                }),
                this.calendarPanel = new Gnt.widget.calendar.Calendar(Ext.apply({
                    region          : 'center',

                    calendar        : this.emptyCalendar = new Gnt.data.calendar.BusinessTime({ name : 'initial' }),
                    split           : true,
                    calendarManager : this.calendarManager
                }, this.calendarConfig))
            ]

//            listeners   : {
//                // changing selection in tree causes this panel to updateLayout,
//                // which is impossible while it isn't rendered yet
//                'afterlayout' : {
//                    fn      : function (panel) {
//                        var toSelect = me.treePanel.getRootNode().firstChild;
//                        if (toSelect){
//                            me.treePanel.getSelectionModel().select(toSelect);
//                        }
//                    },
//                    single  : true
//                }
//
//            }
        });

        this.callParent(arguments);

        this.itemContextMenu = new Ext.menu.Menu({
            margin: '0 0 10 0',
            items: [
                {
                    text    : this.L('add_child'),
                    handler : this.addCalendar,
                    scope   : this
                },
                {
                    text: this.L('add_sibling'),
                    handler : this.addSiblingCalendar,
                    scope   : this
                },
                {
                    text: this.L('remove'),
                    handler : this.removeCalendar,
                    scope   : this
                }
            ]
        });

        this.containerContextMenu = new Ext.menu.Menu({
            margin: '0 0 10 0',
            items: [{
                text    : this.L('add_node'),
                handler : this.addNode,
                scope   : this
            }]
        });

        // for debug purposes
        this.counter = 1;
    },

    onContainerContextMenu  : function (view, e) {
        e.stopEvent();
        this.containerContextMenu.showAt(e.getXY());
    },

    onItemContextMenu       : function (view, record, item, index, e) {
        e.stopEvent();
        this.itemContextMenu.showAt(e.getXY());
    },

    checkChanges            : function () {
        if (this.calendarPanel.calendar != this.emptyCalendar && this.calendarPanel.checkChanges()) {
            return true;
        }
        return false;
    },

    onSelectionChange       : function (treePanelView, selected, eOpts) {
        // Note, that when this method is called, the selection in the tree actually has already been changed.
        // But, the calendar in the center region has not been updated yet (we do it manually below with
        // calendarPanel.setCalendar() call
        // that is why `calendarPanel.calendar` still contains the data calendar from previously(!) selected calendar row in tree
        var treePanel       = this.treePanel;
        var calendarManager = this.calendarManager;
        var calendarPanel   = this.calendarPanel;

        if (selected.length > 0) {
            var selectedCalendar = selected[ 0 ];

            if (calendarPanel.calendar != this.emptyCalendar && calendarPanel.checkChanges()) {
                Ext.Msg.show({
                    title      : this.L('confirm_action'),
                    msg        : this.L('confirm_message'),
                    buttons    : Ext.Msg.YESNOCANCEL,
                    icon       : Ext.Msg.QUESTION,
                    fn         : function (btn) {
                        if (btn == 'yes') {
                            // see the comment above
                            var movingNode  = calendarManager.getNodeById(calendarPanel.calendar.calendarId);
                            calendarPanel.applyChanges(movingNode);
                            calendarPanel.setCalendar(selectedCalendar.getCalendar());
                        } else if (btn == 'no') {
                            calendarPanel.setCalendar(selectedCalendar.getCalendar());
                        } else {
                            treePanelView.suspendEvents();
                            //                                         see the comment above
                            treePanelView.select(calendarManager.getNodeById(calendarPanel.calendar.calendarId));
                            treePanelView.resumeEvents();
                        }
                    }
                });
            } else {
                calendarPanel.setCalendar(selectedCalendar.getCalendar());
            }
        }
    },

    onDrop          : function (node, data, overModel, dropPosition) {
        Ext.each(data.records, function (record){
            record.calendar.setParent(overModel.calendar);
        });
        this.calendarPanel.cmbParentCalendar.setValue(overModel.calendar.calendarId);
    },

    onDestroy       : function () {
        this.containerContextMenu.destroy();
        this.itemContextMenu.destroy();
        this.callParent(arguments);
    },

    /**
     * Call this method when user is satisfied with the current state of the calendar in the UI. It will apply all the changes made in the UI
     * to the original calendar.
     * @method applyChanges
     * @param {Ext.data.NodeInterface (optional)} movingNode Previously selected node. Generally you won't need this argument, we use in "selectionchange" listener
     */
    applyChanges    : function (movingNode) {
        var calendarManager     = this.calendarManager;
        var calendarPanel       = this.calendarPanel;
        var parentId            = calendarPanel.cmbParentCalendar.getValue();
        var newParent           = parentId == -1 ? calendarManager.getRootNode() : calendarManager.getNodeById(parentId);
        var selection           = this.treePanel.getSelectionModel().getSelection();
        var selectedCalendar    = selection.length ? selection[0] : null;

        movingNode = movingNode || selectedCalendar;

        if (movingNode && newParent != movingNode.parentNode) {
            newParent.data.leaf         = false;
            newParent.data.expanded     = true;
            newParent.appendChild(movingNode);
        }

//        if (selected){
//            newParent.appendChild(selected);
//        }

        // call default method
        calendarPanel.applyChanges();

        Ext.each(calendarManager.getModifiedRecords(), function (record) {
            //record.commit();
        });
    },

    onAddCalendar   : function () {
        this.addCalendar();
    },

    addCalendar     : function (parent) {
        var proto = Ext.ClassManager.get(this.calendarManager.calendarClass).prototype;

        var config = {
            Name                : this.L('calendarName') + this.counter++,
            DaysPerMonth        : proto.daysPerMonth,
            DaysPerWeek         : proto.daysPerWeek,
            HoursPerDay         : proto.hoursPerDay,
            WeekendsAreWorkdays : proto.weekendsAreWorkdays,
            WeekendFirstDay     : proto.weekendFirstDay,
            WeekendSecondDay    : proto.weekendSecondDay,
            DefaultAvailability : proto.defaultAvailability,
            expanded            : true,
            leaf                : true
        };

        if (!(parent && parent instanceof Gnt.model.Calendar)) {
            var selection = this.treePanel.getSelectionModel().getSelection();

            if (selection.length) {
                parent = selection[0];
            }
        }

        parent = parent || this.treePanel.getRootNode();

        // TODO: deal with bugs in Ext.tree.Panel
        parent.data.leaf = false;
        parent.data.expanded = true;
        parent.appendChild(config);
    },

    addSiblingCalendar  : function(){
        var selection = this.treePanel.getSelectionModel().getSelection();

        if (selection.length > 0){
            this.addCalendar(selection[0].parentNode);
        }
    },

    addNode : function(){
        this.addCalendar(this.treePanel.getRootNode());
    },

    onRemoveCalendar    : function () {
        this.removeCalendar();
    },

    removeCalendar      : function(){
        var selection   = this.treePanel.getSelectionModel().getSelection();
        var root        = this.treePanel.getRootNode();

        if (selection.length > 0){
            var node = selection[0];

            var next = node.nextSibling || node.previousSibling || (node.parentNode == root ? root.firstChild : node.parentNode);
            if (next) {
                this.treePanel.getSelectionModel().select(next);
            } else {
                this.calendarPanel.setCalendar(new Gnt.data.calendar.BusinessCalendar());
            }

            node.remove();
        }
    }

//    ,
//    // TODO: calendar is both model.Calendar and data.Calendar
//    setCalendar         : function(calendar){
//        // set focus in tree
//        if (calendar instanceof Gnt.model.Calendar){
//            this.calendarPanel.setCalendar(calendar.calendar);
//        } else {
//            this.calendarPanel.setCalendar(calendar);
//        }
//    }
});
