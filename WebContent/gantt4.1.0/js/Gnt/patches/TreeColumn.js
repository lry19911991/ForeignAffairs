/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// https://www.sencha.com/forum/showthread.php?301532-Renderer-scope-is-lost-in-Ext.tree.Column-mixin
Ext.define('Gnt.patches.TreeColumn', {
    extend  : 'Sch.util.Patch',

    requires : 'Ext.tree.Column',
    target : 'Ext.tree.Column',

    minVersion  : '5.1.1',

    overrides    : {
        initComponent: function() {
            var me = this;
            me._rendererScope = me.scope || me;
            // tree column wraps renderer into it's own, but looses provided scope
            me.callParent(arguments);
            me.rendererScope = me._rendererScope;
        }
    }
});