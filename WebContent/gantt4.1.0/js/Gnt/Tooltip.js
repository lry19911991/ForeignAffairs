/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/*
@class Gnt.Tooltip
@extends Ext.ToolTip
@private

Internal tooltip class showing task start/end/duration information for a single task.
*/
Ext.define("Gnt.Tooltip", {
    extend      : 'Ext.ToolTip',
    alias       : 'widget.gantt_task_tooltip',

    requires    : ['Ext.Template'],

    mixins      : ['Gnt.mixin.Localizable'],

    /*
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - startText       : 'Starts: ',
            - endText         : 'Ends: ',
            - durationText    : 'Duration:'
     */

    /*
     * @cfg {String} mode Either "startend" - showing start date and end date, or "duration" to show start date and duration
     */
    mode            : 'startend',

    autoHide        : false,
    anchor          : 'b-tl',
    maskOnDisable   : false,

    /*
     * @cfg {Ext.Template} template An HTML snippet used for the tooltip display.
     * In "startend" mode, it will receive a data object containing "startText", "endText" and "task" (the entire task) properties.
     * In "duration" mode, it will receive a data object containing "startText", "duration", "unit" and "task" (the entire task) properties.
     */
    template : null,

    gantt    : null,

    initComponent : function() {
        this.rtl = this.gantt.rtl;

        this.startLabel     = this.L('startText');
        this.endLabel       = this.L('endText');
        this.durationLabel  = this.L('durationText');

        if (!this.template) {
            this.template = new Ext.Template(
                '<div class="sch-timetipwrap {cls}">' +
                    '<table cellpadding="0" cellspacing="0">' +
                        '<tpl if="value1"><tr><td class="sch-gantt-tip-desc">{label1}</td><td class="sch-gantt-tip-value">{value1}</td></tr></tpl>' +
                        '<tr><td class="sch-gantt-tip-desc">{label2}</td><td class="sch-gantt-tip-value">{value2}</td></tr>' +
                    '</table>' +
                '</div>'
            ).compile();
        }


        this.callParent(arguments);

        this.update(this.template.apply({ value1 : '', value2 : '' }));
        this.addCls('gnt-tooltip');
    },

    updateContent : function (start, end, valid, taskRecord) {
        var content;

        if (this.mode === 'duration') {
            content = this.getDurationContent(start, end, valid, taskRecord);
        } else {
            content = this.getStartEndContent(start, end, valid, taskRecord);
        }

        this.update(content);
    },


    // private
    getStartEndContent : function(start, end, valid, taskRecord) {
        var gantt       = this.gantt,
            startText   = start && gantt.getFormattedDate(start),
            endText;

        if (start) {
            if(end - start > 0) {
                endText     = gantt.getFormattedEndDate(end, start);
            } else{
                endText     = startText;
            }
        } else {
            // Single point in time
            endText   = gantt.getFormattedEndDate(end);
        }

        var retVal = {
            cls         : valid ? 'sch-tip-ok' : 'sch-tip-notok',
            label2      : this.endLabel,
            value2      : endText,
            task        : taskRecord
        };

        if (start) {
            retVal.label1      = this.startLabel;
            retVal.value1      = start && gantt.getFormattedDate(start);
        }

        return this.template.apply(retVal);
    },


    getDurationContent : function(start, end, valid, taskRecord) {
        var unit        = taskRecord.getDurationUnit() || Sch.util.Date.DAY;
        var duration    = taskRecord.calculateDuration(start, end, unit);

        return this.template.apply({
            cls         : valid ? 'sch-tip-ok' : 'sch-tip-notok',
            label1      : this.startLabel,
            value1      : this.gantt.getFormattedDate(start),
            label2      : this.endLabel,
            value2      : parseFloat(Ext.Number.toFixed(duration, 1)) + ' ' + Sch.util.Date.getReadableNameOfUnit(unit, duration > 1),
            task        : taskRecord
        });
    },


    show : function(el, xPos) {
        if (el && (el.dom || el.className)) {
            this.setTarget(el);
        }

        this.callParent([]);

        // Must do this after callParent where rendering takes place
        if (xPos !== undefined) {
            this.setX(xPos);
        }
    }
});
