Ext
		.define(
				"MyApp.Toolbar",
				{
					extend : "Ext.Toolbar",
					cls : 'primary-toolbar',
					alias : 'widget.primarytoolbar',

					gantt : null,

					initComponent : function() {
						var gantt = this.gantt;

						var taskStore = gantt.taskStore || gantt.crudManager
								&& gantt.crudManager.getTaskStore();

						taskStore
								.on({
									'filter-set' : function() {
										this
												.down(
														'[iconCls*=icon-collapseall]')
												.disable();
										this.down('[iconCls*=icon-expandall]')
												.disable();
									},
									'filter-clear' : function() {
										this
												.down(
														'[iconCls*=icon-collapseall]')
												.enable();
										this.down('[iconCls*=icon-expandall]')
												.enable();
									},
									scope : this
								});

						var items = [
								{
									id : 'previousTimespan',
									tooltip : 'Previous timespan',
									iconCls : 'icon icon-left',
									handler : function() {
										gantt.shiftPrevious();
									}
								},
								{
									id : 'nextTimespan',
									tooltip : 'Next timespan',
									iconCls : 'icon icon-right',
									handler : function() {
										gantt.shiftNext();
									}
								},
								{
									id : 'outdent',
									tooltip : 'Outdent',
									iconCls : 'icon icon-outdent',
									handler : function(btn) {
										gantt.taskStore.outdent(gantt
												.getSelectionModel()
												.getSelection());
									}
								} ];

						if (gantt.taskStore && gantt.taskStore.calendarManager) {
							items
									.push({
										id : 'manageCalendars',
										tooltip : 'Manage calendars',
										iconCls : 'icon icon-calendarmgr',
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
								iconCls : 'icon icon-save',
								itemId : 'save-button',
								handler : function() {
									gantt.crudManager.pikeSync();
								}
							});
						}

						items.push('->', '',
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
							iconCls : 'icon icon-pdf',
							scale : 'large',
							text : 'Export to PDF',
							handler : function() {
								gantt.exportPlugin.setFileFormat('pdf');
								// var el =
								// Ext.dom.Element.query('.x-scroll-scroller >
								// .sch-dependencyview-ct')[0]; el &&
								// el.remove();
								gantt.showExportDialog();
							}
						}, {
							iconCls : 'icon icon-png',
							scale : 'large',
							text : 'Export to PNG',
							handler : function() {
								gantt.exportPlugin.setFileFormat('png');
								// var el =
								// Ext.dom.Element.query('.x-scroll-scroller >
								// .sch-dependencyview-ct')[0]; el &&
								// el.remove();
								gantt.showExportDialog();
							}
						},

						{
							text : 'Try more features...',
							handler : function() {
								this.fireEvent('togglesecondary', this);
							},
							scope : this
						});

						Ext.apply(this, {
							defaults : {
								scale : 'medium'
							},

							items : items
						});

						this.callParent(arguments);
					},

					applyPercentDone : function(value) {
						this.gantt.getSelectionModel().selected.each(function(
								task) {
							task.setPercentDone(value);
						});
					},

					showFullScreen : function() {
						this.gantt.el.down('.x-panel-body').dom[this._fullScreenFn]
								(Element.ALLOW_KEYBOARD_INPUT);
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
