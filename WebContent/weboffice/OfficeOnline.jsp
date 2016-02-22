<%@ page contentType="text/html; charset=gb2312"%>

<%
	//获取当前登录用户
	//SessionBean curUser = (SessionBean) session.getAttribute("CurUser");
	//String mEditor=request.getParameter("editor");
	String mEditor = new String("文档不可编辑".getBytes("ISO-8859-1"), "utf-8");

	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ request.getContextPath();
	String mServerUrl = basePath + "/servlet/OfficeServer";
	String mRecordID = "1";
	String mTemplate = "1";
	//String mFileName = request.getParameter("FileName");
	String mFileName = "a.docx";
	//String mExtParam=request.getParameter("ExtParam");
	String mExtParam = new String("ceshi".getBytes("ISO-8859-1"), "utf-8");
	String mFileType = ".docx";
	//String mFileType = request.getParameter("FileType");
	String mEditType = "2";
	//String mUserName = curUser.getOperatorName();
	String mLanguage = "1";
%>
<html>
	<head>
		<title>word在线编辑</title>
		<!-- EXT基础js和css -->
		<link rel="stylesheet" type="text/css" href="ext-all.css" />
		<script type="text/javascript" src="ext.js"></script>
		<script type="text/javascript" src="ext-all.js"></script>
		<script language=javascript>
			//作用：显示操作状态
			function StatusMsg(mString) {
				StatusBar.innerText = mString;
			}
			
			//作用：载入iWebOffice
			function Load() {
				try {
					//以下属性必须设置，实始化iWebOffice
					WebOffice.WebUrl = "<%=mServerUrl%>"; //WebUrl:系统服务器路径，与服务器文件交互操作，如保存、打开文档，重要文件 
					WebOffice.RecordID = "<%=mRecordID%>"; //RecordID:本文档记录编号
					WebOffice.Template = "<%=mTemplate%>"; //Template:模板编号
					WebOffice.FileName = "<%=mFileName%>"; //FileName:文档名称
					WebOffice.ExtParam = "<%=mExtParam%>"; //ExtParam:存储文件汉字名称
					WebOffice.FileType = ".docx"; //FileType:文档类型  .doc  .xls  .wps
					WebOffice.EditType = "<%=mEditType%>"; //EditType:编辑类型  方式一、方式二  <参考技术文档>
					WebOffice.UserName = "test"; //UserName:操作用户名，痕迹保留需要
					//WebOffice.Language = "<%=mLanguage%>"; //Language:多语言支持显示选择   CH 简体 TW繁体 EN英文
					WebOffice.RibbonUIXML = '<customUI xmlns="http://schemas.microsoft.com/office/2006/01/customui">'
							+ '<ribbon startFromScratch="false">'
							+ '<tabs>'
							+ '<tab idMso="TabReviewWord" visible="false">'
							+ '</tab>'
							+ '</tabs>' + '</ribbon>' + '</customUI>';
			
					var mEditType = "";
					//alert("WebOffice.WebUrl:"+WebOffice.WebUrl);
					//alert("WebOffice.RecordID:"+WebOffice.RecordID);
					//alert("WebOffice.Template:"+WebOffice.Template);
					//alert("WebOffice.FileName:"+WebOffice.FileName);
					//alert("WebOffice.ExtParam:"+WebOffice.ExtParam);
					//alert("WebOffice.FileType:"+WebOffice.FileType);
					//alert("WebOffice.EditType:"+WebOffice.EditType);
					//alert("WebOffice.UserName:"+WebOffice.UserName);
					//alert("WebOffice.Language:"+WebOffice.Language);
					//return;
					WebOffice.WebSetMsgByName("COMMAND", "ISFIRST"); //设置一个标识
					WebOffice.WebSetMsgByName("USER", "test"); //当前打开文档的操作人
					WebOffice.WebOpen();
			
					if (WebOffice.WebSendMessage()) { //信息传递
						mEditType = WebOffice.WebGetMsgByName("EDITTYPE"); //得到后台返回的编辑类型
					}
					if (mEditType == "") {
						return false;
					} //交互失败，这里可以弹出提示或关闭页面
			
					if (mEditType == "0") {
						WebOffice.EditType = "0"; //不是第一编辑人，控制为只读状态
						Ext.Msg.alert('提示', '<%=mEditor%>正在审核！');
					} else if (mEditType == "2") {
						WebOffice.EditType = "2"; //是第一编辑人，控制可编辑状态
					}
			
					StatusMsg(WebOffice.Status); //状态信息
				} catch (e) {
					Ext.Msg.alert('提示', "测试");
					Ext.Msg.alert('提示', e.description); //显示出错误信息
				}
			}
			
			//作用：退出iWebOffice
			function UnLoad() {
				//var mEditType = WebOffice.WebGetMsgByName("EDITTYPE");
				var mEditType = "1";
				if (mEditType == "2") {
					//隐藏提交清除user信息
					Ext.Ajax.request( {
						url : '<%=basePath%>/main/ClearUserInfo.action',
						method : 'POST',
						params : {
							'fileName' : '<%=mFileName%>'
						},
						success : function(response, options) {
							//TODO
						},
						scope : this
					});
				}
				return false;
			}
			
			//作用：保存文档
			function SaveDocument() {
				if (!WebOffice.WebSave(true)) { //交互OfficeServer的OPTION="SAVEFILE"
					Ext.Msg.alert('提示', WebOffice.Status);
					StatusMsg(WebOffice.Status);
				} else {
					Ext.Msg.alert('提示', '保存成功！');
					StatusMsg(WebOffice.Status);
				}
			}
			
			//作用：存为本地文件
			function WebSaveLocal() {
				try {
					//导出word文档到本地时，显示中文word名称
					var tempFileName = WebOffice.FileName;
					WebOffice.FileName = WebOffice.ExtParam;
					WebOffice.WebSaveLocal();
					WebOffice.FileName = tempFileName;
					StatusMsg(WebOffice.Status);
				} catch (e) {
					Ext.Msg.alert('提示', e.description);
				}
			}
		</script>
	</head>
	<body bgcolor="#ffffff" onload="Load()" onunload="UnLoad()"	style="margin: 0; padding: 0;">
		<table border=0 cellspacing='0' cellpadding='0' width=100% height=100% align=center class="TBStyle" style="margin: 0; padding: 0;">
			<tr>
				<td	style="background-color: #BBBBBB; height: 30px; text-align: right;"	valign="middle">
					<input type='button' value="保存" onclick="SaveDocument();">
					<input type='button' value="另存为" onclick="WebSaveLocal();">
					<input type='button' value="关闭" onclick="if (confirm('确认保存修改?')){SaveDocument();}window.close();">
				</td>
			</tr>
			<tr>
				<td>
					 
					<div id="hideTitle"	style="position: absolute; width: 10000px; background-color: # #ffffff; height: 22px;" align="left">
						<iframe src="javascript:false" style="position: absolute; background-color: # #ffffff; visibility: inherit; top: 2px; left: 1px; width: 10000; height: 20px; z-index: -1; filter ='progid: DXImageTransform.Microsoft.Alpha ( style = 0, opacity = 0 ) ';"></iframe>
						<font style="position: relative; color: black; top: 5px; left: 10px; font-size: 9pt;">
							<strong> 中煤外事系统</strong> 
						</font>
					</div>
					
					<script src="../js/iWebOffice2003.js"></script>
				</td>
			</tr>
			<tr>
				<td height='30' valign="middle" style="text-align: center; color: green; background-color: #BBBBBB; font-size: 14px; font-weight: bold;">
					<div id=StatusBar>
						状态栏
					</div>
				</td>
			</tr>
		</table>
	</body>
</html>