Date.prototype.format = function(format)
{
 var o = {
 "M+" : this.getMonth()+1, //month
 "d+" : this.getDate(),    //day
 "h+" : this.getHours(),   //hour
 "m+" : this.getMinutes(), //minute
 "s+" : this.getSeconds(), //second
 "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
 "S" : this.getMilliseconds() //millisecond
 }
 if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
 (this.getFullYear()+"").substr(4 - RegExp.$1.length));
 for(var k in o)if(new RegExp("("+ k +")").test(format))
 format = format.replace(RegExp.$1,
 RegExp.$1.length==1 ? o[k] :
 ("00"+ o[k]).substr((""+ o[k]).length));
 return format;
}
 
//日期格式化
//var d = new Date();
//d.format(‘yyyy-MM-dd‘);

//var myDate = new Date(); 
//var yearStr = myDate.getYear(); //获取当前年份(2位) 
//myDate.getFullYear(); //获取完整的年份(4位,1970-????) 
//var monthStr = myDate.getMonth()+1; //获取当前月份(0-11,0代表1月) 
//var dateStr = myDate.getDate(); //获取当前日(1-31) 
//var dayStr = myDate.getDay(); //获取当前星期X(0-6,0代表星期天) 
//myDate.getTime(); //获取当前时间(从1970.1.1开始的毫秒数) 
//myDate.getHours(); //获取当前小时数(0-23) 
//myDate.getMinutes(); //获取当前分钟数(0-59) 
//myDate.getSeconds(); //获取当前秒数(0-59) 
//myDate.getMilliseconds(); //获取当前毫秒数(0-999) 
//myDate.toLocaleDateString(); //获取当前日期 
//var mytime=myDate.toLocaleTimeString(); //获取当前时间 
//myDate.toLocaleString( ); //获取日期与时间 
//var resultDate = yearStr+"-"+monthStr+"-"+dateStr;