<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--  <meta http-equiv="refresh" content="3;url=page/门户页/index.html"/>-->
<title>外事管理平台</title>
<link href="css/login.css" rel="stylesheet" type="text/css" />
<script>
document.onkeydown=function(){
	
	e = event ? event :(window.event ? window.event : null); 
    if(e.keyCode==13){ 

    	var el = window.event.srcElement;
    	if(el.id!= document.getElementById("uname").id){
    		document.getElementById("loginFormId").submit();
    	}else{
    	}
    	
    
    } 
}
</script>

</head>

<body>
<form action="login.action" method="post" name="loginName" id="loginFormId" >

<div id="all">
<div id="head"></div>
<div id="center">
<div id="key"></div>
<div id="input">
	<input class="name" type="text" name="user.uname" id="uname"/>
	<input class="pass" type="password" name="user.upass" id="upass"/>
</div>
<!--input-->
<div id="botton">
	<input class="bot" type="submit" value="" />
</div>
<!--botton-->
</div>
<!--center-->
</div>
<!--all-->
</form>
</body>
</html>
