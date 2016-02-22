<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<%String path = request.getContextPath();%>
<link rel="stylesheet" href="<%=path %>/JQuery zTree/css/zTreeStyle/zTreeStyle.css" type="text/css">
<script type="text/javascript" src="<%=path %>/JQuery zTree/js/jquery-1.4.4.min.js"></script>
<script type="text/javascript" src="<%=path %>/JQuery zTree/js/jquery.ztree.core-3.0.js"></script>
<script type="text/javascript" src="<%=path %>/JQuery zTree/js/jquery.ztree.excheck-3.0.js"></script>
<title>Insert title here</title>
<script type="text/javascript"><!--

var setting = {
		check: {
			enable: false
		},
		data: {
			simpleData: {
				enable: true
			}
		},
		callback: {
			onClick: onClick
		}
	};

	
	
	var code;
	
	function setCheck() {
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		zTree.setting.check.chkboxType = type;
		showCode('setting.check.chkboxType = { "Y" : "' + type.Y + '", "N" : "' + type.N + '" };');
	}
	function showCode(str) {
		if (!code) code = $("#code");
		code.empty();
		code.append("<li>"+str+"</li>");
	}
	
	$(document).ready(function(){
		$.ajax( {
	 		type : 'POST',

	 		url : "<%=path%>/searchCompanyInfo.action",
	 		
	 		success : function(data) {
	 			var zNodes = new Array();
				var i=0;
		 		var list = eval('('+data+')').list;
		 		if(null == list || "" ==list){
					return null;
				}else{
					
					$.each(list, function(a, b){
						zNodes[i]={id:b.id,pId:b.pid,name:b.cname,open:b.open,checked:b.check};
						i=i+1;
					});
				$.fn.zTree.init($("#treeDemo"), setting, zNodes);
				}
	 		}
	 	});
		setCheck();
		
	});
	function onClick(){
		//alert(11);
		window.close();
	}
</script>
</head>
<body>
	<div >
		<ul id="treeDemo" class="ztree"></ul>
	</div>
</body>
</html>