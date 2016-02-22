/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 @class Gnt.plugin.exporter.SinglePage
 @extends Sch.plugin.exporter.SinglePage

 This class extracts all scheduler data to fit in a single page.

 The exporterId of this exporter is `singlepage`
 */


Ext.define('Gnt.plugin.exporter.SinglePage', {

    extend : 'Sch.plugin.exporter.SinglePage',

    mixins : ['Gnt.plugin.exporter.mixin.DependencyPainter'],

    setComponent : function () {
        this.callParent(arguments);
        this.initDependencyPainter();
    },


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

    onRowsCollected : function () {
        var me  = this;

        me.renderDependencies();

        this.callParent(arguments);
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
            splitter    = frag.select('.' + Ext.baseCSSPrefix + 'splitter').first();

        depsCt.dom.innerHTML = me.dependenciesHtml;

        //move the dependencies div to match the position of the dependency lines
        depsCt.applyStyles({
            top     : '0px',
            left    : '0px'
        });

        splitter && splitter.setHeight('100%');

        // hiding dependencies
        var normalGrid  = me.component.normalGrid,
            tableWidth = normalGrid.el.down(me.tableSelector).getWidth(),
            id          = normalGrid.getView().id,
            el          = frag.select('#' + id).first().dom;

        el.style.width = tableWidth + 'px';

        return frag;
    }

});
