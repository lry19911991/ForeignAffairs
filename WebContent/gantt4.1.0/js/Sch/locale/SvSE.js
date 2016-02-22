/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
// @tag alternative-locale
/**
 * Swedish translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.SvSE', {
    extend      : 'Sch.locale.Locale',
    singleton   : true,

    constructor : function (config) {

        Ext.apply(this, {
            l10n        : {
                'Sch.util.Date' : {
                    unitNames : {
                        YEAR        : { single : 'år',    plural : 'år',   abbrev : 'år' },
                        QUARTER     : { single : 'kvartal', plural : 'kvartal',abbrev : 'kv' },
                        MONTH       : { single : 'månad',   plural : 'månader',  abbrev : 'mån' },
                        WEEK        : { single : 'vecka',    plural : 'veckor',   abbrev : 'v' },
                        DAY         : { single : 'dag',     plural : 'dagar',    abbrev : 'd' },
                        HOUR        : { single : 'timme',    plural : 'timmar',   abbrev : 'tim' },
                        MINUTE      : { single : 'minut',  plural : 'minuter', abbrev : 'min' },
                        SECOND      : { single : 'sekund',  plural : 'sekunder', abbrev : 's' },
                        MILLI       : { single : 'ms',      plural : 'ms',      abbrev : 'ms' }
                    }
                },


                'Sch.panel.TimelineGridPanel' : {
                    weekStartDay : 1,
                    loadingText  : 'Laddar, vänligen vänta...',
                    savingText   : 'Sparar ändringar, vänligen vänta...'
                },

                'Sch.panel.TimelineTreePanel' : {
                    weekStartDay : 1,
                    loadingText  : 'Laddar, vänligen vänta...',
                    savingText   : 'Sparar ändringar, vänligen vänta...'
                },

                'Sch.mixin.SchedulerView' : {
                    loadingText : "Laddar schema..."
                },

                'Sch.plugin.CurrentTimeLine' : {
                    tooltipText : 'Aktuell tid'
                },

                'Sch.plugin.EventEditor' : {
                    saveText    : 'Spara',
                    deleteText  : 'Ta bort',
                    cancelText  : 'Avbryt'
                },

                'Sch.plugin.SimpleEditor' : {
                    newEventText    : 'Ny bokning...'
                },

                'Sch.widget.ExportDialog' : {
                    generalError                : 'Ett fel har uppstått, vänligen försök igen.',
                    title                       : 'Inställningar för export',
                    formatFieldLabel            : 'Pappersformat',
                    orientationFieldLabel       : 'Orientering',
                    rangeFieldLabel             : 'Intervall',
                    showHeaderLabel             : 'Visa sidnummer',
                    showFooterLabel             : 'Visa sidfot',
                    orientationPortraitText     : 'Stående',
                    orientationLandscapeText    : 'Liggande',
                    completeViewText            : 'Hela schemat',
                    currentViewText             : 'Aktuell vy',
                    dateRangeText               : 'Datumintervall',
                    dateRangeFromText           : 'Från',
                    dateRangeToText             : 'Till',
                    pickerText                  : 'Ställ in önskad rad och kolumn-storlek',
                    exportButtonText            : 'Exportera',
                    cancelButtonText            : 'Avbryt',
                    progressBarText             : 'Arbetar...',
                    adjustCols                  : 'Ställ in kolumnbredd',
                    adjustColsAndRows           : 'Ställ in radhöjd och kolumnbredd',
                    exportersFieldLabel         : 'Export-typ',
                    specifyDateRange            : 'Ställ in datumintervall',
                    columnPickerLabel           : 'Select columns for export',
                    dpiFieldLabel               : 'DPI (punkter per tum)'
                },

                'Sch.plugin.Export' : {
                    fetchingRows            : 'Hämtar rad {0} av {1}',
                    builtPage               : 'Byggt sida {0} av {1}',
                    requestingPrintServer   : 'Var god vänta...'
                },

                'Sch.plugin.Printable' : {
                    dialogTitle         : 'Utskriftsinställningar',
                    rangeFieldLabel     : 'Utskriftsområdet',
                    exportersFieldLabel : 'Styra sidbrytningarna',
                    exportButtonText    : 'Skriv ut'
                },

                'Sch.plugin.exporter.AbstractExporter' : {
                    name    : 'Exporter'
                },

                'Sch.plugin.exporter.SinglePage' : {
                    name    : 'En sida'
                },

                'Sch.plugin.exporter.MultiPageVertical' : {
                    name    : 'Flera sidor (lodrätt)'
                },

                'Sch.plugin.exporter.MultiPage' : {
                    name    : 'Flera sidor'
                },

                // -------------- View preset date formats/strings -------------------------------------
                'Sch.preset.Manager' : {
                    hourAndDay : {
                        displayDateFormat : 'G:i',
                        middleDateFormat : 'G:i',
                        topDateFormat : 'l d M Y'
                    },

                    secondAndMinute : {
                        displayDateFormat : 'G:i:s',
                        topDateFormat : 'D, d H:i'
                    },

                    dayAndWeek : {
                        displayDateFormat : 'Y-m-d G:i',
                        middleDateFormat : 'D d M'
                    },

                    weekAndDay : {
                        displayDateFormat : 'Y-m-d',
                        bottomDateFormat : 'D d',
                        middleDateFormat : 'd M Y'
                    },

                    weekAndMonth : {
                        displayDateFormat : 'Y-m-d',
                        middleDateFormat : 'm/d',
                        topDateFormat : 'Y-m-d'
                    },

                    monthAndYear : {
                        displayDateFormat : 'Y-m-d',
                        middleDateFormat : 'M Y',
                        topDateFormat : 'Y'
                    },

                    year : {
                        displayDateFormat : 'Y-m-d',
                        middleDateFormat : 'Y'
                    },

                    manyYears : {
                        displayDateFormat : 'Y-m-d',
                        middleDateFormat : 'Y'
                    }
                }
            }
        });

        this.callParent(arguments);
    }
});
