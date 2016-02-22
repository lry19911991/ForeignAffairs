package com.dobn.foreignaffairs.action;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionSupport;

public class BaseAction extends ActionSupport{
	protected HttpSession session = ServletActionContext.getRequest().getSession();
	// 用户当前请求对象
	protected ServletRequest request = ServletActionContext.getRequest();
	// 当前响应对象
	protected ServletResponse response = ServletActionContext.getResponse();
	//系统上下文路径
	protected String contextPath = ServletActionContext.getRequest().getContextPath();
}
