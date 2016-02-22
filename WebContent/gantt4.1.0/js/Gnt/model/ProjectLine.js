/*

Ext Gantt Pro 4.1.0
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/license

*/
/**
@class Gnt.model.ProjectLine
@extends Ext.data.Model

This class represent a single line drawn by {@link Gnt.plugin.ProjectLines}.

A line has the following fields:

- `Id` - The id of the line
- `ProjectId` - The id of the corresponding project
- `Date` The date of the line.
- `Text` The Text to show when hovering over the line (optional)
- `Cls`  A CSS class to add to the line (optional)
*/
Ext.define('Gnt.model.ProjectLine', {
    extend      : 'Ext.data.Model',

    idProperty  : 'Id',

    fields      : [
        { name: 'Id' },
        { name: 'ProjectId' },
        { name: 'Date', type: 'date' },
        { name: 'Cls', type: 'string' },
        { name: 'Text', type: 'string' }
    ]

});