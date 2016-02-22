/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 @class Sch.widget.ExportDialogForm
 @private
 @extends Ext.form.Panel

 Form for {@link Sch.widget.ExportDialog}. This is a private class and can be overriden by providing `formPanel` option to
 {@link Sch.plugin.Export#cfg-exportDialogConfig exportDialogConfig}.
 */
Ext.define('Sch.widget.ExportDialogForm', {
    extend      : 'Ext.form.Panel',
    requires    : [
        'Ext.data.Store',
        'Ext.XTemplate',
        'Ext.ProgressBar',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Date',
        'Ext.form.FieldContainer',
        'Ext.form.field.Checkbox',
        'Sch.widget.ResizePicker',
        'Sch.widget.ColumnPicker'
    ],

    border      : false,
    bodyPadding : '10 10 0 10',
    autoHeight  : true,

    initComponent : function () {
        var me = this;

        me.fieldDefaults    = Ext.applyIf(me.fieldDefaults || {}, {
            labelAlign      : 'left',
            labelWidth      : 120,
            anchor          : '99%'
        });

        me.items            = me.createFields();

        me.items.push(me.progressBar || me.createProgressBar());

        me.callParent(arguments);

        // trigger fields `change` listeners to enable/disable related fields
        me.onRangeChange(null, me.dialogConfig.exportConfig.range);
        me.onExporterChange(me.exportersField, me.exportersField.getValue());

        me.on({
            hideprogressbar     : me.hideProgressBar,
            showprogressbar     : me.showProgressBar,
            updateprogressbar   : me.updateProgressBar,
            scope               : me
        });
    },

    isValid : function () {
        var me  = this;
        if (me.rangeField.getValue() === 'date') return me.dateFromField.isValid() && me.dateToField.isValid();

        return true;
    },

    getValues : function (asString, dirtyOnly, includeEmptyText, useDataValues) {
        var result      = this.callParent(arguments);

        result.showHeader = !!result.showHeader;
        result.showFooter = !!result.showFooter;

        var cellSize    = this.resizePicker.getValues();
        if (!asString) {
            result.cellSize = cellSize;
        } else {
            result += '&cellSize[0]='+cellSize[0]+'&cellSize[1]='+cellSize[1];
        }

        if (this.dialogConfig.showColumnPicker) {
            result.columns = this.columnPicker.getSelectedColumns();
        }

        return result;
    },

    createFields : function () {
        var me                  = this,
            cfg                 = me.dialogConfig,
            beforeLabelTextTpl  = '<table class="sch-fieldcontainer-label-wrap"><td width="1" class="sch-fieldcontainer-label">',
            afterLabelTextTpl   = '<td><div class="sch-fieldcontainer-separator"></div></table>',
            items = [];

        me.rangeField       = new Ext.form.field.ComboBox({
            value           : cfg.exportConfig.range,
            triggerAction   : 'all',
            cls             : 'sch-export-dialog-range',
            forceSelection  : true,
            editable        : false,
            fieldLabel      : cfg.rangeFieldLabel,
            name            : 'range',
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'value',
            store           : new Ext.data.Store({
                fields  : ['name', 'value'],
                data    : [
                    { name : cfg.completeViewText,  value : 'complete' },
                    { name : cfg.dateRangeText,     value : 'date' },
                    { name : cfg.currentViewText,   value : 'current' }
                ]
            }),
            listeners      : {
                change  : me.onRangeChange,
                scope   : me
            }
        });

        // col/row resizer
        me.resizePicker     = new Sch.widget.ResizePicker({
            dialogConfig    : cfg,
            margin          : '10 20'
        });

        me.resizerHolder    = new Ext.form.FieldContainer({
            fieldLabel          : cfg.scrollerDisabled ? cfg.adjustCols : cfg.adjustColsAndRows,
            labelAlign          : 'top',
            hidden              : true,
            labelSeparator      : '',
            beforeLabelTextTpl  : beforeLabelTextTpl,
            afterLabelTextTpl   : afterLabelTextTpl,
            layout              : 'vbox',
            defaults            : {
                flex        : 1,
                allowBlank  : false
            },
            items               : [me.resizePicker]
        });

        // from date
        me.dateFromField = new Ext.form.field.Date({
            fieldLabel  : cfg.dateRangeFromText,
            baseBodyCls : 'sch-exportdialogform-date',
            name        : 'dateFrom',
            format      : cfg.dateRangeFormat || Ext.Date.defaultFormat,
            allowBlank  : false,
            maxValue    : cfg.endDate,
            minValue    : cfg.startDate,
            value       : cfg.startDate
        });

        // till date
        me.dateToField = new Ext.form.field.Date({
            fieldLabel  : cfg.dateRangeToText,
            name        : 'dateTo',
            format      : cfg.dateRangeFormat || Ext.Date.defaultFormat,
            baseBodyCls : 'sch-exportdialogform-date',
            allowBlank  : false,
            maxValue    : cfg.endDate,
            minValue    : cfg.startDate,
            value       : cfg.endDate
        });

        // date fields holder
        me.datesHolder  = new Ext.form.FieldContainer({
            fieldLabel          : cfg.specifyDateRange,
            labelAlign          : 'top',
            hidden              : true,
            labelSeparator      : '',
            beforeLabelTextTpl  : beforeLabelTextTpl,
            afterLabelTextTpl   : afterLabelTextTpl,
            layout              : 'vbox',
            defaults            : {
                flex        : 1,
                allowBlank  : false
            },
            items               : [me.dateFromField, me.dateToField]
        });

        if (cfg.showColumnPicker) {
            me.columnPicker = new Sch.widget.ColumnPicker(Ext.apply({
                fieldLabel      : cfg.columnPickerLabel,
                cls             : 'sch-export-dialog-columns',
                columns         : cfg.scheduler.lockedGrid.query('gridcolumn')
            }, cfg.columnPickerConfig ));
        }

        if (cfg.showDPIField) {
            me.dpiField  = new Ext.form.field.Number(Ext.apply({
                fieldLabel      : cfg.dpiFieldLabel,
                cls             : 'sch-export-dialog-dpi',
                minValue        : 65,
                name            : 'DPI',
                value           : cfg.exportConfig.DPI,
                maxValue        : 200
            }, cfg.dpiFieldConfig ));
        }

        if (cfg.showHeaderField) {
            me.showHeaderField  = new Ext.form.field.Checkbox({
                fieldLabel      : me.dialogConfig.showHeaderLabel,
                cls             : 'sch-export-dialog-header',
                name            : 'showHeader',
                checked         : !!cfg.exportConfig.showHeader,
                checkedValue    : true,
                uncheckedValue  : false
            });
        }

        if (cfg.showFooterField) {
            me.showFooterField  = new Ext.form.field.Checkbox({
                fieldLabel      : me.dialogConfig.showFooterLabel,
                cls             : 'sch-export-dialog-footer',
                name            : 'showFooter',
                checked         : !!cfg.exportConfig.showFooter,
                checkedValue    : true,
                uncheckedValue  : false
            });
        }

        me.exportersField = new Ext.form.field.ComboBox({
            value           : cfg.defaultExporter,
            triggerAction   : 'all',
            cls             : 'sch-export-dialog-exporter',
            forceSelection  : true,
            editable        : false,
            fieldLabel      : cfg.exportersFieldLabel,
            name            : 'exporterId',
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'value',
            store           : {
                fields  : ['name' , 'value'],
                data    : Ext.Array.map(cfg.exporters, function(exporter) {
                    return {
                        name        : exporter.getName(),
                        value       : exporter.getExporterId()
                    };
                })
            },
            listeners      : {
                change  : me.onExporterChange,
                scope   : me
            }
        });

        me.formatField = new Ext.form.field.ComboBox({
            value          : cfg.exportConfig.format,
            triggerAction  : 'all',
            forceSelection : true,
            editable       : false,
            fieldLabel     : cfg.formatFieldLabel,
            name           : 'format',
            queryMode      : 'local',
            store          : cfg.pageFormats || ["A5", "A4", "A3", "Letter", "Legal"]
        });

        var orientationLandscapeCls = cfg.exportConfig.orientation === "portrait" ? 'class="sch-none"' : '',
            orientationPortraitCls = cfg.exportConfig.orientation === "landscape" ? 'class="sch-none"' : '';

        me.orientationField = new Ext.form.field.ComboBox({
            value          : cfg.exportConfig.orientation,
            triggerAction  : 'all',
            componentCls   : 'sch-exportdialogform-orientation',
            forceSelection : true,
            editable       : false,
            fieldLabel     : me.dialogConfig.orientationFieldLabel,
            afterSubTpl    : new Ext.XTemplate('<span id="sch-exportdialog-imagePortrait" ' + orientationPortraitCls +
                '></span><span id="sch-exportdialog-imageLandscape" ' + orientationLandscapeCls + '></span>'),
            name           : 'orientation',
            displayField   : 'name',
            valueField     : 'value',
            queryMode      : 'local',
            store          : new Ext.data.Store({
                fields : ['name', 'value'],
                data   : [
                    { name : cfg.orientationPortraitText, value : 'portrait' },
                    { name : cfg.orientationLandscapeText, value : 'landscape' }
                ]
            }),
            listeners      : {
                change : function (field, newValue) {
                    switch (newValue) {
                        case 'landscape':
                            Ext.fly('sch-exportdialog-imagePortrait').toggleCls('sch-none');
                            Ext.fly('sch-exportdialog-imageLandscape').toggleCls('sch-none');
                            break;
                        case 'portrait':
                            Ext.fly('sch-exportdialog-imagePortrait').toggleCls('sch-none');
                            Ext.fly('sch-exportdialog-imageLandscape').toggleCls('sch-none');
                            break;
                    }
                }
            }
        });

        items.push(me.rangeField);
        items.push(me.resizerHolder);
        items.push(me.datesHolder);
        items.push(me.exportersField);
        items.push(me.formatField);
        items.push(me.orientationField);

        if (cfg.showColumnPicker) {
            items.push(me.columnPicker);
        }

        if (cfg.showDPIField) {
            items.push(me.dpiField);
        }

        if (cfg.showHeaderField) {
            items.push(me.showHeaderField);
        }

        if (cfg.showFooterField) {
            items.push(me.showFooterField);
        }

        return items;
    },

    createProgressBar : function () {
        return this.progressBar = new Ext.ProgressBar({
            text    : this.config.progressBarText,
            animate : true,
            hidden  : true,
            margin  : '4px 0 10px 0'
        });
    },

    onRangeChange : function (field, newValue) {
        switch (newValue) {
            case 'complete':
                this.datesHolder.hide();
                this.resizerHolder.hide();
                break;
            case 'date':
                this.datesHolder.show();
                this.resizerHolder.hide();
                break;
            case 'current':
                this.datesHolder.hide();
                this.resizerHolder.show();
                this.resizePicker.expand(true);
                break;
        }
    },

    /**
     * @protected
     * This method is called after user selects an export mode in the corresponding field.
     * @param  {Ext.form.field.Field} field Reference to the form field
     * @param  {String} exporterId Selected exporter identifier
     */
    onExporterChange : function (field, exporterId) {

        switch (exporterId) {
            case  'singlepage':
                this.disableFields(true);
                break;
            default :
                this.disableFields(false);
        }

    },

    disableFields : function (value) {
        var me = this;

        if (me.showHeaderField) {
            me.showHeaderField.setDisabled(value);
        }

        me.formatField.setDisabled(value);
        me.orientationField.setDisabled(value);
    },


    showProgressBar : function () {
        if (this.progressBar) this.progressBar.show();
    },

    hideProgressBar : function () {
        if (this.progressBar) this.progressBar.hide();
    },

    updateProgressBar : function (value, text) {

        if (this.progressBar) {

            this.progressBar.updateProgress(value);

            if (text) {
                this.progressBar.updateText(text);
            }

        }
    }
});
