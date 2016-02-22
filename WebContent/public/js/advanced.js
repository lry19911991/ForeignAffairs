window.com_polelink_utils_vaadin_gantt_GanttChart = function() {

	var GanttChart = {};
	window.GanttChart = GanttChart;
	var divId = this.getState().divId;
	var delegateSymbolicName = this.getState().delegateSymbolicName;
	var startDate = this.getState().startDate;
	var endDate = this.getState().endDate;

	var ganttContainer = this.getElement();
	
	
	
	
	
	if (divId != 'undefined' && divId != null && divId != '') {
		ganttContainer = document.getElementById(divId);
	};

	
	
	
	
	
	

	
	
	var ganttId = guid();
	var ganttElement = document.createElement('div');
	ganttElement.setAttribute('id', ganttId);
	ganttElement.setAttribute('display', '');
	// ganttElement.setAttribute('style', 'height:100%;overflow:auto;');
	ganttElement.setAttribute('style', 'height:100%;');
	ganttContainer.appendChild(ganttElement);

	
	
	Ext.Loader.setConfig({
		enabled : true,
		disableCaching : true,
		paths : {
			'Gnt' : 'Gnt',
			'Sch' : 'Sch'
		}
	});

	var supportedLocales = {
		en : [ 'En', 'English' ],
		zh : [ 'Zh', 'Chinese' ]
	};

	// get requested locale from URL hash
	var winUrl = window.location;
	var location = (winUrl + '').split('/');
	var contextName = location[3];
	var basePath = location[0] + '//' + location[2] + '/';
	var restPath = basePath + 'gantt/crud';

	var localeId = this.getState().localeId;
	if (localeId == undefined || localeId == "" || localeId == null) {
		localeId = "en";
	}

	var localeClass = supportedLocales[localeId]
			&& supportedLocales[localeId][0];

	// by default let's use English locale
	if (!localeClass) {
		localeClass = 'En';
		localeId = 'en';
	}

	// now when we know the requested locale
	// we will require Ext to load gantt localization class
	Ext.require([ 'Gnt.locale.' + localeClass, 'GanttApp.GanttPanel' ,'Gnt.plugin.TaskEditor']);

	Ext.define('GanttTaskModel', {
		extend : 'Gnt.model.Task',

		// A field in the dataset that will be added as a CSS class to
		// each rendered task element
		clsField : 'TaskType',
		fields : [ {
			name : 'TaskType',
			type : 'string'
		}, {
			name : 'Color',
			type : 'string'
		}, {
			name : 'index',
			type : 'int',
			persist : true
		}, {
			name : 'expanded',
			type : 'bool',
			persist : true
		}, {
			name : 'Deadline',
			type : 'date',
			dateFormat : 'Y-m-d'
		} ],
	 customizableFields : [{ name : 'MyField' ,type:'string'}]
	});

	var calendarManager = Ext.create('Gnt.data.CalendarManager', {
		calendarClass : 'Gnt.data.calendar.BusinessTime'
	});

	var taskStore = Ext.create("Gnt.data.TaskStore", {
		model : 'GanttTaskModel',
		calendarManager : calendarManager,

		rootVisible : false,
		proxy : 'memory',

		cascadeChanges : true,
		recalculateParents : true,
		moveParentAsGroup : true
	});
	


	// var processError = function(crud, response, responseOptions) {
	// Ext.Msg.show({
	// title : 'Error',
	// msg : response.message,
	// icon : Ext.Msg.ERROR,
	// buttons : Ext.Msg.OK,
	// minWidth : Ext.Msg.minWidth
	// });
	// };

	var cm = new Gnt.data.CrudManager({
		autoLoad : true,
		taskStore : taskStore,
		transport : {
			load : {
				url : restPath + '/load',
				method : 'POST',
				params : {
					symbolicName : delegateSymbolicName
				}
			},
			sync : {
				url : restPath + '/sync',
				method : 'POST',
				params : {
					symbolicName : delegateSymbolicName
				}
			}
		},
	
	
    pikeSync : function (callback, errback, scope) {
        if (this.activeRequests.sync) {
            // let's delay this call and start it only after server response
            this.delayedSyncs.push(arguments);

            /**
             * @event syncdelayed
             * Fires after {@link #sync sync request} was delayed due to incomplete previous one.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} arguments The arguments of {@link #sync} call.
             */
            this.fireEvent('syncdelayed', this, arguments);

            return;
        }

        // get current changes set package
        var pack=this.stores[3]['store']['data']['items'];
//        var pack    = this.getChangeSetPackage();

        scope       = scope || this;

        // if no data to persist we run callback and exit
        if (!pack) {
            if (callback) callback.call(scope, null, null);

            return;
        }

        /**
         * @event beforesync
         * Fires before {@link #sync sync request} is sent. Return `false` to cancel sync request.

        crudManager.on('beforesync', function() {
            // cannot persist changes before at least one record is added
            // to the `someStore` store
            if (!someStore.getCount()) return false;
        });

         * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
         * @param {Object} request The request object.
         */
        if (this.fireEvent('beforesync', this, pack) === false) {
            // if this sync was canceled let's fire event about it
            /**
             * @event synccanceled
             * Fires after {@link #sync sync request} was canceled by some {@link #beforesync} listener.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} request The request object.
             */
            this.fireEvent('synccanceled', this, pack);

            return;
        }

        // keep active reaqest Id
        this.activeRequests.sync = { id : pack.requestId };

        // send sync package
        this.activeRequests.sync.desc = this.sendRequest({
            data        : this.encode(pack),
            type        : 'sync',
            success     : function (rawResponse, options) {
                var response    = this.onSync(rawResponse, options);
                var request     = this.activeRequests.sync;

                // reset last requested package descriptor
                this.activeRequests.sync = null;

                if (errback && (!response || !response.success)) {
                    errback.call(scope, response, rawResponse, request);

                } else if (callback) {
                    callback.call(scope, response, rawResponse, request);
                }

                // execute delayed sync() call
                this.runDelayedSync();
            },
            failure     :  function (rawResponse, options) {
                this.onSync(rawResponse, options);

                if (errback) errback.apply(scope, arguments);

                // reset last requested package ID
                this.activeRequests.sync = null;

                // execute delayed sync() call
                this.runDelayedSync();
            },
            scope       : this
        });
    }
	});

	var ganttChart = Ext.create("GanttApp.GanttPanel", {
		
		region:'center',//指定子面板所在区域为center
		layout : 'fit',
		// renderTo:domId,
		// layout : 'fit',
		allowParentTaskMove : true,
		crudManager : cm,
		region : 'center',
		rowHeight : Ext.supports.Touch ? 43 : 28,
		selModel : new Ext.selection.TreeModel({
			ignoreRightMouseSelection : false,
			mode : 'MULTI'
		}),
		taskStore : taskStore,

		// we disable buffered rendering because of bug in ExtJS 5.1.0
		bufferedRenderer : false,

		// uncomment to enable showing exact drop position for the task
		// dragDropConfig : { showExactDropPosition : true },
		// resizeConfig : { showExactResizePosition : true },
		// snapRelativeToEventStartDate : true,

		// snapToIncrement : true, // Uncomment this line to get
		// snapping behavior for resizing/dragging.
		columnLines : false,

		startDate : new Date(startDate),
		endDate : new Date(endDate),

		localeId : 'zh',
		supportedLocales : supportedLocales,

		viewPreset : 'weekAndDayLetter'
	});
	
//	 Ext.create('Gnt.widget.taskeditor.TaskEditor', {
//	        assignmentStore : assignmentStore,
//	        resourceStore : resourceStore,
//	        l10n : {
//	            // rename tab
//	            resourcesText : 'Assignments'
//	        },
//	        // here is grid the config
//	        assignmentGridConfig : {
//	            // disable in-place resources adding
//	            addResources : false
//	        }
//	    });
	var extendColumns = this.getState().extendColumns;
	var extendColumnArray = null;
	if (extendColumns != null) {
		extendColumnArray = extendColumns.split(',');
		if (extendColumnArray != null) {
			for (i = 0; i < extendColumnArray.length; i++) {
				var columnStr = extendColumnArray[i];
				var columnArray = columnStr.split(':');
				if (columnArray != null && columnArray.length == 2) {
					var columnText = columnArray[0];
					var columnName = columnArray[1];
					var extendColumn = Ext.create('Ext.tree.Column');
					extendColumn.text = columnText;
					extendColumn.tooltip = columnText;
					extendColumn.dataIndex = columnName;
					extendColumn.sortable = true;
					extendColumn.hideable = true;
					extendColumn.width = 200;
					extendColumn.renderer = function(value, metaData, record) {
						if (!record.data.leaf)
							metaData.tdCls = 'sch-gantt-domIdparent-cell';
						return value;
					};
					// ganttChart.columns.push(extendColumn);
					ganttChart.lockedGrid.headerCt.insert(extendColumn);
				}
			}
			ganttChart.getView().lockedView.refresh();
		}
	}

	ganttChart
			.on({
				dependencydblclick : function(ga, rec) {
					var from = taskStore.getNodeById(rec.get('From')).get(
							'Name'), to = taskStore.getNodeById(rec.get('To'))
							.get('Name');

					Ext.Msg.alert('Hey', Ext.String.format(
							'You clicked the link between "{0}" and "{1}"',
							from, to));
				},
				timeheaderdblclick : function(col, start, end) {
					Ext.Msg.alert('Hey', 'You clicked header cell : '
							+ Ext.Date.format(start, 'Y-m-d') + ' - '
							+ Ext.Date.format(end, 'Y-m-d'));
				}
			});

//	 var customForm = new Gnt.widget.taskeditor.TaskForm({
//	     title : 'Custom form panel',
//	     xtype : 'taskform',
//	     items : [
//	         {
//	             fieldLabel  : 'Foo field',
//	             // foo - is the name of custom task field
//	             name        : 'foo',
//	             allowBlank  : false
//	         }
//	     ],
//	     taskStore   : taskStore
//	 });
//
//	 var taskEditor = Ext.create('Gnt.plugin.TaskEditor', {
//	     // register custom form as an additional tab
//	     items       : customForm,
//	     listeners   : {
//	         afterupdatetask : function (taskeditor) {
//	             // update form fields to loaded task
//	             customForm.updateRecord();
//	         }
//	     }
//	 });
	
	var extPanel = Ext.create('Ext.Panel', {
//		width : (ganttContainer.clientWidth-4),
//		height : (ganttContainer.clientHeight -4),
		height : 800,
//		width : '100%',
//		height :'100%',
		region:'center',//指定子面板所在区域为center
		layout : 'fit',
		items : ganttChart,
		renderTo : ganttId
	});


//	window.onresize=function(){  
//		extPanel.width = (ganttContainer.clientWidth-4);
//		extPanel.height = (ganttContainer.clientHeight -4);
//		extPanel.doLayout();  
//    } 

	// Listen for state changes
	this.onStateChange = function() {
		divId = this.getState().divId;
		startDate = this.getState().startDate;
		endDate = this.getState().endDate;
		localeId = this.getState().localeId;
		extendColumns = this.getState().extendColumns;
	};
	
	
	
	this.buttonVisible = function(buttonName , buttonVisible){
		var equal = (buttonVisible == 'true');
		Ext.getCmp(buttonName).setVisible(equal);
		ganttChart.getView().lockedView.refresh();
	};
	
	
	this.buttonEnable = function(buttonName , buttonEnable){
		var equal = (buttonEnable == 'true');
		if(equal){
			Ext.getCmp(buttonName).enable();
		}else{
			Ext.getCmp(buttonName).disable();
		}
		ganttChart.getView().lockedView.refresh();
	}
	
	
//	function setButtonVisible(){
//		console.log(" call function success");
//	}
}




function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16)
				.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4()
			+ s4() + s4();
}