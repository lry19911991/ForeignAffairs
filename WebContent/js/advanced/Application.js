Ext.define('Gnt.examples.advanced.Application', {
    extend          : 'Ext.app.Application',

    mixins          : ['Gnt.mixin.Localizable'],

    requires        : [
        'Gnt.examples.advanced.locale.En',
        'Ext.window.MessageBox'
    ],

    paths           : {
        'Gnt'   : './js/Gnt',
        'Sch'   : './js/Sch'
    },

    stores          : [
        'Locales',
        'Calendars',
        'Tasks',
        'CrudManager'
    ],

    views           : [
        'MainViewport'
    ],

    routes          : {
        ':lc'   : {
            before  : 'onBeforeLocaleEstablished',
            action  : 'onLocaleEstablished'
        }
    },

    defaultToken    : 'en',

    listen          : {
        // Right now we just listen to locale-change on controllers domain, any controller fired that event might
        // initiate a locale change procedure
        controller : {
            '*' : {
                'locale-change' : 'onLocaleChange'
            }
        }
    },

    glyphFontFamily : 'FontAwesome',

    mainView        : null,

    currentLocale   : null,

    /**
     * Mapping for the startDate config of the gantt panel
     */
    startDate       : null,

    /**
     * Mapping for the endDate config of the gantt panel
     */
    endDate         : null,

    constructor : function (config) {
        var me = this;

        // Force the Application to instantiate stores in the exactly same order we put them into the "stores" config.
        // We need this since they have references to each other:
        // "Tasks" store requires "Calendars" to be created,
        // and "CrudManager" needs "Tasks" instance to be made
        Ext.Array.each(this.stores, function (store) {
            me.getStore(store);
        });

        this.callParent(arguments);
    },

    /**
     * Since CrudManager is not a real store
     * original getStore() method will be confused trying to retrieve it using StoreManager
     * so we keep reference to once created CrudManager instance and return it when requested
     */
    getStore : function (name) {
        // special treatment for CrudManager
        if (name == 'CrudManager') {
            // if it's not instantiated yet
            if (!this.crudManager) {
                // callParent will do this
                this.crudManager = this.callParent(arguments);

                // bind listeners to handle CRUD errors gracefully
                this.mon(this.crudManager, {
                    loadfail    : this.onCrudError,
                    syncfail    : this.onCrudError,
                    scope       : this
                });
            }

            return this.crudManager;
        }

        return this.callParent(arguments);
    },

    /**
     * This method will be called on CRUD manager exception and display a message box with error details.
     */
    onCrudError : function (crud, response, responseOptions) {
        Ext.Msg.show({
            title    : this.L('error'),
            msg      : response.message || this.L('requestError'),
            icon     : Ext.Msg.ERROR,
            buttons  : Ext.Msg.OK,
            minWidth : Ext.Msg.minWidth
        });
    },

    /**
     * When we've got a request to change locale we simply use redirectTo() for locale changing route handlers
     * fired, which in their turn know how to properly change locale.
     */
    onLocaleChange : function (lc, lcRecord) {
        this.redirectTo(lc);
    },

    /**
     * This method will be executed upon location has change and upon application startup with default token in case
     * location hash is empty. This method is called *before* corresponding route change action handler, and it's
     * cappable of stopping/resument the switch action, thus we use it to load locale required script files.
     */
    onBeforeLocaleEstablished : function (lc, action) {
        var me          = this,
            lcRecord    = me.getLocalesStore().getById(lc);

        switch (true) {
            case lcRecord && !me.mainView && me.currentLocale != lc:

                Ext.Loader.loadScript({
                    // load Ext JS locale for the chosen language
                    url     : 'http://bryntum.com/examples/extjs-6.0.0/build/classic/locale/locale-' + lc + '.js',
                    onLoad  : function() {
                        var cls = lcRecord.get('cls');
                        // load the gantt locale for the chosen language
                        Ext.require('Gnt.examples.advanced.locale.' + cls, function () {
                            // apply the chosen locale
                            Gnt.examples.advanced.locale[cls].apply();

                            // Some of Ext JS localization wrapped with Ext.onReady(...)
                            // so we have to do the same to instantiate UI after Ext JS localization is applied
                            Ext.onReady(function() { action.resume(); });
                        });
                    }
                });

                break;

            case lcRecord && !me.mainView && me.currentLocale == lc:

                action.resume();
                break;

            case lcRecord && me.mainView && true:

                // Main view is already created thus we have to execute hard reload otherwise locale related
                // scripts won't be properly applied.
                me.deactivate();
                action.stop();
                window.location.hash = '#' + lc;
                window.location.reload(true);
                break;

            default:
                action.stop();
        }
    },

    /**
     * Since we are supporting such locale management we can't use application's autoCreateViewport option, since
     * we have to load all required locale JS files before any GUI creation. Loading is done in the 'before' handler,
     * so here in 'action' handler we are ready to create our main view.
     */
    onLocaleEstablished : function (lc) {
        var me      = this,
            crud    = me.getCrudManagerStore();

        me.currentLocale    = lc;

        me.mainView         = me.getMainViewportView().create({
            viewModel       : {
                type        : 'advanced-viewport',
                data        : {
                    crud                : crud,
                    taskStore           : crud.getTaskStore(),
                    calendarManager     : crud.getCalendarManager(),
                    currentLocale       : me.currentLocale,
                    availableLocales    : me.getLocalesStore()
                }
            },
            crudManager     : crud,
            startDate       : this.startDate,
            endDate         : this.endDate
        });
    }
});
