/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.plugin.ProjectLines
@extends Sch.plugin.Lines

A simple subclass of the {@link Sch.plugin.Lines} which sets project lines on the gantt chart.
Generally, there's no need to instantiate it manually, it can be activated with the {@link Gnt.panel.Gantt#showProjectLines} configuration option.

It uses the task store to populate own store with {@link Gnt.model.ProjectLine} instances.

 */
Ext.define("Gnt.plugin.ProjectLines", {
    extend              : 'Sch.plugin.Lines',
    alias               : 'plugin.gantt_projectlines',

    requires            : [
        'Gnt.model.ProjectLine',
        'Ext.data.Store'
    ],

    innerTpl            : '<span class="sch-gantt-project-line-text" style="{Style}">{Text}</span>',

    // Some number to use to make sure labels don't overlap if project labels are rendered near each other.
    labelHeight         : 25,

    showHeaderElements  : true,

    /**
     * @cfg {Gnt.data.taskStore} taskStore The task store to extract projects from
     */
    taskStore           : null,

    /**
     * @cfg {String} linesFor
     * Specifies what project dates should be used to build lines. Might be:
     *
     * - `start` - to build lines for project start dates
     * - `end` - to build lines for project end dates
     * - `both` - to build lines for both project start and end dates
     */
    linesFor            : 'both',

    init : function (ganttPanel) {
        this.taskStore  = this.taskStore || ganttPanel.getTaskStore();

        this.bindTaskStore(this.taskStore);

        if (!this.store) {
            this.store  = new Ext.data.Store({
                model   : 'Gnt.model.ProjectLine'
            });
        }

        this.callParent(arguments);

        ganttPanel.on('viewchange', this.onViewChange, this);

        // timeAxis should be already fully initialized at this point
        this.onViewChange();
    },

    bindTaskStore : function (taskStore) {
        var listeners       = {
            datachanged     : this.onDataChanged,
            update          : this.onUpdate,
            scope           : this,
            delay           : 1
        };

        if (this.taskStore) {
            this.taskStore.un(listeners);
        }

        if (taskStore) {
            taskStore.on(listeners);
        }

        this.taskStore = taskStore;
    },


    onDataChanged : function (store) {
        this.refresh();
    },


    onUpdate : function (store, record, operation) {
        if (record && record.isProject && operation == Ext.data.Model.EDIT) {

            var projectId = record.modified && record.modified.Id || record.getId();

            // re-create the project related lines
            this.store.remove(this.getProjectLines(projectId));
            this.store.add(this.retrieveProjectLines(record));
        }
    },


    onViewChange : function () {
        this.refresh();
    },


    loadStore : function () {
        this.store.removeAll(true);

        this.store.add(this.retrieveProjectLines());
    },


    refresh : function() {
        this.loadStore();
    },


    getProjectLines : function (projectId) {
        var result = [];

        this.store.each(function (line) {
            if (line.get('ProjectId') == projectId) result.push(line);
        });

        return result;
    },


    /**
     * @protected
     * @method prepareProjectStartLine Prepares a record that corresponds to a project start date.
     * @param  {Gnt.model.Project} project Project
     * @return {Object} Object representing the record to be added to the store
     */
    prepareProjectStartLine : function (project, index) {
        return {
            Date        : project.getStartDate(),
            Text        : 'Start of: ' + project.getName(),
            Cls         : 'sch-gantt-project-line-start sch-gantt-project-line-' + project.getId(),
            ProjectId   : project.getId(),
            Style       : 'margin-top:' + (index * this.labelHeight) + 'px'
        };
    },

    /**
     * @protected
     * @method prepareProjectEndLine Prepares a record that corresponds to a project end date.
     * @param  {Gnt.model.Project} project Project
     * @return {Object} Object representing the record to be added to the store
     */
    prepareProjectEndLine : function (project, index) {
        return {
            Date        : project.getEndDate(),
            Text        : 'End of: ' + project.getName(),
            Cls         : 'sch-gantt-project-line-end sch-gantt-project-line-' + project.getId(),
            ProjectId   : project.getId(),
            Style       : 'margin-top:' + (index * this.labelHeight) + 'px'
        };
    },


    retrieveProjectLines : function (project) {
        var me              = this,
            projects        = Ext.isArray(project) ? project : project && [project] || this.taskStore.getProjects(),
            projectLines    = [],
            linesFor    = me.linesFor;

        for (var i = 0; i < projects.length; i++) {
            linesFor != 'end' && projectLines.push( me.prepareProjectStartLine(projects[i], i) );
            linesFor != 'start' && projectLines.push( me.prepareProjectEndLine(projects[i], i) );
        }

        return projectLines;
    },


    destroy : function() {
        this.bindTaskStore(null);

        this.store.destroy();

        this.callParent(arguments);
    }
});