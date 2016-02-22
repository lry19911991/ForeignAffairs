/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 @class Gnt.plugin.exporter.MultiPageVertical
 @extends Sch.plugin.exporter.MultiPageVertical

 This class extracts pages in a vertical order. It fits all locked columns and the timeaxis on a single page and will generate
 new pages vertically down for the rows.

 The exporterId of this exporter is `multipagevertical`

 To adjust column widths for specific export cases the function {@link #fitLockedColumnWidth} can be overridden.

 */


Ext.define('Gnt.plugin.exporter.MultiPageVertical', {

    extend          : 'Sch.plugin.exporter.MultiPageVertical',

    mixins          : ['Gnt.plugin.exporter.mixin.DependencyPainter'],

    depsTopOffset   : 0,


    /**
     * @protected
     * Collects the normal grid row and its taskBoxes.
     * @param  {Element} item The normal grid row
     * @param  {Ext.data.Model} recordIndex Index of the record corresponding to the row.
     * @return {Object} Object keeping reference to the cloned row element and its height.
     */
    collectNormalRow : function (item, recordIndex) {
        var me  = this,
            row = me.callParent(arguments);

        me.fillTaskBox(row.record);

        return row;
    },

    setComponent : function () {
        var me  = this;
        me.callParent(arguments);
        me.initDependencyPainter();
    },

    onRowsCollected : function () {
        var me  = this;

        me.renderDependencies();
        me.depsTopOffset    = 0;

        me.callParent(arguments);
    },

    commitPage : function (pageData) {
        var me      = this;

        me.callParent(arguments);

        // on next page dependencies will be shifted vertically based on this page height
        me.depsTopOffset -= pageData.rowsHeight;
    },


    /**
     * @protected
     * Performs last changes to {@link #getCurrentPage the current page} being extracted before it's pushed into {@link #extractedPages} array.
     * This function will add dependencies to the output fragment.
     * @param {Object} [config] Optional configuration object.
     * @return {Ext.dom.Element} element Element holding the page.
     */
    preparePageToCommit : function () {
        var me          = this,
            frag        = me.callParent(arguments),
            depsCt      = frag.select('.sch-dependencyview-ct').first(),
            splitter    = frag.select('.' + Ext.baseCSSPrefix + 'splitter').first(),
            get = function (s) {
                var el = frag.select('#' + s).first();
                return el && el.dom;
            };

        depsCt.dom.innerHTML = me.dependenciesHtml;

        //move the dependencies div to match the position of the dependency lines
        depsCt.applyStyles({
            top     : me.depsTopOffset + 'px',
            left    : '0px'
        });

        splitter && splitter.setHeight('100%');

        // hiding dependencies
        var normalGrid  = me.normalGrid,
            tableWidth = normalGrid.el.down(me.tableSelector).getWidth(),
            id          = normalGrid.getView().id;

        var normalView  = get(id);

        normalView.style.width = tableWidth + 'px';
        //remove scrollbar
        normalView.style.overflow = 'hidden';

        var lockedView  = get( me.lockedView.id );
        //remove scrollbar
        lockedView.style.overflow = 'hidden';

        return frag;
    }

});