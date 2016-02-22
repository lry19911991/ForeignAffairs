/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.widget.calendar.CalendarManagerWindow
@extends Ext.window.Window
@aside guide gantt_calendars

{@img gantt/images/calendar.png}

This is just a {@link Gnt.widget.calendar.CalendarManager} widget, wrapped with the Ext.window.Window instance.
It proxies the {@link #calendar} config and {@link #applyChanges} method.

*/
Ext.define('Gnt.widget.calendar.CalendarManagerWindow', {
    extend          : 'Ext.window.Window',

    requires        : ['Gnt.widget.calendar.CalendarManager'],

    mixins          : ['Gnt.mixin.Localizable'],

    alias           : 'widget.calendarmanagerwindow',
    
    width       : 800,
    height      : 600,
    layout      : 'fit',
    border      : false,

    /**
     * @cfg {Object} calendarConfig An object to be applied to the newly created instance of the {@link Gnt.widget.calendar.Calendar}
     */
    calendarConfig  : null,

    /**
     * @cfg {Gnt.data.CalendarManager} calendarManager An instance of the {@link Gnt.data.CalendarManager}
     */
    calendarManager : null,

    /**
     * @property {Gnt.widget.calendar.Calendar} calendarWidget An underlying calendar widget instance
     */
    calendarWidget  : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - ok         : 'Ok',
            - cancel     : 'Cancel',
     */

    initComponent   : function () {
        Ext.apply(this, {

            items       : [this.calendarWidget = new Gnt.widget.calendar.CalendarManager({
                calendarManager : this.calendarManager,
                calendarConfig  : this.calendarConfig 
            })],

            buttons     : [
                {
                    text        : this.L('ok'),
                    handler     : function(){
                        this.calendarWidget.applyChanges();
                    },
                    scope       : this
                },
                {
                    text        : this.L('cancel'),
                    handler     : function(){
                        this.close();
                    },
                    scope: this
                }
            ],
            
            listeners   : {
                beforeclose : this.onBeforeClose
            }
        });

        this.callParent(arguments);
    },

    /**
     * Call this method when user is satisfied with the current state of the calendar in the UI. It will apply all the changes made in the UI
     * to the original calendar.
     */
    applyChanges    : function () {
        this.calendarWidget.applyChanges();
    },
    
    onBeforeClose   : function () {
        var me              = this;
        var calendarManager = this.calendarManager;
        var calendarWidget  = this.calendarWidget;
        var calendarPanel   = calendarWidget.calendarPanel;
        var treePanel       = calendarWidget.treePanel;
        
        if (this.calendarWidget.checkChanges()) {
            Ext.Msg.show({
                title      : calendarWidget.L('confirm_action'),
                msg        : calendarWidget.L('confirm_message'),
                buttons    : Ext.Msg.YESNOCANCEL,
                icon       : Ext.Msg.QUESTION,
                fn         : function (btn) {
                    if (btn == 'yes') {
                        // see the comment above  
                        var movingNode  = calendarManager.getNodeById(calendarPanel.calendar.calendarId);
                        calendarWidget.applyChanges(movingNode);
                        me.close();
                    } else if (btn == 'no') {
                        me.suspendEvents();
                        me.close();
                    }
                }
            });
            return false;
        }
    }
});
