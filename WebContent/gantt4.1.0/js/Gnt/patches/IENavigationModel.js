/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// https://www.assembla.com/spaces/bryntum/tickets/2415-assignment-column-editor-collapses-on-checkcolumn-click/details#
Ext.define('Gnt.patches.IENavigationModel', {
    extend      : 'Sch.util.Patch',

    requires    : ['Ext.grid.NavigationModel'],
    target      : 'Ext.grid.NavigationModel',

    ieOnly      : true,

    minVersion  : '6.0.0',
    maxVerson   : '6.1.0',

    overrides   : {
        onKeyTab: function(keyEvent) {
            var forward = !keyEvent.shiftKey,
                position = keyEvent.position.clone(),
                view = position.view,
                cell = keyEvent.position.cellElement,
                tabbableChildren = Ext.fly(cell).findTabbableElements(),
                focusTarget,
                actionables = view.ownerGrid.actionables,
                len = actionables.length,
                i;
            // We control navigation when in actionable mode.
            // no TAB events must navigate.
            keyEvent.preventDefault();
            // Find the next or previous tabbable in this cell.
            focusTarget = tabbableChildren[Ext.Array.indexOf(tabbableChildren, keyEvent.target) + (forward ? 1 : -1)];
            // If we are exiting the cell:
            // Find next cell if possible, otherwise, we are exiting the row
            while (!focusTarget && (cell = cell[forward ? 'nextSibling' : 'previousSibling'])) {
                // Move position pointer to point to the new cell
                position.setColumn(view.getHeaderByCell(cell));
                // Inform all Actionables that we intend to activate this cell.
                // If they are actionable, they will show/insert tabbable elements in this cell.
                for (i = 0; i < len; i++) {
                    actionables[i].activateCell(position);
                }
                // If there are now tabbable elements in this cell (entering a row restores tabbability)
                // and Actionables also show/insert tabbables), then focus in the current direction.
                if ((tabbableChildren = Ext.fly(cell).findTabbableElements()).length) {
                    focusTarget = tabbableChildren[forward ? 0 : tabbableChildren.length - 1];
                }
            }

            // Original method first focuses field and then view el to get blur event, doesn't sound right

            // IE, which does not blur on removal from DOM of focused element must be kicked to blur the focused element
            // which Actionables react to.
            if (Ext.isIE) {
                view.el.focus();
            }
            // We found a focus target either in the cell or in a sibling cell in the direction of navigation.
            if (focusTarget) {
                // Keep actionPosition synched
                this.actionPosition = position.view.actionPosition = position;
                Ext.fly(focusTarget).focus();
                return;
            }

            // We need to exit the row
            view.onRowExit(keyEvent.item, keyEvent.item[forward ? 'nextSibling' : 'previousSibling'], forward);
        }
    }
});
