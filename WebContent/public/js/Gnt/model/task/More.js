/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**

@class Gnt.model.task.More
@mixin
@protected

Internal mixin class providing additional logic and functionality belonging to the Task model class.

*/
Ext.define('Gnt.model.task.More', {

    propagating : false,

    /**
     * Increases the indendation level of this task in the tree
     *
     * @param {Function} [callback] Callback function to call after task has been indented and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    indent : function(callback) {
        var me = this,
            previousSibling = me.previousSibling,
            cancelFn;

        if (previousSibling) {
            me.propagateChanges(
                function() {
                    return me.indentWithoutPropagation(function(fn) {
                        cancelFn = fn;
                    });
                },
                function(cancelChanges, affectedTasks) {
                    if (cancelChanges) {
                        cancelFn && cancelFn();
                    }
                    else {
                        previousSibling.expand();
                    }
                    callback && callback(cancelChanges, affectedTasks);
                }
            );
        }
        else {  // TODO: actually an exception should be thrown here, but BC is such BC
            callback && callback(false, {});
        }
    },


    indentWithoutPropagation : function (cancelFeedback) {
        var me = this,
            previousSibling = me.previousSibling,
            taskStore,
            originalParent,
            originalIndex,
            wasLeaf,
            segments,
            removeContext;

        removeContext = {
            parentNode          : me.parentNode,
            previousSibling     : me.previousSibling,
            nextSibling         : me.nextSibling
        };

        taskStore      = me.getTaskStore();

        // This data we need for canceling
        originalParent = me.parentNode;
        originalIndex  = originalParent.indexOf(me);
        // Need to suspend the events here to prevent the taskStore from doing a cascade and thereby triggering UI updates
        // before the indent operation has completed (node first removed, then appended).
        taskStore.suspendEvents(true);

        wasLeaf = previousSibling.get('leaf');
        if (wasLeaf) {
            segments = previousSibling.getSegments();
            previousSibling.markAsParent();
        }

        // This clears the removeContext object, put it back below
        previousSibling.appendChild(me);

        // http://www.sencha.com/forum/showthread.php?270802-4.2.1-NodeInterface-removeContext-needs-to-be-passed-as-an-arg
        me.removeContext = removeContext;

        // Iterate and drop existing invalid dependencies since a parent task cannot have
        // dependencies to its children etc.
        previousSibling.removeInvalidDependencies();

        //previousSibling.expand();
        cancelFeedback && cancelFeedback(function() {
            originalParent.insertChild(originalIndex, me);
            wasLeaf && previousSibling.set('leaf', true);
            wasLeaf && segments && previousSibling.setSegmentsWithoutPropagation(segments);
        });

        taskStore.resumeEvents();

        return me;
    },

    /**
     * Decreases the indendation level of this task in the tree
     * @param {Function} [callback] Callback function to call after task has been indented and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    outdent : function(callback) {
        var me = this,
            parentNode = me.parentNode,
            cancelFn;

        if (parentNode && !parentNode.isRoot()) {
            me.propagateChanges(
                function() {
                    return me.outdentWithoutPropagation(function(fn) {
                        cancelFn = fn;
                    });
                },
                function(cancelChanges, affectedTasks) {
                    cancelChanges && cancelFn && cancelFn();
                    callback && callback(cancelChanges, affectedTasks);
                }
            );
        }
        else {  // TODO: actually an exception should be thrown here, but BC is such BC
            callback && callback(false, {});
        }

    },

    outdentWithoutPropagation : function (cancelFeedback) {
        var me = this,
            originalParent,
            originalIndex,
            taskStore,
            removeContext;

        removeContext = {
            parentNode          : me.parentNode,
            previousSibling     : me.previousSibling,
            nextSibling         : me.nextSibling
        };

        taskStore = me.getTaskStore();

        // This data we need for canceling
        originalParent = me.parentNode;
        originalIndex  = originalParent.indexOf(me);
        // Need to suspend the events here to prevent the taskStore from doing a cascade and thereby triggering UI updates
        // before the indent operation has completed (node first removed, then appended).
        taskStore.suspendEvents(true);

        // This clears the removeContext object, put it back below
        if (originalParent.nextSibling) {
            originalParent.parentNode.insertBefore(me, originalParent.nextSibling);
        } else {
            originalParent.parentNode.appendChild(me);
        }

        me.convertEmptyParentToLeaf && originalParent.set('leaf', originalParent.childNodes.length === 0);

        // http://www.sencha.com/forum/showthread.php?270802-4.2.1-NodeInterface-removeContext-needs-to-be-passed-as-an-arg
        me.removeContext = removeContext;

        // Iterate and drop existing invalid dependencies since a parent task cannot have
        // dependencies to its children etc.
        originalParent.parentNode.removeInvalidDependencies();

        taskStore.resumeEvents();

        cancelFeedback && cancelFeedback(function() {
            originalParent.insertChild(originalIndex, me);
        });

        // Changes propagation will be collected using original parent as the source point
        return originalParent;
    },


    removeInvalidDependencies : function() {
        var depStore    = this.getDependencyStore(),
            deps        = this.getAllDependencies();

        for (var i = 0; i < deps.length; i++) {

            if(!deps[i].isValid(true)) {
                depStore.remove(deps[i]);
            }
        }
    },


    /**
     * Returns all dependencies of this task (both incoming and outgoing)
     *
     * @return {Gnt.model.Dependency[]}
     */
    getAllDependencies: function () {
        return this.predecessors.concat(this.successors);
    },

    /**
     * Returns true if this task has at least one incoming dependency
     *
     * @return {Boolean}
     */
    hasIncomingDependencies: function () {
        return this.predecessors.length > 0;
    },

    /**
     * Returns true if this task has at least one outgoing dependency
     *
     * @return {Boolean}
     */
    hasOutgoingDependencies: function () {
        return this.successors.length > 0;
    },

    /**
     * Returns all incoming dependencies of this task
     *
     * @param {Boolean} [doNotClone=false] Whether to **not** create a shallow copy of the underlying {@link Gnt.model.Task#predecessors} property.
     * Passing `true` is more performant, but make sure you don't modify the array in this case.
     *
     * @return {Gnt.model.Dependency[]}
     */
    getIncomingDependencies: function (doNotClone) {
        return doNotClone ? this.predecessors : this.predecessors.slice();
    },


    /**
     * Returns all outcoming dependencies of this task
     *
     * @param {Boolean} [doNotClone=false] Whether to **not** create a shallow copy of the underlying {@link Gnt.model.Task#successors} property.
     * Passing `true` is more performant, but make sure you don't modify the array in this case.
     *
     * @return {Gnt.model.Dependency[]}
     */
    getOutgoingDependencies: function (doNotClone) {
        return doNotClone ? this.successors : this.successors.slice();
    },


    // TODO: see if this is needed or can be removed or substituted by another method
    // TODO: rename it to alignByIncomingDependencies
    // NOTE: return value is never used anywhere in our code base
    /**
     * @private
     * Internal method, constrains the task according to its incoming dependencies
     * @param {Gnt.data.TaskStore} taskStore The task store
     * @return {Boolean} true if the task was updated as a result.
     */
    constrain: function (taskStore, currentCascadeBatch, callback) {
        var result      = this.constrainWithoutPropagation(taskStore, currentCascadeBatch);

        this.propagateChanges(null, callback, true);

        return result;
    },


    // TODO: rename it to alignByIncomingDependenciesWithoutPropagation
    constrainWithoutPropagation: function (taskStore, currentCascadeBatch, parentNode) {
        if (this.isManuallyScheduled()) {
            return false;
        }

        var changed             = false;

        taskStore               = taskStore || this.getTaskStore();

        var constrainContext    = this.getConstrainContext(taskStore, parentNode);

        if (constrainContext) {
            var startDate       = constrainContext.startDate;
            var endDate         = constrainContext.endDate;

            // if we have both start & end constraints ...
            if (startDate && endDate) {
                // we need to compare them to get effective constraint value
                // so we convert endDate constraint to task start date and compare it with startDate constraint
                var start   = this.calculateStartDate(endDate, this.getDuration(), this.getDurationUnit());
                if (start > startDate) {
                    startDate       = start;
                }
                // get rid of endDate constraint since we just processed it
                endDate         = null;
            }


            if (startDate && startDate - this.getStartDate() !== 0) {
                currentCascadeBatch && currentCascadeBatch.addAffected(this);

                this.setStartDateWithoutPropagation(startDate, true, taskStore.skipWeekendsDuringDragDrop);

                changed         = true;
            } else if (endDate && endDate - this.getEndDate() !== 0) {
                currentCascadeBatch && currentCascadeBatch.addAffected(this);

                this.setEndDateWithoutPropagation(endDate, true, taskStore.skipWeekendsDuringDragDrop);

                changed         = true;
            }
        }

        return changed;
    },


    // TODO: rename it to getIncomingDependenciesConstraintContext
    getConstrainContext: function (providedTaskStore, parentNode) {
        var incomingDependencies = this.getIncomingDependencies(true);

        if (!incomingDependencies.length || this.isUnscheduled()) {
            return null;
        }

        var DepType             = Gnt.model.Dependency.Type,
            earliestStartDate   = new Date(0), // This will break for tasks later then 01.01.1970
            earliestEndDate     = new Date(0), // This will break for tasks later then 01.01.1970
            projectCalendar     = this.getProjectCalendar(),
            ownCalendar         = this.getCalendar(),
            constrainingTask;

        var dependenciesCalendar    = (providedTaskStore || this.getTaskStore()).dependenciesCalendar;


        Ext.each(incomingDependencies, function (dependency) {
            var fromTask = dependency.getSourceTask(providedTaskStore);

            if (fromTask && (!parentNode || fromTask.isAncestor(parentNode))) {
                var calendar;

                if (dependenciesCalendar == 'project')
                    calendar    = projectCalendar;
                else if (dependenciesCalendar == 'source')
                    calendar    = fromTask.getCalendar();
                else if (dependenciesCalendar == 'target')
                    calendar    = ownCalendar;
                else
                    throw "Unsupported value for `dependenciesCalendar` config option";

                var lag         = dependency.getLag() || 0,
                    lagUnit     = dependency.getLagUnit(),
                    start       = fromTask.getStartDate(),
                    end         = fromTask.getEndDate();

                switch (dependency.getType()) {
                    case DepType.StartToEnd:
                        start   = calendar.skipWorkingTime(start, lag, lagUnit);
                        if (earliestEndDate < start) {
                            earliestEndDate     = start;
                            constrainingTask    = fromTask;
                        }
                        break;

                    case DepType.StartToStart:
                        start   = calendar.skipWorkingTime(start, lag, lagUnit);
                        if (earliestStartDate < start) {
                            earliestStartDate   = start;
                            constrainingTask    = fromTask;
                        }
                        break;

                    case DepType.EndToStart:
                        end     = calendar.skipWorkingTime(end, lag, lagUnit);
                        if (earliestStartDate < end) {
                            earliestStartDate   = end;
                            constrainingTask    = fromTask;
                        }
                        break;

                    case DepType.EndToEnd:
                        end     = calendar.skipWorkingTime(end, lag, lagUnit);
                        if (earliestEndDate < end) {
                            earliestEndDate     = end;
                            constrainingTask    = fromTask;
                        }
                        break;

                    default:
                        throw 'Invalid dependency type: ' + dependency.getType();
                }
            }
        });

        return {
            startDate           : earliestStartDate > 0 ? earliestStartDate : null,
            endDate             : earliestEndDate > 0 ? earliestEndDate : null,

            constrainingTask    : constrainingTask
        };
    },


    /**
    * @private
    * Internal method, called recursively to query for the longest duration of the chain structure
    * @return {Gnt.model.Task[]} chain An array forming a chain of linked tasks
    */
    getCriticalPaths: function () {
        var cPath = [this],
            ctx = this.getConstrainContext();

        while (ctx) {
            cPath.push(ctx.constrainingTask);

            ctx = ctx.constrainingTask.getConstrainContext();
        }

        return cPath;
    },


    /**
     * Cascades changes for a task, and all its dependent tasks. This is more of a system method, you probably
     * want to use {@link Gnt.data.TaskStore#cascadeChangesForTask} method instead.
     *
     * @param {Gnt.data.TaskStore} [taskStore] The taskStore
     * @param {Object} [context] (private)
     * @param {Gnt.model.Dependency} [triggeringDependency] The dependency triggering the cascade
     */
    cascadeChanges: function (taskStore, context, triggeringDependency) {
//        context                     = context || { nbrAffected : 0, affected : {} };
//        taskStore                   = taskStore || this.getTaskStore();
//
//        var currentCascadeBatch     = taskStore.currentCascadeBatch;
//
//        if (currentCascadeBatch) {
//            if (currentCascadeBatch.visitedCounters[ this.internalId ] > this.predecessors.length) return;
//
//            currentCascadeBatch.addVisited(this);
//        }
//
//        if (this.isLeaf() || taskStore.enableDependenciesForParentTasks) {
//            // `constrain` will also update the `currentCascadeBatch` if task is affected
//            var changed     = this.constrain(taskStore, currentCascadeBatch);
//
//            if (changed) {
//                // update local context
//                context.nbrAffected++;
//                context.affected[ this.internalId ] = this;
//
//                Ext.each(this.getOutgoingDependencies(true), function (dependency) {
//
//                    var toTaskRecord = dependency.getTargetTask();
//
//                    if (toTaskRecord && !toTaskRecord.isManuallyScheduled()) {
//                        toTaskRecord.cascadeChanges(taskStore, context, dependency);
//                    }
//                });
//            }
//        }
//
//        return context;
    },

    /**
    * Adds the passed task to the collection of child tasks.
    * @param {Gnt.model.Task} subtask The new subtask
    * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
    * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
    *  and a user opted for canceling the change and thus nothing has been updated.
    * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
    * @return {Gnt.model.Task} The added subtask task
    */
    addSubtask : function(subtask, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.addSubtaskWithoutPropagation(subtask, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },

    addSubtaskWithoutPropagation : function(subtask, cancelAndResultFeedback) {
        var me = this,
            originalParent,
            originalIndex,
            propagationSources,
            wasLeaf,
            segments;

        originalParent = subtask.parentNode;
        originalIndex  = originalParent && originalParent.indexOf(me);

        wasLeaf = me.get('leaf');
        if (wasLeaf) {
            me.markAsParent();
            segments = me.getSegments();
        }

        subtask = me.appendChild(subtask);
        me.expand();

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            if (originalParent) {
                originalParent.insertChild(originalIndex, subtask);
            }
            else {
                me.removeChild(subtask);
            }

            wasLeaf && me.set('leaf', true);
            wasLeaf && segments && me.setSegmentsWithoutPropagation(segments);

        }, subtask);

        // Changes propagation will be collected using affected parents as the source points
        if (!originalParent) {
            propagationSources = subtask;
        }
        else if (me !== originalParent && me.getTaskStore(true) === originalParent.getTaskStore(true)) {
            propagationSources = [subtask, originalParent];
        }

        return propagationSources;
    },

    /**
    * Inserts the passed task to the collection of child tasks at the given index.
    * @param {Integer} index Tne new subtask index
    * @param {Gnt.model.Task} subtask The new subtask
    * @param {Function} [callback] Callback function to call after task has been inserted and changes among dependent tasks was propagated.
    * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
    *  and a user opted for canceling the change and thus nothing has been updated.
    * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
    * @return {Gnt.model.Task} The inserted subtask
    */
    insertSubtask : function(index, subtask, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.insertSubtaskWithoutPropagation(index, subtask, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },


    insertSubtaskWithoutPropagation : function(index, subtask, cancelAndResultFeedback) {
        var me = this,
            originalParent,
            originalIndex,
            propagationSources,
            wasLeaf,
            segments;

        originalParent = subtask.parentNode;
        originalIndex  = originalParent && originalParent.indexOf(me);

        wasLeaf = me.get('leaf');
        if (wasLeaf) {
            me.markAsParent();
            segments = me.getSegments();
        }

        subtask = me.insertChild(index, subtask);
        me.expand();

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            if (originalParent) {
                originalParent.insertChild(originalIndex, subtask);
            }
            else {
                me.removeChild(subtask);
            }

            wasLeaf && me.set('leaf', true);
            wasLeaf && segments && me.setSegmentsWithoutPropagation(segments);

        }, subtask);

        // Changes propagation will be collected using affected parents as the source points
        if (!originalParent) {
            propagationSources = subtask;
        }
        else if (me !== originalParent && me.getTaskStore(true) === originalParent.getTaskStore(true)) {
            propagationSources = [subtask, originalParent];
        }

        return propagationSources;
    },


    /*
     * Constraints aware removes the passed subtask from this task child nodes.
     *
     * @param {Gnt.model.Task} [subtask] The subtask to remove
     * @param {Function} [callback] Callback function to call after the subtask has been removed and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    removeSubtask : function(subtask, callback) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.removeSubtaskWithoutPropagation(subtask, function cancelFeedback(fn) {
                    cancelFn = fn;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },

    removeSubtaskWithoutPropagation : function(subtask, cancelFeedback) {
        var me = this,
            indexOfSubtask = me.indexOf(subtask),
            subtree,
            taskStore,
            dependencyStore,
            assignmentStore,
            dependencies,
            assignments,
            dependenciesIndices,
            assignmentsIndices,
            i, len, r;

        // <debug>
        indexOfSubtask != -1 ||
            Ext.Error.raise("Can't remove subtask `" + subtask.getInternalId() + "` from task `" + me.getInternalId() + "` subtask is not a child of the task!");
        // </debug>

        taskStore           = me.getTaskStore();
        dependencyStore     = me.getDependencyStore();
        assignmentStore     = me.getAssignmentStore();
        dependencies        = dependencyStore && dependencyStore.getDependenciesForTask(subtask);
        assignments         = assignmentStore && subtask.getAssignments();
        subtree             = [];
        dependenciesIndices = [];
        assignmentsIndices  = [];

        // Collecting all the descendants of the subtask.
        subtask.cascadeBy(function(node) {
            node !== subtask && subtree.push(node);
        });

        // Collecting dependencies and assignments of the subtree
        for (i = 0, len = subtree.length; (dependencyStore || assignmentStore) && i < len; i++) {
            r = subtree[i];
            dependencyStore && (dependencies = dependencies.concat(dependencyStore.getDependenciesForTask(r)));
            assignmentStore && (assignments  = assignments.concat(r.getAssignments()));
        }

        // Sorting dependencies in index order for future restoration
        dependencies = dependencyStore && Ext.Array.unique(dependencies);
        dependencies = dependencyStore && Ext.Array.sort(dependencies, function(a, b) {
            return dependencyStore.indexOf(a) < dependencyStore.indexOf(b) ? -1 : 1; // 0 is not an option here
        });
        // Collecting dependencies indices
        for (i = 0, len = dependencies && dependencies.length; dependencyStore && i < len; i++) {
            dependenciesIndices.push(dependencyStore.indexOf(dependencies[i]));
        }

        // Sorting assignments in index order for future restoration
        assignments = assignmentStore && Ext.Array.sort(assignments, function(a, b) {
            return assignmentStore.indexOf(a) < assignmentStore.indexOf(b) ? -1 : 1; // 0 is not an option here
        });
        // Collecting assignments indicies
        for (i = 0, len = assignments && assignments.length; assignmentStore && i < len; i++) {
            assignmentsIndices.push(assignmentStore.indexOf(assignments[i]));
        }

        // Removing all assignments
        assignmentStore && assignmentStore.remove(assignments);
        // Removing all dependencies
        dependencyStore && dependencyStore.remove(dependencies);
        // Removing subtask (which will remove subtree as well)
        subtask = me.removeChild(subtask);

        // Converting self to leaf if required
        if (me.childNodes.length === 0 && me.convertEmptyParentToLeaf) {
            me.set('leaf', true);
        }

        cancelFeedback && cancelFeedback(function() {
            // Restoring everything back
            me.insertChild(indexOfSubtask, subtask);
            for (i = 0, len = assignments && assignments.length; assignmentStore && i < len; i++) {
                assignmentStore.insert(assignmentsIndices[i], assignments[i]);
            }
            for (i = 0, len = dependencies && dependencies.length; dependencyStore && i < len; i++) {
                dependencyStore.insert(dependenciesIndices[i], dependencies[i]);
            }
        });

        return me;
    },

    /**
     * Adds the passed task as a successor and creates a new dependency between the two tasks.
     * @param {Gnt.model.Task} [successor] The new successor
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the successor task
    */
    addSuccessor : function(successor, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.addSuccessorWithoutPropagation(successor, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },


    addSuccessorWithoutPropagation : function(successor, cancelAndResultFeedback) {
        var me              = this,
            parentNode      = me.parentNode,
            index           = parentNode.indexOf(me),
            dependencyStore = me.getDependencyStore(),
            taskStore       = me.getTaskStore(true),
            insertCancelFn,
            linkCancelFn,
            newDependency;

        successor           = successor           || new me.self();
        successor.calendar  = successor.calendar  || me.getCalendar(); // WTF, why so?
        successor.taskStore = successor.taskStore || me.getTaskStore(true);

        if (me.getEndDate()) {
            successor.beginEdit();
            successor.set(me.startDateField, me.getEndDate());
            successor.set(me.endDateField, successor.calculateEndDate(me.getEndDate(), 1, Sch.util.Date.DAY));
            successor.set(me.durationField, 1);
            successor.set(me.durationUnitField, Sch.util.Date.DAY);
            successor.endEdit();
        }

        // adding successor below
        parentNode.insertSubtaskWithoutPropagation(index + 1, successor, function(fn, result) {
            insertCancelFn = fn;
            successor      = result;
        });

        me.linkToWithoutPropagation(successor, Gnt.model.Dependency.Type.EndToStart, function(fn) {
            linkCancelFn = fn;
        });

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            linkCancelFn();
            insertCancelFn();
        }, successor);

        return me;
    },

    /**
     * Adds the passed task as a milestone below this task.
     * @param {Gnt.model.Task} milestone (optional) The milestone
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the new milestone
    */
    addMilestone : function(milestone, callback) {
        var me        = this,
            taskStore = me.getTaskStore(),
            date      = me.getEndDate();

        if (!milestone) {
            milestone = new me.self();
        }
        else if (Ext.isObject(milestone) && !(milestone instanceof Gnt.model.Task)) {
            milestone = new me.self(milestone);
        }

        if (date && !milestone.isMilestone()) {
            milestone.calendar = milestone.calendar || me.getCalendar();
            milestone.setStartEndDate(date, date);
        }

        return me.addTaskBelow(milestone, callback);
   },

    /**
     * Adds the passed task as a predecessor and creates a new dependency between the two tasks.
     * @param {Gnt.model.Task} [predecessor] The new predecessor
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the new predecessor
    */
    addPredecessor : function(predecessor, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.addPredecessorWithoutPropagation(predecessor, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },


    addPredecessorWithoutPropagation : function(predecessor, cancelAndResultFeedback) {
        var me              = this,
            parentNode      = me.parentNode,
            index           = parentNode.indexOf(me),
            dependencyStore = me.getDependencyStore(),
            taskStore       = me.getTaskStore(true),
            insertCancelFn,
            linkCancelFn,
            newDependency;

        predecessor           = predecessor           || new me.self();
        predecessor.calendar  = predecessor.calendar  || me.getCalendar(); // WTF, why so?
        predecessor.taskStore = predecessor.taskStore || me.getTaskStore(true);

        if (me.getStartDate()) {
            predecessor.beginEdit();
            predecessor.set(me.startDateField, predecessor.calculateStartDate(me.getStartDate(), 1, Sch.util.Date.DAY));
            predecessor.set(me.endDateField, me.getStartDate());
            predecessor.set(me.durationField, 1);
            predecessor.set(me.durationUnitField, Sch.util.Date.DAY);
            predecessor.endEdit();
        }

        parentNode.insertSubtaskWithoutPropagation(index, predecessor, function(fn, result) {
            insertCancelFn = fn;
            predecessor    = result;
        });

        predecessor.linkToWithoutPropagation(me, Gnt.model.Dependency.Type.EndToStart, function(fn) {
            linkCancelFn   = fn;
        });

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            linkCancelFn();
            insertCancelFn();
        }, predecessor);

        return predecessor;
    },

    /**
    * Returns all the successor tasks of this task
    *
    * @return {Gnt.model.Task[]}
    */
    getSuccessors: function () {
        var deps    = this.successors,
            res     = [];

        for (var i = 0, len = deps.length; i < len; i++) {
            var task = deps[i].getTargetTask();

            if (task) res.push(task);
        }

        return res;
    },

    /**
    * Returns all the predecessor tasks of a this task.
    *
    * @return {Gnt.model.Task[]}
    */
    getPredecessors: function () {
        var deps    = this.predecessors,
            res     = [];

        for (var i = 0, len = deps.length; i < len; i++) {
            var task = deps[i].getSourceTask();

            if (task) res.push(task);
        }

        return res;
    },

    /**
     * Adds the passed task (or creates a new task) before itself
     * @param {Gnt.model.Task} addTaskAbove (optional) The task to add
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the newly added task
     */
    addTaskAbove : function (task, callback) {
        var me = this,
            parentNode = me.parentNode,
            index = parentNode.indexOf(me),
            compatResult,
            cancelFn;

        task = task || new me.self();

        me.propagateChanges(
            function() {
                return parentNode.insertSubtaskWithoutPropagation(index, task, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },

    /**
     * Adds the passed task (or creates a new task) after itself
     * @param {Gnt.model.Task} task (optional) The task to add
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the newly added task
     */
    addTaskBelow : function (task, callback) {
        var me = this,
            parentNode = me.parentNode,
            index = parentNode.indexOf(me) + 1,
            compatResult,
            cancelFn;

        task = task || new me.self();

        me.propagateChanges(
            function() {
                return parentNode.insertSubtaskWithoutPropagation(index, task, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },

    // Returns true if this task model is 'above' the passed task model
    isAbove : function(otherTask) {
        var me          = this,
            minDepth    = Math.min(me.data.depth, otherTask.data.depth);

        var current     = this;

        // Walk upwards until tasks are on the same level
        while (current.data.depth > minDepth) {
            current     = current.parentNode;

            if (current == otherTask) return false;
        }
        while (otherTask.data.depth > minDepth) {
            otherTask   = otherTask.parentNode;

            if (otherTask == me) return true;
        }

        // At this point, depth of both tasks should be identical.
        // Walk up to find common parent, to be able to compare indexes
        while (otherTask.parentNode !== current.parentNode) {
            otherTask   = otherTask.parentNode;
            current     = current.parentNode;
        }

        return otherTask.data.index > current.data.index;
    },

    /**
     * Cascades the children of a task. The given function is not called for this node itself.
     * @param {Function} fn The function to call for each child
     * @param {Object} scope The 'this' object to use for the function, defaults to the current node.
     */
    cascadeChildren : function(fn, scope) {
        var me = this;

        if (me.isLeaf()) return;

        var childNodes      = this.childNodes;

        for (var i = 0, len = childNodes.length; i < len; i++) childNodes[ i ].cascadeBy(fn, scope);
    },


    // TODO: Rename it to getViolatedDependencyConstraints
    getViolatedConstraints : function () {
        if (!this.get('leaf') || this.isManuallyScheduled()) return false;

        var value   = this.getEarlyStartDate();

        if (this.getStartDate() < value) {
            return [{
                task        : this,
                startDate   : value
            }];
        }

        return null;
    },

    // TODO: Rename it to resolveViolatedDependencyConstraints
    resolveViolatedConstraints : function (errors) {
        errors = errors || this.getViolatedConstraints();

        if (!errors) return;

        if (!Ext.isArray(errors)) errors = [errors];

        var store   = this.getTaskStore();

        for (var error, i = 0, l = errors.length; i < l; i++) {
            error   = errors[i];

            if (error.startDate) {
                error.task.setStartDate(error.startDate, true, store.skipWeekendsDuringDragDrop);
            } else if (error.endDate) {
                error.task.setEndDate(error.endDate, true, store.skipWeekendsDuringDragDrop);
            }
        }
    },

    /**
     * Returns the _slack_ (or _float_) of this task.
     * The _slack_ is the amount of time that this task can be delayed without causing a delay
     * to any of its successors.
     *
     * @param {String} unit The time unit used to calculate the slack.
     * @return {Number} The _slack_ of this task.
     */
    getSlack : function (unit) {
        unit = unit || Sch.util.Date.DAY;

        var earlyStart  = this.getEarlyStartDate(),
            lateStart   = this.getLateStartDate();

        if (!earlyStart || !lateStart) return null;

        // slack taking into account only working period of time
        return this.getCalendar().calculateDuration(earlyStart, lateStart, unit);
    },

    /**
     * Returns the _early start date_ of this task.
     * The _early start date_ is the earliest possible start date of a task.
     * This value is calculated based on the earliest end dates of the task predecessors.
     * If the task has no predecessors, its start date is the early start date.
     *
     * @return {Date} The early start date.
     */
    getEarlyStartDate : function () {
        var store = this.getTaskStore();
        if (!store) return this.getStartDate();

        var internalId = this.internalId;
        if (store.earlyStartDates[internalId]) return store.earlyStartDates[internalId];

        var dt, result = 0, i, l;

        // for a parent task we take the minimum Early Start from its children
        if (this.childNodes.length) {

            for (i = 0, l = this.childNodes.length; i < l; i++) {
                dt = this.childNodes[i].getEarlyStartDate();
                if (dt < result || !result) result = dt;
            }

            store.earlyStartDates[internalId] = result;

            return result;
        }

        // for manually scheduled task we simply return its start date
        if (this.isManuallyScheduled())  {
            result = store.earlyStartDates[internalId] = this.getStartDate();
            return result;
        }

        var deps = this.getIncomingDependencies(true),
            fromTask;

        if (!deps.length) {
            result = store.earlyStartDates[internalId] = this.getStartDate();
            return result;
        }

        var depType     = Gnt.model.Dependency.Type,
            cal         = this.getCalendar(),
            projectCal  = this.getProjectCalendar(),
            lag;

        // Early Start Date is the largest of Early Finish Dates of the preceding tasks
        for (i = 0, l = deps.length; i < l; i++) {

            fromTask = deps[i].getSourceTask();

            if (fromTask) {
                switch (deps[i].getType()) {
                    case depType.StartToStart: // start-to-start
                        dt  = fromTask.getEarlyStartDate();
                        break;
                    case depType.StartToEnd: // start-to-end
                        dt  = fromTask.getEarlyStartDate();
                        // minus duration to get start
                        dt  = cal.calculateStartDate(dt, this.getDuration(), this.getDurationUnit());
                        break;
                    case depType.EndToStart: // end-to-start
                        dt  = fromTask.getEarlyEndDate();
                        break;
                    case depType.EndToEnd: // end-to-end
                        dt  = fromTask.getEarlyEndDate();
                        // minus duration to get start
                        dt  = cal.calculateStartDate(dt, this.getDuration(), this.getDurationUnit());
                        break;
                }

                // plus dependency Lag
                lag = deps[i].getLag();
                if (lag) dt = projectCal.skipWorkingTime(dt, lag, deps[i].getLagUnit());
                dt = projectCal.skipNonWorkingTime(dt, true);
            }

            if (dt > result) result = dt;
        }

        // store found value into the cache
        store.earlyStartDates[internalId] = result;

        return result;
    },

    /**
     * Returns the _early end date_ of the task.
     * The _early end date_ is the earliest possible end date of the task.
     * This value is calculated based on the earliest end dates of predecessors.
     * If the task has no predecessors then its end date is used as its earliest end date.
     *
     * @return {Date} The early end date.
     */
    getEarlyEndDate : function () {
        var store = this.getTaskStore();

        if (!store) return this.getEndDate();

        var internalId = this.internalId;

        if (store.earlyEndDates[internalId]) return store.earlyEndDates[internalId];

        var result = 0;
        // for parent task we take maximum Early Finish from its children
        if (this.childNodes.length) {
            var dt, i, l;

            for (i = 0, l = this.childNodes.length; i < l; i++) {
                dt = this.childNodes[i].getEarlyEndDate();
                if (dt > result) result = dt;
            }

            store.earlyEndDates[internalId] = result;

            return result;
        }

        // for manually scheduled task we simply return its end date
        if (this.isManuallyScheduled())  {
            result = store.earlyEndDates[internalId] = this.getEndDate();

            return result;
        }

        // Early Finish Date is Early Start Date plus duration
        var value = this.getEarlyStartDate();

        if (!value) return null;

        result = store.earlyEndDates[internalId] = this.getCalendar().calculateEndDate(value, this.getDuration(), this.getDurationUnit());

        return result;
    },

    /**
     * Returns the _late end date_ of the task.
     * The _late end date_ is the latest possible end date of the task.
     * This value is calculated based on the latest start dates of its successors.
     * If the task has no successors, the project end date is used as its latest end date.
     *
     * @return {Date} The late end date.
     */
    getLateEndDate : function () {
        var store = this.getTaskStore();
        if (!store) return this.getEndDate();

        var internalId = this.internalId;
        if (store.lateEndDates[internalId]) return store.lateEndDates[internalId];

        var dt, result = 0, i, l;

        // for parent task we take maximum Late Finish from its children
        if (this.childNodes.length) {
            for (i = 0, l = this.childNodes.length; i < l; i++) {
                dt = this.childNodes[i].getLateEndDate();
                if (dt > result) result = dt;
            }

            store.lateEndDates[internalId] = result;

            return result;
        }

        // for manually scheduled task we simply return its end date
        if (this.isManuallyScheduled())  {
            result = store.lateEndDates[internalId] = this.getEndDate();
            return result;
        }

        var deps = this.getOutgoingDependencies(true);

        if (!deps.length) {
            result = store.lateEndDates[internalId] = store.getProjectEndDate();
            return result;
        }

        var depType     = Gnt.model.Dependency.Type,
            cal         = this.getCalendar(),
            projectCal  = this.getProjectCalendar(),
            toTask, lag;

        // Late Finish Date is the smallest of Late Start Dates of succeeding tasks
        for (i = 0, l = deps.length; i < l; i++) {
            toTask = deps[i].getTargetTask();

            if (toTask) {
                switch (deps[i].getType()) {
                    case depType.StartToStart: // start-to-start
                        dt  = toTask.getLateStartDate();
                        // plus duration to get end
                        dt  = cal.calculateEndDate(dt, this.getDuration(), this.getDurationUnit());
                        break;
                    case depType.StartToEnd: // start-to-end
                        dt  = toTask.getLateEndDate();
                        // plus duration to get end
                        dt  = cal.calculateEndDate(dt, this.getDuration(), this.getDurationUnit());
                        break;
                    case depType.EndToStart: // end-to-start
                        dt  = toTask.getLateStartDate();
                        break;
                    case depType.EndToEnd: // end-to-end
                        dt  = toTask.getLateEndDate();
                        break;
                }

                // minus dependency Lag
                lag = deps[i].getLag();
                if (lag) dt  = projectCal.skipWorkingTime(dt, -lag, deps[i].getLagUnit());
                dt = projectCal.skipNonWorkingTime(dt, false);

                if (dt < result || !result) result = dt;
            }
        }

        // cache found value
        store.lateEndDates[internalId] = result || store.getProjectEndDate();

        return store.lateEndDates[internalId];
    },

    /**
     * Returns the _late start date_ of the task.
     * The _late start date_ is the latest possible start date of this task.
     * This value is calculated based on the latest start dates of its successors.
     * If the task has no successors, this value is calculated as the _project end date_ minus the task duration
     * (_project end date_ is the latest end date of all the tasks in the taskStore).
     *
     * @return {Date} The late start date.
     */
    getLateStartDate : function () {
        var store = this.getTaskStore();
        if (!store) return this.getStartDate();

        var internalId = this.internalId;
        if (store.lateStartDates[internalId]) return store.lateStartDates[internalId];

        var result;
        // for parent task we take minimum Late Start from its children
        if (this.childNodes.length) {
            var dt, i, l;

            for (i = 0, l = this.childNodes.length; i < l; i++) {
                dt = this.childNodes[i].getLateStartDate();
                if (dt < result || !result) result = dt;
            }

            store.lateStartDates[internalId] = result;

            return result;
        }

        // for manually scheduled task we simply return its start date
        if (this.isManuallyScheduled())  {
            result = store.lateStartDates[internalId] = this.getStartDate();
            return result;
        }

        // Late Start Date is Late Finish Date minus duration
        var value = this.getLateEndDate();
        if (!value) return null;

        result = store.lateStartDates[internalId] = this.getCalendar().calculateStartDate(value, this.getDuration(), this.getDurationUnit());

        return result;
    },

    resetEarlyDates : function () {
        var store = this.getTaskStore();
        if (!store) return;

        var internalId = this.internalId;
        store.earlyStartDates[internalId]    = null;
        store.earlyEndDates[internalId]      = null;
    },

    resetLateDates : function () {
        var store = this.getTaskStore();
        if (!store) return;

        var internalId = this.internalId;
        store.lateStartDates[internalId]    = null;
        store.lateEndDates[internalId]      = null;
    },


    getTopParent : function (all) {
        var root    = this.getTaskStore().getRootNode(),
            p       = this,
            path    = [ this ],
            result;

        while (p) {
            if (p === root) return all ? path : result;

            path.push(p);

            result  = p;
            p       = p.parentNode;
        }
    },


    // TODO: use for something - as a fast way of iterating over all children of some parent in depth
    getInDepthWalker : function (includeThisNode) {
        var current         = includeThisNode ? this : this.childNodes && this.childNodes[ 0 ];
        var stopAt          = this;

        var visitedParents  = {};
        var prev            = null;

        var next            = function (from) {
            var current     = from;
            var internalId  = current.internalId;

            if (current.isLeaf() || !current.childNodes.length)
                current     = current.nextSibling;
            else {
                if (visitedParents[ internalId ] === true) {
                    visitedParents[ internalId ] = false;

                    current = current.nextSibling;
                } else {
                    visitedParents[ internalId ] = true;

                    current = current.childNodes[ 0 ];
                }
            }

            if (!current) {
                current     = from;

                do {
                    if (current === stopAt) return null;

                    current = current.parentNode;

                    if (current === stopAt) return null;
                } while (visitedParents[ current.internalId ] === false);

                return next(current);
            }

            return current;
        };

        return function () {
            var task    = current;

            if (current) current  = next(current);

            return task;
        };
    },


    /**
     * Propagates changes done in `changer` function to the task to all dependent tasks. The action is asynchronous
     * since changes propagation might violate some constraints applyed, which in it's turn might require user
     * interaction.
     *
     * @param {Function} [changer] A function which should apply changes to the task
     *  A changer might return:
     *  - true - in this case the task will be considered as propagation source and propagation will be done only
     *    if the task has outstanding changes to propagate;
     *  - false or nothing - to cancel changes and skip propagation entirely;
     *  - a task instance, or array of task instances - to considered given instances as propagation source(s) and do
     *    the propagation
     *  If changer is not given or it's equal to Ext.emptyFn then propagation will be forcefully executed and tasks
     *  will be aligned/constrained according to their dependencies and/or constraints.
     * @param {Gnt.model.Task} changer.task The task
     * @param {Function} [callback] A callback function which will be called after changes propagation.
     * @param {Boolean}  callback.cancel Flag showing whether entire changes transaction has been canceled
     *  and nothing is changed.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @param {Boolean}  [forceCascadeChanges=task's task store `cascadeChanges` option] Flag indicating whether to propagate changes to dependent tasks.
     */
    propagateChanges : function(changer, callback, forceCascadeChanges) {
        var me = this,
            propagationSources,
            affectedTasks,
            taskStore,
            cascadeBatch;

        // <debug>
        !changer || Ext.isFunction(changer) ||
            Ext.Error.raise("Can't propagete changes to a task, invalid changer function given!");
        !callback || Ext.isFunction(callback) ||
            Ext.Error.raise("Can't propagate changes to a task, invalid callback function given!");
        // </debug>

        taskStore = me.getTaskStore(true);
        forceCascadeChanges = arguments.length == 3 ? forceCascadeChanges : taskStore && taskStore.cascadeChanges;

        if (!me.propagating && taskStore) {

            me.propagating = true;
            affectedTasks  = {};
            taskStore.suspendAutoSync();
            cascadeBatch   = taskStore.startBatchCascade();
            taskStore.startProjection();

            try {
                propagationSources = (changer && changer !== Ext.emptyFn) ? changer(me) : [me];
            }
            catch(e) {
                taskStore.rejectProjection();
                taskStore.endBatchCascade();
                taskStore.resumeAutoSync(taskStore.autoSync);
                me.propagating = false;
                throw e;
            }

            if (propagationSources === true) {
                propagationSources = me.isProjected() && [me] || false;
            }
            else if (propagationSources) {
                propagationSources = [].concat(propagationSources);
            }

            // Propagating
            if (propagationSources) {
                me.propagateChangesThroughDependentTasks(
                    taskStore.getLinearWalkingSequenceForDependentTasks(
                        propagationSources, {
                            self : true,
                            ancestors   : taskStore.recalculateParents,
                            descendants : taskStore.moveParentAsGroup,
                            successors  : forceCascadeChanges,
                            cycles      : taskStore.cycleResolutionStrategy
                        }
                    ),
                    taskStore,
                    cascadeBatch,
                    propagationSources,
                    forceCascadeChanges,
                    affectedTasks,
                    function propagateChangesThroughDependentTasksCallback(cancelChanges, affectedTasks) {
                        // JSHint doesn't like it
                        //  cancelChanges ? (taskStore.rejectProjection(), affectedTasks = {}) : taskStore.commitProjection();
                        // thus
                        if (cancelChanges) {
                            taskStore.rejectProjection();
                            affectedTasks = {};
                        }
                        else {
                            taskStore.commitProjection();
                        }
                        taskStore.endBatchCascade();

                        me.propagating = false;
                        callback && callback(cancelChanges, affectedTasks);

                        taskStore.resumeAutoSync(taskStore.autoSync && !cancelChanges && !Ext.Object.isEmpty(affectedTasks));
                    }
                );
            }
            else {
                taskStore.rejectProjection();
                taskStore.endBatchCascade();
                me.propagating = false;
                callback && callback(false, {});
                taskStore.resumeAutoSync(taskStore.autoSync);
            }
        }
        // No task store
        else if (!me.propagating) {
            me.propagating = true;

            try {
                changer && changer(me);
            }
            catch (e) {
                me.propagating = false;
                throw e;
            }

            me.verifyConstraint(function(constraintSatisfied, cancelChanges) {
                affectedTasks = {};
                cancelChanges = !!cancelChanges;
                if (!cancelChanges) {
                    affectedTasks[me.getInternalId()] = me;
                }
                me.propagating = false;
                callback && callback(cancelChanges, affectedTasks);
            });
        }
        // We are currently propagating
        else {
            callback && callback(true, {});
        }
    },


    /**
     * @private
     *
     * @param {Array} linearWalkingSequence
     * @param {Gnt.model.Task} linearWalkingSequence[0] Step task
     * @param {String}         linearWalkingSequence[1] Color of the visiting step
     *  - 'green'  - Task is ready to be processed
     *  - 'yellow' - Branch task is ready to process it's children
     * @param {Object}         linearWalkingSequence[2] Set of all collected dependent tasks
     * @param {Object}         linearWalkingSequence[3] Dependency data
     * @param {Gnt.data.TaskStore} taskStore
     * @param {Object}             cascadeBatch
     * @param {Gnt.model.Task[]}   propagationSources
     * @param {Boolean}            forceCascadeChanges
     * @param {Object}             affectedTasks
     * @param {Function}           callback
     * @param {Integer}            startAt
     */
    propagateChangesThroughDependentTasks : function(linearWalkingSequence, taskStore, cascadeBatch, propagationSources, forceCascadeChanges, affectedTasks, callback, startAt) {
        var me = this,
            i, len,
            constraintSatisfied;

        startAt             = startAt    || 0;
        constraintSatisfied = true;

        for (i = startAt, len = linearWalkingSequence.length; constraintSatisfied && i < len; ++i) {

            constraintSatisfied = me.processTaskConstraints(
                linearWalkingSequence,
                i,
                taskStore,
                cascadeBatch,
                propagationSources,
                forceCascadeChanges,
                affectedTasks,
                function(linearWalkingIndex, constraintSatisfied, propagationCanceled, affectedTasks) {
                    // This callback might be called either synchronously or asynchronously thus we can't rely on
                    // `i` variable here. That's because if it is called synchronously then `i` will not yet be
                    // incremeted by the for loop counter incrementing part, and if it's called asynchronously
                    // then `i` will be already incremeted by the for loop directive. Thus we got the index
                    // for which this callback is called for as a parameter

                    // Stop condition
                    if (propagationCanceled || (linearWalkingIndex == len - 1)) {
                        callback(propagationCanceled, affectedTasks);
                    }
                    // Continue by recursion condition
                    else if (!constraintSatisfied) {
                        me.propagateChangesThroughDependentTasks(
                            linearWalkingSequence,
                            taskStore,
                            cascadeBatch,
                            propagationSources,
                            forceCascadeChanges,
                            affectedTasks,
                            callback,
                            linearWalkingIndex + 1
                        );
                    }
                    // Else constraint is satisfied and we will continue by the for loop
                }
            );
        }
    },

    /**
     * @private
     *
     * Will return `false` if a constraint conflict has been detected and awaiting for resolution, once resolved
     * the callback method will be called.
     */
    processTaskConstraints : function(linearWalkingSequence, linearWalkingIndex, taskStore, cascadeBatch, propagationSources, forceCascadeChanges, affectedTasks, callback) {
        var me                             = this,
            step                           = linearWalkingSequence[linearWalkingIndex],
            task                           = step[0],
            color                          = step[1],
            isParent                       = task.hasChildNodes(),
            isLeaf                         = !isParent,
            internalId                     = task.internalId,
            autoScheduled                  = !(task.isManuallyScheduled() || Ext.Array.contains(propagationSources, task)),
            cascadeChanges                 = forceCascadeChanges || taskStore.cascadeChanges,
            recalculateParents             = taskStore.recalculateParents,
            moveParentAsGroup              = taskStore.moveParentAsGroup,
            parentNode                     = task.parentNode,
            parentNodeStartDate            = parentNode && (parentNode.getStartDate()),
            parentNodeUnprojectedStartDate = parentNode && (parentNode.getUnprojected(parentNode.startDateField)),
            parentNodeDateOffset           = parentNode && (parentNodeStartDate - parentNodeUnprojectedStartDate),
            offsetFromParent;

        function areIncomingDependenciesAffectedOrPropagationSourcesIncoming(task, affectedTasks, propagationSources) {
            var incomingDeps = task.getIncomingDependencies(true),
                result = false,
                i, len, dep, fromTask;

            for (i = 0, len = incomingDeps.length; !result && i < len; ++i) {
                dep = incomingDeps[i];
                fromTask = dep.getSourceTask();
                result = fromTask && affectedTasks.hasOwnProperty(fromTask.getInternalId()) ||
                                     Ext.Array.contains(propagationSources, fromTask);
            }

            return result;
        }

        switch (true) {
            case autoScheduled && isLeaf   && color == 'green'  && parentNodeDateOffset && moveParentAsGroup:
            case autoScheduled && isParent && color == 'yellow' && parentNodeDateOffset && moveParentAsGroup:

                offsetFromParent = task.calculateDuration(parentNodeUnprojectedStartDate, task.getStartDate());
                task.setStartDateWithoutPropagation(task.calculateEndDate(parentNodeStartDate, offsetFromParent), true, taskStore.skipWeekendsDuringDragDrop);
                // Passing a parent node here limits the constraining to incoming dependencies incoming from
                // that parent node descendants only, outer nodes are not taken into account
                areIncomingDependenciesAffectedOrPropagationSourcesIncoming(task, affectedTasks, propagationSources) &&
                    task.constrainWithoutPropagation(taskStore, null, parentNode);
                break;

            case autoScheduled && isLeaf   && color == 'green'  && cascadeChanges:
            case autoScheduled && isParent && color == 'yellow' && cascadeChanges:

                areIncomingDependenciesAffectedOrPropagationSourcesIncoming(task, affectedTasks, propagationSources) &&
                    task.constrainWithoutPropagation(taskStore, null);
                break;

            case isParent && color == 'green' && recalculateParents:

                task.refreshCalculatedParentNodeData();
                break;
        }

        if (task.isProjected()) {
            cascadeBatch.addAffected(task);
            affectedTasks[task.getInternalId()] = task;
        }

        return task.verifyConstraint(function(constraintSatisfied, propagationCanceled) {
            var yellowStep,
                yellowStepIdx;

            // In case a parent node is adjusted according to it's children and such an adjustment violates
            // the parent node constraint then we rewind back to the same parent node yellow step to readjust
            // it and it's children once again allowing a user to reconsider (by showing him constraint violation
            // dialog, for example). We rewince by calling a callback with ajusted step index.
            if (!constraintSatisfied && isParent && autoScheduled && taskStore.recalculateParents && color == 'green') {
                yellowStep = Ext.Array.findBy(linearWalkingSequence, function(step, index) {
                    var stepTask  = step[0],
                        stepColor = step[1];

                    yellowStepIdx = index;

                    return task === stepTask && stepColor == 'yellow';
                });
                // yellowStep must always be present in the linear walking sequence.
                callback(yellowStepIdx, constraintSatisfied, !!propagationCanceled, affectedTasks);
            }
            else {
                callback(linearWalkingIndex, constraintSatisfied, !!propagationCanceled, affectedTasks);
            }
        });
    }
});
