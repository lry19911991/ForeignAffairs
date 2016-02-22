/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.model.task.Splittable
@mixin
@protected

Internal mixin class providing task splitting logic and functionality belonging to the Task model class.

*/
Ext.define('Gnt.model.task.Splittable', {

    uses                        : [
        'Gnt.model.TaskSegment'
    ],

    segmentsTrackingSuspended   : 0,

    changingTaskBySegments      : false,

    splitsDuration              : 0,

    segmentsSnapshot            : null,

    segmentsProjection          : null,


    getFirstSegment : function () {
        var segments    = this.getSegments();

        return segments && segments[0];
    },


    getLastSegment : function () {
        var segments    = this.getSegments();

        return segments && segments[segments.length - 1];
    },


    normalizeSegments : function () {
        var segments    = this.getSegments();

        // we don't wanna hear any response from segments during their normalization
        this.suspendSegmentsTracking();

        // first let sort intervals by its start dates ascending
        segments.sort(function (a, b) {
            if (!a.normalized) a.normalize();
            if (!b.normalized) b.normalize();
            return a.getStartDate() > b.getStartDate() ? 1 : -1;
        });

        // merge overlapped segments if any
        this.mergeOverlappedSegments();

        // if we still have segmentation after merging
        if (segments = this.getSegments()) {
            this.data[ this.durationField ] = this.getSegmentsDuration();
        }

        this.resumeSegmentsTracking();
    },


    // Refreshes the task segments dates. We have to call this after the task time span change.
    updateSegmentsDates : function (options) {
        options     = options || {};

        if (!this.isSegmented()) return;

        // we don't want to catch response from segments
        this.suspendSegmentsTracking();

        options             = Ext.apply({
            useAbsoluteOffset   : false
        }, options);

        options.isForward   = options.isForward !== false;

        this.forEachSegment(function (segment) {
            segment.updateDatesByOffsets(options);
        }, options.isForward);

        // need to set Segments field dirty
        this.set(this.segmentsField, this.getSegments().slice());

        this.resumeSegmentsTracking();
    },


    getSegmentIntervalsForRange : function (from, till, segments) {
        segments    = segments || this.getSegments();
        if (!segments) return;

        var DATE    = Sch.util.Date,
            result  = [];

        for (var i = 0, l = segments.length; i < l; i++) {
            var part            = segments[i],
                segmentStart    = part.getStartDate(),
                segmentEnd      = part.getEndDate();

            if (DATE.intersectSpans(from, till, segmentStart, segmentEnd)) {
                result.push([ DATE.constrain(segmentStart, from, till) - 0, DATE.constrain(segmentEnd, from, till) - 0 ]);
            }
        }

        return result.length && result || null;
    },


    getSegmentByDate : function (date, segments) {
        segments    = segments || this.getSegments();
        if (!segments) return;

        for (var i = 0, l = segments.length; i < l; i++) {
            var part    = segments[i];
            if (date >= part.getStartDate() && date < part.getEndDate()) return part;
        }
    },


    // Truncates segments that don't fit into task time span (this can be detected either based on the task start/end dates or by comparing with the task duration).
    // @private
    constrainSegments : function (options) {
        // should be called only for the task driven changes, and `this.changingTaskBySegments` means that change initiated by a segment
        if (this.changingTaskBySegments) return;

        options             = options || {};

        var segments    = this.getSegments();
        if (!segments) return;

        var taskDuration    = this.getDuration('MILLI'),
            durationUnit    = options.unit || this.getDurationUnit(),
            durationLimit   = options.duration,
            startDate       = this.getStartDate(),
            endDate         = this.getEndDate(),
            converter       = this.getUnitConverter();

        if (!startDate || (!endDate && !taskDuration && !durationLimit)) {
            this.set(this.segmentsField, null);
            return;
        }

        if (durationLimit) {
            durationLimit   = converter.convertDurationToMs(durationLimit, durationUnit);
        } else if (!endDate) {
            durationLimit   = taskDuration;
        }

        // we don't want to catch response from segments
        this.suspendSegmentsTracking();

        segments[0].setStartDateWithoutPropagation(this.getStartDate(), false);

        // now let's loop over array and merged overlapping intervals
        var splitsDuration  = 0,
            toRemove        = [],
            durationLeft    = durationLimit,
            current, previous;

        var toRemoveChecker;
        // we check if segment fits into task timespan using either task end date or task duration depending on options provided
        if (durationLimit) {
            toRemoveChecker = function (segment) { return durationLeft <= 0; };
        } else {
            toRemoveChecker = function (segment) { return segment.getStartDate() >= endDate; };
        }

        for (var i = 0, l = segments.length; i < l; i++) {
            current         = segments[i];

            // we get rid of segments that do not fit into task timespan
            if (toRemoveChecker(current)) {
                toRemove.push.apply(toRemove, segments.slice(i));
                break;
            }

            durationLeft    -= current.getDuration('MILLI');

            // increment total splits duration
            if (previous) {
                splitsDuration  += current.getStartOffset() - previous.getEndOffset();
            }

            previous        = current;
        }

        // remove segments swallowed during merge
        this.removeSegments(toRemove);

        if (segments.length < 2) {
            this.set(this.segmentsField, null);

        } else {

            var last            = this.getLastSegment();
            var lastAdjusted    = false;

            // if we constrain using duration
            if (durationLimit) {
                if (durationLeft) {
                    last.setDurationWithoutPropagation(converter.convertMSDurationToUnit(last.getEndOffset() - last.getStartOffset() + durationLeft, last.getDurationUnit()));
                    lastAdjusted    = true;
                }
            } else {
                if (last.getEndDate() - endDate) {
                    last.setEndDateWithoutPropagation(endDate, false);
                    lastAdjusted    = true;
                }
            }

            last.setNextSegment(null);

            // keep total splits duration
            this.splitsDuration = splitsDuration;

            // if we modified segments and field is not marked as modified yet
            if ((toRemove || lastAdjusted) && (!this.modified || !this.modified[this.segmentsField])) {
                this.set(this.segmentsField, this.getSegments().slice());
            }
        }


        this.resumeSegmentsTracking();
    },


    forEachSegment : function (fn, isForward, startSegment, scope) {
        if (!fn) return;

        scope       = scope || this;

        var method, segment;

        if (isForward !== false) {
            // method to walk down the segments available
            method  = 'getNextSegment';
            // initial segment
            segment = startSegment || this.getFirstSegment();
        } else {
            method  = 'getPrevSegment';
            segment = startSegment || this.getLastSegment();
        }

        while (segment) {
            if (fn.call(scope, segment) === false) return;

            segment    = segment[method].call(segment);
        }
    },


    /**
     * Splits a task.
     * @param {Date} from The date to split this task at.
     * @param {Number} [duration=1] Split duration.
     * @param {String} [unit=d] Split duration unit.
     * @param {Boolean} [skipNonWorkingTime] Pass `true` to automatically move the start date to the earliest available working time (if it falls on non-working time).
     * Default is `false`
     * @param {Function} [callback] Callback function to call after task has been split and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    split : function(from, duration, unit, skipNonWorkingTime, callback) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.splitWithoutPropagation(from, duration, unit, skipNonWorkingTime, function cancelFeedback(fn) {
                    cancelFn = fn;
                });
            },
            function(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },


    splitWithoutPropagation : function (from, duration, unit, skipNonWorkingTime, cancelFeedback) {
        var me  = this;

        if (skipNonWorkingTime !== true && skipNonWorkingTime !== false) {
            var taskStore       = me.getTaskStore(true);

            skipNonWorkingTime  = taskStore ? taskStore.skipWeekendsDuringDragDrop : false;
        }

        // cannot split:
        // - if no split date specified
        // - a summary task
        // - a milestone
        if (!from || !me.isLeaf() || me.isMilestone()) return;

        var startDate   = me.getStartDate(),
            endDate     = me.getEndDate();

        // - not scheduled task
        // - provided date violates task interval
        if (!startDate || !endDate || (startDate >= from) || (from >= endDate)) return;

        var segments    = me.getSegments(),
            segmentToSplit;

        // let's make a snapshot to rollback in case of some constraint violation
        var snapshot    = me.buildSegmentsSnapshot(segments);

        if (segments) {
            segmentToSplit  = me.getSegmentByDate(from);

            if (!segmentToSplit) return;
        } else {
            segments        = [];
        }

        duration        = duration || 1;
        unit            = unit || this.getDurationUnit();

        var date        = new Date(from),
            splitStart  = date,
            splitEnd    = date,
            durationMS  = me.getUnitConverter().convertDurationToMs(duration, unit);

        if (skipNonWorkingTime) {
            splitEnd    = me.skipNonWorkingTime(splitEnd, true, true);
            splitStart  = me.skipNonWorkingTime(splitStart, false, true);

            // exit if split date is in a large gap between working periods of time
            // if (splitEnd - splitStart  > durationMS) return;
        }

        var taskDurationUnit    = me.getDurationUnit(),
            firstPieceDuration,
            secondPieceDuration;

        // suspend to not call onSegmentsChanged on every segment modification
        // we call it one time on the last step
        me.suspendSegmentsTracking();

        // split not segmented task
        if (!segmentToSplit) {

            firstPieceDuration      = me.calculateDuration(startDate, splitStart);
            secondPieceDuration     = me.getDuration() - firstPieceDuration;

            segments.push(Ext.create(me.segmentClassName, {
                StartDate       : startDate,
                Duration        : firstPieceDuration,
                DurationUnit    : taskDurationUnit,
                task            : me
            }));

            // split existing segment
        } else {
            firstPieceDuration  = me.calculateDuration( segmentToSplit.getStartDate(), splitStart, taskDurationUnit );
            secondPieceDuration = segmentToSplit.getDuration(taskDurationUnit) - firstPieceDuration;

            segmentToSplit.setEndDateWithoutPropagation( splitStart, false, skipNonWorkingTime );
        }

        var splitDurationMS = me.getUnitConverter().convertDurationToMs(duration, unit);

        // shift all further segments by provided duration
        if (segmentToSplit && segmentToSplit.getNextSegment()) {

            me.forEachSegment(function (s) {
                s.setStartEndOffset( s.getStartOffset() + splitDurationMS, s.getEndOffset() + splitDurationMS );
                s.updateDatesByOffsets();
            }, true, segmentToSplit.getNextSegment());

        }

        // take split duration into account
        splitEnd        = me.skipWorkingTime(splitEnd, splitDurationMS);

        if (skipNonWorkingTime) {
            // adjust to calendar if required
            splitEnd    = me.skipNonWorkingTime(splitEnd);
        }

        var newSegment      = Ext.create(me.segmentClassName, {
            StartDate       : splitEnd,
            Duration        : secondPieceDuration,
            DurationUnit    : taskDurationUnit,
            prevSegment     : segmentToSplit || segments[0],
            task            : me
        });

        if (segmentToSplit) {
            Ext.Array.insert(segments, Ext.Array.indexOf(segments, segmentToSplit) + 1, [newSegment]);
        } else {
            segments.push(newSegment);
        }

        me.resumeSegmentsTracking();

        cancelFeedback && cancelFeedback(function() {
            me.rollbackSegmentsToSnapshot(snapshot);
        });

        if (!segmentToSplit) {
            me.setSegmentsWithoutPropagation(segments);
        } else {
            me.onSegmentsChanged(null, null);
        }

        return true;
    },


    /**
     * Merges two segments of a task.
     * @param {Gnt.model.TaskSegment} segment1 First segment to merge.
     * @param {Gnt.model.TaskSegment} segment2 Second segment to merge.
     * @param {Function} [callback] Callback function to call after task has been merged and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    merge : function (segment1, segment2, callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.mergeWithoutPropagation(segment1, segment2);
            },
            callback
        );
    },


    mergeWithoutPropagation : function(segment1, segment2) {
        if (!this.isSegmented() || !segment1 || !segment2) return;

        var first, second;

        if (segment1.getStartOffset() > segment2.getStartOffset()) {
            first   = segment2;
            second  = segment1;
        } else {
            first   = segment1;
            second  = segment2;
        }

        // merging itself will be done automatically inside of `onSegmentsChanged`
        first.setEndDateWithoutPropagation(second.getEndDate(), false);

        return true;
    },


    suspendSegmentsTracking : function () {
        this.segmentsTrackingSuspended++;
    },


    resumeSegmentsTracking : function () {
        this.segmentsTrackingSuspended--;
    },


    // Returns the sum of segments durations.
    getSegmentsDuration : function (unit) {
        unit            = unit || this.getDurationUnit();
        var segments    = this.getSegments();
        var duration    = 0;

        for (var i = 0, l = segments.length; i < l; i++) {
            var s       = segments[i];
            duration    += s.getEndOffset() - s.getStartOffset();
        }

        return this.getUnitConverter().convertMSDurationToUnit(duration, unit);
    },


    mergeOverlappedSegments : function (doNotTruncate) {
        var segments = this.getSegments();

        if (segments) {
            var toRemove    = [],
                previous    = segments[0],
                current;

            // Check if we should merge segments
            for (var i = 1, l = segments.length; i < l; i++) {
                current     = segments[i];

                // if `current` segment intersects `previous` segment
                if (current.getStartOffset() <= previous.getEndOffset()) {
                    // we skip the current
                    toRemove.push(current);

                    // if `current` end date is greater than `previous` one we elapse previous segment
                    if (current.getEndOffset() > previous.getEndOffset()) {
                        previous.setEndDateWithoutPropagation(current.getEndDate(), false);
                    }

                } else {
                    current.setPrevSegment(previous);
                    // `previous` keeps the last not skipped segment
                    previous    = current;
                }
            }

            this.removeSegments(toRemove);

            if (segments.length < 2 && !doNotTruncate) {
                this.setSegmentsWithoutPropagation(null);
            } else {
                segments[segments.length - 1].setNextSegment(null);
            }
        }
    },


    onSegmentEditBegin : function (segment) {
        this.snapshotSegments();
    },


    onSegmentsChanged : function (segment, modified) {

        if (this.segmentsTrackingSuspended) return;

        var segments = this.getSegments();

        this.changingTaskBySegments = true;

        // we don't want to escalate chain of calls
        this.suspendSegmentsTracking();

        // Check if we should merge segments
        // we pass `true` to not truncate segments array if we have 1 element in it (we need this to get duration from it)
        // The array will be completely reset inside of this.set() call
        this.mergeOverlappedSegments(true);

        segments    = this.getSegments();

        // segments has been changed so we need re-adjust task to take them into account

        // if segment duration has been changed - task duration has to be updated
        if (segment && modified && segment.durationField in modified) {
            // even after merge here we have at least 1 segment to be able to get duration from it
            this.setDurationWithoutPropagation(this.getSegmentsDuration());
        } else {
            this.setStartDateWithoutPropagation(this.getStartDate(), true);
        }

        // re-get segments list since it could've been rolled back because of failed propagation
        // inside of setDuration/setStartDate call
        segments    = this.getSegments();

        // set field state to dirty
        this.set(this.segmentsField, segments && segments.slice() || null);

        this.resumeSegmentsTracking();

        this.changingTaskBySegments = false;
    },


    removeSegments : function (toRemove) {
        var segments    = this.getSegments();

        if (!segments || !toRemove || !toRemove.length) return;

        if (!Ext.isArray(toRemove)) toRemove    = [ toRemove ];

        for (var i = 0, l = toRemove.length; i < l; i++) {
            Ext.Array.remove(segments, toRemove[i]);
        }

        this.onSegmentsChanged();
    },


    /**
     * Sets list of segments of the split task.
     * @param {Array[Gnt.model.TaskSegment/Object]} value List of segments.
     * @param {Function} [callback] Callback function to call after task end date has been set and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setSegments : function (value, callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.setSegmentsWithoutPropagation(value);
            },
            callback
        );
    },


    setSegmentsWithoutPropagation : function(value) {
        this.splitsDuration = 0;

        this.suspendSegmentsTracking();

        var oldSegments     = this.getSegments();

        // we slice() passed array to make model understand that field content is updated
        this.set(this.segmentsField, this.processSegmentsValue(value));

        if (!this.isSegmented()) {
            // remove old segments
            if (oldSegments) {
                this.removeSegments(oldSegments.slice());
            }
        }

        this.resumeSegmentsTracking();

        this.onSegmentsChanged(null, null);

        return true;
    },


    processSegmentsValue : function (value) {
        var segments;

        // if segments are specified for the task
        if (value) {
            value    = [].concat(value);
            segments = [];

            for (var i = 0, l = value.length; i < l; i++) {
                if (value[i] instanceof Gnt.model.TaskSegment) {
                    segments.push(value[i]);

                } else {
                    segments.push(Ext.create(this.segmentClassName, Ext.apply(value[i], {
                        task    : this
                    })));
                }
            }

            value = segments && segments.length > 1 && segments || null;
        }

        return value;
    },


    /**
     * Returns `true` if task is segmented and `false` otherwise.
     * @return {Boolean} `true` if task is segmented and `false` otherwise.
     */
    isSegmented : function () {
        return Boolean(this.getSegments());
    },


    /**
     * Gets segment by its index.
     * @param {Number} index Segment index to retrieve (zero based value).
     * @return {Gnt.model.TaskSegment}
     */
    getSegment : function(index) {
        return this.getSegments()[index];
    },


    rejectSegmentsProjection : function () {
        var projectionLevel = this.getTaskStore(true).getProjectionLevel();

        var snapshot, i;

        if (this.segmentsProjection) {
            var snapshotLevel;

            for (i = projectionLevel; i >= 0; i--) {
                if (snapshot        = this.segmentsProjection[i]) {
                    snapshotLevel   = i;
                    break;
                }
            }

            if (snapshotLevel === projectionLevel) {
                delete this.segmentsProjection[snapshotLevel];
            }
        }

        if (snapshot) {
            this.rollbackSegmentsToSnapshot(snapshot);
        }
    },


    commitSegmentsProjection : function () {
        var taskStore       = this.getTaskStore(true),
            projectionLevel = taskStore && taskStore.getProjectionLevel();

        if (this.segmentsProjection) {
            delete this.segmentsProjection[projectionLevel];
        }
    },


    rollbackSegmentsToSnapshot : function (snapshot) {
        this.data[this.segmentsField]   = snapshot && Ext.Array.map(snapshot, function (segment) {
            return segment && segment[0].readSnapshot(segment);
        });
    },


    buildSegmentsSnapshot : function (segments) {
        segments    = segments || this.getSegments();

        return segments && Ext.Array.map(segments, function (segment) {
            return segment && segment.buildSnapshot();
        });
    },


    snapshotSegments : function () {
        var taskStore       = this.getTaskStore(true),
            segments        = this.getSegments(),
            projectionLevel = taskStore && taskStore.getProjectionLevel(),
            snapshot;

        // if taskStore is in the middle of projection let's try to follow it
        // and bind snapshot to previous projection level, to be able to rollback segments
        // after projection rollback
        if (projectionLevel) {

            this.segmentsProjection = this.segmentsProjection || {};
            snapshot                = this.segmentsProjection[projectionLevel - 1];

            if (!snapshot) {

                snapshot                                        = this.buildSegmentsSnapshot(segments);
                this.segmentsProjection[projectionLevel - 1]    = snapshot;
            }

        }

        // this is a zero level snapshot that is used for task.reject() support
        if (!this.segmentsSnapshot) {
            this.segmentsSnapshot     = snapshot || this.buildSegmentsSnapshot(segments);
        }
    },


    commitSegments : function () {
        // EtxJS5 calls `commit` during `reject` call. o_O
        if (this.rejecting) return;

        // let's reset snapshot, we will fill it during first attempt to edit this task segments
        this.segmentsSnapshot   = null;

        var segments            = this.getSegments();

        if (segments) {
            for (var i = 0, l = segments.length; i < l; i++) {
                segments[i].commit();
            }
        }
    },


    rejectSegments : function () {
        // get kept previous segments data
        this.rollbackSegmentsToSnapshot(this.segmentsSnapshot);
        this.segmentsSnapshot           = null;

        var segments                    = this.getSegments();

        if (segments) {
            for (var i = 0, l = segments.length; i < l; i++) {
                segments[i].reject();
            }
        }
    }

});
