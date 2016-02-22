Ext.define("GanttApp.TaskArea", {
    extend : 'Ext.AbstractPlugin',

    tpl : '<div class="gnt-taskarea" style="{height}px"><div class="gnt-taskarea-inner"></div></div>',

    init : function (panel) {
        var bodyTpl = (panel.parentTaskBodyTemplate || Gnt.template.ParentTask.prototype.innerTpl) + this.tpl;

        Ext.apply(panel.getSchedulingView(), {
            parentTaskBodyTemplate : bodyTpl
        });

        this.panel = panel;
        this.taskStore = panel.getTaskStore();

        panel.getSchedulingView().on({
            refresh    : this.repaintAllAreas,

            // These are also fired on expand / collapse
            itemupdate : this.repaintAllAreas,
            itemremove : this.repaintAllAreas,
            itemadd    : this.repaintAllAreas,
            scope      : this
        });
    },

    getLastVisibleChild : function (parentNode) {
        var result;

        if (!parentNode || parentNode.isLeaf() || !parentNode.isExpanded()) {
            result = parentNode;
        }
        else {
            result = this.getLastVisibleChild(parentNode.lastChild);
        }

        return result;
    },

    repaintAllAreas : function () {
        var view = this.panel.getSchedulingView();
        var viewNodes = this.panel.getSchedulingView().getNodes();

        Ext.Array.each(viewNodes, function (domNode) {
            if (domNode) {
                var node = view.getRecord(domNode);

                if (node && !node.isRoot() && !node.isLeaf() && !node.isMilestone() && node.isExpanded()) {
                    this.refreshAreaSize(node);
                }
            }
        }, this);
    },

    refreshAreaSize : function (parentTask) {

        var view = this.panel.getSchedulingView();
        var el = view.getElementFromEventRecord(parentTask);

        if (!el) return;

        var areaEl = el.down('.gnt-taskarea');

        if (!areaEl) return;

        var store = view.store;
        var lastVisibleChild = this.getLastVisibleChild(parentTask);
        var height = 0;

        if (lastVisibleChild && lastVisibleChild !== parentTask) {
            var indexDelta = view.store.indexOf(lastVisibleChild) - view.store.indexOf(parentTask);

            height = indexDelta * view.timeAxisViewModel.getViewRowHeight() - 5;
        }

        // we should filter height less than 1 for IE8
        if (height < 0) {
            return;
        }

        areaEl.setHeight(height);
    }
});