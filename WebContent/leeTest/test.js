	Ext.onReady(function() {
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
			} ],
		 customizableFields : [{ name : 'MyField' ,type:'string'}]
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
	                    "StartDate" : "2010-01-18",
	                    "EndDate"   : "2010-02-02",
	                    "Id"        : 1,
	                    "Name"      : "Planning",
	                    "expanded"  : true,
//	                    "leaf"      : true,
	                    "iconCls":'TaskType',
//	                    "leaf":true,
//	                    "loaded":true,
//	                    'expandable':true,
	                    "cls":"folder",
	                    "MyField":'customAttributeValue',
	                    "children"  : [
	                        { 
	                            "StartDate" : "2010-01-18",
	                            "EndDate"   : "2010-01-26",
	                            "Id"        : 2,
//	                            "leaf"      : true,
	                    
	                            "Name22"      : "Investigate",
	                            "parentId"  : 1
	                        },
	                        { 
	                            "StartDate" : "2010-01-22",
	                            "EndDate"   : "2010-01-25",
	                            "Id"        : 3,
//	                            "leaf"      : true,
	                            "leaf":false,
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
	
	var ganttChart = Ext.create("Gnt.examples.advanced.view.Gantt", {

		region : 'center',// 指定子面板所在区域为center
		layout : 'fit',
		// renderTo:domId,
		// layout : 'fit',
		allowParentTaskMove : true,
	//	crudManager : cm,
		region : 'center',
		rowHeight : Ext.supports.Touch ? 43 : 28,
		selModel : new Ext.selection.TreeModel({
			ignoreRightMouseSelection : false,
			mode : 'MULTI'
		}),
		taskStore : taskStore,

		// we disable buffered rendering because of bug in ExtJS 5.1.0
		bufferedRenderer : true,

		// uncomment to enable showing exact drop position for the task
		// dragDropConfig : { showExactDropPosition : true },
		// resizeConfig : { showExactResizePosition : true },
		// snapRelativeToEventStartDate : true,

		// snapToIncrement : true, // Uncomment this line to get
		// snapping behavior for resizing/dragging.
		columnLines : false,

		startDate : new Date(),
		endDate : new Date(),

		localeId : 'zh',
		//supportedLocales : supportedLocales,

		viewPreset : 'weekAndDayLetter',
			renderTo:'test'
	});
	
	
	
	
});