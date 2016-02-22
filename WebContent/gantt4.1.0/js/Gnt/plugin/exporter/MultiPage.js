/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 @class Gnt.plugin.exporter.MultiPage
 @extends Sch.plugin.exporter.MultiPage

 This class extracts pages in a vertical and horizontal order.

 The exporterId of this exporter is `multipage`
 */

Ext.define('Gnt.plugin.exporter.MultiPage', {

    extend              : 'Sch.plugin.exporter.MultiPage',

    mixins              : ['Gnt.plugin.exporter.mixin.DependencyPainter'],

    depsTopOffset       : 0,

    normalGridOffset    : 0,


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
        me.normalGridOffset = 0;

        me.callParent(arguments);
    },

    commitPage : function (pageData) {
        var me      = this;

        me.callParent(arguments);

        // on next page dependencies will be shifted vertically based on this page height
        me.depsTopOffset -= pageData.rowsHeight;
    },

    startPage : function (pattern, newColumnPage) {
        var me = this;

        me.normalGridOffset = pattern.normalGridOffset;

        if (newColumnPage) {
            me.depsTopOffset    = 0;
        }

        me.callParent(arguments);
    },


    /**
     * @protected
     * Builds a page frame, a DOM-"skeleton" for a future pages.
     * @param  {Number} colIndex Zero based index of page column to build frame for.
     * @param  {Number} offset   Proper normal grid offset for the page column.
     * @return {Ext.dom.Element} Column page frame.
     */
    buildPageFrame : function (colIndex, offset) {
        var me  = this;

        var copy = me.callParent(arguments);

        // remember locked/normal grids visibility
        copy.normalHidden = me.normalGrid.hidden;
        copy.lockedHidden = me.lockedGrid.hidden;

        return copy;
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
            pageFrame   = me.pageFrames[me.columnPageIndex-1],
            get = function (s) {
                var el = frag.select('#' + s).first();
                return el && el.dom;
            };

        if (!pageFrame.normalHidden) {
            depsCt.dom.innerHTML = me.dependenciesHtml;

            // move the dependencies div to match the position of the dependency lines
            depsCt.applyStyles({
                top : me.depsTopOffset + 'px'
            });

            var normalGrid  = me.normalGrid,
                id          = normalGrid.getView().id;

            var normalView  = get(id);
            if (normalView) {
                var tableWidth = normalGrid.el.down(me.tableSelector).getWidth();

                // hiding dependencies
                normalView.style.width      = tableWidth + 'px';
                // remove scrollbars
                normalView.style.overflow   = 'hidden';
            }
        }

        if (!pageFrame.lockedHidden) {
            var lockedView  = get( me.lockedView.id );

            if (lockedView) {
                // remove scrollbars
                lockedView.style.overflow   = 'hidden';
            }
        }

        return frag;
    }

});
