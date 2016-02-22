/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// We patched grid navigation model to not focus rows in normal view in order to save scroll in IE
// this is why under some conditions keyevent contain wrong view and target. This can break navigation
// 2117_key_navigation
Ext.define('Sch.patches.NavigationModel', {
    extend      : 'Sch.util.Patch',

    requires    : ['Ext.grid.NavigationModel'],
    target      : 'Ext.grid.NavigationModel',

    minVersion  : '6.0.0',

    ieOnly      : true,

    overrides   : {
        setPosition: function(recordIndex, columnIndex, keyEvent, suppressEvent, preventNavigation) {
            // We need to only handle pageup/pagedown keys, because they call setPosition(record, null,...) which trigger
            // special path that leads to error when there's lastFocused property that holds
            // column from normal view and current view is locked
            if (keyEvent && (keyEvent.getKey() === keyEvent.PAGE_DOWN || keyEvent.getKey() === keyEvent.PAGE_UP)) {
                var lastFocused = this.lastFocused;
                if (keyEvent.view.isLockedView && lastFocused && keyEvent.view.getVisibleColumnManager().indexOf(lastFocused.column) === -1) {
                    keyEvent.view = keyEvent.view.lockingPartner;
                }
            }
            return this.callParent(arguments);
        }
    }
});