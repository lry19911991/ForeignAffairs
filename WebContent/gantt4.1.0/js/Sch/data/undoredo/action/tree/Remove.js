/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
Ext.define('Sch.data.undoredo.action.tree.Remove', {
    extend          : 'Sch.data.undoredo.action.Base',

    parent          : null,
    removedChild    : null,
    nextSibling     : null,

    newParent       : null,
    newNextSibling  : null,

    isMove          : false,

    undo : function () {
        if (this.isMove) {
            this.newParent = this.removedChild.parentNode;
            this.newNextSibling = this.removedChild.nextSibling;
        }
        this.parent.insertBefore(this.removedChild, this.nextSibling);
    },

    redo : function () {
        if (this.isMove) {
            this.newParent.insertBefore(this.removedChild, this.newNextSibling);
        }
        else {
            this.parent.removeChild(this.removedChild);
        }
    },

    getRecord : function () {
        return this.removedChild;
    }
});
