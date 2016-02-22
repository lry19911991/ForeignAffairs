/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

 @class Gnt.view.ResourceHistogram
 @extends Sch.view.TimelineGridView

 A view of the resource histogram panel. Use the {@link Gnt.panel.ResourceHistogram#getSchedulingView} method to get its instance from gantt panel.

 */
 Ext.define('Gnt.view.ResourceHistogram', {
    extend                  : 'Sch.view.TimelineGridView',

    alias                   : 'widget.resourcehistogramview',

    requires    : [
        'Ext.XTemplate',
        'Ext.util.Format',
        'Sch.util.Date',
        'Gnt.model.Resource'
    ],

    _cmpCls                 : 'gnt-resourcehistogramview',

    scheduledEventName      : 'bar',

    // private
    eventSelector           : '.gnt-resourcehistogram-bar',

    barTpl                  : null,

    barRenderer             : Ext.emptyFn,

    lineTpl                 : null,
    limitLineTpl            : null,

     // private cls properties
    _barCls                 : 'gnt-resourcehistogram-bar',
    _limitLineCls           : 'gnt-resourcehistogram-limitline',
    _limitLineVerticalCls   : 'gnt-resourcehistogram-limitline-vertical',
    _lineCls                : 'gnt-resourcehistogram-line',

    barCls                  : null,
    limitLineCls            : null,
    lineCls                 : null,


    limitLineWidth          : 1,

    rowHeight               : 60,

    showLimitLinesThreshold : 10,
    showVerticalLimitLines  : true,

    labelMode               : false,

    labelPercentFormat      : '0',

    labelUnitsFormat        : '0.0',
    histogram               : null,
    unitHeight              : null,
    availableRowHeight      : null,

     /**
      * @event barclick
      * Fires when a histogram bar is clicked
      *
      * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
      * @param {Object} context Object containing a description of the clicked bar.
      * @param {Gnt.model.Resource} context.resource The resource record.
      * @param {Date} context.startDate Start date of corresponding period.
      * @param {Date} context.endDate End date of corresponding period.
      * @param {Number} context.allocationMS Resource allocation time in milliseconds.
      * @param {Number} context.totalAllocation Resource allocation (in percents).
      * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
      * @param {Ext.EventObject} e The event object
      */

     /**
      * @event bardblclick
      * Fires when a histogram bar is double clicked
      *
      * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
      * @param {Object} context Object containing description of clicked bar.
      * @param {Gnt.model.Resource} context.resource The resource record.
      * @param {Date} context.startDate Start date of corresponding period.
      * @param {Date} context.endDate End date of corresponding period.
      * @param {Number} context.allocationMS Resource allocation time in milliseconds.
      * @param {Number} context.totalAllocation Resource allocation (in percents).
      * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
      * @param {Ext.EventObject} e The event object
      */

     /**
      * @event barcontextmenu
      * Fires when contextmenu is activated on a histogram bar
      *
      * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
      * @param {Object} context Object containing description of clicked bar.
      * @param {Gnt.model.Resource} context.resource The resource record.
      * @param {Date} context.startDate Start date of corresponding period.
      * @param {Date} context.endDate End date of corresponding period.
      * @param {Number} context.allocationMS Resource allocation time in milliseconds.
      * @param {Number} context.totalAllocation Resource allocation (in percents).
      * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
      * @param {Ext.EventObject} e The event object
      */

    initComponent : function (config) {

        if (this.barCls) {
            this.eventSelector = '.' + this.barCls;
        }

        // bar template
        if (!this.barTpl) {
            this.barTpl = new Ext.XTemplate(
                '<tpl for=".">',
                    '<div id="{id}" class="gnt-resourcehistogram-bar '+ (this.barCls || '') +' {cls}" gnt-bar-index="{index}" style="left:{left}px;top:{top}px;height:{height}px;width:{width}px">',
                        '<tpl if="text !== \'\'">',
                            '<span class="gnt-resourcehistogram-bar-text" style="bottom:' + Math.floor(this.rowHeight/2) + 'px">{text}</span>',
                        '</tpl>',
                    '</div>',
                '</tpl>'
            );
        }

        // scale line template
        if (!this.lineTpl) {
            this.lineTpl = new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="gnt-resourcehistogram-line '+ (this.lineCls || '') +' {cls}" style="top:{top}px;"></div>',
                '</tpl>'
            );
        }

        // limit line template
        if (!this.limitLineTpl) {
            this.limitLineTpl = new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="gnt-resourcehistogram-limitline '+ (this.limitLineCls || '') +' {cls}" style="left:{left}px;top:{top}px;width:{width}px;height:{height}px"></div>',
                '</tpl>'
            );
        }

        this.callParent(arguments);

        // calculate pixels per scale step
        this.unitHeight = this.getAvailableRowHeight() / (this.scaleMax - this.scaleMin + this.scaleStep);
    },

    // histogram scale lines renderer
    renderLines : function (histogram) {
        return this.lineTpl.apply(this.prepareLines(histogram));
    },

    // prepare data for scale lines renderer
    prepareLines : function (histogram) {
        var value       = histogram.scaleMin,
            labelStep   = histogram.scaleLabelStep,
            rowHeight   = this.getAvailableRowHeight(),
            tplData     = [],
            lineCls     = this._lineCls,
            cls         = lineCls + 'min';

        // if scale point array specified
        if (histogram.scalePoints) {
            var point;
            for (var i = 0, l = histogram.scalePoints.length; i < l; i++) {
                point = histogram.scalePoints[i];

                tplData.push({
                    value   : point.value,
                    top     : point.top || Math.round(rowHeight - this.unitHeight * (point.value - histogram.scaleMin)),
                    cls     : point.cls + (point.label ? ' '+lineCls+'-label' : '') + (i === 0 ? ' '+lineCls+'-min' : (i == l ? ' '+lineCls+'-max' : ''))
                });
            }

        // otherwise we have to calculate line top-coordinates
        } else {
            // loop from scaleMin up to scaleMax
            while (value <= histogram.scaleMax) {

                tplData.push({
                    value   : value,
                    top     : Math.round(rowHeight - this.unitHeight * (value - histogram.scaleMin)),
                    cls     : cls
                });

                // increment by scale step size
                value   += histogram.scaleStep;

                cls     = value % labelStep ? '' : lineCls+'-label';

                if (value == histogram.scaleMax) cls += ' '+lineCls+'-max';
            }

            // ensure that we have scaleMax as last tplData element (we can step over it for some stepSize values)
            if (tplData.length && tplData[tplData.length - 1].value !== histogram.scaleMax) {
                tplData.push({
                    value   : histogram.scaleMax,
                    top     : Math.round(rowHeight - this.unitHeight * (histogram.scaleMax - histogram.scaleMin)),
                    cls     : (histogram.scaleMax % labelStep ? '' : lineCls+'-label') + ' '+lineCls+'-max'
                });
            }
        }

        return tplData;
    },

    renderLimitLines : function (histogram, data) {
        return this.limitLineTpl.apply(this.prepareLimitLines(histogram, data));
    },

    getLimitLinesConnector : function (from, to) {
        return {
            left    : from.right,
            width   : 1,
            top     : Math.min(from.top, to.top),
            height  : Math.abs(from.top - to.top) + this.limitLineWidth,
            cls     : this._limitLineCls + '-top' + ' ' + this._limitLineVerticalCls
        };
    },

    pushLimitLine : function (tplData, line, toMerge) {
        var prev    = tplData[tplData.length - 1];

        // if we had cached lines too small to display
        if (toMerge) {
            // let's lengthen the previous line (if any) right coordinate
            if (prev) {
                prev.width  = toMerge.right - prev.left;
                prev.right  = toMerge.right;
            } else {
                line.left   = toMerge.left;
                line.width  = line.right - toMerge.left;
            }
            toMerge     = null;
        }

        if (prev && this.showVerticalLimitLines) {
            // if previous line is invisible get rid of it
            if (!prev.visible) tplData.pop();

            tplData.push(this.getLimitLinesConnector(prev, line));
        }

        tplData.push(line);
    },

    prepareLimitLines : function (histogram, data) {
        if (!data) return;

        var tplData     = [],
            rowHeight   = this.getAvailableRowHeight(),
            lineCls     = this._limitLineCls,
            toMerge,
            line,
            prev;

        for (var i = 0, l = data.length; i < l; i++) {

            // get allocation in histogram.scaleUnit units
            var allocation  = histogram.calendar.convertMSDurationToUnit(data[i].allocationMS, histogram.scaleUnit);

            var visible     = true;

            // if the line doesn't fit into row height
            if (allocation * this.unitHeight > rowHeight) {
                allocation  = histogram.scaleMax + histogram.scaleStep;
                visible     = false;
            } else if (allocation <= 0) {
                allocation  = 0;
                visible     = false;
            }

            var left    = this.getXFromDate(data[i].startDate || histogram.getStart(), true);
            var right   = this.getXFromDate(data[i].endDate || histogram.getEnd(), true);

            // interval may start before timeaxis start
            if (left < 0) {
                left    = 0;
                if (right < 0) continue;
            // interval may end after timeaxis end
            } else {
                if (right < 0) right = this.getXFromDate(histogram.getEnd(), true);
            }

            line        = {
                left    : left,
                width   : right - left,
                right   : right,
                top     : '',
                height  : 0,
                cls     : '',
                visible : visible
            };

            // get top-position based on max possible allocation
            line.top    = Math.round(rowHeight - (allocation - histogram.scaleMin) * this.unitHeight);

            if (visible) {
                line.cls += ' '+lineCls+'-top';
            }

            prev        = tplData[tplData.length - 1] || toMerge;

            // check if line size is less than threshold
            var small   = line.width <= this.showLimitLinesThreshold;

            // if the line has the same allocation as the previous one
            // or it's a small invisible line -> then we merge it w/ the previous line
            if (prev && (line.top == prev.top || (small && !visible))) {

                prev.width  = right - prev.left;
                prev.right  = right;
                // reset cached line
                line        = null;

                // if we have a pushed line we simply skip small line(s) after it
                if (tplData[tplData.length - 1]) {
                    toMerge = null;
                // if we enlarged "toMerge" line and its width got greater than threshold
                } else if (toMerge.width > this.showLimitLinesThreshold) {
                    this.pushLimitLine(tplData, toMerge);
                    // reset cached line since we just pushed it
                    toMerge = null;
                }

            // if the line is small and visible we'll try to merge it w/ next lines and approximate its top coordinate
            } else if (small && visible) {

                // if the previous line was also too small
                if (toMerge) {
                    var width = toMerge.width + line.width;
                    // merge both lines and approximate average top level
                    toMerge.top     = Math.round(line.top * line.width/width + toMerge.top * toMerge.width/width);
                    toMerge.width   = right - toMerge.left;
                    toMerge.right   = right;
                // remember this line hoping to merge w/ the next line
                } else {
                    toMerge     = line;
                }

                // if merged line width is greater than threshold
                if (toMerge.width > this.showLimitLinesThreshold) {
                    this.pushLimitLine(tplData, toMerge);
                    // reset cached lines since we just pushed them
                    line = toMerge = null;
                }

            // if the current line is large enough to display
            } else {
                this.pushLimitLine(tplData, line, toMerge);
                // reset cached lines since we just pushed them
                line = toMerge = null;
            }

        }

        line && this.pushLimitLine(tplData, line, toMerge);

        // make sure we don't have invisible line in the last item
        prev    = tplData[tplData.length - 1];
        if (prev && !prev.visible) tplData.pop();

        return tplData;
    },

    renderBars : function (histogram, data, resourceId) {
        return this.barTpl.apply(this.prepareBars(histogram, data, resourceId));
    },

    prepareBars : function (histogram, data, resourceId) {
        if (!data) return;

        // loop over periods that we have for the resource
        var tplData     = [],
            rowHeight   = this.getAvailableRowHeight(),
            barCls      = this._barCls,
            tplItem,
            allocation;

        for (var i = 0, l = data.length; i < l; i++) {

            // if resource is allocated
            if (data[i].totalAllocation) {

                // get allocation in units (hours by default)
                allocation          = histogram.calendar.convertMSDurationToUnit(data[i].allocationMS, histogram.scaleUnit);

                tplItem = Ext.apply({
                    id      : resourceId + '-' + i,
                    index   : i,
                    left    : this.getXFromDate(data[i].startDate, true),
                    width   : this.getXFromDate(data[i].endDate, true) - this.getXFromDate(data[i].startDate, true),
                    height  : rowHeight,
                    top     : 0,
                    text    : '',
                    cls     : ''
                }, this.barRenderer(resourceId, data[i]));

                // if label has to be shown
                if (this.labelMode) {
                    // what type of label requested
                    switch (this.labelMode) {
                        case 'percent'  :
                            tplItem.text = Ext.util.Format.number(data[i].totalAllocation, this.labelPercentFormat) + '%';
                            break;

                        case 'units'    :
                            tplItem.text = Ext.util.Format.number(allocation,  this.labelUnitsFormat) + Sch.util.Date.getShortNameOfUnit(histogram.scaleUnit);
                            break;

                        // custom template
                        default         :
                            tplItem.text = this.labelMode.apply({
                                allocation  : allocation,
                                percent     : data[i].totalAllocation
                            });
                    }
                }

                // if the bar fits in row height
                if (allocation <= histogram.scaleMax + histogram.scaleStep) {
                    tplItem.height  = allocation >= histogram.scaleMin ? Math.round((allocation - histogram.scaleMin) * this.unitHeight) : 0;
                    tplItem.top     = rowHeight - tplItem.height;
                // if bar is higher than row height
                } else {
                    // add class to indicate it
                    tplItem.cls     = barCls+'-partofbar';
                }

                // overworking (allocation > 100%)
                if (data[i].totalAllocation > 100 || data[i].totalOverAllocationMS > 0) {
                    tplItem.cls = barCls+'-overwork';
                }

                tplData.push(tplItem);
            }
        }

        return tplData;
    },


    getAvailableRowHeight : function () {
        if (this.availableRowHeight) return this.availableRowHeight;

        this.availableRowHeight    = this.rowHeight - this.cellTopBorderWidth - this.cellBottomBorderWidth;

        return this.availableRowHeight;
    },

    resolveEventRecord : function (el) {
        var node = this.findItemByChild(el);
        if (node) {
            var resource = this.getRecord(node);
            if (resource) {
                var result = {
                    resource    : resource
                };
                var data    = this.histogram.allocationData[resource.getInternalId()];
                var index   = el.getAttribute('gnt-bar-index');
                var bar     = data.bars[index];
                if (bar) {
                    result.startDate        = bar.startDate;
                    result.endDate          = bar.endDate;
                    result.assignments      = bar.assignments;
                    result.allocationMS     = bar.allocationMS;
                    result.totalAllocation  = bar.totalAllocation;
                }

                return result;
            }
        }
        return null;
    },

    resolveEventRecordFromResourceRow : function (el) {
        return this.resolveEventRecord(el);
    },

    getDataForTooltipTpl : function (record) {
        return record;
    }

});
