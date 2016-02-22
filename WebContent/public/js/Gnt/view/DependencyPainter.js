/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/*
 * @class Gnt.view.DependencyPainter
 * @extends Ext.util.Observable
 * @private
 * Internal class handling the drawing of inter-task dependencies.
 */
Ext.define("Gnt.view.DependencyPainter", {

    ganttView       : null,
    rowHeight       : null,
    arrowOffset     : 8,
    lineWidth       : 2,
    xOffset         : 6,

    constructor: function (cfg) {
        cfg = cfg || {};

        Ext.apply(this, cfg);
    },

    setRowHeight : function(height) {
        this.rowHeight = height;
    },

    getTaskBox: function (task) {
        var DT          = Sch.util.Date,
            taskStart   = task.getStartDate(),
            taskEnd     = task.getEndDate(),
            view        = this.ganttView,
            isBuffered  = view.bufferedRenderer,
            viewStart   = view.timeAxis.getStart(),
            viewEnd     = view.timeAxis.getEnd();

        // Assure task is:
        //      - not inside a collapsed parent task
        //      - fully scheduled
        //      - intersecting current view date range
        if (!task.isVisible() ||
            !taskStart ||
            !taskEnd ||
            !DT.intersectSpans(taskStart, taskEnd, viewStart, viewEnd)) {
            return null;
        }

        // Assure task is:
        //      - not filtered out
        if (view.store.indexOf(task) < 0) {
            var taskStore = view.taskStore;

            // If for any reason, a task is not part of the view flat store, and buffering is not enabled
            // we should not draw anything
            if (!isBuffered) {
                return null;
            }

            // Query the current filter to know if the task is truly filtered out of the current view
            if (taskStore.isTreeFiltered() && !taskStore.lastTreeFilter.filter.call(taskStore.lastTreeFilter.scope || taskStore, task)) {
                return null;
            }
        }

        var offsets,
            start       = view.getXFromDate(DT.max(taskStart, viewStart)),
            end         = view.getXFromDate(DT.min(taskEnd, viewEnd)),
            rowNode     = view.getNodeByRecord(task);

        if (rowNode || isBuffered) {
            var xOffset         = view.getXOffset(task),
                top, bottom,
                isMilestone     = task.isMilestone(),
                rendered        = true;

            if (start > xOffset) {
                start -= xOffset;
            }
            end += xOffset;

            var viewEl          = view.el;                                        // HACK: Reading private properties
            var viewElScrollTop = view.getScroll().top - (view.bufferedRenderer ? view.bufferedRenderer.bodyTop : 0);

            if (rowNode) {
                var eventNode = view.getEventNodeByRecord(task);
                // eventNode could be null if we are trying to paint dependencies for a non rendered task
                if (!eventNode) return null;

                offsets     = Ext.fly(eventNode).getOffsetsTo(viewEl);
                top         = offsets[1] + viewElScrollTop + (isMilestone && Ext.isIE8 ? 3 : 0);
                bottom      = top + Ext.fly(eventNode).getHeight();

                if (isMilestone) {
                    end       +=1;
                }
            } else {
                // View is buffered, and task element is not in DOM - try to project a reasonable box
                var nodes           = view.all.elements;
                var firstInView     = view.store.getAt(view.all.startIndex);

                if (task.isAbove(firstInView)) {
                    rowNode     = nodes[view.all.startIndex];
                    offsets     = Ext.fly(rowNode).getOffsetsTo(viewEl);
                    offsets[1]  -= view.getRowHeight();     // Make sure it's off screen
                } else {
                    rowNode     = nodes[view.all.endIndex];
                    offsets     = Ext.fly(rowNode).getOffsetsTo(viewEl);
                    offsets[1]  += view.getRowHeight();     // Make sure it's off screen
                }

                top     = offsets[1] + viewElScrollTop;
                bottom  = top + this.rowHeight;

                rendered = false;
            }

            return {
                top         : top,
                end         : end,
                bottom      : bottom,
                start       : start,
                rendered    : rendered
            };
        }
    },

    getRenderData : function(dependency) {
        var fromTask = dependency.getSourceTask(),
            toTask = dependency.getTargetTask();

        // When indenting, Ext JS might request a refresh of the node before it exists in the view properly
        // (task might not belong to a treeStore in this situation) so we should handle this case and not try to draw
        // if the task is currently being moved around in the task tree
        if (!fromTask || !fromTask.getTreeStore() || !toTask || !toTask.getTreeStore()) return null;

        var fromBox = this.getTaskBox(fromTask);
        var toBox = this.getTaskBox(toTask);
        var view = this.ganttView;

        if (view.bufferRender && fromBox && !fromBox.rendered && toBox && !toBox.rendered) {

            // Make sure the path between the tasks intersect current table chunk
            var firstInView    = view.store.getAt(view.all.startIndex);
            var lastInView     = view.store.getAt(view.all.endIndex);

            if ((fromTask.isAbove(firstInView) && toTask.isAbove(firstInView)) ||
                (lastInView.isAbove(fromTask) && lastInView.isAbove(toTask)))
            {
                return null;
            }
        }

        return {
            fromBox : fromBox,
            toBox   : toBox
        };
    },

    getDependencyTplData: function (dependencyRecords) {
        var me = this,
            view = me.ganttView;

        // Normalize input
        if (dependencyRecords instanceof Ext.data.Model) {
            dependencyRecords = [dependencyRecords];
        }

        if (dependencyRecords.length === 0 || view.store.getCount() === 0) {
            return;
        }

        var depData = [],
            coords, fromBox, toBox, dependency;

        for (var i = 0, l = dependencyRecords.length; i < l; i++) {
            dependency = dependencyRecords[i];

            var data = this.getRenderData(dependency);

            if (data) {
                fromBox = data.fromBox;
                toBox = data.toBox;

                if (fromBox && toBox) {
                    coords = me.getLineCoordinates(fromBox, toBox, dependency);

                    if (coords) {
                        depData.push({
                            dependency      : dependency,
                            id              : dependency.internalId,
                            cls             : dependency.getCls(),
                            lineCoordinates : coords
                        });
                    }
                }
            }
        }

        return depData;
    },

    getLineCoordinates: function (fromBox, toBox, dependency) {
        var startSide, endSide,
            startXY     = [0, fromBox.top - 1 + ((fromBox.bottom - fromBox.top) / 2)],
            endXY       = [0, toBox.top - 1 + ((toBox.bottom - toBox.top) / 2)],
            targetBelow = endXY[1] > startXY[1],
            DepType     = dependency.self.Type,
            offset      = this.arrowOffset + this.xOffset,
            type        = dependency.getType(),
            coords      = [],
            targetIsMilestone = dependency.getTargetTask().isMilestone(),
            xPoint, targetX, turningPointY;

        switch (type) {
            case DepType.StartToEnd:
                startXY[0]  = fromBox.start;
                endXY[0]    = toBox.end + offset;
                startSide = 'l';
                endSide = 'r';
                break;

            case DepType.StartToStart:
                startXY[0]  = fromBox.start;
                endXY[0]    = toBox.start - offset;
                startSide = 'l';
                endSide = 'l';
                break;

            case DepType.EndToStart:
                startXY[0]  = fromBox.end;
                endXY[0]    = toBox.start - offset;
                startSide = 'r';
                endSide = 'l';
                break;

            case DepType.EndToEnd:
                startXY[0]  = fromBox.end;
                endXY[0]    = toBox.end + offset;
                startSide = 'r';
                endSide = 'r';
                break;

            default:
                throw 'Invalid dependency type: ' + dependency.getType();
        }

        coords.push(startXY);

        var x2 = startXY[0] + (startSide === 'r' ? this.xOffset : -this.xOffset);

        if (targetBelow && type === DepType.EndToStart && fromBox.end < (toBox.start + 5)) {
            // 2 lines
            xPoint = Math.min(toBox.start, toBox.end) + this.xOffset;

            coords.push([ xPoint, startXY[1] ]);
            coords.push([ xPoint, toBox.top - this.arrowOffset - (targetIsMilestone ? 2 : 0) ]);
        }
        else if (startSide !== endSide && ((startSide === 'r' && x2 > endXY[0]) || (startSide === 'l' && x2 < endXY[0]))) {
            // 5 lines
            targetX = toBox[endSide === 'l' ? 'start' : 'end'];
            turningPointY = endXY[1] + (targetBelow ? -1 : 1) * (this.rowHeight / 2);

            coords.push([ x2, startXY[1] ]);
            coords.push([ x2, turningPointY ]);
            coords.push([ endXY[0], turningPointY ]);
            coords.push(endXY);

            coords.push([targetX + (endXY[0] < targetX ? -this.arrowOffset : this.arrowOffset) - (targetIsMilestone && endSide === 'l' && !Ext.isIE8m ? 2 : 0), endXY[1]]);
        } else {
            // 3 lines
            targetX = toBox[endSide === 'l' ? 'start' : 'end'];

            if (startSide === 'r') {
                xPoint = Math.max(x2, endXY[0]);
            } else {
                xPoint = Math.min(x2, endXY[0]);
            }
            coords.push([ xPoint, startXY[1]]);
            coords.push([ xPoint, endXY[1]]);

            coords.push([targetX + (xPoint < targetX ? -this.arrowOffset : this.arrowOffset) - (targetIsMilestone && endSide === 'l' ? 2 : 0), endXY[1]]);
        }

        var lineCoords = [];

        for (var i = 0; i < coords.length - 1; i++) {
            lineCoords.push({
                x1 : coords[i][0],
                y1 : coords[i][1],
                x2 : coords[i+1][0],
                y2 : coords[i+1][1]
            });
        }

        return lineCoords;
    }
});
