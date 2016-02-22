/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
 @class Sch.widget.ExportDialog
 @private
 @extends Ext.window.Window

 Widget for export options.

 */
Ext.define('Sch.widget.ExportDialog', {
    alternateClassName  : 'Sch.widget.PdfExportDialog',
    extend              : 'Ext.window.Window',
    requires            : ['Sch.widget.ExportDialogForm'],
    mixins              : ['Sch.mixin.Localizable'],
    alias               : "widget.exportdialog",

    //Panel settings. Overridable with {@link Sch.plugin.Export#cfg-exportDialogConfig}
    modal               : false,
    width               : 350,
    cls                 : 'sch-exportdialog',
    frame               : false,
    layout              : 'fit',
    draggable           : true,
    padding             : 0,
    myConfig            : null,

    //Private
    plugin              : null,
    pluginListeners     : null,

    /**
     * @cfg {Ext.Component} buttonsPanel Component with buttons controlling export.
     */
    buttonsPanel        : null,

    /**
     * @cfg {Object} buttonsPanelScope
     * The scope for the {@link #buttonsPanel}
     */
    buttonsPanelScope   : null,

    /**
     * @cfg {Ext.Component} progressBar Progress bar component.
     */
    progressBar         : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - generalError                : 'An error occured, try again.',
            - title                       : 'Export Settings',
            - formatFieldLabel            : 'Paper format',
            - orientationFieldLabel       : 'Orientation',
            - rangeFieldLabel             : 'Export range',
            - columnPickerLabel           : 'Select columns for export',
            - showHeaderLabel             : 'Add page number',
            - showFooterLabel             : 'Add footer',
            - orientationPortraitText     : 'Portrait',
            - orientationLandscapeText    : 'Landscape',
            - completeViewText            : 'Complete schedule',
            - currentViewText             : 'Current view',
            - dateRangeText               : 'Date range',
            - dateRangeFromText           : 'Export from',
            - pickerText                  : 'Resize column/rows to desired value',
            - dateRangeToText             : 'Export to',
            - exportButtonText            : 'Export',
            - cancelButtonText            : 'Cancel',
            - progressBarText             : 'Exporting...',
            - exportToSingleLabel         : 'Export as single page'
     */

    /**
     * @cfg {String} dateRangeFormat Valid date format to be used by the date ranges fields.
     */
    dateRangeFormat : '',

    /**
     * @cfg {Boolean} showHeaderField Indicates if showHeaderField is visible in the exportdialog.
     */
    showHeaderField : true,

    /**
     * @cfg {Boolean} showFooterField Indicates if showFooterField is visible in the exportdialog.
     */
    showFooterField : false,

    /**
     * @cfg {Boolean} showColumnPicker Indicates if columnpicker is visible in the exportdialog.
     */
    showColumnPicker : false,

    /**
     * @cfg {Object} columnPickerConfig Configuration for the columnPicker
     */
    columnPickerConfig : null,

    /**
     * @cfg {Boolean} showDPIField Indicates if the DPI (dots per inch) input field is visible in the exportdialog.
     */
    showDPIField : false,

    /**
     * @cfg {Object} dpiFieldConfig Configuration for the dpiField
     */
    dpiFieldConfig : null,

    constructor : function (config) {
        Ext.apply(this, config.exportDialogConfig);

        this.plugin = config.plugin;

        this.title = this.title || this.L('title');

        //store fields texts in the config object for further use by form
        this.myConfig = Ext.apply({
            progressBarText             : this.L('progressBarText'),
            dateRangeToText             : this.L('dateRangeToText'),
            pickerText                  : this.L('pickerText'),
            dateRangeFromText           : this.L('dateRangeFromText'),
            dateRangeText               : this.L('dateRangeText'),
            currentViewText             : this.L('currentViewText'),
            formatFieldLabel            : this.L('formatFieldLabel'),
            orientationFieldLabel       : this.L('orientationFieldLabel'),
            rangeFieldLabel             : this.L('rangeFieldLabel'),
            showHeaderLabel             : this.L('showHeaderLabel'),
            showFooterLabel             : this.L('showFooterLabel'),
            exportersFieldLabel         : this.L('exportersFieldLabel'),
            orientationPortraitText     : this.L('orientationPortraitText'),
            orientationLandscapeText    : this.L('orientationLandscapeText'),
            completeViewText            : this.L('completeViewText'),
            adjustCols                  : this.L('adjustCols'),
            adjustColsAndRows           : this.L('adjustColsAndRows'),
            specifyDateRange            : this.L('specifyDateRange'),
            columnPickerLabel           : this.L('columnPickerLabel'),
            dpiFieldLabel               : this.L('dpiFieldLabel'),
            dateRangeFormat             : this.dateRangeFormat,
            exportConfig                : this.exportConfig,
            showColumnPicker            : this.showColumnPicker,
            columnPickerConfig          : this.columnPickerConfig,
            showHeaderField             : this.showHeaderField,
            showFooterField             : this.showFooterField,
            pageFormats                 : this.getPageFormats(),
            scheduler                   : this.plugin && this.plugin.scheduler
        }, config.exportDialogConfig);

        this.callParent(arguments);
    },

    getPageFormats : function () {
        var pageSizes   = this.plugin.pageSizes,
            sizes       = [];

        Ext.Object.each(pageSizes, function (key, value) {
            sizes.push({
                width   : value.width,
                height  : value.height,
                name    : key
            });
        });

        // let's sort page sizes by width and return array of names
        return Ext.Array.map(sizes.sort(function (a, b) { return a.width - b.width; }), function (size) {
            return size.name;
        });
    },

    initComponent : function () {
        var me          = this,
            listeners   = {
                hidedialogwindow    : me.destroy,
                showdialogerror     : me.showError,
                exportstart         : me.onExportStart,
                afterexport         : me.onExportEnd,

                updateprogressbar   : function (value, text) {

                    if (arguments.length == 2) {
                        me.fireEvent('updateprogressbar', value, undefined);
                    }
                    else {
                        me.fireEvent('updateprogressbar', value, text);
                    }

                },
                destroyable         : true,
                scope               : me
            };

        me.form         = me.buildForm(me.myConfig);

        Ext.apply(this, {
            items : me.form,
            fbar  : me.buildButtons(me.buttonsPanelScope || me)
        });

        me.callParent(arguments);

        me.pluginListeners = me.plugin.on(listeners);
    },

    afterRender : function () {
        var me = this;

        me.relayEvents(me.form.resizePicker, ['change', 'changecomplete', 'select']);

        me.form.relayEvents(me, ['updateprogressbar', 'hideprogressbar', 'showprogressbar']);

        me.callParent(arguments);
    },

    /**
     * Create Dialog's buttons.
     *
     * @param {Object} buttonsScope Scope for the buttons.
     * @return {Object} buttons Object containing buttons for Exporting/Cancelling export.
     */
    buildButtons : function (buttonsScope) {
        var me = this;

        return [
            {
                xtype   : 'button',
                scale   : 'medium',
                itemId  : 'export',
                text    : this.L('exportButtonText'),
                handler : function () {
                    if (this.form.isValid()) {
                        this.fireEvent('showprogressbar');

                        var config          = this.form.getValues();
                        //exporter combo returns a exporterId
                        config.exporterId   = config.exporterId;

                        // convert strings to dates before passing date range to doExport method
                        var dateFormat      = this.dateRangeFormat || Ext.Date.defaultFormat;

                        if (config.dateFrom && !Ext.isDate(config.dateFrom)) {
                            config.dateFrom = Ext.Date.parse(config.dateFrom, dateFormat);
                        }

                        if (config.dateTo && !Ext.isDate(config.dateTo)) {
                            config.dateTo   = Ext.Date.parse(config.dateTo, dateFormat);
                        }

                        this.plugin.doExport(config);
                    }
                },
                scope   : buttonsScope
            },
            {
                xtype   : 'button',
                scale   : 'medium',
                itemId  : 'cancel',
                text    : this.L('cancelButtonText'),
                handler : function () {
                    this.destroy();
                },
                scope   : buttonsScope
            }
        ];
    },

    /**
     * Build the {@link Sch.widget.ExportDialogForm} for the dialog window.
     *
     * @param {Object} config Config object for the form, containing field names and values.
     * @return {Sch.widget.ExportDialogForm} form
     */
    buildForm : function (config) {
        return new Sch.widget.ExportDialogForm({
            progressBar  : this.progressBar,
            dialogConfig : config
        });
    },

    /**
     * @private
     * Displays error message in the dialog. When it's called, both form and buttons are hidden.
     * @param {Sch.widget.ExportDialog} dialog Dialog window or null
     * @param {String} error (optional) Text of the message that will be displayed in the dialog. If not provided, {@link #generalError}
     * will be used.
     */
    showError : function (dialog, error) {
        var me = dialog,
            text = error || me.L('generalError');

        me.fireEvent('hideprogressbar');
        Ext.Msg.alert('', text);
    },

    onExportStart : function() {
        var btn = this.down('#export');

        btn && btn.disable();
    },

    onExportEnd : function() {
        var btn = this.down('#export');

        btn && btn.enable();
    },

    destroy : function() {
        // After this we're not interested in any progress events or such
        this.pluginListeners.destroy();

        this.callParent(arguments);
    }
});
