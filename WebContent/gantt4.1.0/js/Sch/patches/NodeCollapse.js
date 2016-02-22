/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// caught by 2102_view_scroll
// TODO: remove this when ext6.0.0 support is dropped
Ext.define('Sch.patches.NodeCollapse', {

    onClassMixedIn : function (cls) {
        if (Ext.versions.extjs.isLessThan('6.0.1')) {
            cls.override(this.prototype.overridables);
        }
    },


    overridables : {
        initComponent : function () {

            this.callParent(arguments);

            var lockedView      = this.lockedGrid.getView();

            this.mon(this.resourceStore, {
                'nodecollapse' : function () {
                    // layout procedure is initiated on collapse and this property will be removed
                    lockedView._doNotStoreScrollPosition = true;
                }
            });

            lockedView.syncRowHeightBegin = Ext.Function.createInterceptor(lockedView.syncRowHeightBegin, function () {
                // caught by 2102_view_scroll
                // during layout update ext is trying to synchronize row heights
                // call to syncRowHeightsBegin will screw scroll position in locked grid
                // and right after that scroll position is memorized. We need to save scroll position before it's messed

                // when we collapse node we hit this part of the code twice and need to memorize first value
                // but for every other case - last, most recent. e.g. when you dragcreate, scroll and update
                // layout (hovering mouse over scheduling view will trigger that)
                if (!lockedView._doNotStoreScrollPosition) {
                    var scrollRestore = {
                        x: lockedView.getScrollX(),
                        y: lockedView.getScrollY()
                    };

                    this.lockedGrid.on('afterlayout', function () {
                        lockedView.scrollTo(scrollRestore.x, scrollRestore.y);
                        delete lockedView._doNotStoreScrollPosition;
                    }, this, {single: true});
                }
            }, this);
        }
    }
});
