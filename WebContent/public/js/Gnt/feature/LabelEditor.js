/*

Ext Gantt 3.0.2
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 * @class Gnt.feature.LabelEditor
 * @protected
 * @extends Ext.Editor
 *
 * Internal class used by the Gantt chart internals allowing inline editing of the task labels.
 */
Ext.define("Gnt.feature.LabelEditor", {
    extend : "Ext.Editor",

    /**
     * @cfg {String} labelPosition Identifies which side of task this editor is used for. Possible values: 'left', 'right', 'top' or 'bottom'.
     * @property
     */
    labelPosition : '',

    constructor     : function (ganttView, config) {
        this.ganttView = ganttView;
        this.ganttView.on('afterrender', this.onGanttRender, this);

        Ext.apply(this, config);

        if (this.labelPosition === 'left') {
            this.alignment = 'r-r';
        } else if (this.labelPosition === 'right') {
            this.alignment = 'l-l';
        }

        this.delegate = '.sch-gantt-label-' + this.labelPosition;

        this.callParent([config]);
    },

    // Programmatically enter edit mode
    edit            : function (record) {
        var eventEl = this.ganttView.getElementFromEventRecord(record);

        if (eventEl) {
            var wrap = eventEl.up(this.ganttView.eventWrapSelector);
            var pnl, old;

            this.record = record;

            if (!this.rendered) {
                this.render(this.ganttView.getSecondaryCanvasEl());
            }

            // HACK: Ext grid panel observes focus events handling in the grid element and messes up
            // the focusing in IE, we work around it
            if (Ext.isIE) {
                pnl = this.ganttView.up('panel');
                old = pnl.handleFocusEnter;

                pnl.handleFocusEnter = Ext.emptyFn;
            }

            this.startEdit(wrap.down(this.delegate), this.dataIndex ? record.get(this.dataIndex) : '');

            // HACK continued
            if (Ext.isIE) {
                pnl.handleFocusEnter = old;
            }
        }
    },

    triggerEvent    : 'dblclick',

    // private, must be supplied
    delegate        : null,

    // private, must be supplied
    dataIndex       : null,
    shadow          : false,
    completeOnEnter : true,
    cancelOnEsc     : true,
    ignoreNoChange  : true,

    onGanttRender : function (ganttView) {

        if (!this.field.width) {
            this.autoSize = 'width';
        }

        this.on({
            beforestartedit : function (editor, el, value) {
                return ganttView.fireEvent('labeledit_beforestartedit', ganttView, this.record, value, editor);
            },
            beforecomplete  : function (editor, value, original) {
                return ganttView.fireEvent('labeledit_beforecomplete', ganttView, value, original, this.record, editor);
            },
            complete        : function (editor, value, original) {
                this.record.set(this.dataIndex, value);
                ganttView.fireEvent('labeledit_complete', ganttView, value, original, this.record, editor);
            },
            scope           : this
        });

        ganttView.el.on(this.triggerEvent, function (e, t) {
            this.edit(ganttView.resolveTaskRecord(t));
        }, this, {
            delegate : this.delegate
        });
    }
});
