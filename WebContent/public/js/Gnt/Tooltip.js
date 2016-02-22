/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/*
@class Gnt.Tooltip
@extends Ext.ToolTip
@private

Internal plugin showing task start/end/duration information for a single task.
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


    cls             : 'sch-tip',

    height          : 40,

    autoHide        : false,
    anchor          : 'b-tl',
    maskOnDisable   : false,

    /*
     * @cfg {Ext.Template} startEndTemplate An HTML snippet used for the tooltip display in "startend" mode. During rendering, it will receive a data object
     * containing "startText", "endText" and "task" (the entire task) properties.
     */
    startEndTemplate : null,

    /*
     * @cfg {Ext.Template} durationTemplate An HTML snippet used for the tooltip display in "duration" mode. During rendering, it will receive a data object
     * containing "startText", "duration", "unit" and "task" (the entire task) properties.
     */
    durationTemplate : null,

    initComponent : function() {
        this.rtl = this.gantt.rtl;

        if (this.mode === 'startend' && !this.startEndTemplate) {
            this.startEndTemplate = new Ext.Template(
            '<div class="sch-timetipwrap {cls}">' +
                '<table cellpadding="0" cellspacing="0">' +
                    '<tr><td class="sch-gantt-tip-desc">' + this.L('startText') + '</td><td class="sch-gantt-tip-value">{startText}</td></tr>' +
                    '<tr><td class="sch-gantt-tip-desc">' + this.L('endText') + '</td><td class="sch-gantt-tip-value">{endText}</td></tr>' +
                '</table>' +
            '</div>'
            ).compile();
        }

        if (this.mode === 'duration' && !this.durationTemplate) {
            this.durationTemplate = new Ext.Template(
                '<div class="sch-timetipwrap {cls}">',
                '<table cellpadding="0" cellspacing="0">' +
                    '<tr><td class="sch-gantt-tip-desc">' + this.L('startText') + '</td><td class="sch-gantt-tip-value"> {startText}</td></tr>',
                    '<tr><td class="sch-gantt-tip-desc">' + this.L('durationText') + '</td><td class="sch-gantt-tip-value"> {duration} {unit}' + '</td></tr>',
                '</table>' +
                '</div>'
            ).compile();
        }

        this.callParent(arguments);
    },



    update : function (start, end, valid, taskRecord) {
        var content;
        if (this.mode === 'duration') {
            content = this.getDurationContent(start, end, valid, taskRecord);
        } else {
            content = this.getStartEndContent(start, end, valid, taskRecord);
        }
        this.callParent([content]);
    },


    // private
    getStartEndContent : function(start, end, valid, taskRecord) {
        var gantt       = this.gantt,
            startText   = gantt.getFormattedDate(start),
            endText     = startText;

        if (end - start > 0) {
            endText = gantt.getFormattedEndDate(end, start);
        }

        var retVal = {
            cls         : valid ? 'sch-tip-ok' : 'sch-tip-notok',
            startText   : startText,
            endText     : endText,
            task        : taskRecord
        };

        return this.startEndTemplate.apply(retVal);
    },


    getDurationContent : function(start, end, valid, taskRecord) {
        var unit        = taskRecord.getDurationUnit() || Sch.util.Date.DAY;
        var duration    = taskRecord.calculateDuration(start, end, unit);

        return this.durationTemplate.apply({
            cls         : valid ? 'sch-tip-ok' : 'sch-tip-notok',
            startText   : this.gantt.getFormattedDate(start),
            duration    : parseFloat(Ext.Number.toFixed(duration, 1)),
            unit        : Sch.util.Date.getReadableNameOfUnit(unit, duration > 1),
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
