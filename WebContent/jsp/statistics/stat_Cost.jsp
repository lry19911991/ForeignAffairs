<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>出国费用统计</title>
<link href="../css/table.css" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="css/Style.css" type="text/css" />
<script language="JavaScript" src="js/FusionCharts.js"></script>

<script type="text/javascript" >

  window.onload=function(){ 
  	//alert(1);
     var chart = new FusionCharts("/swf/FCF_MSColumn3D.swf", "ChartId", "600", "350");
     //var chart = new FusionCharts("http://localhost:8080/ForeignAffairs/swf/FCF_MSColumn3D.swf", "ChartId", "600", "350");
     alert(chart);
  	 var xmldata=
	 "<graph hovercapbg='DEDEBE' hovercapborder='889E6D' rotateNames='0' yAxisMaxValue='0' numberPrefix='$'" + 																			        
	 "numdivlines='9' divLineColor='CCCCCC' divLineAlpha='80' decimalPrecision='0' showAlternateHGridColor='1' AlternateHGridAlpha='30'" +        
	 "AlternateHGridColor='CCCCCC' caption='出访国家费用统计' subcaption='(单位/万元)' >" +
	    "<categories font='Arial' fontSize='11' fontColor='000000'>" +
		   "<category name='美国'/>" +
		   "<category name='澳大利亚' />" +
		   "<category name='英国' />" +
		   "<category name='法国' />" +
		   "<category name='日本' />" +
	    "</categories>" +
	    "<dataset seriesname='计划费用' color='FDC12E'>" +
	  	   "<set value='30' />" +
		   "<set value='26' />" +
		   "<set value='29' />" +
		   "<set value='31' />" +
		   "<set value='34' />" +
	    "</dataset>" +
		"<dataset seriesname='实际费用' color='56B9F9'>" +
		  "<set value='27' />" +
		  "<set value='28' />" +
		  "<set value='29' />" +
		  "<set value='33' />" +
		  "<set value='30' />" +
	    "</dataset>" +
	 "</graph>"
	  
	  // chart.setDataURL("Data/MSColumn3D.xml");		
	   chart.setDataXML(xmldata);   
	   chart.render("chartdiv");
	   
	   
  }
  
  function openTZTJ(){
	 window.showModalDialog("团组费用.html",window,"dialogWidth=800px;dialogHeight=500px");
  }
</script> 
</head>

<body>
<table width="99%" class="t1">
	<tr>
    	<td width="10%">年度</td>
        <td>
        	<select>
            	<option>--请选择--</option>
                <option>2012</option>
                <option>2013</option>
                <option>2014</option>
                <option>2015</option>
                <option>2016</option>
                <option>2017</option>
                <option>2018</option>
            </select>&nbsp;年
        </td>
        <td width="10%">
        	季度
        </td>
        <td>
        	<select>
            	<option>--请选择--</option>
                <option>第一季度</option>
                <option>第二季度</option>
                <option>第三季度</option>
                <option>第四季度</option>
            </select>
        </td>
        <td width="10%">区域</td>
        <td>
        	<select>
            	<option>--请选择--</option>
                <option>非洲</option>
                <option>东亚</option>
                <option>欧美</option>
                <option>东南亚</option>
                <option>其他</option>
            </select>
        </td>
    </tr>
    <tr>
    	<td>单位</td>
        <td colspan="3">
        	<input type="text" />&nbsp;
            <input type="button" value="请选择" />
        </td>
        <td>出访状态</td>
        <td>
        	<select>
            	<option>--请选择--</option>
                <option>已出访</option>
                <option>未出访</option>
            </select>
        </td>
    </tr>
    <tr align="center">
    	<td colspan="6">
        	<input type="button" value="筛选" />&nbsp;&nbsp;
            <input type="button" value="清空" />
        </td>
    </tr>
</table>
<table width="99%" class="t1">
	<tr class="a1">
    	<td>
        	<img id="tit1" src="../images/tit1.gif" height="18px" width="18px" align="bottom" />统计信息
        </td>
    </tr>
    <tr align="right">
    	<td>
        	<input type="button" value="导出统计结果" />
        </td>
    </tr>
    <tr align="center" onClick="openTZTJ();"> 
      <td valign="top" class="text" align="center">
          <div id="chartdiv" align="center">暂无数据</div>
      </td>
    </tr>
</table>
</body>
</html>