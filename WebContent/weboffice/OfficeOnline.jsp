<%@ page contentType="text/html; charset=gb2312"%>

<%
	//��ȡ��ǰ��¼�û�
	//SessionBean curUser = (SessionBean) session.getAttribute("CurUser");
	//String mEditor=request.getParameter("editor");
	String mEditor = new String("�ĵ����ɱ༭".getBytes("ISO-8859-1"), "utf-8");

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
		<title>word���߱༭</title>
		<!-- EXT����js��css -->
		<link rel="stylesheet" type="text/css" href="ext-all.css" />
		<script type="text/javascript" src="ext.js"></script>
		<script type="text/javascript" src="ext-all.js"></script>
		<script language=javascript>
			//���ã���ʾ����״̬
			function StatusMsg(mString) {
				StatusBar.innerText = mString;
			}
			
			//���ã�����iWebOffice
			function Load() {
				try {
					//�������Ա������ã�ʵʼ��iWebOffice
					WebOffice.WebUrl = "<%=mServerUrl%>"; //WebUrl:ϵͳ������·������������ļ������������籣�桢���ĵ�����Ҫ�ļ� 
					WebOffice.RecordID = "<%=mRecordID%>"; //RecordID:���ĵ���¼���
					WebOffice.Template = "<%=mTemplate%>"; //Template:ģ����
					WebOffice.FileName = "<%=mFileName%>"; //FileName:�ĵ�����
					WebOffice.ExtParam = "<%=mExtParam%>"; //ExtParam:�洢�ļ���������
					WebOffice.FileType = ".docx"; //FileType:�ĵ�����  .doc  .xls  .wps
					WebOffice.EditType = "<%=mEditType%>"; //EditType:�༭����  ��ʽһ����ʽ��  <�ο������ĵ�>
					WebOffice.UserName = "test"; //UserName:�����û������ۼ�������Ҫ
					//WebOffice.Language = "<%=mLanguage%>"; //Language:������֧����ʾѡ��   CH ���� TW���� ENӢ��
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
					WebOffice.WebSetMsgByName("COMMAND", "ISFIRST"); //����һ����ʶ
					WebOffice.WebSetMsgByName("USER", "test"); //��ǰ���ĵ��Ĳ�����
					WebOffice.WebOpen();
			
					if (WebOffice.WebSendMessage()) { //��Ϣ����
						mEditType = WebOffice.WebGetMsgByName("EDITTYPE"); //�õ���̨���صı༭����
					}
					if (mEditType == "") {
						return false;
					} //����ʧ�ܣ�������Ե�����ʾ��ر�ҳ��
			
					if (mEditType == "0") {
						WebOffice.EditType = "0"; //���ǵ�һ�༭�ˣ�����Ϊֻ��״̬
						Ext.Msg.alert('��ʾ', '<%=mEditor%>������ˣ�');
					} else if (mEditType == "2") {
						WebOffice.EditType = "2"; //�ǵ�һ�༭�ˣ����ƿɱ༭״̬
					}
			
					StatusMsg(WebOffice.Status); //״̬��Ϣ
				} catch (e) {
					Ext.Msg.alert('��ʾ', "����");
					Ext.Msg.alert('��ʾ', e.description); //��ʾ��������Ϣ
				}
			}
			
			//���ã��˳�iWebOffice
			function UnLoad() {
				//var mEditType = WebOffice.WebGetMsgByName("EDITTYPE");
				var mEditType = "1";
				if (mEditType == "2") {
					//�����ύ���user��Ϣ
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
			
			//���ã������ĵ�
			function SaveDocument() {
				if (!WebOffice.WebSave(true)) { //����OfficeServer��OPTION="SAVEFILE"
					Ext.Msg.alert('��ʾ', WebOffice.Status);
					StatusMsg(WebOffice.Status);
				} else {
					Ext.Msg.alert('��ʾ', '����ɹ���');
					StatusMsg(WebOffice.Status);
				}
			}
			
			//���ã���Ϊ�����ļ�
			function WebSaveLocal() {
				try {
					//����word�ĵ�������ʱ����ʾ����word����
					var tempFileName = WebOffice.FileName;
					WebOffice.FileName = WebOffice.ExtParam;
					WebOffice.WebSaveLocal();
					WebOffice.FileName = tempFileName;
					StatusMsg(WebOffice.Status);
				} catch (e) {
					Ext.Msg.alert('��ʾ', e.description);
				}
			}
		</script>
	</head>
	<body bgcolor="#ffffff" onload="Load()" onunload="UnLoad()"	style="margin: 0; padding: 0;">
		<table border=0 cellspacing='0' cellpadding='0' width=100% height=100% align=center class="TBStyle" style="margin: 0; padding: 0;">
			<tr>
				<td	style="background-color: #BBBBBB; height: 30px; text-align: right;"	valign="middle">
					<input type='button' value="����" onclick="SaveDocument();">
					<input type='button' value="���Ϊ" onclick="WebSaveLocal();">
					<input type='button' value="�ر�" onclick="if (confirm('ȷ�ϱ����޸�?')){SaveDocument();}window.close();">
				</td>
			</tr>
			<tr>
				<td>
					 
					<div id="hideTitle"	style="position: absolute; width: 10000px; background-color: # #ffffff; height: 22px;" align="left">
						<iframe src="javascript:false" style="position: absolute; background-color: # #ffffff; visibility: inherit; top: 2px; left: 1px; width: 10000; height: 20px; z-index: -1; filter ='progid: DXImageTransform.Microsoft.Alpha ( style = 0, opacity = 0 ) ';"></iframe>
						<font style="position: relative; color: black; top: 5px; left: 10px; font-size: 9pt;">
							<strong> ��ú����ϵͳ</strong> 
						</font>
					</div>
					
					<script src="../js/iWebOffice2003.js"></script>
				</td>
			</tr>
			<tr>
				<td height='30' valign="middle" style="text-align: center; color: green; background-color: #BBBBBB; font-size: 14px; font-weight: bold;">
					<div id=StatusBar>
						״̬��
					</div>
				</td>
			</tr>
		</table>
	</body>
</html>