/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * This class extends id consistency management inherited from Sch.data.util.IdConsistencyManager to dependency store
 *
 * Note on update process:
 *  at the time when 'idchanged' handler is called we can effectively query stores which are using caches for
 *  a data cached under old id, but we cannot update related models with the new id since at the time of
 *  'idchanged' handler is called a record which id has been updated is still marked as phantom, it's
 *  phantom flag will be reset only at 'update' event time (and 'idchanged' event is always followed by 'update'
 *  event) and it's important we start updating related records after primary records are not phantoms
 *  any more since we might rely on this flag (for example a related store sync operation might be blocked
 *  if primary store records it relies on are still phantom).
 *
 * TODO: it should be merged with Sch.data.util.IdConsistencyManager when dependency store will be moved to Scheduler
 *       as well
 *
 * @private
 */
Ext.define('Gnt.data.util.IdConsistencyManager', {

    extend          : 'Sch.data.util.IdConsistencyManager',

    config          : {
        dependencyStore : null
    },

    // {{{ Event handlers

    // Please see the note at the class description
    onEventIdChanged : function(eventStore, event, oldId, newId) {
        var me = this,
            dependencyStore = me.getDependencyStore(),
            dependenciesUpdater;

        me.callParent([eventStore, event, oldId, newId]);

        if (dependencyStore) {
            dependenciesUpdater = me.getUpdateDependencyFromToFieldsFn(dependencyStore, oldId, newId);
            eventStore.on(
                'update',
                dependenciesUpdater,
                null,
                { single : true, priority : 200 }
            );
        }
    },
    // }}}

    // {{{ Update rules
    getUpdateDependencyFromToFieldsFn : function(dependencyStore, oldId, newId) {
        var dependencies = dependencyStore.getRange();

        return function() {
            Ext.Array.each(dependencies, function(dependency) {
                if (dependency.getFrom() == oldId) {
                    dependency.setFrom(newId);
                }
                else if (dependency.getTo() == oldId) {
                    dependency.setTo(newId);
                }
            });
        };
    }
    // }}}
});
