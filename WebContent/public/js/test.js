(window.onload = function() {
//	alert(this+"this");
	console.dir(this);

	var GanttChart = {};
	window.GanttChart = GanttChart;
	var divId = "test";
	//var delegateSymbolicName = this.getState().delegateSymbolicName;
	var startDate = new Date();
	var endDate = new Date();

	var ganttContainer ;
	
	

	
	
	if (divId) {
		ganttContainer = document.getElementById(divId);
	};

	
	
	
	
	
	
	Ext.setGlyphFontFamily('FontAwesome');
	
	
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
	console.dir(window.location);

	var restPath = "http://localhost:8081/" + 'java-gantt-demo/services';

	var localeId ="en";
	if (!localeId) {
		localeId = "en";
	}

	var localeClass = supportedLocales[localeId]
			&& supportedLocales[localeId][0];

	// by default let's use English locale
	if (!localeClass) {
		localeClass = 'En';
		localeId = 'en';
	}
//	Ext.tip.QuickTipManager.init();
	// now when we know the requested locale
	// we will require Ext to load gantt localization class
	Ext.require([ 'Gnt.locale.' + localeClass, 'MyApp.DemoGanttPanel' ,'Gnt.plugin.TaskEditor']);

	Ext.define('GanttTaskModel', {
		extend : 'Gnt.model.Task',

		// A field in the dataset that will be added as a CSS class to
		// each rendered task element
		clsField : 'Name',
		iconCls: 'TaskType',
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
		}, {
			name : 'calendarId',
			type : 'int',
			persist : true
		},{
			name : 'customAttribute',
			type : 'string'
		} ,        { name: 'PercentDone', type: 'number', defaultValue: 20 }],
	 customizableFields : [{ name : 'MyField' ,type:'string'}]
	});

	var calendarManager = Ext.create('Gnt.data.CalendarManager', {
		calendarClass : 'Gnt.data.calendar.BusinessTime'
	});

    var taskStore = Ext.create('Gnt.data.TaskStore', {
    	model : 'GanttTaskModel',
        autoLoad    : true,
        proxy       : {
            type    : 'memory',
            reader  : {
                type : 'json'
            },

            data    : [
                { 
                    "StartDate" : "2016-01-18",
                    "EndDate"   : "2016-02-02",
                    "Id"        : 1,
                    "Name"      : "Planning2",
                    "expanded"  : true,
//                    "leaf"      : true,
                    "iconCls":'TaskType',
//                    "leaf":true,
//                    "loaded":true,
//                    'expandable':true,
                    "cls":"folder",
                    "MyField":'customAttributeValue',
                    "children"  : [
                        { 
                            "StartDate" : "2010-01-18",
                            "EndDate"   : "2016-01-26",
                            "Id"        : 2,
//                            "leaf"      : true,
                            "Name22"      : "Investigate",
                            "parentId"  : 1
                        },
                        { 
                            "StartDate" : "2010-01-22",
                            "EndDate"   : "2016-01-25",
                            "Id"        : 3,
//                            "leaf"      : true,
                            "leaf":false,
                            "PercentDone": 40, 
                            "expanded":true,
                            "loaded":true,
                            "Name"      : "Investigate2",
                            "parentId"  : 1
                        },
                        { 
                            "StartDate" : "2010-01-28",
                            "EndDate"   : "2010-01-28",
                            "Id"        : 4,
                            "leaf"      : true,
                            "PercentDone": 50, 
                            
                            "Name"      : "Investigate3",
                            "parentId"  : 1
                        }
                    ]
                }
            ]
            // eof data
        }
        // eof proxy
    });
	

	Ext.tip.QuickTipManager.init();


	// var processError = function(crud, response, responseOptions) {
	// Ext.Msg.show({
	// title : 'Error',
	// msg : response.message,
	// icon : Ext.Msg.ERROR,
	// buttons : Ext.Msg.OK,
	// minWidth : Ext.Msg.minWidth
	// });
	// };
//
	var cm = new Gnt.data.CrudManager({
		autoLoad : true,
		taskStore : taskStore,
		transport : {
			load : {
				url : restPath + '/load',
				method : 'POST',
				params : {
					symbolicName : "com.polelink.app.TestManagement"
				}
			},
			sync : {
				url : restPath + '/sync',
				method : 'POST',
				params : {
					symbolicName : "com.polelink.app.TestManagement"
				}
			}
		}
	
,
	
	
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
        var packet=this.stores[3]['store']['data']['items'];
        var pack=new Array();
        for(var index in packet){
        	pack.push(packet[index]['data']);
        }
        console.log('pack');
        console.dir(pack);
//        var pack    = this.getChangeSetPackage();
       alert(JSON.stringify(pack)+"  pack");
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
//	console.dir(cm);
	this.buildGanttPanel = function() {
//		var ganttChart = Ext.create("MyApp.DemoGanttPanel", {
//
//			region : 'center',// 指定子面板所在区域为center
//			layout : 'fit',
//			// renderTo:domId,
//			// layout : 'fit',
//			allowParentTaskMove : true,
//			crudManager : cm,
//			region : 'center',
//			rowHeight : Ext.supports.Touch ? 43 : 28,
//			selModel : new Ext.selection.TreeModel({
//				ignoreRightMouseSelection : false,
//				mode : 'MULTI'
//			}),
//			taskStore : taskStore,
//
//			// we disable buffered rendering because of bug in ExtJS 5.1.0
//			bufferedRenderer : false,
//
//			// uncomment to enable showing exact drop position for the task
//			// dragDropConfig : { showExactDropPosition : true },
//			// resizeConfig : { showExactResizePosition : true },
//			// snapRelativeToEventStartDate : true,
//
//			// snapToIncrement : true, // Uncomment this line to get
//			// snapping behavior for resizing/dragging.
//			columnLines : false,
//
//			startDate : new Date(startDate),
//			endDate : new Date(endDate),
//
//			localeId : 'zh',
//			supportedLocales : supportedLocales,
//
//			viewPreset : 'weekAndDayLetter'
//		});
		var ganttChart = Ext.create("MyApp.DemoGanttPanel", {

			  region      : 'center',
		         reference   : 'gantt',
//		       
		         header      : Gnt.panel.Timeline ? null : { xtype : 'controlheader' },
//
//			crudManager : cm,
			
			taskStore : taskStore,
//
//		
//
			startDate : new Date(startDate),
			endDate : new Date(endDate)

		
		});
		
	   
		
		return ganttChart;
	};
	this.ganttChart = this.buildGanttPanel();
	
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
	var extendColumns = "EXTEND,ASDSA";
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
//	     header: {
//             titlePosition: 0,
//             items: [ 
//                 {
//                     xtype: 'splitbutton',
//
//                 }
//             ]
//         },
	 
		height : 800,
//		tools : [
//		                {
//		                    tooltip   : 'previousTimespan',
//		                    reference : 'shiftPrevious',
//		                    cls       : 'icon-previous'
//		                },
//		                {
//		                    tooltip   : 'nextTimespan',
//		                    reference : 'shiftNext',
//		                    cls       : 'icon-next'
//		                }],

//		width : '100%',
//		height :'100%',
		region:'center',//指定子面板所在区域为center
		layout : 'fit',
		items : ganttChart,
		renderTo : ganttId
	});

	   this.refesh=function(){
			  // console.dir(ganttChart.getView().lockedView);
//			   ganttChart.getView().doLayout();
//			   ganttChart.getView().lockedView.refresh();
//			   ganttChart.getView().destory();
//			   taskStore.load();
//			   alert('ss');
//			   document.getElementById(divId).innerHTML = "";
//			   onload();
		   var panelsWithinmyCt = Ext.ComponentQuery.query('toolbar');
		   
		   var header = Ext.ComponentQuery.query('header');
		   console.dir(header);
		   var objArray = Ext.ComponentQuery.query("MyApp.Toolbar");
		   
		   console.dir(panelsWithinmyCt);
		   
		   for(var index in header){
			   console.dir(panelsWithinmyCt[index]);
	if(header[index].isXType('primarytoolbar')){
		console.log('1');
		header[index].removeAll();
		
	}
			   
		   }
		   console.log('------');
		   
			   document.getElementById(ganttId).innerHTML = "";
			   ganttChart=buildGanttPanel();
			   
				extPanel = Ext.create('Ext.Panel', {
				// width : (ganttContainer.clientWidth-4),
				// height : (ganttContainer.clientHeight -4),
				height : 800,
				// width : '100%',
				// height :'100%',
				region : 'center',// 指定子面板所在区域为center
				layout : 'fit',
				items : ganttChart,
				renderTo : ganttId
			});
		   }
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
	
	ganttChart.getView().lockedView.refresh();
});

function ajx(){
var xhr=createXmlHttpRequest();

xhr.open("POST", "http://localhost:8080/rest/task/gantt/load", true);
xhr.send("gello ");
xhr.onreadystatechange=function()
{
if (xmlhttp.readyState==4 && xmlhttp.status==200)
  {
  document.getElementById("test").innerHTML=xmlhttp.responseText;
  }
}
	
	
}

function createXmlHttpRequest(){
	var xmlHttp;
	if(window.XMLHttpRequest){
		xmlHttp=new XMLHttpRequest();
	}else if(window.ActiveXObject){
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlHttp;
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16)
				.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4()
			+ s4() + s4();
}