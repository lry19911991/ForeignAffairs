/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/* global Ext */
/**
 * @singleton
 */
Ext.define('Gnt.data.linearizator.CycleResolvers', function(thisClass) {

    /**
     * Doesn't resolve dependency cycle.
     *
     * @method none
     * @member Gnt.data.linearizator.CycleResolvers
     */
    function resolveCycleNone() {
        return false;
    }

    /**
     * Doesn't resolve dependency cycle and throws exception.
     *
     * @method exception
     * @member Gnt.data.linearizator.CycleResolvers
     */
    function resolveCycleByException() {
        Ext.Error.raise("Can't linearize dependent tasks, there's a cycle in the dependency chain!");
    }

    /**
     * Resolve a dependency cycle by cutting (forcefully marking one or more dependencies as resolved ('green')).
     *
     * @method cut
     * @member Gnt.data.linearizator.CycleResolvers
     */
    function resolveCycleByCuttingLinks$(sourceSet, depsData) {
        
        // The code assuming that nodes in source set form strict upward vertical hierarchy i.e. there can't be child
        // nodes missing parents but the opposite (downward) might be possible, i.e. it is possible forparent node to
        // miss children in the source set, as well as horizontal hierarchy might be lax, i.e. there might be nodes
        // whose siblings are not present the source set.

        var sourceTree = buildSourceTreeFromSourceSet(sourceSet, depsData),
            cuts = {},
            cutsCollector = function(from, to) {
                var d = cuts[from] || (cuts[from] = {});
                d[to] = to;
            };
 
        // Folding order is the following:
        //   A
        // +-+-+
        // B C D
        //
        // B - skipped
        // C - folded with B
        // D - folded with C and then folded with A
        traverseSourceTreePostOrder(sourceTree, function foldNode$(node) {

            // First we fold a node with it's previous sibling if one exists
            if (node.prevSibling) {
                collectCycles(node.prevSibling.foldedDeps, node.foldedDeps, cutsCollector);
                node.foldedDeps = Ext.apply(node.foldedDeps, node.prevSibling.foldedDeps);
            }

            // Next if a node is the last sibling in a parent node then we fold it with parent node
            if (!node.nextSibling && node.parentNode) {
                collectCycles(node.parentNode.foldedDeps, node.foldedDeps, cutsCollector);
                node.parentNode.foldedDepds = Ext.apply(node.parentNode.foldedDeps, node.foldedDeps);
            }

        });

        cutCycles$(depsData.fromById, cuts);

        return true;
    }

    // --- Private functions --------------------------------------------------------------------------------------- //
    // Source set represents a set of colored nodes, which might or might not have vertical links among themselves
    // regardles of that fact we have to build a traversable tree from that linear data structure, so if a task
    // from colored node has some siblings which are not in the sources set then those siblings shouldn't be present
    // in resulting tree, same goes for children and parent nodes. Due to this node skipping we might end with several
    // nodes having no parent nodes, such nodes will be then joined together under common pseudo root node.
    function buildSourceTreeFromSourceSet(sourceSet, depsData) {
        var root,
            roots = [],
            nodes = {},
            internalId, node;

        // In this loop we transform each colored node from a source set into a tree node (an object we use
        // to represent a tree node), and collecting each transformed node for furher realization as well as each
        // root node, i.e. nodes whose parents are not in the source set, for further processing.
        for (internalId in sourceSet) {
            if (sourceSet.hasOwnProperty(internalId)) {
                node = nodes[internalId] = createRawSourceTreeNode(sourceSet[internalId].task, sourceSet, depsData);
                if (!sourceSet.hasOwnProperty(node.parentNode)) {
                    roots.push(node);
                }
            }
        }

        // In this loop we relize collected tree nodes to point to other tree nodes instead of ids.
        for (internalId in nodes) {
            if (nodes.hasOwnProperty(internalId)) {
                nodes[internalId] = realizeRawSourceTreeNode$(nodes[internalId], nodes);
            }
        }

        if (roots.length == 1) {
            root = roots[0];
        }
        else {
            // The data structure is the same createRawSourceTreeNode() returns
            root = {
                parentNode  : null,
                prevSibling : null,
                nextSibling : null,
                children    : roots,
                foldedDeps  : {}
            };
        }

        return root;
    }


    function createRawSourceTreeNode(storeNode, sourceSet, depsData) {
        var fromDeps         = depsData.fromById,
            foldedDeps       = {},
            internalId       = storeNode.internalId,
            parentNode, nextSibling, prevSibling,
            children, childInternalId, childrenInternalIds,
            i, len;

        // We count outgoing horizontal (i.e. successors)  dependencies only, this is ok, since if we would count
        // both successors and predecessors then each successor - predecessor pair will create a direct loop
        foldedDeps[internalId] = Ext.clone(fromDeps[internalId] || {});

        // Vertical upward hierarchy might be either present or not, if it's present then it's present up to root
        parentNode = storeNode.parentNode && sourceSet.hasOwnProperty(storeNode.parentNode.internalId) && storeNode.parentNode.internalId;

        // Vertical downward hierarchy might be lax
        children = storeNode.childNodes || [];
        childrenInternalIds = [];

        for (i = 0, len = children.length; i < len; i++) {
            childInternalId = children[i].internalId;
            if (sourceSet.hasOwnProperty(childInternalId)) {
                childrenInternalIds.push(childInternalId);
            }
        }

        // Horizontal hierarchy might be lax.
        prevSibling = storeNode.previousSibling;
        while (prevSibling && !sourceSet.hasOwnProperty(prevSibling.internalId)) {
            prevSibling = prevSibling.previousSibling;
        }
        prevSibling = prevSibling && prevSibling.internalId;

        nextSibling = storeNode.nextSibling;
        while (nextSibling && !sourceSet.hasOwnProperty(nextSibling.internalId)) {
            nextSibling = nextSibling.nextSibling;
        }
        nextSibling = nextSibling && nextSibling.internalId;

        // That'll be our source node
        // now it references related nodes by ids.
        // Each original node which is referenced by a task but not present in source set has been skipped
        // The resulting data structure will be further realized to reference other tree nodes instead of ids.
        return {
            parentNode  : parentNode, 
            prevSibling : prevSibling, 
            nextSibling : nextSibling,
            children    : childrenInternalIds,
            foldedDeps  : foldedDeps
        };
    }


    function realizeRawSourceTreeNode$(node, nodes) {
        var i, len,
            children = node.children;

        for (i = 0, len = children.length; i < len; i++) {
            children[i] = nodes[children[i]];
        }

        node.parentNode  = (node.parentNode  || node.parentNode === 0)   && nodes[node.parentNode]  || null;
        node.prevSibling = (node.prevSibling || node.prevSibling === 0)  && nodes[node.prevSibling] || null;
        node.nextSibling = (node.nextSibling || node.nextSibling === 0)  && nodes[node.nextSibling] || null;  

        return node;
    }


    function traverseSourceTreePostOrder(branchRoot, stepFn) {
        var children = branchRoot.children,
            i, len;

        for (i = 0, len = children.length; i < len; i++) {
            traverseSourceTreePostOrder(children[i], stepFn);
        }

        stepFn(branchRoot);

        return branchRoot;
    }


    function collectCycles(sourceNodeDeps, destNodeDeps, cycleDepsCollectorFn) {
        var sourceFrom, sourceTo,
            destFrom, destTo,
            intersectSourceToDestFrom, weightFromSourceToDest,
            intersectDestToSourceFrom, weightFromDestToSource,
            fromId, toId;

        sourceFrom = Ext.Object.getKeys(sourceNodeDeps);
        destFrom   = Ext.Object.getKeys(destNodeDeps);

        sourceTo   = Ext.Array.flatten(
                        Ext.Array.map(sourceFrom, function(id) {
                            return Ext.Object.getKeys(sourceNodeDeps[id]);
                        })
                     );

        destTo     = Ext.Array.flatten(
                        Ext.Array.map(destFrom, function(id) {
                            return Ext.Object.getKeys(destNodeDeps[id]);
                        })
                     );
        
        intersectSourceToDestFrom = Ext.Array.intersect(sourceTo, destFrom);
        intersectDestToSourceFrom = Ext.Array.intersect(destTo, sourceFrom);

        // Detecting cut
        if (intersectSourceToDestFrom.length > 0 && intersectDestToSourceFrom.length > 0) {
            // Detecting minimal cut
            weightFromSourceToDest = 0;
            Ext.Array.forEach(intersectSourceToDestFrom, function(id) {
                for (var i = 0, len = sourceTo.length; i < len; i++) {
                    sourceTo[i] == id && ++weightFromSourceToDest;
                }
            });
            weightFromDestToSource = 0;
            Ext.Array.forEach(intersectDestToSourceFrom, function(id) {
                for (var i = 0, len = destTo.length; i < len; i++) {
                    destTo[i] == id && ++weightFromDestToSource;
                }
            });

            // Collecting minimal cut
            if (weightFromSourceToDest < weightFromDestToSource) {
                Ext.Array.forEach(intersectSourceToDestFrom, function(id) {
                    collectAllDepsTo(sourceNodeDeps, id, cycleDepsCollectorFn);
                });
            }
            else {
                Ext.Array.forEach(intersectDestToSourceFrom, function(id) {
                    collectAllDepsTo(destNodeDeps, id, cycleDepsCollectorFn);
                });
            }
        } 
    }

    function collectAllDepsTo(fromDeps, toId, depsCollectorFn) {
        var fromId;

        for (fromId in fromDeps) {
            if (fromDeps.hasOwnProperty(fromId) && fromDeps[fromId].hasOwnProperty(toId)) {
                depsCollectorFn(fromId, toId);
            }
        }
    }

    function cutCycles$(fromDeps, cuts) {
        var fromId, toId,
            toIdMap, i, len;

        for (fromId in cuts) {
            if (cuts.hasOwnProperty(fromId)) {
                toIdMap = cuts[fromId];
                for (toId in toIdMap) {
                    if (toIdMap.hasOwnProperty(toId)) {
                        fromDeps[fromId][toId][0] = 'green';
                    }
                }
            }
        }

        return fromDeps;
    }

    // --- Public interface ---------------------------------------------------------------------------------------- //
    return {
        singleton   : true,

        'none'      : resolveCycleNone, 
        'exception' : resolveCycleByException,
        'cut'       : resolveCycleByCuttingLinks$
    };
});
