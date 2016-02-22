/* global MyApp */
Ext
		.define(
				"MyApp.DemoGanttPanel",
				{
					extend : "Gnt.panel.Gantt",
					alias : 'widget.demogantt',

					requires : [ 'Ext.form.field.Text',
							'Sch.plugin.TreeCellEditing', 'Sch.plugin.Pan',
							'Gnt.plugin.TaskEditor',
							'Gnt.plugin.ProjectEditor', 'Gnt.column.Sequence',
							'Gnt.column.Name', 'Gnt.column.StartDate',
							'Gnt.column.EndDate', 'Gnt.column.Duration',
							'Gnt.column.ConstraintType',
							'Gnt.column.ConstraintDate',
							'Gnt.column.PercentDone', 'Gnt.column.Predecessor',
							'Gnt.column.ManuallyScheduled',
							'Gnt.column.AddNew', 'Gnt.column.DeadlineDate',
							'Gnt.column.ShowInTimeline',
							'MyApp.TaskContextMenu', 'MyApp.FilterField',
							'MyApp.TaskArea','Gnt.panel.Timeline','MyApp.PrimaryToolbar','MyApp.SecondaryToolbar' ],

					highlightWeekends : true,
					showTodayLine : true,
					loadMask : true,
					enableProgressBarResize : true,
					showRollupTasks : true,
					eventBorderWidth : 0,
					rowHeight : 32,
					viewPreset : 'weekAndDayLetter',
					exportPlugin : new Gnt.plugin.Export({
						printServer : 'public/js/export/server.php'
					}),
					listeners :{
					selectionchange:function (grid, selection) {
						var primarytoolbar	=Ext.ComponentQuery.query('primarytoolbar');
						var disbaled=!!!selection.getCount()
						primarytoolbar[0].setIndent(disbaled);
						primarytoolbar[0].setOutdent(disbaled);
						primarytoolbar[0].setAddNewTask(disbaled);
						primarytoolbar[0].setRemoveSelectedTask(disbaled);
						
				    }},
					projectLinesConfig : {
						// Configure the gantt to mark project start dates w/
						// lines.
						// Options are:
						// 'start' - to show lines for start dates,
						// 'end' - to show lines for end dates,
						// 'both' - to show lines for both start and end dates.
						linesFor : 'start'
					},
					allowDeselect : true,
					selModel : {
						type : 'spreadsheet'
					},
		
//					  header      : Gnt.panel.Timeline,
//					 header      : Gnt.panel.Timeline ? null : { xtype : 'controlheader' },
					initComponent : function() {

						Ext
								.apply(
										this,
										{
											// Define a custom HTML template for
											// regular tasks
											taskBodyTemplate : '<div class="sch-gantt-progress-bar" style="width:{progressBarWidth}px;{progressBarStyle}" unselectable="on">'
													+ '<span class="sch-gantt-progress-bar-label">{[Math.round(values.percentDone)]}%</span>'
													+ '</div>',
											// Define properties for the left
											// 'locked' and scrollable tree grid
											lockedGridConfig : {
												width : 400
											},

											// Define properties for the left
											// 'locked' and scrollable tree view
											lockedViewConfig : {
												// Adds a CSS class returned to
												// each row element
												getRowClass : function(rec) {
													return rec.isRoot() ? 'root-row'
															: '';
												}
											},

											normalViewConfig : {
												stripeRows : true,
												// Adds a CSS class to each row
												// element
												getRowClass : function(rec) {
													return rec === this.store
															.getRootNode().firstChild ? 'first-row'
															: '';
												},
											},

											leadingBufferZone : 1, // HACK:
																	// temp fix
																	// for Ext
																	// JS 5
																	// buffered
																	// renderer
																	// issue
											// Define properties for the
											// schedule section
											schedulerConfig : {},

											// Define what should be shown in
											// the left label field, along with
											// the type of editor
											leftLabelField : {
												dataIndex : 'Name',
												editor : {
													xtype : 'textfield'
												}
											},

											// Add some extra functionality
											plugins : [
													'advanced_taskcontextmenu',
													'scheduler_pan',
													'gantt_taskeditor',
													'gantt_projecteditor',
													this.exportPlugin,
													{
														ptype : 'gantt_dependencyeditor',
														width : 320
													},
													{
														pluginId : 'taskarea',
														ptype : 'taskarea'
													},
													{
														ptype : 'scheduler_treecellediting',
														clicksToEdit : 2,
														pluginId : 'editingInterface'
													},
													{
														ptype : 'gantt_clipboard',
														// data copied in raw
														// format can be copied
														// and pasted to gantt
														// data in text format
														// is copied to system
														// clipboard and can be
														// pasted anywhere
														source : [ 'raw',
																'text' ]
													},
													'gantt_selectionreplicator' ],

											// Define an HTML template for the
											// tooltip
											tooltipTpl : '<strong class="tipHeader">{Name}</strong>'
													+ '<table class="taskTip">'
													+ '<tr><td>Start:</td> <td align="right">{[values._record.getDisplayStartDate("y-m-d")]}</td></tr>'
													+ '<tr><td>End:</td> <td align="right">{[values._record.getDisplayEndDate("y-m-d")]}</td></tr>'
													+ '<tr><td>Progress:</td><td align="right">{[ Math.round(values.PercentDone)]}%</td></tr>'
													+ '</table>',

												    eventRenderer : function (task, tplData) {
												        var style,
												            segments, i,
												            result;

												        if (task.get('Color')) {
												            style = Ext.String.format('background-color: #{0};border-color:#{0}', task.get('Color'));

												            if (!tplData.segments) {
												                result = {
												                    // Here you can add custom per-task styles
												                    style : style
												                };
												            }
												            // if task is segmented we cannot use above code
												            // since it will set color of background visible between segments
												            // in this case instead we need to provide "style" for each individual segment
												            else {
												                segments = tplData.segments;
												                for (i = 0; i < segments.length; i++) {
												                    segments[i].style = style;
												                }
												            }
												        }

												        return result;
												    },

											 // Define the static columns
										    // Any regular Ext JS columns are ok too
										    columns : [
										        {
										            xtype : 'namecolumn',
										            width : 200,
										            items : {
										                xtype : 'gantt-filter-field'
										            }
										        },
										        {
										            xtype : 'startdatecolumn',
										            width : 130
										        },
										        {
										            xtype : 'enddatecolumn',
										            width : 130
										        },
										        {
										            xtype : 'durationcolumn',
										            width : 100
										        },
										        // Uncomment to try this column
										        //{
										        //    xtype : 'deadlinecolumn'
										        //},
										        {
										            xtype : 'constrainttypecolumn'
										        },
										        {
										            xtype : 'constraintdatecolumn'
										        },
										        {
										            xtype : 'percentdonecolumn',
										            width : 100
										        },
										        {
										            xtype             : 'predecessorcolumn',
										            useSequenceNumber : true
										        },
										        {
										            xtype : 'addnewcolumn'
										        }
										    ],
										    header      :{xtype : 'primarytoolbar',
												gantt : this,listeners : {
				                                    togglesecondary : function(tbar) {
				                                        var secondary = this.down('gantt-secondary-toolbar');
//				                                        alert('secondary'+secondary)
				                                        console.dir(secondary);
				                                        secondary.setVisible(!secondary.isVisible());
//				                                        secondary.animate({
//				                                            to : { height : secondary.getHeight() < 10 ? tbar.getHeight() : 0 }
//				                                        });
				                                    },
				                                    scope : this}},
				                                    bbar        : {
				                                        xtype   : 'gantt-secondary-toolbar',
				                                        gantt : this
				                                    }
												
					
										});
					  

						this.callParent(arguments);

					}
				});
