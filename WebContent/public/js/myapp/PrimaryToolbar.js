Ext
		.define(
				"MyApp.PrimaryToolbar",
				{
					extend : "Ext.panel.Header",
					//cls : 'primary-toolbar',
					alias : 'widget.primarytoolbar',

					gantt : null,
					config : {
						primaryToolBarSaveFunctionName : undefined
					},

					initComponent : function() {

						var that = this;
						var gantt = this.gantt;

						var taskStore = gantt.taskStore || gantt.crudManager
								&& gantt.crudManager.getTaskStore();

//						taskStore
//								.on({
//									'filter-set' : function() {
//										this
//												.down(
//														'[iconCls*=icon-collapseall]')
//												.disable();
//										this.down('[iconCls*=icon-expandall]')
//												.disable();
//									},
//									'filter-clear' : function() {
//										this
//												.down(
//														'[iconCls*=icon-collapseall]')
//												.enable();
//										this.down('[iconCls*=icon-expandall]')
//												.enable();
//									},
//									scope : this
//								});

						var items = [
								{
									id : 'previousTimespan',
									tooltip : 'Previous timespan',
									cls : 'icon-previous',
									handler : function() {
										gantt.shiftPrevious();
									}
								},
								{
									id : 'nextTimespan',
									tooltip : 'Next timespan',
									 cls       : 'icon-next',
									handler : function() {
										gantt.shiftNext();
									}
								},
								{
									id : 'collapseAll',
									tooltip : 'Collapse all',
									 cls       : 'icon-collapse-all',
									handler : function() {
//										this.disabled=!this.disabled;
										gantt.collapseAll();
									}
								},
								{
									id : 'expandAll',
									tooltip : 'Expand all',
									 cls       : 'icon-expand-all',
									 //disabled  : true,
									handler : function() {
//										this.disabled=!this.disabled;
										gantt.expandAll();
									}
								},
								{
									id : 'zoomOut',
									tooltip : 'Zoom out',
									  cls       : 'icon-zoom-out',
									handler : function() {
										gantt.zoomOut();
									}
								},
								{
									id : 'zoomIn',
									tooltip : 'Zoom in',
									 cls       : 'icon-zoom-in',
									handler : function() {
										gantt.zoomIn();
									}
								},
								{
									id : 'zoomToFit',
									tooltip : 'Zoom to fit',
									cls       : 'icon-zoom-to-fit',
									handler : function() {
										gantt.zoomToFit(null, {
											leftMargin : 100,
											rightMargin : 100
										});
									}
								},
								{
									id : 'viewFullScreen',
									tooltip : 'View full screen',
									 cls       : 'icon-fullscreen',
									disabled : !this._fullScreenFn,
									handler : function() {
										this.showFullScreen();
									},
									scope : this
								},
								{
									id : 'highlightCriticalPath',
									tooltip : 'Highlight critical path',
									cls       : 'icon-critical-path',
									enableToggle : true,
									pressed:false,
									handler : function(btn) {
										var v = gantt.getSchedulingView();
										this.pressed=!this.pressed;
									        if (this.pressed) {
									            v.highlightCriticalPaths(true);
									        } else {
									            v.unhighlightCriticalPaths(true);
									        }
									}
								},
								{
									id : 'addNewTask',
									tooltip : 'Add new task',
									 cls       : 'icon-add-task',
									 disabled : true,
									handler : function(btn) {

										eval(that
												.getPrimaryToolBarSaveFunctionName()
												+ '()');
										// var task =
										// gantt.taskStore.getRootNode().appendChild({
										// Name : 'New Task',
										// leaf : true
										// });
										// gantt.getSchedulingView().scrollEventIntoView(task);
										// gantt.editingInterface.startEdit(task,
										// 1);
									}
								},
								{
									id : 'removeSelectedTask',
									tooltip : 'Remove selected task(s)',
									 cls       : 'icon-remove-task',
									 disabled : true,
									handler : function(btn) {
									    var tasks = [];

							            var selected = gantt.getSelectionModel().getSelected();

							            if (selected instanceof Ext.grid.selection.Rows) {
							                tasks = selected.getRecords();
							            } else if (selected instanceof Ext.grid.selection.Cells) {
							                selected.eachRow(function (record) {
							                    tasks.push(record);
							                });
							            }
							            gantt.getTaskStore().removeTasks(tasks);
									}
								},
								{
									id : 'indent',
									tooltip : 'Indent',
									cls       : 'icon-indent',
									disabled : true,
									handler : function(btn) {
										this.disabled=true;
									    var tasks = [];

								            var selected = gantt.getSelectionModel().getSelected();

								            if (selected instanceof Ext.grid.selection.Rows) {
								                tasks = selected.getRecords();
								            } else if (selected instanceof Ext.grid.selection.Cells) {
								                selected.eachRow(function (record) {
								                    tasks.push(record);
								                });
								            }
										gantt.taskStore.indent([].concat(tasks));
									}
								},
								{
									id : 'outdent',
									tooltip : 'Outdent',
									 cls       : 'icon-outdent',
									 disabled : true,
									handler : function(btn) {
										
									    var tasks = [];

							            var selected = gantt.getSelectionModel().getSelected();

							            if (selected instanceof Ext.grid.selection.Rows) {
							                tasks = selected.getRecords();
							            } else if (selected instanceof Ext.grid.selection.Cells) {
							                selected.eachRow(function (record) {
							                    tasks.push(record);
							                });
							            }
									gantt.taskStore.outdent([].concat(tasks));
									}
								} ];
						if (gantt.taskStore && gantt.taskStore.calendarManager) {
							items
									.push({
										id : 'manageCalendars',
										tooltip : 'Manage calendars',
										 cls       : 'icon-calendar',
										scope : this,
										handler : function(btn) {
											var editorWindow = new Gnt.widget.calendar.CalendarManagerWindow(
													{
														title : 'Manage Calendars',
														height : 550,
														constrain : true,
														calendarManager : gantt.taskStore.calendarManager
													});
											editorWindow.show();
											editorWindow.alignTo(btn);
										}
									});
						}

						if (gantt.crudManager) {
							items.push({
								id : 'saveChanges',
								tooltip : 'Save changes',
								 cls       : 'icon-save',
								itemId : 'save-button',
								handler : function() {
									gantt.crudManager.sync();
								}
							});
						}

						items.push(
						// {
						// xtype : 'combo',
						// store : new Ext.data.ArrayStore({
						// fields : ['code', 'language'],
						// data : (function () {
						// var result = [];
						//
						// Ext.Object.each(gantt.supportedLocales, function (id,
						// info) {
						// result.push([ id, info[1] ]);
						// });
						//
						// return result;
						// })()
						// }),
						// displayField : 'language',
						// valueField : 'code',
						// mode : 'local',
						// triggerAction : 'all',
						// emptyText : 'Select a language...',
						// selectOnFocus : true,
						// value : gantt.localeId || '',
						// listeners : {
						// select : function (f, record) {
						// window.location.hash = '#' + record[0].get('code');
						// window.location.reload(true);
						// }
						// }
						// },
				           {
							id : 'export',
							cls       : 'icon-settings',
			                scale   : 'large',
			                tooltip    : 'Export to PNG',
			                handler : function () {
			                	gantt.exportPlugin.setFileFormat('png');
			                    var el = Ext.dom.Element.query('.x-scroll-scroller > .sch-dependencyview-ct')[0]; el && el.remove();
			                    gantt.showExportDialog();
			                }
			            },
						{
			            	tooltip : 'Try more features...',
							cls       : 'icon-settings',
							handler : function() {
								this.fireEvent('togglesecondary', this);
							},
							scope : this
						});
                         
						Ext.apply(this, {


							tools : items
						});

						this.callParent(arguments);
					},

					applyPercentDone : function(value) {
						this.gantt.getSelectionModel().selected.each(function(
								task) {
							task.setPercentDone(value);
						});
					},
//					showExportDialog : function() {
//						this.gantt.showExportDialog();
//					},
					showFullScreen : function() {
						this.gantt.el.down('.x-panel-body').dom[this._fullScreenFn]
								(Element.ALLOW_KEYBOARD_INPUT);
					},
					setIndent : function(disabled) {
						Ext.ComponentQuery.query('#indent')[0].setDisabled(disabled);
					    if(disabled)
					     Ext.ComponentQuery.query('#indent')[0].addCls('x-tool-disabled');
					    else
					    	Ext.ComponentQuery.query('#indent')[0].removeCls('x-tool-disabled');
					},
					setOutdent : function(disabled) {
						Ext.ComponentQuery.query('#outdent')[0].setDisabled(disabled);
					},
					setAddNewTask : function(disabled) {
						Ext.ComponentQuery.query('#addNewTask')[0].setDisabled(disabled);
					},
					setRemoveSelectedTask : function(disabled) {
						Ext.ComponentQuery.query('#removeSelectedTask')[0].setDisabled(disabled);
					},

					// Experimental, not X-browser
					_fullScreenFn : (function() {
						var docElm = document.documentElement;

						if (docElm.requestFullscreen) {
							return "requestFullscreen";
						} else if (docElm.mozRequestFullScreen) {
							return "mozRequestFullScreen";
						} else if (docElm.webkitRequestFullScreen) {
							return "webkitRequestFullScreen";
						} else if (docElm.msRequestFullscreen) {
							return "msRequestFullscreen";
						}
					})()
				});
