/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// https://www.assembla.com/spaces/bryntum/tickets/2127
// https://www.sencha.com/forum/showthread.php?296729
Ext.define('Gnt.patches.RightClick', {
    extend  : 'Sch.util.Patch',

    requires    : ['Gnt.view.Gantt'],
    target      : 'Gnt.view.Gantt',

    minVersion  : '5.1.0',

    overrides   : {
        handleScheduleBarEvent  : function (e) {
            // FF in windows and mac throws click event on right button click, while it shouldn't
            if (Ext.isGecko && e.type === 'click' && e.button === 2) {
                return false;
            }

            return this.callParent(arguments);
        }
    }
});
