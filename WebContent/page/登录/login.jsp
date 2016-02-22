<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="GBK"%>
	
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>ÍâÊÂ</title>
<link href="login.css"  rel="stylesheet" type="text/css" />
<script type="text/javascript">
function login(){
	var uname = document.getElementById("uname");
	
	if(uname.value == "mgr_user"){
		window.location="../é¦–é¡µ/home_mgr.html";
	}else{
		window.location="../é¦–é¡µ/home.html";
	}
	//alert(uname.value);
}


</script>
</head>

<body>
<div id="all">
<div  id="head"></div>
<div id="center">
<div id="key"></div>
<div id="input">
<a href="../../loginAction.Action">111</a>
<input class="name" type="text" name="uname" id="uname" />
<span id="infousername" ></span>
<input class="pass" type="text" name="upsw" id="upsw"/>
</div><!--input-->
<div id="botton">
<input class="bot" type="submit" value="" onclick="login();" />
</div><!--botton-->
</div><!--center-->
</div><!--all-->
</body>
</html>
