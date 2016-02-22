package com.dobn.foreignaffairs.servlet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class WebOffice {
	private String mOption;
	private String mRecordID;
	private String mFileName;
	private String mDirectory;
	private String mFilePath;
	private String mHtmlName;
	private DBstep.iMsgServer2000 MsgObj;
	
	public void ExecuteRun(HttpServletRequest request,HttpServletResponse response) {
		mOption = "";
		mRecordID = "";
		mFileName = "";
		mDirectory = "";
		mHtmlName = "";
		MsgObj = new DBstep.iMsgServer2000();

		try {
			if (request.getMethod().equalsIgnoreCase("POST")) {
//				System.out.println(request);
				MsgObj.Load(request);
//				mUserName = MsgObj.GetMsgByName("USERNAME");

				if (MsgObj.GetMsgByName("DBSTEP").equalsIgnoreCase("DBSTEP")) {
//					System.out.println("a");
					mOption = MsgObj.GetMsgByName("OPTION");
//					System.out.println("OPTION:" + mOption);

					if (mOption.equalsIgnoreCase("LOADFILE")) { // 请求调用文档
						mRecordID = MsgObj.GetMsgByName("RECORDID"); // 取得文档编号
						mFileName = MsgObj.GetMsgByName("FILENAME"); // 取得文档名称
//						mFileType = MsgObj.GetMsgByName("FILETYPE"); // 取得文档类型
//						synchronizedEdit();
//						mFilePath = mFilePath + "/Document/" + mFileName; // 文件存在服务器的完整路径
						//mFilePath = mFilePath + mFileName; // 文件存在服务器的完整路径
//						mFilePath = "file/" + mFileName; // 文件存在服务器的完整路径
						mFilePath = "d://003.doc"; // 文件存在服务器的完整路径
						System.out.println(mFilePath);
						if (MsgObj.MsgFileLoad(mFilePath)) { // 调入文件文档
							MsgObj.SetMsgByName("STATUS", "打开成功!"); // 设置状态信息
							MsgObj.MsgError(""); // 清除错误信息
						} else {
							MsgObj.MsgError("打开失败!"); // 设置错误信息
						}
						//MsgObj.MsgTextClear();
					}
					
					else if (mOption.equalsIgnoreCase("SAVEFILE")) { // 请求保存文档
						mRecordID = MsgObj.GetMsgByName("RECORDID"); // 取得文档编号
						mFileName = MsgObj.GetMsgByName("FILENAME"); // 取得文档名称
						
						String slawEditType=MsgObj.GetMsgByName("EDITTYPE"); 
						MsgObj.MsgTextClear(); // 清除文本信息
						
						// 保存文档内容
//						if (MsgObj.MsgFileSave(mFilePath + "/Document/" + mFileName)) {
						if (MsgObj.MsgFileSave(mFilePath + mFileName)) {
							MsgObj.SetMsgByName("STATUS", "保存成功!"); // 设置状态信息
							MsgObj.MsgError(""); // 清除错误信息
						} else {
							MsgObj.MsgError("保存失败!"); // 设置错误信息
						}
						MsgObj.MsgTextClear(); // 清除文档内容
						MsgObj.SetMsgByName("EDITTYPE", slawEditType);
					}

					else if (mOption.equalsIgnoreCase("SAVEPDF")) { // 下面的代码为保存PDF文件
						mRecordID = MsgObj.GetMsgByName("RECORDID"); // 取得文档编号
						mFileName = MsgObj.GetMsgByName("FILENAME"); // 取得文档名称
						MsgObj.MsgTextClear(); // 清除文本信息
						// 保存文档内容到文件夹中
//						if (MsgObj.MsgFileSave(mFilePath + "\\Document\\"
//								+ mRecordID + ".pdf")) {
						if (MsgObj.MsgFileSave(mFilePath + mRecordID + ".pdf")) {
							MsgObj.SetMsgByName("STATUS", "保存成功!");// 设置状态信息
							MsgObj.MsgError(""); // 清除错误信息
						} else {
							MsgObj.MsgError("保存失败!"); // 设置错误信息
						}
						MsgObj.MsgFileClear(); // 清除文档内容
					}

					else if (mOption.equalsIgnoreCase("SAVEIMAGE")) { // 保存为图片HTML发布
						mHtmlName = MsgObj.GetMsgByName("HTMLNAME"); // 取得文件名称
						mDirectory = MsgObj.GetMsgByName("DIRECTORY"); // 取得目录名称
						MsgObj.MsgTextClear();
						if (mDirectory.trim().equalsIgnoreCase("")) {
							mFilePath = mFilePath + "\\HTMLIMAGE";
						} else {
							mFilePath = mFilePath + "\\HTMLIMAGE\\"
									+ mDirectory;
						}
						MsgObj.MakeDirectory(mFilePath);
						if (MsgObj.MsgFileSave(mFilePath + "\\" + mHtmlName)) {
							MsgObj.MsgError(""); // 清除错误信息
							MsgObj.SetMsgByName("STATUS", "保存成功"); // 设置状态信息
						} else {
							MsgObj.MsgError("保存失败"); // 设置错误信息
						}
						MsgObj.MsgFileClear();
					}

				} else {
					MsgObj.MsgError("客户端发送数据包错误!");
					MsgObj.MsgTextClear();
					MsgObj.MsgFileClear();
				}
			} else {
				MsgObj.MsgError("请使用Post方法");
				MsgObj.MsgTextClear();
				MsgObj.MsgFileClear();
			}
//			System.out.println("SendPackage");
			MsgObj.Send(response);
		} catch (Exception e) {
			System.out.println(e.toString());
		}
	}
}
